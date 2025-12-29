import React from 'react';
import { ArrowUpRight, ArrowDownRight, X } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { usePolling } from '../../hooks/usePolling';
import { tradingService } from '../../api';
import { formatCurrency, formatCrypto, formatRelativeTime, cn } from '../../lib/utils';
import { POLLING_INTERVALS } from '../../lib/constants';

export function TradingPage() {
  const { data: activeOrders, isLoading: ordersLoading, refresh: refreshOrders, lastUpdated } = usePolling({
    fetcher: async () => {
      const result = await tradingService.getActiveOrders({ limit: 50 });
      return result.data || [];
    },
    interval: POLLING_INTERVALS.ACTIVE_ORDERS,
  });

  const { data: positions, isLoading: positionsLoading } = usePolling({
    fetcher: async () => {
      const result = await tradingService.getPositions({ limit: 50 });
      return result.data || [];
    },
    interval: POLLING_INTERVALS.POSITIONS,
  });

  const { data: trades, isLoading: tradesLoading } = usePolling({
    fetcher: async () => {
      const result = await tradingService.getTrades({ limit: 50 });
      return result.data || [];
    },
    interval: POLLING_INTERVALS.TRADES,
  });

  const orderColumns = [
    {
      key: 'trading_pair',
      header: 'Pair',
      render: (value: unknown) => (
        <span className="font-medium text-white">{String(value)}</span>
      ),
    },
    {
      key: 'trade_type',
      header: 'Side',
      render: (value: unknown) => (
        <Badge variant={value === 'BUY' ? 'success' : 'danger'}>{String(value)}</Badge>
      ),
    },
    {
      key: 'order_type',
      header: 'Type',
      render: (value: unknown) => (
        <span className="text-dark-300">{String(value)}</span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="tabular-nums">{formatCurrency(Number(value))}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="tabular-nums">{formatCrypto(Number(value))}</span>
      ),
    },
    {
      key: 'filled_amount',
      header: 'Filled',
      align: 'right' as const,
      render: (value: unknown, row: any) => (
        <span className="tabular-nums text-dark-300">
          {formatCrypto(Number(value))} ({((Number(value) / Number(row.amount)) * 100).toFixed(0)}%)
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      render: () => (
        <Button variant="ghost" size="sm">
          <X className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  const positionColumns = [
    {
      key: 'trading_pair',
      header: 'Pair',
      render: (value: unknown) => (
        <span className="font-medium text-white">{String(value)}</span>
      ),
    },
    {
      key: 'position_side',
      header: 'Side',
      render: (value: unknown) => (
        <Badge variant={value === 'LONG' ? 'success' : 'danger'}>{String(value)}</Badge>
      ),
    },
    {
      key: 'amount',
      header: 'Size',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="tabular-nums">{formatCrypto(Math.abs(Number(value)))}</span>
      ),
    },
    {
      key: 'entry_price',
      header: 'Entry',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="tabular-nums">{formatCurrency(Number(value))}</span>
      ),
    },
    {
      key: 'mark_price',
      header: 'Mark',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="tabular-nums">{formatCurrency(Number(value))}</span>
      ),
    },
    {
      key: 'unrealized_pnl',
      header: 'Unrealized PNL',
      align: 'right' as const,
      render: (value: unknown) => {
        const pnl = Number(value);
        return (
          <span className={cn('tabular-nums font-medium', pnl >= 0 ? 'text-profit' : 'text-loss')}>
            {formatCurrency(pnl)}
          </span>
        );
      },
    },
    {
      key: 'leverage',
      header: 'Leverage',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="tabular-nums text-warning">{Number(value)}x</span>
      ),
    },
  ];

  const tradeColumns = [
    {
      key: 'trading_pair',
      header: 'Pair',
      render: (value: unknown) => (
        <span className="font-medium text-white">{String(value)}</span>
      ),
    },
    {
      key: 'trade_type',
      header: 'Side',
      render: (value: unknown) => (
        <div className="flex items-center gap-1">
          {value === 'BUY' ? (
            <ArrowDownRight className="w-3 h-3 text-profit" />
          ) : (
            <ArrowUpRight className="w-3 h-3 text-loss" />
          )}
          <Badge variant={value === 'BUY' ? 'success' : 'danger'}>{String(value)}</Badge>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="tabular-nums">{formatCurrency(Number(value))}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="tabular-nums">{formatCrypto(Number(value))}</span>
      ),
    },
    {
      key: 'fee',
      header: 'Fee',
      align: 'right' as const,
      render: (value: unknown, row: any) => (
        <span className="tabular-nums text-dark-400">
          {formatCrypto(Number(value))} {row.fee_asset}
        </span>
      ),
    },
    {
      key: 'timestamp',
      header: 'Time',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="text-dark-400">{formatRelativeTime(Number(value))}</span>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <Header
        title="Trading"
        subtitle="Orders, positions, and trade history"
        lastUpdated={lastUpdated}
        isRefreshing={ordersLoading}
        onRefresh={refreshOrders}
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-dark-400 text-sm mb-1">Active Orders</div>
            <div className="text-2xl font-bold text-white">{activeOrders?.length || 0}</div>
          </Card>
          <Card>
            <div className="text-dark-400 text-sm mb-1">Open Positions</div>
            <div className="text-2xl font-bold text-white">{positions?.length || 0}</div>
          </Card>
          <Card>
            <div className="text-dark-400 text-sm mb-1">Today's Trades</div>
            <div className="text-2xl font-bold text-white">{trades?.length || 0}</div>
          </Card>
          <Card>
            <div className="text-dark-400 text-sm mb-1">Unrealized PNL</div>
            <div className={cn(
              'text-2xl font-bold tabular-nums',
              (positions?.reduce((sum: number, p: any) => sum + (p.unrealized_pnl || 0), 0) || 0) >= 0 ? 'text-profit' : 'text-loss'
            )}>
              {formatCurrency(positions?.reduce((sum: number, p: any) => sum + (p.unrealized_pnl || 0), 0) || 0)}
            </div>
          </Card>
        </div>

        <Tabs defaultValue="orders">
          <TabsList>
            <TabsTrigger value="orders">Active Orders ({activeOrders?.length || 0})</TabsTrigger>
            <TabsTrigger value="positions">Positions ({positions?.length || 0})</TabsTrigger>
            <TabsTrigger value="trades">Trade History ({trades?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card padding="none">
              <div className="p-5 border-b border-dark-700">
                <CardTitle>Active Orders</CardTitle>
              </div>
              <Table
                columns={orderColumns}
                data={activeOrders || []}
                keyExtractor={(row) => row.order_id || row.client_order_id}
                isLoading={ordersLoading}
                emptyMessage="No active orders"
              />
            </Card>
          </TabsContent>

          <TabsContent value="positions">
            <Card padding="none">
              <div className="p-5 border-b border-dark-700">
                <CardTitle>Open Positions</CardTitle>
              </div>
              <Table
                columns={positionColumns}
                data={positions || []}
                keyExtractor={(row) => `${row.trading_pair}-${row.position_side}`}
                isLoading={positionsLoading}
                emptyMessage="No open positions"
              />
            </Card>
          </TabsContent>

          <TabsContent value="trades">
            <Card padding="none">
              <div className="p-5 border-b border-dark-700">
                <CardTitle>Trade History</CardTitle>
              </div>
              <Table
                columns={tradeColumns}
                data={trades || []}
                keyExtractor={(row) => row.trade_id}
                isLoading={tradesLoading}
                emptyMessage="No trades recorded"
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


