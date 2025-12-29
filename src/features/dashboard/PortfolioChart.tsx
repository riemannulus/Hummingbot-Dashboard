import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { LineChart } from '../../components/ui/Charts/LineChart';
import { SkeletonChart } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../lib/utils';
import type { PortfolioHistoryItem, PaginatedResponse, ProcessedHistoryItem } from '../../types/api';

interface PortfolioChartProps {
  history: PaginatedResponse<PortfolioHistoryItem> | null;
  isLoading: boolean;
}

const timeRanges = [
  { label: '1D', value: '24h' },
  { label: '7D', value: '7d' },
  { label: '1M', value: '30d' },
  { label: '3M', value: '90d' },
  { label: 'ALL', value: 'all' },
];

// Process API response to calculate total portfolio value for each timestamp
function processHistoryData(data: PortfolioHistoryItem[]): ProcessedHistoryItem[] {
  return data.map((item) => {
    // Calculate total value by summing all token values across all accounts and connectors
    let totalValue = 0;
    
    if (item.state) {
      Object.values(item.state).forEach((account) => {
        Object.values(account).forEach((connectorBalances) => {
          if (Array.isArray(connectorBalances)) {
            connectorBalances.forEach((token) => {
              totalValue += token.value || 0;
            });
          }
        });
      });
    }

    return {
      timestamp: new Date(item.timestamp).getTime(),
      value: totalValue,
    };
  }).sort((a, b) => a.timestamp - b.timestamp); // Sort by timestamp ascending
}

export function PortfolioChart({ history, isLoading }: PortfolioChartProps) {
  const [selectedRange, setSelectedRange] = useState('24h');

  const chartData = useMemo(() => {
    if (!history?.data) return [];
    return processHistoryData(history.data);
  }, [history?.data]);

  // Calculate change
  const firstValue = chartData[0]?.value || 0;
  const lastValue = chartData[chartData.length - 1]?.value || 0;
  const change = lastValue - firstValue;
  const changePercentage = firstValue > 0 ? (change / firstValue) * 100 : 0;

  if (isLoading) {
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
        formatLabel={(ts) => {
          const date = new Date(ts);
          return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
        }}
      />
    </Card>
  );
}

