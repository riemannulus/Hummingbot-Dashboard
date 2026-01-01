import React from 'react';
import { Card, CardTitle } from '../ui/Card';
import { Table } from '../ui/Table';
import { getTradeColumns } from '../../features/bots/utils';
import type { BotTrade } from '../../types/api';

interface TradesTabProps {
  trades: BotTrade[];
  maxDisplay?: number;
}

export function TradesTab({ trades, maxDisplay = 100 }: TradesTabProps) {
  const tradeColumns = getTradeColumns();
  const displayTrades = trades.slice().reverse().slice(0, maxDisplay);

  return (
    <Card padding="none">
      <div className="p-5 border-b border-dark-700">
        <CardTitle>Recent Trades</CardTitle>
      </div>
      <Table
        columns={tradeColumns}
        data={displayTrades}
        keyExtractor={(row) => row.trade_id}
        isLoading={false}
        emptyMessage="No trades recorded yet."
      />
    </Card>
  );
}

