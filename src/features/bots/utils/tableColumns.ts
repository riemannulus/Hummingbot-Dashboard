import React from 'react';
import { Badge, StatusBadge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { formatCurrency, formatPercentage, formatRelativeTime, cn } from '../../../lib/utils';
import { Eye, Square, Play } from 'lucide-react';
import type { ProcessedBotStatus, BotTrade, BotRun } from '../../../types/api';

/**
 * Column definitions for the bot list table
 */
export function getBotColumns(options: {
  onViewDetails: (botName: string) => void;
  onStop: (botName: string) => void;
  onStart?: (botName: string) => void;
}) {
  return [
    {
      key: 'name',
      header: 'Bot Name',
      render: (value: unknown) =>
        React.createElement('span', { className: 'font-medium text-white' }, String(value)),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: unknown) => React.createElement(StatusBadge, { status: String(value) }),
    },
    {
      key: 'strategy',
      header: 'Strategy',
      render: (value: unknown) =>
        React.createElement(
          'span',
          { className: 'text-dark-300 text-sm' },
          String(value) || '-'
        ),
    },
    {
      key: 'volume',
      header: 'Volume',
      align: 'right' as const,
      render: (value: unknown) => {
        const vol = Number(value) || 0;
        return React.createElement(
          'span',
          { className: 'tabular-nums text-dark-300' },
          formatCurrency(vol)
        );
      },
    },
    {
      key: 'pnl',
      header: 'PNL',
      align: 'right' as const,
      render: (value: unknown, row: ProcessedBotStatus) => {
        const pnl = Number(value) || 0;
        const pnlPct = Number(row.pnl_pct) || 0;
        return React.createElement(
          'div',
          { className: 'text-right' },
          React.createElement(
            'span',
            {
              className: cn('tabular-nums font-medium', pnl >= 0 ? 'text-profit' : 'text-loss'),
            },
            `${pnl >= 0 ? '+' : ''}${formatCurrency(pnl)}`
          ),
          React.createElement(
            'div',
            {
              className: cn('text-xs tabular-nums', pnlPct >= 0 ? 'text-profit/70' : 'text-loss/70'),
            },
            `${pnlPct >= 0 ? '+' : ''}${formatPercentage(pnlPct)}`
          )
        );
      },
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      render: (_: unknown, row: ProcessedBotStatus) =>
        React.createElement(
          'div',
          { className: 'flex items-center gap-2 justify-end' },
          React.createElement(
            Button,
            {
              variant: 'ghost',
              size: 'sm',
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                options.onViewDetails(row.name);
              },
            },
            React.createElement(Eye, { className: 'w-3 h-3' }),
            'Details'
          ),
          row.status === 'running'
            ? React.createElement(
                Button,
                {
                  variant: 'danger',
                  size: 'sm',
                  onClick: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    options.onStop(row.name);
                  },
                },
                React.createElement(Square, { className: 'w-3 h-3' }),
                'Stop'
              )
            : React.createElement(
                Button,
                {
                  variant: 'primary',
                  size: 'sm',
                  onClick: options.onStart
                    ? (e: React.MouseEvent) => {
                        e.stopPropagation();
                        options.onStart!(row.name);
                      }
                    : undefined,
                },
                React.createElement(Play, { className: 'w-3 h-3' }),
                'Start'
              )
        ),
    },
  ];
}

/**
 * Column definitions for the bot run history table
 */
export function getRunColumns() {
  return [
    {
      key: 'bot_name',
      header: 'Bot',
      render: (value: unknown) =>
        React.createElement('span', { className: 'font-medium text-white' }, String(value)),
    },
    {
      key: 'strategy_name',
      header: 'Strategy',
    },
    {
      key: 'run_status',
      header: 'Status',
      render: (value: unknown) => React.createElement(StatusBadge, { status: String(value) }),
    },
    {
      key: 'deployment_status',
      header: 'Deployment',
      render: (value: unknown) =>
        React.createElement(
          Badge,
          {
            variant:
              value === 'DEPLOYED' ? 'success' : value === 'ARCHIVED' ? 'neutral' : 'danger',
          },
          String(value)
        ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (value: unknown) =>
        React.createElement(
          'span',
          { className: 'text-dark-300' },
          formatRelativeTime(new Date(String(value)).getTime())
        ),
    },
  ];
}

/**
 * Column definitions for the trade history table
 */
export function getTradeColumns() {
  return [
    {
      key: 'trade_timestamp',
      header: 'Time',
      render: (value: unknown) =>
        React.createElement(
          'span',
          { className: 'text-dark-300 text-sm' },
          new Date(Number(value)).toLocaleString()
        ),
    },
    {
      key: 'trade_type',
      header: 'Type',
      render: (value: unknown) =>
        React.createElement(Badge, { variant: value === 'BUY' ? 'success' : 'danger' }, String(value)),
    },
    {
      key: 'symbol',
      header: 'Pair',
      render: (value: unknown) =>
        React.createElement('span', { className: 'font-medium' }, String(value)),
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right' as const,
      render: (value: unknown) =>
        React.createElement(
          'span',
          { className: 'tabular-nums' },
          `$${parseFloat(String(value)).toFixed(2)}`
        ),
    },
    {
      key: 'quantity',
      header: 'Quantity',
      align: 'right' as const,
      render: (value: unknown) =>
        React.createElement(
          'span',
          { className: 'tabular-nums' },
          parseFloat(String(value)).toFixed(6)
        ),
    },
    {
      key: 'volume',
      header: 'Volume',
      align: 'right' as const,
      render: (_: unknown, row: BotTrade) => {
        const vol = parseFloat(row.price) * parseFloat(row.quantity);
        return React.createElement('span', { className: 'tabular-nums' }, formatCurrency(vol));
      },
    },
    {
      key: 'fee',
      header: 'Fee',
      align: 'right' as const,
      render: (_: unknown, row: BotTrade) => {
        const fee = row.raw_json?.trade_fee?.flat_fees?.[0];
        return fee
          ? React.createElement(
              'span',
              { className: 'tabular-nums text-dark-400' },
              `$${parseFloat(fee.amount).toFixed(4)}`
            )
          : React.createElement('span', { className: 'text-dark-500' }, '-');
      },
    },
  ];
}

