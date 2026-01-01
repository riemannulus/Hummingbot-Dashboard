import React from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { formatCurrency, cn } from '../../lib/utils';
import type { TradeStats, AggregatedPerformance } from '../../features/bots/utils';
import type { BotTrade } from '../../types/api';

interface StatsTabProps {
  stats: TradeStats;
  performance: AggregatedPerformance | null;
  trades: BotTrade[];
}

export function StatsTab({ stats, performance, trades }: StatsTabProps) {
  // Calculate trades per hour
  const tradesPerHour =
    trades.length > 1
      ? (
          trades.length /
          ((trades[trades.length - 1].trade_timestamp - trades[0].trade_timestamp) / 3600000)
        ).toFixed(2)
      : '-';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {/* Trade Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Trade Distribution</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-dark-300">Buy Orders</span>
            <span className="text-profit font-medium tabular-nums">{stats.buyTrades}</span>
          </div>
          <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-profit rounded-full"
              style={{
                width: `${stats.totalTrades > 0 ? (stats.buyTrades / stats.totalTrades) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-dark-300">Sell Orders</span>
            <span className="text-loss font-medium tabular-nums">{stats.sellTrades}</span>
          </div>
          <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-loss rounded-full"
              style={{
                width: `${stats.totalTrades > 0 ? (stats.sellTrades / stats.totalTrades) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </Card>

      {/* Volume Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Volume Statistics</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-dark-300">Total Volume</span>
            <span className="text-white font-medium tabular-nums">
              {formatCurrency(stats.totalVolume)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-dark-300">Average Trade Size</span>
            <span className="text-white font-medium tabular-nums">
              {formatCurrency(stats.avgTradeSize)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-dark-300">Total Fees Paid</span>
            <span className="text-warning font-medium tabular-nums">
              {formatCurrency(stats.totalFees)}
            </span>
          </div>
        </div>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-dark-300">Net PnL (after fees)</span>
            <span
              className={cn(
                'font-medium tabular-nums',
                (performance?.pnl || 0) - stats.totalFees >= 0 ? 'text-profit' : 'text-loss'
              )}
            >
              {formatCurrency((performance?.pnl || 0) - stats.totalFees)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-dark-300">Fee Impact</span>
            <span className="text-warning font-medium tabular-nums">
              {stats.totalVolume > 0
                ? ((stats.totalFees / stats.totalVolume) * 100).toFixed(4)
                : '0.00'}
              %
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-dark-300">Trades per Hour</span>
            <span className="text-white font-medium tabular-nums">{tradesPerHour}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

