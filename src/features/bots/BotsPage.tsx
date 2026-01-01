import React, { useState, useEffect } from 'react';
import { Play, Square, Trash2, Plus, RefreshCw, History, Settings, Check, Loader2, Eye } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Input } from '../../components/ui/Input';
import { usePolling } from '../../hooks/usePolling';
import { useLazyApi } from '../../hooks/useApi';
import { botsService, controllersService, accountsService } from '../../api';
import { formatCurrency, formatDuration, formatRelativeTime, formatPercentage, cn } from '../../lib/utils';
import { POLLING_INTERVALS } from '../../lib/constants';
import type { BotStatus, BotRun, ProcessedBotStatus, ControllerConfig } from '../../types/api';

interface BotsPageProps {
  onNavigate?: (path: string) => void;
}

// Helper function to process bot data and extract PnL
function processBotData(bots: Record<string, BotStatus> | null): ProcessedBotStatus[] {
  if (!bots) return [];
  
  return Object.entries(bots).map(([name, botStatus]) => {
    const controllers = Object.entries(botStatus.performance || {});
    const strategy = controllers.length > 0 ? controllers[0][0] : 'Unknown';
    
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

// Deploy Bot Modal Component
interface DeployBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function DeployBotModal({ isOpen, onClose, onSuccess }: DeployBotModalProps) {
  const [instanceName, setInstanceName] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('master_account');
  const [selectedConfigs, setSelectedConfigs] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [configs, setConfigs] = useState<ControllerConfig[]>([]);
  const [loadingConfigs, setLoadingConfigs] = useState(false);

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoadingConfigs(true);
      
      Promise.all([
        accountsService.listAccounts(),
        controllersService.listConfigs()
      ]).then(([accountsData, configsData]) => {
        setAccounts(accountsData || []);
        setConfigs(configsData || []);
      }).catch((err) => {
        console.error('Failed to load modal data:', err);
      }).finally(() => {
        setLoadingConfigs(false);
      });
    }
  }, [isOpen]);

  const handleToggleConfig = (configId: string) => {
    setSelectedConfigs(prev => 
      prev.includes(configId) 
        ? prev.filter(id => id !== configId)
        : [...prev, configId]
    );
  };

  const handleDeploy = async () => {
    if (!instanceName.trim()) {
      setError('Instance name is required');
      return;
    }
    if (selectedConfigs.length === 0) {
      setError('Select at least one controller config');
      return;
    }

    setIsDeploying(true);
    setError(null);

    try {
      await botsService.deployV2Controllers({
        instance_name: instanceName,
        credentials_profile: selectedAccount,
        controllers_config: selectedConfigs,
      });
      onSuccess();
      onClose();
      setInstanceName('');
      setSelectedConfigs([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deploy bot');
    } finally {
      setIsDeploying(false);
    }
  };

  const configList = configs;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Deploy New Bot" size="lg">
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-loss/10 border border-loss/20 rounded-lg text-loss text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Instance Name
          </label>
          <Input
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value)}
            placeholder="e.g., my_trading_bot"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Account
          </label>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="input w-full"
          >
            {(accounts.length > 0 ? accounts : ['master_account']).map(acc => (
              <option key={acc} value={acc}>{acc}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Controller Configs ({selectedConfigs.length} selected)
          </label>
          <div className="max-h-64 overflow-y-auto border border-dark-600 rounded-lg">
            {loadingConfigs ? (
              <div className="p-4 text-center text-dark-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading configs...
              </div>
            ) : configList.length === 0 ? (
              <div className="p-4 text-center text-dark-400">
                No controller configs available
              </div>
            ) : (
              configList.map((config: ControllerConfig) => (
                <div
                  key={config.id}
                  onClick={() => handleToggleConfig(config.id)}
                  className={cn(
                    'flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-dark-700 last:border-b-0',
                    selectedConfigs.includes(config.id)
                      ? 'bg-accent-green/10'
                      : 'hover:bg-dark-700/50'
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded border flex items-center justify-center flex-shrink-0',
                      selectedConfigs.includes(config.id)
                        ? 'bg-accent-green border-accent-green'
                        : 'border-dark-500'
                    )}
                  >
                    {selectedConfigs.includes(config.id) && (
                      <Check className="w-3 h-3 text-dark-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white">{config.id}</div>
                    <div className="text-sm text-dark-400 truncate">
                      {config.controller_name} • {config.trading_pair} • {config.connector_name}
                    </div>
                  </div>
                  <Badge variant="info" className="flex-shrink-0">
                    {config.controller_type}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleDeploy}
            disabled={isDeploying || !instanceName.trim() || selectedConfigs.length === 0}
            className="flex-1"
          >
            {isDeploying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Deploy Bot
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function BotsPage({ onNavigate }: BotsPageProps) {
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);

  const handleViewBotDetails = (botName: string) => {
    if (onNavigate) {
      onNavigate(`/bots/${encodeURIComponent(botName)}`);
    }
  };

  const { data: botsStatus, isLoading, isRefreshing, lastUpdated, refresh } = usePolling({
    fetcher: async () => {
      const result = await botsService.getStatus();
      return result.data || {};
    },
    interval: POLLING_INTERVALS.BOT_STATUS,
  });

  const { data: botRuns, isLoading: runsLoading, refresh: refreshRuns } = usePolling({
    fetcher: () => botsService.getBotRuns({ limit: 50 }),
    interval: POLLING_INTERVALS.BOT_STATUS * 2,
  });

  const stopBot = useLazyApi(botsService.stopBot);

  const botList = processBotData(botsStatus);

  const runningBots = botList.filter((b) => b.status === 'running');
  const stoppedBots = botList.filter((b) => b.status !== 'running');

  const handleStopBot = async () => {
    if (!selectedBot) return;
    await stopBot.execute({ bot_name: selectedBot });
    setShowStopConfirm(false);
    setSelectedBot(null);
    refresh();
  };

  const botColumns = [
    {
      key: 'name',
      header: 'Bot Name',
      render: (value: unknown) => (
        <span className="font-medium text-white">{String(value)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: unknown) => <StatusBadge status={String(value)} />,
    },
    {
      key: 'strategy',
      header: 'Strategy',
      render: (value: unknown) => (
        <span className="text-dark-300 text-sm">{String(value) || '-'}</span>
      ),
    },
    {
      key: 'volume',
      header: 'Volume',
      align: 'right' as const,
      render: (value: unknown) => {
        const vol = Number(value) || 0;
        return (
          <span className="tabular-nums text-dark-300">
            {formatCurrency(vol)}
          </span>
        );
      },
    },
    {
      key: 'pnl',
      header: 'PNL',
      align: 'right' as const,
      render: (value: unknown, row: any) => {
        const pnl = Number(value) || 0;
        const pnlPct = Number(row.pnl_pct) || 0;
        return (
          <div className="text-right">
            <span className={cn('tabular-nums font-medium', pnl >= 0 ? 'text-profit' : 'text-loss')}>
              {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
            </span>
            <div className={cn('text-xs tabular-nums', pnlPct >= 0 ? 'text-profit/70' : 'text-loss/70')}>
              {pnlPct >= 0 ? '+' : ''}{formatPercentage(pnlPct)}
            </div>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      render: (_: unknown, row: any) => (
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewBotDetails(row.name);
            }}
          >
            <Eye className="w-3 h-3" />
            Details
          </Button>
          {row.status === 'running' ? (
            <Button
              variant="danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedBot(row.name);
                setShowStopConfirm(true);
              }}
            >
              <Square className="w-3 h-3" />
              Stop
            </Button>
          ) : (
            <Button variant="primary" size="sm">
              <Play className="w-3 h-3" />
              Start
            </Button>
          )}
        </div>
      ),
    },
  ];

  const runColumns = [
    {
      key: 'bot_name',
      header: 'Bot',
      render: (value: unknown) => (
        <span className="font-medium text-white">{String(value)}</span>
      ),
    },
    {
      key: 'strategy_name',
      header: 'Strategy',
    },
    {
      key: 'run_status',
      header: 'Status',
      render: (value: unknown) => <StatusBadge status={String(value)} />,
    },
    {
      key: 'deployment_status',
      header: 'Deployment',
      render: (value: unknown) => (
        <Badge variant={value === 'DEPLOYED' ? 'success' : value === 'ARCHIVED' ? 'neutral' : 'danger'}>
          {String(value)}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (value: unknown) => (
        <span className="text-dark-300">{formatRelativeTime(new Date(String(value)).getTime())}</span>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <Header
        title="Bot Management"
        subtitle="Monitor and control your trading bots"
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
      />

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Stats */}
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
              {formatCurrency(botList.reduce((sum, b) => sum + (b.volume || 0), 0))}
            </div>
          </Card>
          <Card>
            <div className="text-dark-400 text-sm mb-1">Total PNL</div>
            <div className={cn(
              'text-2xl font-bold tabular-nums',
              botList.reduce((sum, b) => sum + (b.pnl || 0), 0) >= 0 ? 'text-profit' : 'text-loss'
            )}>
              {botList.reduce((sum, b) => sum + (b.pnl || 0), 0) >= 0 ? '+' : ''}
              {formatCurrency(botList.reduce((sum, b) => sum + (b.pnl || 0), 0))}
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active Bots ({botList.length})</TabsTrigger>
            <TabsTrigger value="history">Run History ({botRuns?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <Card padding="none">
              <div className="p-5 border-b border-dark-700 flex items-center justify-between">
                <CardTitle>Bot Instances</CardTitle>
                <Button variant="primary" size="sm" onClick={() => setShowDeployModal(true)}>
                  <Plus className="w-4 h-4" />
                  Deploy Bot
                </Button>
              </div>
              <Table
                columns={botColumns}
                data={botList}
                keyExtractor={(row) => row.name}
                isLoading={isLoading}
                emptyMessage="No bots found. Deploy your first bot to get started."
              />
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card padding="none">
              <div className="p-5 border-b border-dark-700">
                <CardTitle>Bot Run History</CardTitle>
              </div>
              <Table
                columns={runColumns}
                data={botRuns || []}
                keyExtractor={(row) => String(row.id)}
                isLoading={runsLoading}
                emptyMessage="No bot runs recorded yet."
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        isOpen={showStopConfirm}
        onClose={() => setShowStopConfirm(false)}
        onConfirm={handleStopBot}
        title="Stop Bot"
        message={`Are you sure you want to stop "${selectedBot}"? This will cancel all open orders.`}
        confirmText="Stop Bot"
        variant="danger"
        isLoading={stopBot.isLoading}
      />

      <DeployBotModal
        isOpen={showDeployModal}
        onClose={() => setShowDeployModal(false)}
        onSuccess={() => {
          refresh();
        }}
      />
    </div>
  );
}

