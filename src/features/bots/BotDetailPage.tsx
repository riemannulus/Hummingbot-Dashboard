import React, { useEffect, useState, useMemo } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  BarChart3,
  Settings,
  Clock,
  Target,
  Zap,
  RefreshCw,
  Edit2,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Skeleton } from '../../components/ui/Skeleton';
import { botsService } from '../../api';
import { formatCurrency, formatPercentage, formatRelativeTime, cn } from '../../lib/utils';
import type { BotStatus, BotDetailedHistory, BotControllerConfig, BotTrade } from '../../types/api';
import { EditStrategyConfigModal } from './EditStrategyConfigModal';

interface BotDetailPageProps {
  botName: string;
  onBack: () => void;
}

interface TradeStats {
  totalTrades: number;
  buyTrades: number;
  sellTrades: number;
  totalVolume: number;
  totalFees: number;
  avgTradeSize: number;
  winRate: number;
}

function calculateTradeStats(trades: BotTrade[]): TradeStats {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      buyTrades: 0,
      sellTrades: 0,
      totalVolume: 0,
      totalFees: 0,
      avgTradeSize: 0,
      winRate: 0,
    };
  }

  const buyTrades = trades.filter((t) => t.trade_type === 'BUY');
  const sellTrades = trades.filter((t) => t.trade_type === 'SELL');

  let totalVolume = 0;
  let totalFees = 0;

  trades.forEach((trade) => {
    const price = parseFloat(trade.price);
    const quantity = parseFloat(trade.quantity);
    totalVolume += price * quantity;

    if (trade.raw_json?.trade_fee?.flat_fees) {
      trade.raw_json.trade_fee.flat_fees.forEach((fee) => {
        totalFees += parseFloat(fee.amount);
      });
    }
  });

  return {
    totalTrades: trades.length,
    buyTrades: buyTrades.length,
    sellTrades: sellTrades.length,
    totalVolume,
    totalFees,
    avgTradeSize: totalVolume / trades.length,
    winRate: sellTrades.length > 0 ? (sellTrades.length / trades.length) * 100 : 0,
  };
}

