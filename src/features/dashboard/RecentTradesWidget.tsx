import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatCrypto, formatCurrency, formatRelativeTime, cn } from '../../lib/utils';
import type { Trade } from '../../types/api';

interface RecentTradesWidgetProps {
  trades: Trade[] | null;
  isLoading: boolean;
  onViewAll: () => void;
}

export function RecentTradesWidget({ trades, isLoading, onViewAll }: RecentTradesWidgetProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton width={120} />
          <Skeleton width={80} height={24} />
        </CardHeader>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-dark-700/50">
              <div className="flex items-center gap-3">
                <Skeleton variant="circular" width={32} height={32} />
                <div>
                  <Skeleton width={100} className="mb-1" />
                  <Skeleton width={60} height={12} />
                </div>
              </div>
              <div className="text-right">
                <Skeleton width={80} className="mb-1" />
                <Skeleton width={60} height={12} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Trades</CardTitle>
        <button
          onClick={onViewAll}
          className="text-sm text-accent-green hover:text-accent-teal transition-colors"
        >
          View All
        </button>
      </CardHeader>

      {!trades || trades.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-dark-400">No recent trades</p>
        </div>
      ) : (
        <div className="space-y-1">
          {trades.slice(0, 8).map((trade) => (
            <div
              key={trade.trade_id}
              className="flex items-center justify-between py-2.5 border-b border-dark-700/50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    trade.trade_type === 'BUY'
                      ? 'bg-profit/10'
                      : 'bg-loss/10'
                  )}
                >
                  {trade.trade_type === 'BUY' ? (
                    <ArrowDownRight className="w-4 h-4 text-profit" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-loss" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">
                      {trade.trading_pair}
                    </span>
                    <Badge
                      variant={trade.trade_type === 'BUY' ? 'success' : 'danger'}
                    >
                      {trade.trade_type}
                    </Badge>
                  </div>
                  <p className="text-dark-400 text-sm">
                    {formatRelativeTime(trade.timestamp)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-white font-medium tabular-nums">
                  {formatCrypto(trade.amount)}
                </p>
                <p className="text-dark-400 text-sm tabular-nums">
                  @ {formatCurrency(trade.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}


