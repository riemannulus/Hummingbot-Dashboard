// Pages
export { BotsPage } from './BotsPage';
export { BotDetailPage } from './BotDetailPage';

// Hooks (re-export from hooks/bots)
export { useBotsList, useBotDetail } from '../../hooks/bots';

// Components (re-export from components/bots)
export {
  LogEntry,
  BotStatsCards,
  BotPerformanceCards,
  TradesTab,
  ConfigTab,
  StatsTab,
  LogsTab,
  DeployBotModal,
  EditStrategyConfigModal,
} from '../../components/bots';

// Utils
export {
  processBotData,
  calculateTradeStats,
  extractPerformance,
  extractTrades,
  getBotColumns,
  getRunColumns,
  getTradeColumns,
  type TradeStats,
  type AggregatedPerformance,
} from './utils';
