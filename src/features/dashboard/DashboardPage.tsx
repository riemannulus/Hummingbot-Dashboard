import React from 'react';
import { Header } from '../../components/layout/Header';
import { TotalBalanceCard } from './TotalBalanceCard';
import { AssetDistribution } from './AssetDistribution';
import { PortfolioChart } from './PortfolioChart';
import { ActiveBotsWidget } from './ActiveBotsWidget';
import { RecentTradesWidget } from './RecentTradesWidget';
import { AISummaryCard } from '../ai';
import { useDashboardData } from './hooks/useDashboardData';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const {
    distribution,
    bots,
    trades,
    isLoading,
    isRefreshing,
    lastUpdated,
    refresh,
  } = useDashboardData();

  return (
    <div className="animate-fade-in">
      <Header
        title="Dashboard"
        subtitle="Overview of your trading portfolio"
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
      />

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Top Row - Balance and Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2">
            <TotalBalanceCard
              distribution={distribution}
              isLoading={isLoading}
            />
          </div>
          <div>
            <AssetDistribution
              distribution={distribution}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Portfolio Chart */}
        <PortfolioChart />

        {/* Bottom Row - Bots, Trades, and AI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <ActiveBotsWidget
            bots={bots}
            isLoading={isLoading}
            onViewAll={() => onNavigate('/bots')}
          />
          <RecentTradesWidget
            trades={trades}
            isLoading={isLoading}
            onViewAll={() => onNavigate('/trading')}
          />
          <AISummaryCard />
        </div>
      </div>
    </div>
  );
}


