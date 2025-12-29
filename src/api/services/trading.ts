import { getApiClient } from '../client';
import type {
  Order,
  Position,
  Trade,
  TradeRequest,
  TradeResponse,
  ActiveOrdersRequest,
  PositionsRequest,
  TradesRequest,
  PaginatedResponse,
} from '../../types/api';

export const tradingService = {
  /**
   * Place a trade order
   */
  async placeOrder(request: TradeRequest): Promise<TradeResponse> {
    const client = getApiClient();
    return client.post<TradeResponse>('/trading/orders', request);
  },

  /**
   * Cancel an order
   */
  async cancelOrder(
    accountName: string,
    connectorName: string,
    clientOrderId: string
  ): Promise<{ status: string; message: string }> {
    const client = getApiClient();
    return client.post(`/trading/${accountName}/${connectorName}/orders/${clientOrderId}/cancel`);
  },

  /**
   * Get active (in-flight) orders
   */
  async getActiveOrders(request: ActiveOrdersRequest = {}): Promise<PaginatedResponse<Order>> {
    const client = getApiClient();
    return client.post<PaginatedResponse<Order>>('/trading/orders/active', request);
  },

  /**
   * Search historical orders
   */
  async searchOrders(request: TradesRequest = {}): Promise<PaginatedResponse<Order>> {
    const client = getApiClient();
    return client.post<PaginatedResponse<Order>>('/trading/orders/search', request);
  },

  /**
   * Get current positions (perpetual)
   */
  async getPositions(request: PositionsRequest = {}): Promise<PaginatedResponse<Position>> {
    const client = getApiClient();
    return client.post<PaginatedResponse<Position>>('/trading/positions', request);
  },

  /**
   * Get trade history
   */
  async getTrades(request: TradesRequest = {}): Promise<PaginatedResponse<Trade>> {
    const client = getApiClient();
    return client.post<PaginatedResponse<Trade>>('/trading/trades', request);
  },

  /**
   * Set position mode for perpetual connector
   */
  async setPositionMode(
    accountName: string,
    connectorName: string,
    positionMode: 'HEDGE' | 'ONEWAY'
  ): Promise<{ status: string; message: string }> {
    const client = getApiClient();
    return client.post(`/trading/${accountName}/${connectorName}/position-mode`, { position_mode: positionMode });
  },

  /**
   * Get position mode for perpetual connector
   */
  async getPositionMode(
    accountName: string,
    connectorName: string
  ): Promise<{ position_mode: string; connector_name: string; account_name: string }> {
    const client = getApiClient();
    return client.get(`/trading/${accountName}/${connectorName}/position-mode`);
  },

  /**
   * Set leverage for perpetual trading
   */
  async setLeverage(
    accountName: string,
    connectorName: string,
    tradingPair: string,
    leverage: number
  ): Promise<{ status: string; message: string }> {
    const client = getApiClient();
    return client.post(`/trading/${accountName}/${connectorName}/leverage`, {
      trading_pair: tradingPair,
      leverage,
    });
  },

  /**
   * Get funding payments
   */
  async getFundingPayments(request: {
    account_names?: string[];
    connector_names?: string[];
    trading_pair?: string;
    start_time?: number;
    end_time?: number;
    limit?: number;
    cursor?: string;
  } = {}): Promise<PaginatedResponse<{
    timestamp: number;
    trading_pair: string;
    funding_rate: number;
    payment: number;
    position_amount: number;
  }>> {
    const client = getApiClient();
    return client.post('/trading/funding-payments', request);
  },
};


