// =====================
// Common Types
// =====================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    has_more: boolean;
    next_cursor?: string;
    total_count?: number;
  };
}

// =====================
// Auth Types
// =====================

export interface Credentials {
  username: string;
  password: string;
}

// =====================
// Portfolio Types
// =====================

export interface PortfolioStateRequest {
  account_names?: string[];
  connector_names?: string[];
  skip_gateway?: boolean;
  refresh?: boolean;
}

export interface TokenBalance {
  token: string;
  total_balance: number;
  available_balance: number;
  usd_value?: number;
  price?: number;
}

export interface ConnectorBalance {
  connector: string;
  balances: TokenBalance[];
  total_usd_value: number;
}

export interface AccountState {
  [connector: string]: TokenBalance[];
}

export interface PortfolioState {
  [account: string]: AccountState;
}

export interface PortfolioHistoryRequest {
  account_names?: string[];
  connector_names?: string[];
  start_time?: number;
  end_time?: number;
  interval?: string;
  limit?: number;
  cursor?: string;
}

// Token balance in portfolio history
export interface PortfolioHistoryTokenBalance {
  token: string;
  units: number;
  price: number;
  value: number;
  available_units: number;
}

// Actual API response format for portfolio history
export interface PortfolioHistoryItem {
  timestamp: string; // ISO date string
  state: Record<string, Record<string, PortfolioHistoryTokenBalance[]>>;
}

// Processed history item for charts
export interface ProcessedHistoryItem {
  timestamp: number;
  value: number;
  [key: string]: unknown;
}

export interface PortfolioDistributionRequest {
  account_names?: string[];
  connector_names?: string[];
}

export interface TokenDistribution {
  token: string;
  percentage: number;
  total_value: number;
  total_units: number;
  accounts: Record<string, {
    value: number;
    units: number;
    percentage: number;
    connectors: Record<string, {
      value: number;
      units: number;
    }>;
  }>;
}

export interface PortfolioDistribution {
  total_portfolio_value: number;
  token_count: number;
  distribution: TokenDistribution[];
  account_filter: string;
}

export interface AccountDistribution {
  account: string;
  percentage: number;
  usd_value: number;
  connectors: Record<string, number>;
}

// =====================
// Bot Types
// =====================

export interface ControllerPerformance {
  realized_pnl_quote: number;
  unrealized_pnl_quote: number;
  unrealized_pnl_pct: number;
  realized_pnl_pct: number;
  global_pnl_quote: number;
  global_pnl_pct: number;
  volume_traded: number;
  positions_summary: unknown[];
  close_type_counts: Record<string, number>;
}

export interface ControllerStatus {
  status: string;
  performance: ControllerPerformance;
}

export interface BotLogEntry {
  level_name: string;
  msg: string;
  timestamp: number;
  level_no: number;
  logger_name: string;
}

export interface BotStatus {
  status: 'running' | 'stopped' | 'error' | 'starting' | 'stopping';
  performance: Record<string, ControllerStatus>;
  error_logs: BotLogEntry[];
  general_logs: BotLogEntry[];
  recently_active: boolean;
  source: string;
}

// Helper type for processed bot data
export interface ProcessedBotStatus {
  name: string;
  status: string;
  strategy: string;
  pnl: number;
  pnl_pct: number;
  volume: number;
  error_count: number;
}

export interface BotRun {
  id: number;
  bot_name: string;
  account_name: string;
  strategy_type: string;
  strategy_name: string;
  run_status: 'CREATED' | 'RUNNING' | 'STOPPED' | 'ERROR';
  deployment_status: 'DEPLOYED' | 'FAILED' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
}

export interface BotHistory {
  trades: Trade[];
  pnl: number;
  pnl_percentage: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
}

// Detailed trade from bot history API
export interface BotTrade {
  market: string;
  trade_id: string;
  price: string;
  quantity: string;
  symbol: string;
  trade_timestamp: number;
  trade_type: 'BUY' | 'SELL';
  base_asset: string;
  quote_asset: string;
  raw_json?: {
    trade_fee?: {
      fee_type: string;
      percent: string;
      percent_token: string;
      flat_fees: Array<{ token: string; amount: string }>;
    };
  };
}

// Detailed history response from bot history API
export interface BotDetailedHistory {
  status: string;
  response: {
    success: boolean;
    data: {
      header: {
        reply_to: string;
        timestamp: number;
        content_type: string;
        encoding: string;
        agent: string;
      };
      data: {
        status: number;
        msg: string;
        trades: BotTrade[];
      };
    };
  };
}

// Controller configuration for a bot
export interface BotControllerConfig {
  id: string;
  connector_name: string;
  controller_name: string;
  controller_type: string;
  trading_pair: string;
  leverage?: number;
  position_mode?: string;
  total_amount_quote?: number;
  start_price?: number;
  end_price?: number;
  limit_price?: number;
  min_spread_between_orders?: number;
  max_open_orders?: number;
  order_frequency?: number;
  side?: number;
  // DCA parameters
  dca_spreads?: string[];
  dca_amounts_pct?: string[];
  // Stop loss / Take profit
  stop_loss?: string;
  take_profit?: string;
  trailing_stop?: {
    activation_price: string;
    trailing_delta: string;
  };
  // Additional config
  [key: string]: unknown;
}

