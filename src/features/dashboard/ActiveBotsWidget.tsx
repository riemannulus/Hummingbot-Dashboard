import React from 'react';
import { Bot, Play, Square, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatCurrency, formatPercentage, cn } from '../../lib/utils';
import type { BotStatus, ProcessedBotStatus } from '../../types/api';

interface ActiveBotsWidgetProps {
  bots: Record<string, BotStatus> | null;
  isLoading: boolean;
  onViewAll: () => void;
}

// Helper function to process bot data and extract PnL
function processBotData(bots: Record<string, BotStatus> | null): ProcessedBotStatus[] {
  if (!bots) return [];
  
  return Object.entries(bots).map(([name, botStatus]) => {
    // Extract strategy name and aggregate PnL from all controllers
    const controllers = Object.entries(botStatus.performance || {});
    const strategy = controllers.length > 0 ? controllers[0][0] : 'Unknown';
    
    // Sum up PnL from all controllers
    let totalPnl = 0;
    let totalPnlPct = 0;
    let totalVolume = 0;
    
    controllers.forEach(([_, controller]) => {
      if (controller.performance) {
        totalPnl += controller.performance.global_pnl_quote || 0;
        totalPnlPct += controller.performance.global_pnl_pct || 0;
        totalVolume += controller.performance.volume_traded || 0;
      }
    });
    
    return {
      name,
      status: botStatus.status,
      strategy,
      pnl: totalPnl,
      pnl_pct: totalPnlPct,
      volume: totalVolume,
      error_count: botStatus.error_logs?.length || 0,
    };
  });
}

export function ActiveBotsWidget({ bots, isLoading, onViewAll }: ActiveBotsWidgetProps) {
  const botList = processBotData(bots);

  const runningCount = botList.filter((b) => b.status === 'running').length;
  const totalCount = botList.length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton width={120} />
          <Skeleton width={80} height={24} />
        </CardHeader>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Skeleton variant="circular" width={36} height={36} />
                <div>
                  <Skeleton width={100} className="mb-1" />
                  <Skeleton width={60} height={12} />
                </div>
              </div>
              <Skeleton width={60} />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>Active Bots</CardTitle>
          <span className="text-sm text-dark-400">
            {runningCount}/{totalCount} running
          </span>
        </div>
        <button
          onClick={onViewAll}
          className="text-sm text-accent-green hover:text-accent-teal transition-colors"
        >
          View All
        </button>
      </CardHeader>

      {botList.length === 0 ? (
        <div className="text-center py-8">
          <Bot className="w-12 h-12 text-dark-500 mx-auto mb-3" />
          <p className="text-dark-400">No bots deployed</p>
          <p className="text-dark-500 text-sm mt-1">
            Start a bot to see it here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {botList.slice(0, 5).map((bot) => (
            <div
              key={bot.name}
              className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg hover:bg-dark-700/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center',
                    bot.status === 'running'
                      ? 'bg-profit/10'
                      : bot.status === 'error'
                      ? 'bg-loss/10'
                      : 'bg-dark-600'
                  )}
                >
                  {bot.status === 'running' ? (
                    <Play className="w-4 h-4 text-profit" />
                  ) : bot.status === 'error' ? (
                    <AlertTriangle className="w-4 h-4 text-loss" />
                  ) : (
                    <Square className="w-4 h-4 text-dark-400" />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{bot.name}</p>
                  <p className="text-dark-400 text-xs">{bot.strategy}</p>
                </div>
              </div>

              <div className="text-right">
                <p
                  className={cn(
                    'text-sm font-medium tabular-nums',
                    bot.pnl >= 0 ? 'text-profit' : 'text-loss'
                  )}
                >
                  {bot.pnl >= 0 ? '+' : ''}{formatCurrency(bot.pnl)}
                </p>
                <p
                  className={cn(
                    'text-xs tabular-nums',
                    bot.pnl_pct >= 0 ? 'text-profit/70' : 'text-loss/70'
                  )}
                >
                  {bot.pnl_pct >= 0 ? '+' : ''}{formatPercentage(bot.pnl_pct)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

