import { usePolling } from '../../../hooks/usePolling';
import { portfolioService, botsService, tradingService } from '../../../api';
import { POLLING_INTERVALS } from '../../../lib/constants';

export function usePortfolioState() {
  return usePolling({
    fetcher: () => portfolioService.getState({ refresh: true }),
    interval: POLLING_INTERVALS.PORTFOLIO,
    pauseOnHidden: true,
  });
}

export function usePortfolioDistribution() {
  return usePolling({
    fetcher: () => portfolioService.getDistribution({}),
    interval: POLLING_INTERVALS.PORTFOLIO,
    pauseOnHidden: true,
  });
}

export function useBotsStatus() {
  return usePolling({
    fetcher: async () => {
      const result = await botsService.getStatus();
      return result.data || {};
    },
    interval: POLLING_INTERVALS.BOT_STATUS,
    pauseOnHidden: true,
  });
}

export function useRecentTrades(limit = 10) {
  return usePolling({
    fetcher: async () => {
      const result = await tradingService.getTrades({ limit });
      return result.data || [];
    },
    interval: POLLING_INTERVALS.TRADES,
    pauseOnHidden: true,
  });
}

// Combined dashboard data hook
export function useDashboardData() {
  const portfolio = usePortfolioState();
  const distribution = usePortfolioDistribution();
  const bots = useBotsStatus();
  const trades = useRecentTrades();

  const isLoading =
    portfolio.isLoading ||
    distribution.isLoading ||
    bots.isLoading ||
    trades.isLoading;

  const isRefreshing =
    portfolio.isRefreshing ||
    distribution.isRefreshing ||
    bots.isRefreshing ||
    trades.isRefreshing;

  const refresh = async () => {
    await Promise.all([
      portfolio.refresh(),
      distribution.refresh(),
      bots.refresh(),
      trades.refresh(),
    ]);
  };

  const lastUpdated = Math.max(
    portfolio.lastUpdated || 0,
    distribution.lastUpdated || 0,
    bots.lastUpdated || 0,
    trades.lastUpdated || 0
  ) || null;

  return {
    portfolio: portfolio.data,
    distribution: distribution.data,
    bots: bots.data,
    trades: trades.data,
    isLoading,
    isRefreshing,
    lastUpdated,
    refresh,
  };
}
