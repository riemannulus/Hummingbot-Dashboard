import React, { useEffect, useState } from 'react';
import { Users, Key, Server, Container, RefreshCw, Plus, Trash2, Play, Square } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Table, DataRow } from '../../components/ui/Table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { usePolling } from '../../hooks/usePolling';
import { useLazyApi } from '../../hooks/useApi';
import { accountsService, gatewayService, dockerService, connectorsService } from '../../api';
import { formatRelativeTime } from '../../lib/utils';
import { POLLING_INTERVALS } from '../../lib/constants';

export function SettingsPage() {
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');

  // Accounts
  const { data: accounts, isLoading: accountsLoading, refresh: refreshAccounts } = usePolling({
    fetcher: () => accountsService.listAccounts(),
    interval: POLLING_INTERVALS.DEFAULT * 2,
  });

  // Connectors
  const { data: connectors, isLoading: connectorsLoading } = usePolling({
    fetcher: () => connectorsService.listConnectors(),
    interval: POLLING_INTERVALS.DEFAULT * 4,
  });

  // Gateway Status
  const { data: gatewayStatus, isLoading: gatewayLoading, refresh: refreshGateway } = usePolling({
    fetcher: () => gatewayService.getStatus(),
    interval: POLLING_INTERVALS.BOT_STATUS,
  });

  // Docker
  const { data: dockerRunning, refresh: refreshDocker } = usePolling({
    fetcher: async () => {
      const result = await dockerService.isRunning();
      return result.is_running;
    },
    interval: POLLING_INTERVALS.DEFAULT * 2,
  });

  const { data: containers, isLoading: containersLoading } = usePolling({
    fetcher: () => dockerService.getActiveContainers(),
    interval: POLLING_INTERVALS.BOT_STATUS,
  });

  // Add account
  const addAccount = useLazyApi(accountsService.addAccount);

  const handleAddAccount = async () => {
    if (!newAccountName.trim()) return;
    await addAccount.execute(newAccountName.trim());
    setShowAddAccount(false);
    setNewAccountName('');
    refreshAccounts();
  };

  // Gateway controls
  const startGateway = useLazyApi(gatewayService.start);
  const stopGateway = useLazyApi(gatewayService.stop);

  const containerColumns = [
    {
      key: 'name',
      header: 'Name',
      render: (value: unknown) => (
        <span className="font-medium text-white">{String(value)}</span>
      ),
    },
    {
      key: 'image',
      header: 'Image',
      render: (value: unknown) => (
        <span className="text-dark-300 text-sm">{String(value)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: unknown) => <StatusBadge status={String(value)} />,
    },
    {
      key: 'created',
      header: 'Created',
      render: (value: unknown) => (
        <span className="text-dark-400">{formatRelativeTime(new Date(String(value)).getTime())}</span>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <Header title="Settings" subtitle="Configure your Hummingbot environment" />

      <div className="p-6">
        <Tabs defaultValue="accounts">
          <TabsList>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="connectors">Connectors</TabsTrigger>
            <TabsTrigger value="gateway">Gateway</TabsTrigger>
            <TabsTrigger value="docker">Docker</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Accounts</CardTitle>
                  <CardDescription>Manage trading accounts and credentials</CardDescription>
                </div>
                <Button variant="primary" size="sm" onClick={() => setShowAddAccount(true)}>
                  <Plus className="w-4 h-4" />
                  Add Account
                </Button>
              </CardHeader>

              {accountsLoading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-dark-700 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {accounts?.map((account) => (
                    <div
                      key={account}
                      className="flex items-center justify-between p-4 bg-dark-700/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-dark-600 flex items-center justify-center">
                          <Users className="w-5 h-5 text-accent-green" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{account}</p>
                          <p className="text-sm text-dark-400">Trading Account</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm">
                          <Key className="w-4 h-4" />
                          Credentials
                        </Button>
                        {account !== 'master' && (
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-loss" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="connectors">
            <Card>
              <CardHeader>
                <CardTitle>Available Connectors</CardTitle>
                <CardDescription>Supported exchanges and trading platforms</CardDescription>
              </CardHeader>

              {connectorsLoading ? (
                <div className="animate-pulse grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-12 bg-dark-700 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {connectors?.map((connector) => (
                    <Badge key={connector} variant="neutral" className="px-3 py-1.5">
                      {connector}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="gateway">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gateway Status</CardTitle>
                  <CardDescription>DEX trading gateway for decentralized exchanges</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`status-dot ${gatewayStatus?.running ? 'online' : 'offline'}`} />
                  <span className={gatewayStatus?.running ? 'text-profit' : 'text-dark-400'}>
                    {gatewayStatus?.running ? 'Running' : 'Stopped'}
                  </span>
                </div>
              </CardHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-dark-700/30 rounded-lg">
                    <DataRow label="Container ID" value={gatewayStatus?.container_id || '-'} />
                    <DataRow label="Image" value={gatewayStatus?.image || '-'} />
                    <DataRow label="Port" value={gatewayStatus?.port || '-'} />
                  </div>
                </div>

                <div className="flex gap-2">
                  {gatewayStatus?.running ? (
                    <Button
                      variant="danger"
                      onClick={() => stopGateway.execute()}
                      isLoading={stopGateway.isLoading}
                    >
                      <Square className="w-4 h-4" />
                      Stop Gateway
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => startGateway.execute({ passphrase: 'admin' })}
                      isLoading={startGateway.isLoading}
                    >
                      <Play className="w-4 h-4" />
                      Start Gateway
                    </Button>
                  )}
                  <Button variant="secondary" onClick={refreshGateway}>
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="docker">
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Docker Status</CardTitle>
                    <CardDescription>Docker daemon and container management</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`status-dot ${dockerRunning ? 'online' : 'offline'}`} />
                    <span className={dockerRunning ? 'text-profit' : 'text-loss'}>
                      {dockerRunning ? 'Running' : 'Not Running'}
                    </span>
                  </div>
                </CardHeader>
              </Card>

              <Card padding="none">
                <div className="p-5 border-b border-dark-700">
                  <CardTitle>Active Containers</CardTitle>
                </div>
                <Table
                  columns={containerColumns}
                  data={containers || []}
                  keyExtractor={(row) => row.id}
                  isLoading={containersLoading}
                  emptyMessage="No active containers"
                />
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Modal
        isOpen={showAddAccount}
        onClose={() => setShowAddAccount(false)}
        title="Add Account"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Account Name"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            placeholder="Enter account name"
            autoFocus
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowAddAccount(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddAccount}
              isLoading={addAccount.isLoading}
              disabled={!newAccountName.trim()}
            >
              Add Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