export interface StartBotRequest {
  bot_name: string;
  script?: string;
  conf?: string;
  log_level?: string;
  async_backend?: boolean;
}

export interface StopBotRequest {
  bot_name: string;
  skip_order_cancellation?: boolean;
  async_backend?: boolean;
}

export interface V2ScriptDeployment {
  instance_name: string;
  credentials_profile: string;
  image?: string;
  script?: string;
  script_config?: string;
  headless?: boolean;
}

export interface V2ControllerDeployment {
  instance_name: string;
  credentials_profile: string;
  controllers_config: string[];
  max_global_drawdown_quote?: number;
  max_controller_drawdown_quote?: number;
  image?: string;
  headless?: boolean;
}

// =====================
// Trading Types
// =====================

export interface Order {
  order_id: string;
  client_order_id: string;
  trading_pair: string;
  order_type: 'LIMIT' | 'MARKET' | 'LIMIT_MAKER';
  trade_type: 'BUY' | 'SELL';
  price: number;
  amount: number;
  filled_amount: number;
  status: string;
  created_at: number;
  connector: string;
  account: string;
}

export interface Position {
  trading_pair: string;
  position_side: 'LONG' | 'SHORT';
  amount: number;
  entry_price: number;
  mark_price: number;
  unrealized_pnl: number;
  leverage: number;
  liquidation_price?: number;
  connector: string;
  account: string;
}

export interface Trade {
  trade_id: string;
  order_id: string;
  trading_pair: string;
  trade_type: 'BUY' | 'SELL';
  price: number;
  amount: number;
  fee: number;
  fee_asset: string;
  timestamp: number;
  connector: string;
  account: string;
}

export interface TradeRequest {
  account_name: string;
  connector_name: string;
  trading_pair: string;
  trade_type: 'BUY' | 'SELL';
  amount: number;
  order_type?: 'LIMIT' | 'MARKET' | 'LIMIT_MAKER';
  price?: number;
  position_action?: 'OPEN' | 'CLOSE';
}

export interface TradeResponse {
  order_id: string;
  account_name: string;
  connector_name: string;
  trading_pair: string;
  trade_type: string;
  amount: string;
  order_type: string;
  price: string | null;
  status: string;
}

export interface ActiveOrdersRequest {
  account_names?: string[];
  connector_names?: string[];
  trading_pairs?: string[];
  limit?: number;
  cursor?: string;
}

export interface PositionsRequest {
  account_names?: string[];
  connector_names?: string[];
  limit?: number;
  cursor?: string;
}

export interface TradesRequest {
  account_names?: string[];
  connector_names?: string[];
  trading_pairs?: string[];
  trade_types?: string[];
  start_time?: number;
  end_time?: number;
  limit?: number;
  cursor?: string;
}

// =====================
// Account Types
// =====================

export interface Account {
  name: string;
  credentials: string[];
}

export interface Connector {
  name: string;
  config_fields: string[];
}

// =====================
// Docker Types
// =====================

export interface DockerContainer {
  name: string;
  id: string;
  image: string;
  status: string;
  created: string;
  ports?: Record<string, string>;
}

export interface DockerImage {
  tag: string;
  id: string;
  created: string;
  size: number;
}

// =====================
// Gateway Types
// =====================

export interface GatewayStatus {
  running: boolean;
  container_id?: string;
  image?: string;
  created_at?: string;
  port?: number;
}

export interface GatewayWallet {
  chain: string;
  address: string;
  balance?: number;
}

export interface GatewayConnector {
  name: string;
  chain: string;
  networks: string[];
  trading_types: string[];
}

// =====================
// Controller/Script Types
// =====================

export interface Controller {
  name: string;
  type: 'directional_trading' | 'market_making' | 'generic';
  content?: string;
}

export interface ControllerConfig {
  id: string;
  controller_name: string;
  controller_type: string;
  connector_name: string;
  trading_pair: string;
  [key: string]: unknown;
}

export interface Script {
  name: string;
  content?: string;
}

export interface ScriptConfig {
  name: string;
  script_file_name: string;
  config: Record<string, unknown>;
}

// =====================
// Market Data Types
// =====================

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CandlesRequest {
  connector_name: string;
  trading_pair: string;
  interval?: string;
  max_records?: number;
}

export interface PriceRequest {
  connector_name: string;
  trading_pairs: string[];
}

export interface PricesResponse {
  connector: string;
  prices: Record<string, number>;
  timestamp: number;
}

export interface OrderBookLevel {
  price: number;
  amount: number;
}

export interface OrderBook {
  trading_pair: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: number;
}

// =====================
// Archived Bots Types
// =====================

export interface ArchivedBot {
  path: string;
  name: string;
}

export interface ArchivedBotSummary {
  total_trades: number;
  total_pnl: number;
  start_time: number;
  end_time: number;
  trading_pairs: string[];
}

export interface ArchivedBotPerformance {
  pnl: number;
  pnl_percentage: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  avg_trade_duration: number;
  max_drawdown: number;
}

