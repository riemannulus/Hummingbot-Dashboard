import React from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign,
  Zap,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/Badge';
import { formatCurrency, formatPercentage, cn } from '../../lib/utils';
import type { AggregatedPerformance, TradeStats } from '../../features/bots/utils';

interface BotPerformanceCardsProps {
  status: string;
  performance: AggregatedPerformance | null;
  stats: TradeStats;
}

export function BotPerformanceCards({ status, performance, stats }: BotPerformanceCardsProps) {
  const pnl = performance?.pnl || 0;
  const pnlPct = performance?.pnlPct || 0;
  const realizedPnl = performance?.realizedPnl || 0;
  const unrealizedPnl = performance?.unrealizedPnl || 0;
  const volume = performance?.volume || stats.totalVolume;

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Top Row: Status, Total PnL, ROI, Volume, Total Trades */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {/* Status Card */}
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center">
              <Activity className="w-5 h-5 text-accent-green" />
            </div>
            <div>
              <div className="text-dark-400 text-sm">Status</div>
              <StatusBadge status={status || 'unknown'} />
            </div>
          </div>
        </Card>

        {/* Total PnL Card */}
        <Card>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                pnl >= 0 ? 'bg-profit/10' : 'bg-loss/10'
              )}
            >
              {pnl >= 0 ? (
                <TrendingUp className="w-5 h-5 text-profit" />
              ) : (
                <TrendingDown className="w-5 h-5 text-loss" />
              )}
            </div>
            <div>
              <div className="text-dark-400 text-sm">Total PnL</div>
              <div
                className={cn(
                  'text-xl font-bold tabular-nums',
                  pnl >= 0 ? 'text-profit' : 'text-loss'
                )}
              >
                {formatCurrency(pnl)}
              </div>
            </div>
          </div>
        </Card>

        {/* ROI Card */}
        <Card>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                pnlPct >= 0 ? 'bg-profit/10' : 'bg-loss/10'
              )}
            >
              <BarChart3
                className={cn('w-5 h-5', pnlPct >= 0 ? 'text-profit' : 'text-loss')}
              />
            </div>
            <div>
              <div className="text-dark-400 text-sm">ROI</div>
              <div
                className={cn(
                  'text-xl font-bold tabular-nums',
                  pnlPct >= 0 ? 'text-profit' : 'text-loss'
                )}
              >
                {formatPercentage(pnlPct)}
              </div>
            </div>
          </div>
        </Card>

        {/* Volume Card */}
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-green/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-accent-green" />
            </div>
            <div>
              <div className="text-dark-400 text-sm">Volume</div>
              <div className="text-xl font-bold tabular-nums text-white">
                {formatCurrency(volume)}
              </div>
            </div>
          </div>
        </Card>

        {/* Total Trades Card */}
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-warning" />
            </div>
            <div>
              <div className="text-dark-400 text-sm">Total Trades</div>
              <div className="text-xl font-bold text-white">{stats.totalTrades}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Row: Realized PnL and Unrealized PnL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {/* Realized PnL Card */}
        <Card>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                realizedPnl >= 0 ? 'bg-profit/10' : 'bg-loss/10'
              )}
            >
              <CheckCircle
                className={cn('w-5 h-5', realizedPnl >= 0 ? 'text-profit' : 'text-loss')}
              />
            </div>
            <div className="flex-1">
              <div className="text-dark-400 text-sm">Realized PnL</div>
              <div
                className={cn(
                  'text-xl font-bold tabular-nums',
                  realizedPnl >= 0 ? 'text-profit' : 'text-loss'
                )}
              >
                {formatCurrency(realizedPnl)}
              </div>
              <div className="text-dark-500 text-xs">Closed positions</div>
            </div>
          </div>
        </Card>

        {/* Unrealized PnL Card */}
        <Card>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                unrealizedPnl >= 0 ? 'bg-profit/10' : 'bg-loss/10'
              )}
            >
              <Clock
                className={cn('w-5 h-5', unrealizedPnl >= 0 ? 'text-profit' : 'text-loss')}
              />
            </div>
            <div className="flex-1">
              <div className="text-dark-400 text-sm">Unrealized PnL</div>
              <div
                className={cn(
                  'text-xl font-bold tabular-nums',
                  unrealizedPnl >= 0 ? 'text-profit' : 'text-loss'
                )}
              >
                {formatCurrency(unrealizedPnl)}
              </div>
              <div className="text-dark-500 text-xs">Open positions</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