export function BotDetailPage({ botName, onBack }: BotDetailPageProps) {
  const [status, setStatus] = useState<BotStatus | null>(null);
  const [history, setHistory] = useState<BotDetailedHistory | null>(null);
  const [configs, setConfigs] = useState<BotControllerConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [editingConfig, setEditingConfig] = useState<BotControllerConfig | null>(null);

  const fetchData = async () => {
    try {
      const [statusRes, historyRes, configsRes] = await Promise.all([
        botsService.getBotStatus(botName),
        botsService.getBotHistory(botName, { verbose: true }),
        botsService.getBotControllerConfigs(botName),
      ]);
      setStatus(statusRes);
      setHistory(historyRes);
      setConfigs(configsRes);
      setLastUpdated(Date.now());
    } catch (error) {
      console.error('Failed to fetch bot details:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchData();
    
    // Poll every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [botName]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  // Extract trades from history
  const trades = useMemo(() => {
    return history?.response?.data?.data?.trades || [];
  }, [history]);

  // Calculate stats
  const stats = useMemo(() => calculateTradeStats(trades), [trades]);

  // Extract performance from status
  const performance = useMemo(() => {
    if (!status?.performance) return null;
    const controllers = Object.entries(status.performance);
    if (controllers.length === 0) return null;

    let totalPnl = 0;
    let totalPnlPct = 0;
    let totalVolume = 0;

    controllers.forEach(([, controller]) => {
      if (controller.performance) {
        totalPnl += controller.performance.global_pnl_quote || 0;
        totalPnlPct += controller.performance.global_pnl_pct || 0;
        totalVolume += controller.performance.volume_traded || 0;
      }
    });

    return {
      pnl: totalPnl,
      pnlPct: totalPnlPct,
      volume: totalVolume,
      controllers: controllers.map(([name, c]) => ({
        name,
        ...c.performance,
      })),
    };
  }, [status]);

  // Trade columns for table
  const tradeColumns = [
    {
      key: 'trade_timestamp',
      header: 'Time',
      render: (value: unknown) => (
        <span className="text-dark-300 text-sm">
          {new Date(Number(value)).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'trade_type',
      header: 'Type',
      render: (value: unknown) => (
        <Badge variant={value === 'BUY' ? 'success' : 'danger'}>
          {String(value)}
        </Badge>
      ),
    },
    {
      key: 'symbol',
      header: 'Pair',
      render: (value: unknown) => <span className="font-medium">{String(value)}</span>,
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="tabular-nums">${parseFloat(String(value)).toFixed(2)}</span>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantity',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="tabular-nums">{parseFloat(String(value)).toFixed(6)}</span>
      ),
    },
    {
      key: 'volume',
      header: 'Volume',
      align: 'right' as const,
      render: (_: unknown, row: BotTrade) => {
        const vol = parseFloat(row.price) * parseFloat(row.quantity);
        return <span className="tabular-nums">{formatCurrency(vol)}</span>;
      },
    },
    {
      key: 'fee',
      header: 'Fee',
      align: 'right' as const,
      render: (_: unknown, row: BotTrade) => {
        const fee = row.raw_json?.trade_fee?.flat_fees?.[0];
        return fee ? (
          <span className="tabular-nums text-dark-400">${parseFloat(fee.amount).toFixed(4)}</span>
        ) : (
          <span className="text-dark-500">-</span>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="p-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Bots
          </Button>
          <div className="space-y-6">
            <Skeleton height={100} />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} height={80} />
              ))}
            </div>
            <Skeleton height={400} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Header
        title={botName}
        subtitle={`Strategy: ${configs[0]?.controller_name || 'Unknown'} • ${configs[0]?.trading_pair || ''}`}
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          Back to Bots
        </Button>

        {/* Status & Performance */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center">
                <Activity className="w-5 h-5 text-accent-green" />
              </div>
              <div>
                <div className="text-dark-400 text-sm">Status</div>
                <StatusBadge status={status?.status || 'unknown'} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  (performance?.pnl || 0) >= 0 ? 'bg-profit/10' : 'bg-loss/10'
                )}
              >
                {(performance?.pnl || 0) >= 0 ? (
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
                    (performance?.pnl || 0) >= 0 ? 'text-profit' : 'text-loss'
                  )}
                >
                  {formatCurrency(performance?.pnl || 0)}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  (performance?.pnlPct || 0) >= 0 ? 'bg-profit/10' : 'bg-loss/10'
                )}
              >
                <BarChart3
                  className={cn(
                    'w-5 h-5',
                    (performance?.pnlPct || 0) >= 0 ? 'text-profit' : 'text-loss'
                  )}
                />
              </div>
              <div>
                <div className="text-dark-400 text-sm">ROI</div>
                <div
                  className={cn(
                    'text-xl font-bold tabular-nums',
                    (performance?.pnlPct || 0) >= 0 ? 'text-profit' : 'text-loss'
                  )}
                >
                  {formatPercentage(performance?.pnlPct || 0)}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-green/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-accent-green" />
              </div>
              <div>
                <div className="text-dark-400 text-sm">Volume</div>
                <div className="text-xl font-bold tabular-nums text-white">
                  {formatCurrency(performance?.volume || stats.totalVolume)}
                </div>
              </div>
            </div>
          </Card>

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

        {/* Tabs */}
        <Tabs defaultValue="trades">
          <TabsList>
            <TabsTrigger value="trades">Trade History ({trades.length})</TabsTrigger>
            <TabsTrigger value="config">Strategy Config</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="trades">
            <Card padding="none">
              <div className="p-5 border-b border-dark-700">
                <CardTitle>Recent Trades</CardTitle>
              </div>
              <Table
                columns={tradeColumns}
                data={trades.slice().reverse().slice(0, 100)}
                keyExtractor={(row) => row.trade_id}
                isLoading={false}
                emptyMessage="No trades recorded yet."
              />
            </Card>
          </TabsContent>

          <TabsContent value="config">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {configs.map((config) => (
                <Card key={config.id}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-accent-green" />
                        <CardTitle>{config.id}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="info">{config.controller_type}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingConfig(config)}
                          className="text-dark-400 hover:text-white"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-dark-400 text-sm">Controller</div>
                        <div className="text-white font-medium">{config.controller_name}</div>
                      </div>
                      <div>
                        <div className="text-dark-400 text-sm">Trading Pair</div>
                        <div className="text-white font-medium">{config.trading_pair}</div>
                      </div>
                      <div>
                        <div className="text-dark-400 text-sm">Connector</div>
                        <div className="text-white font-medium">{config.connector_name}</div>
                      </div>
                      <div>
                        <div className="text-dark-400 text-sm">Leverage</div>
                        <div className="text-white font-medium">{config.leverage || 1}x</div>
                      </div>
                    </div>

                    {/* Position Settings */}
                    <div className="pt-4 border-t border-dark-700">
                      <div className="text-dark-300 text-sm font-medium mb-3">Position Settings</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-dark-400 text-sm">Total Amount (Quote)</div>
                          <div className="text-white font-medium tabular-nums">
                            ${config.total_amount_quote || '-'}
                          </div>
                        </div>
                        <div>
                          <div className="text-dark-400 text-sm">Position Mode</div>
                          <div className="text-white font-medium">{config.position_mode || '-'}</div>
                        </div>
                        {config.start_price && (
                          <div>
                            <div className="text-dark-400 text-sm">Start Price</div>
                            <div className="text-white font-medium tabular-nums">
                              ${config.start_price}
                            </div>
                          </div>
                        )}
                        {config.end_price && (
                          <div>
                            <div className="text-dark-400 text-sm">End Price</div>
                            <div className="text-white font-medium tabular-nums">
                              ${config.end_price}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Risk Management */}
                    {(config.stop_loss || config.take_profit) && (
                      <div className="pt-4 border-t border-dark-700">
                        <div className="text-dark-300 text-sm font-medium mb-3">Risk Management</div>
                        <div className="grid grid-cols-2 gap-4">
                          {config.stop_loss && (
                            <div>
                              <div className="text-dark-400 text-sm">Stop Loss</div>
                              <div className="text-loss font-medium">
                                {(parseFloat(config.stop_loss) * 100).toFixed(1)}%
                              </div>
                            </div>
                          )}
                          {config.take_profit && (
                            <div>
                              <div className="text-dark-400 text-sm">Take Profit</div>
                              <div className="text-profit font-medium">
                                {(parseFloat(config.take_profit) * 100).toFixed(1)}%
                              </div>
                            </div>
                          )}
                          {config.trailing_stop && (
                            <>
                              <div>
                                <div className="text-dark-400 text-sm">Trailing Activation</div>
                                <div className="text-white font-medium">
                                  {(parseFloat(config.trailing_stop.activation_price) * 100).toFixed(1)}%
                                </div>
                              </div>
                              <div>
                                <div className="text-dark-400 text-sm">Trailing Delta</div>
                                <div className="text-white font-medium">
                                  {(parseFloat(config.trailing_stop.trailing_delta) * 100).toFixed(1)}%
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Grid Settings */}
                    {config.max_open_orders && (
                      <div className="pt-4 border-t border-dark-700">
                        <div className="text-dark-300 text-sm font-medium mb-3">Grid Settings</div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-dark-400 text-sm">Max Open Orders</div>
                            <div className="text-white font-medium">{config.max_open_orders}</div>
                          </div>
                          {config.min_spread_between_orders && (
                            <div>
                              <div className="text-dark-400 text-sm">Min Spread</div>
                              <div className="text-white font-medium">
                                {(config.min_spread_between_orders * 100).toFixed(2)}%
                              </div>
                            </div>
                          )}
                          {config.order_frequency && (
                            <div>
                              <div className="text-dark-400 text-sm">Order Frequency</div>
                              <div className="text-white font-medium">{config.order_frequency}s</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}

              {configs.length === 0 && (
                <Card className="col-span-1 lg:col-span-2">
                  <div className="text-center py-8 text-dark-400">
                    No controller configurations found for this bot.
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="stats">
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
                        ((performance?.pnl || 0) - stats.totalFees) >= 0 ? 'text-profit' : 'text-loss'
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
                    <span className="text-white font-medium tabular-nums">
                      {trades.length > 1
                        ? (
                            trades.length /
                            ((trades[trades.length - 1].trade_timestamp - trades[0].trade_timestamp) /
                              3600000)
                          ).toFixed(2)
                        : '-'}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Strategy Config Modal */}
      {editingConfig && (
        <EditStrategyConfigModal
          isOpen={!!editingConfig}
          onClose={() => setEditingConfig(null)}
          botName={botName}
          config={editingConfig}
          onSave={() => {
            // Refresh data after saving
            fetchData();
          }}
        />
      )}
    </div>
  );
}


