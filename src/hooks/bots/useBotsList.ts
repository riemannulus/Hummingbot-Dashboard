import { usePolling } from '../usePolling';
import { useLazyApi } from '../useApi';
import { botsService } from '../../api';
import { POLLING_INTERVALS } from '../../lib/constants';
import { processBotData } from '../../features/bots/utils';
import type { ProcessedBotStatus, BotRun } from '../../types/api';

export interface UseBotsListReturn {
  /** Processed list of bots with aggregated metrics */
  botList: ProcessedBotStatus[];
  /** List of running bots */
  runningBots: ProcessedBotStatus[];
  /** List of stopped bots */
  stoppedBots: ProcessedBotStatus[];
  /** Bot run history */
  botRuns: BotRun[] | null;
  /** Loading state for bot status */
  isLoading: boolean;
  /** Loading state for bot runs */
  runsLoading: boolean;
  /** Whether data is being refreshed */
  isRefreshing: boolean;
  /** Timestamp of last update */
  lastUpdated: number | null;
  /** Manually refresh bot status */
  refresh: () => void;
  /** Manually refresh bot runs */
  refreshRuns: () => void;
  /** Stop a bot by name */
  stopBot: {
    execute: (params: { bot_name: string }) => Promise<void>;
    isLoading: boolean;
  };
}

/**
 * Hook for managing bot list data and operations
 */
export function useBotsList(): UseBotsListReturn {
  // Poll bot status
  const {
    data: botsStatus,
    isLoading,
    isRefreshing,
    lastUpdated,
    refresh,
  } = usePolling({
    fetcher: async () => {
      const result = await botsService.getStatus();
      return result.data || {};
    },
    interval: POLLING_INTERVALS.BOT_STATUS,
  });

  // Poll bot run history
  const {
    data: botRuns,
    isLoading: runsLoading,
    refresh: refreshRuns,
  } = usePolling({
    fetcher: () => botsService.getBotRuns({ limit: 50 }),
    interval: POLLING_INTERVALS.BOT_STATUS * 2,
  });

  // Lazy API for stopping bots
  const stopBotApi = useLazyApi(botsService.stopBot);

  // Process bot data
  const botList = processBotData(botsStatus);
  const runningBots = botList.filter((b) => b.status === 'running');
  const stoppedBots = botList.filter((b) => b.status !== 'running');

  return {
    botList,
    runningBots,
    stoppedBots,
    botRuns,
    isLoading,
    runsLoading,
    isRefreshing,
    lastUpdated,
    refresh,
    refreshRuns,
    stopBot: {
      execute: stopBotApi.execute,
      isLoading: stopBotApi.isLoading,
    },
  };
}

