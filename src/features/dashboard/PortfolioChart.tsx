import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { LineChart } from '../../components/ui/Charts/LineChart';
import { SkeletonChart } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../lib/utils';
import { POLLING_INTERVALS } from '../../lib/constants';
import type { ProcessedHistoryItem } from '../../types/api';

const timeRanges = [
  { label: '1D', value: '24h' },
  { label: '7D', value: '7d' },
  { label: '1M', value: '30d' },
  { label: '3M', value: '90d' },
  { label: 'ALL', value: 'all' },
];

interface StorageHistoryResponse {
  data: Array<{
    timestamp: number; // milliseconds
    value: number;
    state: unknown;
  }>;
  pagination: {
    limit: number;
    has_more: boolean;
    filters: {
      start_time: number | null;
      end_time: number | null;
    };
  };
}

// Get API parameters based on selected time range
// API expects Unix timestamps in seconds
function getRangeParams(range: string): { start_time?: number; end_time?: number; limit: number } {
  const nowSec = Math.floor(Date.now() / 1000);
  const hourSec = 60 * 60;
  const daySec = 24 * hourSec;
  
  switch (range) {
    case '7d':
      return { 
        start_time: nowSec - 7 * daySec, 
        end_time: nowSec,
        limit: 500 
      };
    case '30d':
      return { 
        start_time: nowSec - 30 * daySec, 
        end_time: nowSec,
        limit: 500 
      };
    case '90d':
      return { 
        start_time: nowSec - 90 * daySec, 
        end_time: nowSec,
        limit: 1000 
      };
    case 'all':
      return { 
        // Don't set time filters to get all history
        limit: 1000 
      };
    default: // '24h'
      return { 
        start_time: nowSec - daySec, 
        end_time: nowSec,
        limit: 500 
      };
  }
}

// Get appropriate date format based on time range
function getDateFormatter(range: string): (ts: number) => string {
  return (ts: number) => {
    const date = new Date(ts);
    
    switch (range) {
      case '24h':
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      case '7d':
        return date.toLocaleDateString('en-US', {
          weekday: 'short',
          hour: '2-digit',
          hour12: false,
        });
      case '30d':
      case '90d':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
      case 'all':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        });
      default:
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
    }
  };
}

export function PortfolioChart() {
  const [selectedRange, setSelectedRange] = useState('24h');
  const [history, setHistory] = useState<StorageHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const params = useMemo(() => getRangeParams(selectedRange), [selectedRange]);

  const fetchHistory = useCallback(async () => {
    try {
      // Build query string
      const queryParams = new URLSearchParams();
      if (params.start_time !== undefined) {
        queryParams.set('start_time', String(params.start_time));
      }
      if (params.end_time !== undefined) {
        queryParams.set('end_time', String(params.end_time));
      }
      queryParams.set('limit', String(params.limit));

      const queryString = queryParams.toString();
      const url = `/storage/portfolio-history${queryString ? `?${queryString}` : ''}`;

      // Get auth from localStorage
      const storedAuth = localStorage.getItem('hb_auth_credentials');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (storedAuth) {
        const decoded = atob(storedAuth);
        const credentials = JSON.parse(decoded);
        headers['Authorization'] = 'Basic ' + btoa(`${credentials.username}:${credentials.password}`);
      }

      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const result: StorageHistoryResponse = await response.json();
      setHistory(result);
    } catch (error) {
      console.error('Failed to fetch portfolio history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  // Fetch data when range changes
  useEffect(() => {
    setIsLoading(true);
    fetchHistory();
  }, [fetchHistory]);

  // Set up polling
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchHistory();
    }, POLLING_INTERVALS.PORTFOLIO * 2);

    return () => clearInterval(intervalId);
  }, [fetchHistory]);

  const chartData: ProcessedHistoryItem[] = useMemo(() => {
    if (!history?.data || history.data.length === 0) return [];
    
    // Data is already sorted by the API, just map to the expected format
    return history.data.map((item) => ({
      timestamp: item.timestamp,
      value: item.value,
    }));
  }, [history?.data]);

  // Calculate change
  const firstValue = chartData[0]?.value || 0;
  const lastValue = chartData[chartData.length - 1]?.value || 0;
  const change = lastValue - firstValue;
  const changePercentage = firstValue > 0 ? (change / firstValue) * 100 : 0;

  const formatLabel = useMemo(() => getDateFormatter(selectedRange), [selectedRange]);

  if (isLoading && !history) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Portfolio History</CardTitle>
          <div className="flex gap-1">
            {timeRanges.map((range) => (
              <div key={range.value} className="skeleton w-10 h-7 rounded" />
            ))}
          </div>
        </CardHeader>
        <SkeletonChart height={280} />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Portfolio History</CardTitle>
          {chartData.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-white tabular-nums">
                {formatCurrency(lastValue)}
              </span>
              <span
                className={`text-sm font-medium ${
                  change >= 0 ? 'text-profit' : 'text-loss'
                }`}
              >
                {change >= 0 ? '+' : ''}
                {changePercentage.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        
        <div className="flex gap-1 bg-dark-700/50 p-1 rounded-lg">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setSelectedRange(range.value)}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                selectedRange === range.value
                  ? 'bg-dark-600 text-white'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </CardHeader>

      <LineChart
        data={chartData}
        height={280}
        showArea
        showGrid
        formatValue={formatCurrency}
        formatLabel={formatLabel}
      />
    </Card>
  );
}
