import { useState, useCallback } from 'react';
import type { ApiError } from '../api/client';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

interface UseApiResult<T, P extends unknown[]> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
  execute: (...params: P) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T, P extends unknown[] = []>(
  apiFunction: (...params: P) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T, P> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (...params: P): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...params);
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError);
        options.onError?.(apiError);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction, options.onSuccess, options.onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    execute,
    reset,
  };
}

// Hook for lazy API calls (doesn't execute on mount)
export function useLazyApi<T, P extends unknown[] = []>(
  apiFunction: (...params: P) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T, P> {
  return useApi(apiFunction, options);
}


