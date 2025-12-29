import { getApiClient } from '../client';

export const connectorsService = {
  /**
   * List available connectors
   */
  async listConnectors(): Promise<string[]> {
    const client = getApiClient();
    return client.get<string[]>('/connectors/');
  },

  /**
   * Get connector config map (required fields)
   */
  async getConfigMap(connectorName: string): Promise<string[]> {
    const client = getApiClient();
    return client.get<string[]>(`/connectors/${connectorName}/config-map`);
  },

  /**
   * Get trading rules for a connector
   */
  async getTradingRules(
    connectorName: string,
    tradingPairs?: string[]
  ): Promise<Record<string, {
    trading_pair: string;
    min_order_size: number;
    max_order_size: number;
    min_price_increment: number;
    min_base_amount_increment: number;
    min_quote_amount_increment: number;
    min_notional_size: number;
    supports_limit_orders: boolean;
    supports_market_orders: boolean;
  }>> {
    const client = getApiClient();
    return client.get(`/connectors/${connectorName}/trading-rules`, { trading_pairs: tradingPairs?.join(',') });
  },

  /**
   * Get supported order types
   */
  async getOrderTypes(connectorName: string): Promise<string[]> {
    const client = getApiClient();
    return client.get<string[]>(`/connectors/${connectorName}/order-types`);
  },
};


