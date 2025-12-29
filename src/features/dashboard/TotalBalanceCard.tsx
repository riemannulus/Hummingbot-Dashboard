import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatCurrency, formatPercentage, cn } from '../../lib/utils';
import type { PortfolioDistribution } from '../../types/api';

interface TotalBalanceCardProps {
  distribution: PortfolioDistribution | null;
  isLoading: boolean;
  previousValue?: number;
}

export function TotalBalanceCard({
  distribution,
  isLoading,
  previousValue,
}: TotalBalanceCardProps) {
  const totalValue = distribution?.total_portfolio_value || 0;
  
  const change = useMemo(() => {
    if (!previousValue || previousValue === 0) return null;
    const diff = totalValue - previousValue;
    const percentage = (diff / previousValue) * 100;
    return { value: diff, percentage };
  }, [totalValue, previousValue]);

  if (isLoading) {
    return (
      <Card className="gradient-border">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton width={100} />
        </div>
        <Skeleton width="60%" height={40} className="mb-2" />
        <Skeleton width={120} />
      </Card>
    );
  }

  return (
    <Card className="gradient-border overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent-green/10 rounded-full blur-3xl" />
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-accent-green/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-accent-green" />
          </div>
          <span className="text-dark-300 font-medium">Total Balance</span>
        </div>

        <div className="mb-2">
          <span className="text-4xl font-bold text-white tabular-nums">
            {formatCurrency(totalValue)}
          </span>
        </div>

        {change && (
          <div
            className={cn(
              'flex items-center gap-1.5',
              change.value >= 0 ? 'text-profit' : 'text-loss'
            )}
          >
            {change.value >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="font-medium">
              {formatCurrency(Math.abs(change.value))}
            </span>
            <span className="text-dark-400">
              ({formatPercentage(change.percentage)})
            </span>
            <span className="text-dark-500 text-sm">today</span>
          </div>
        )}

        {!change && (
          <div className="flex items-center gap-1.5 text-dark-400">
            <span>Portfolio value in USD</span>
          </div>
        )}
      </div>
    </Card>
  );
}

