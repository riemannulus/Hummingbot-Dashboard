import { useState, useEffect, useCallback, useRef } from 'react';
import { useVisibility } from './useVisibility';

interface UsePollingOptions<T> {
  fetcher: () => Promise<T>;
  interval: number;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  pauseOnHidden?: boolean;
  retryOnError?: boolean;
  maxRetries?: number;
}

interface UsePollingResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: number | null;
  refresh: () => Promise<void>;
  setInterval: (interval: number) => void;
}

export function usePolling<T>({
  fetcher,
  interval,
  enabled = true,
  onSuccess,
  onError,
  pauseOnHidden = true,
  retryOnError = true,
  maxRetries = 3,
}: UsePollingOptions<T>): UsePollingResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [currentInterval, setCurrentInterval] = useState(interval);
  
  const isVisible = useVisibility();
  const retryCount = useRef(0);
  const isMounted = useRef(true);

  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading && !data) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const result = await fetcher();
      
      if (!isMounted.current) return;
      
      setData(result);
      setError(null);
      setLastUpdated(Date.now());
      retryCount.current = 0;
      
      onSuccess?.(result);
    } catch (err) {
      if (!isMounted.current) return;
      
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (retryOnError && retryCount.current < maxRetries) {
        retryCount.current++;
      }
      
      onError?.(error);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [fetcher, data, onSuccess, onError, retryOnError, maxRetries]);

  const refresh = useCallback(async () => {
    await fetchData(false);
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    isMounted.current = true;
    
    if (enabled) {
      fetchData(true);
    }

    return () => {
      isMounted.current = false;
    };
  }, [enabled]); // Don't include fetchData to avoid infinite loop

  // Polling interval
  useEffect(() => {
    if (!enabled) return;
    
    // Pause polling when tab is hidden
    if (pauseOnHidden && !isVisible) return;

    const intervalId = setInterval(() => {
      fetchData(false);
    }, currentInterval);

    return () => clearInterval(intervalId);
  }, [enabled, currentInterval, isVisible, pauseOnHidden, fetchData]);

  // Refresh when tab becomes visible after being hidden
  useEffect(() => {
    if (enabled && pauseOnHidden && isVisible && lastUpdated) {
      const timeSinceLastUpdate = Date.now() - lastUpdated;
      if (timeSinceLastUpdate > currentInterval) {
        fetchData(false);
      }
    }
  }, [isVisible]);

  return {
    data,
    error,
    isLoading,
    isRefreshing,
    lastUpdated,
    refresh,
    setInterval: setCurrentInterval,
  };
}


