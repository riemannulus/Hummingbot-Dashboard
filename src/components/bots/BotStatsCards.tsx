import React from 'react';
import { Card } from '../ui/Card';
import { formatCurrency, cn } from '../../lib/utils';
import type { ProcessedBotStatus } from '../../types/api';

interface BotStatsCardsProps {
  botList: ProcessedBotStatus[];
  runningBots: ProcessedBotStatus[];
  stoppedBots: ProcessedBotStatus[];
}

export function BotStatsCards({ botList, runningBots, stoppedBots }: BotStatsCardsProps) {
  const totalVolume = botList.reduce((sum, b) => sum + (b.volume || 0), 0);
  const totalPnl = botList.reduce((sum, b) => sum + (b.pnl || 0), 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
      <Card>
        <div className="text-dark-400 text-sm mb-1">Total Bots</div>
        <div className="text-2xl font-bold text-white">{botList.length}</div>
      </Card>
      <Card>
        <div className="text-dark-400 text-sm mb-1">Running</div>
        <div className="text-2xl font-bold text-profit">{runningBots.length}</div>
      </Card>
      <Card>
        <div className="text-dark-400 text-sm mb-1">Stopped</div>
        <div className="text-2xl font-bold text-dark-300">{stoppedBots.length}</div>
      </Card>
      <Card>
        <div className="text-dark-400 text-sm mb-1">Total Volume</div>
        <div className="text-2xl font-bold tabular-nums text-white">
          {formatCurrency(totalVolume)}
        </div>
      </Card>
      <Card>
        <div className="text-dark-400 text-sm mb-1">Total PNL</div>
        <div
          className={cn(
            'text-2xl font-bold tabular-nums',
            totalPnl >= 0 ? 'text-profit' : 'text-loss'
          )}
        >
          {totalPnl >= 0 ? '+' : ''}
          {formatCurrency(totalPnl)}
        </div>
      </Card>
    </div>
  );
}

