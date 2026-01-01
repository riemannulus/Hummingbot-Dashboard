import React, { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { LineChart } from '../../components/ui/Charts/LineChart';
import { usePolling } from '../../hooks/usePolling';
import { portfolioService } from '../../api';
import { formatCurrency, formatCrypto, formatPercentage, cn } from '../../lib/utils';
import { POLLING_INTERVALS } from '../../lib/constants';

export function PortfolioPage() {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const { data: portfolioState, isLoading, isRefreshing, lastUpdated, refresh } = usePolling({
    fetcher: () => portfolioService.getState({ refresh: true }),
    interval: POLLING_INTERVALS.PORTFOLIO,
  });

  const { data: distribution } = usePolling({
    fetcher: () => portfolioService.getDistribution({}),
    interval: POLLING_INTERVALS.PORTFOLIO,
  });

  const accounts = Object.keys(portfolioState || {});
  const currentAccount = selectedAccount || accounts[0];

  // Flatten all balances for the selected account
  const balances: Array<{
    token: string;
    connector: string;
    total: number;
    available: number;
    usdValue: number;
  }> = [];

  if (portfolioState && currentAccount && portfolioState[currentAccount]) {
    const accountData = portfolioState[currentAccount];
    Object.entries(accountData).forEach(([connector, tokens]) => {
      if (Array.isArray(tokens)) {
        tokens.forEach((token: any) => {
          balances.push({
            token: token.token || token.asset || 'Unknown',
            connector,
            total: token.units || token.total_balance || token.total || 0,
            available: token.available_units || token.available_balance || token.available || 0,
            usdValue: token.value || token.usd_value || 0,
          });
        });
      }
    });
  }

  const columns = [
    {
      key: 'token',
      header: 'Asset',
      render: (value: unknown) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-xs font-medium">
            {String(value).slice(0, 2)}
          </div>
          <span className="font-medium text-white">{String(value)}</span>
        </div>
      ),
    },
    {
      key: 'connector',
      header: 'Connector',
      render: (value: unknown) => (
        <Badge variant="neutral">{String(value)}</Badge>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="tabular-nums">{formatCrypto(Number(value))}</span>
      ),
    },
    {
      key: 'available',
      header: 'Available',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="tabular-nums text-dark-300">{formatCrypto(Number(value))}</span>
      ),
    },
    {
      key: 'usdValue',
      header: 'USD Value',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="tabular-nums font-medium">{formatCurrency(Number(value))}</span>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <Header
        title="Portfolio"
        subtitle="Manage your assets across all accounts"
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
      />

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Account Selector */}
        {accounts.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {accounts.map((account) => (
              <button
                key={account}
                onClick={() => setSelectedAccount(account)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  currentAccount === account
                    ? 'bg-accent-green text-dark-900'
                    : 'bg-dark-700 text-dark-300 hover:text-white'
                )}
              >
                {account}
              </button>
            ))}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <Card>
            <div className="text-dark-400 text-sm mb-1">Total Value</div>
            <div className="text-2xl font-bold text-white tabular-nums">
              {formatCurrency(distribution?.total_portfolio_value || 0)}
            </div>
          </Card>
          <Card>
            <div className="text-dark-400 text-sm mb-1">Assets</div>
            <div className="text-2xl font-bold text-white">
              {distribution?.token_count || distribution?.distribution?.length || 0}
            </div>
          </Card>
          <Card>
            <div className="text-dark-400 text-sm mb-1">Connectors</div>
            <div className="text-2xl font-bold text-white">
              {Object.keys(portfolioState?.[currentAccount] || {}).length}
            </div>
          </Card>
        </div>

        {/* Balances Table */}
        <Card padding="none">
          <div className="p-5 border-b border-dark-700">
            <CardTitle>Asset Balances</CardTitle>
          </div>
          <Table
            columns={columns}
            data={balances}
            keyExtractor={(row) => `${row.connector}-${row.token}`}
            isLoading={isLoading}
            emptyMessage="No assets found"
          />
        </Card>
      </div>
    </div>
  );
}

