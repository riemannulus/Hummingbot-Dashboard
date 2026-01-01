import type { BotStatus, BotTrade, ProcessedBotStatus, ControllerPerformance } from '../../../types/api';

/**
 * Trade statistics calculated from bot trades
 */
export interface TradeStats {
  totalTrades: number;
  buyTrades: number;
  sellTrades: number;
  totalVolume: number;
  totalFees: number;
  avgTradeSize: number;
  winRate: number;
}

/**
 * Aggregated performance metrics from bot controllers
 */
export interface AggregatedPerformance {
  pnl: number;
  pnlPct: number;
  volume: number;
  controllers: Array<{ name: string } & Partial<ControllerPerformance>>;
}

/**
 * Process raw bot status data into a flat list for display
 */
export function processBotData(bots: Record<string, BotStatus> | null): ProcessedBotStatus[] {
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

/**
 * Calculate trade statistics from a list of trades
 */
export function calculateTradeStats(trades: BotTrade[]): TradeStats {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      buyTrades: 0,
      sellTrades: 0,
      totalVolume: 0,
      totalFees: 0,
      avgTradeSize: 0,
      winRate: 0,
    };
  }

  const buyTrades = trades.filter((t) => t.trade_type === 'BUY');
  const sellTrades = trades.filter((t) => t.trade_type === 'SELL');

  let totalVolume = 0;
  let totalFees = 0;

  trades.forEach((trade) => {
    const price = parseFloat(trade.price);
    const quantity = parseFloat(trade.quantity);
    totalVolume += price * quantity;

    if (trade.raw_json?.trade_fee?.flat_fees) {
      trade.raw_json.trade_fee.flat_fees.forEach((fee) => {
        totalFees += parseFloat(fee.amount);
      });
    }
  });

  return {
    totalTrades: trades.length,
    buyTrades: buyTrades.length,
    sellTrades: sellTrades.length,
    totalVolume,
    totalFees,
    avgTradeSize: totalVolume / trades.length,
    winRate: sellTrades.length > 0 ? (sellTrades.length / trades.length) * 100 : 0,
  };
}

/**
 * Extract and aggregate performance data from bot status
 */
export function extractPerformance(status: BotStatus | null): AggregatedPerformance | null {
  if (!status?.performance) return null;

  const controllers = Object.entries(status.performance);
  if (controllers.length === 0) return null;

  let totalPnl = 0;
  let totalPnlPct = 0;
  let totalVolume = 0;

  controllers.forEach(([, controller]) => {
    if (controller.performance) {
      totalPnl += controller.performance.global_pnl_quote || 0;
      totalPnlPct += controller.performance.global_pnl_pct || 0;
      totalVolume += controller.performance.volume_traded || 0;
    }
  });

  return {
    pnl: totalPnl,
    pnlPct: totalPnlPct,
    volume: totalVolume,
    controllers: controllers.map(([name, c]) => ({
      name,
      ...c.performance,
    })),
  };
}

/**
 * Extract trades from bot history response
 */
export function extractTrades(history: unknown): BotTrade[] {
  if (!history) return [];
  // Navigate through the nested response structure
  const data = (history as any)?.response?.data?.data?.trades;
  return Array.isArray(data) ? data : [];
}

