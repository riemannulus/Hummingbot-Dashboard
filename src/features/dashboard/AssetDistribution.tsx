import React from 'react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { DonutChart } from '../../components/ui/Charts/DonutChart';
import { Skeleton, SkeletonChart } from '../../components/ui/Skeleton';
import { formatCurrency, formatPercentage } from '../../lib/utils';
import type { PortfolioDistribution } from '../../types/api';

interface AssetDistributionProps {
  distribution: PortfolioDistribution | null;
  isLoading: boolean;
}

export function AssetDistribution({ distribution, isLoading }: AssetDistributionProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton width={150} />
        </CardHeader>
        <SkeletonChart height={250} />
      </Card>
    );
  }

  const chartData = distribution?.distribution
    ?.slice(0, 6)
    .map((token) => ({
      name: token.token,
      value: token.total_value,
      percentage: token.percentage,
    })) || [];

  // Add "Other" category if there are more tokens
  if (distribution?.distribution && distribution.distribution.length > 6) {
    const otherTokens = distribution.distribution.slice(6);
    const otherValue = otherTokens.reduce((sum, t) => sum + t.total_value, 0);
    const otherPercentage = otherTokens.reduce((sum, t) => sum + t.percentage, 0);
    chartData.push({
      name: 'Other',
      value: otherValue,
      percentage: otherPercentage,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Distribution</CardTitle>
      </CardHeader>
      
      <DonutChart
        data={chartData}
        height={220}
        innerRadius={55}
        outerRadius={85}
        centerValue={`${chartData.length}`}
        centerLabel="Assets"
      />

      {/* Asset List */}
      <div className="mt-4 space-y-2">
        {chartData.slice(0, 5).map((token) => (
          <div
            key={token.name}
            className="flex items-center justify-between py-2 border-b border-dark-700/50 last:border-0"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-xs font-medium">
                {token.name.slice(0, 2)}
              </div>
              <div>
                <span className="text-white font-medium">{token.name}</span>
                <span className="text-dark-400 text-sm ml-2">
                  {token.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
            <span className="text-white font-medium tabular-nums">
              {formatCurrency(token.value)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

