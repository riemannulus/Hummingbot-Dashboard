import { useState, useEffect, useMemo } from 'react';
import { botsService } from '../../api';
import { calculateTradeStats, extractPerformance, extractTrades } from '../../features/bots/utils';
import type { TradeStats, AggregatedPerformance } from '../../features/bots/utils';
import type { BotStatus, BotDetailedHistory, BotControllerConfig, BotTrade } from '../../types/api';

export interface UseBotDetailReturn {
  /** Bot status including logs */
  status: BotStatus | null;
  /** Bot history data */
  history: BotDetailedHistory | null;
  /** Controller configurations */
  configs: BotControllerConfig[];
  /** Extracted trade list */
  trades: BotTrade[];
  /** Calculated trade statistics */
  stats: TradeStats;
  /** Aggregated performance metrics */
  performance: AggregatedPerformance | null;
  /** Whether initial data is loading */
  isLoading: boolean;
  /** Whether data is being refreshed */
  isRefreshing: boolean;
  /** Timestamp of last update */
  lastUpdated: number | null;
  /** Manually refresh all data */
  refresh: () => void;
  /** Fetch data (exposed for modal callbacks) */
  fetchData: () => Promise<void>;
}

/**
 * Hook for managing bot detail page data
 */
export function useBotDetail(botName: string): UseBotDetailReturn {
  const [status, setStatus] = useState<BotStatus | null>(null);
  const [history, setHistory] = useState<BotDetailedHistory | null>(null);
  const [configs, setConfigs] = useState<BotControllerConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

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
  const trades = useMemo(() => extractTrades(history), [history]);

  // Calculate stats
  const stats = useMemo(() => calculateTradeStats(trades), [trades]);

  // Extract performance from status
  const performance = useMemo(() => extractPerformance(status), [status]);

  return {
    status,
    history,
    configs,
    trades,
    stats,
    performance,
    isLoading,
    isRefreshing,
    lastUpdated,
    refresh: handleRefresh,
    fetchData,
  };
}

