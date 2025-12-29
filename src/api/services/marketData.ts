import { getApiClient } from '../client';
import type {
  Candle,
  CandlesRequest,
  PriceRequest,
  PricesResponse,
  OrderBook,
} from '../../types/api';

export const marketDataService = {
  /**
   * Get real-time candles
   */
  async getCandles(request: CandlesRequest): Promise<Candle[]> {
    const client = getApiClient();
    return client.post<Candle[]>('/market-data/candles', request);
  },

  /**
   * Get historical candles
   */
  async getHistoricalCandles(request: {
    connector_name: string;
    trading_pair: string;
    interval: string;
    start_time: number;
    end_time: number;
  }): Promise<Candle[]> {
    const client = getApiClient();
    return client.post<Candle[]>('/market-data/historical-candles', request);
  },

  /**
   * Get active market data feeds
   */
  async getActiveFeeds(): Promise<Record<string, { last_access: number; expires_at: number }>> {
    const client = getApiClient();
    return client.get('/market-data/active-feeds');
  },

  /**
   * Get market data settings
   */
  async getSettings(): Promise<Record<string, unknown>> {
    const client = getApiClient();
    return client.get('/market-data/settings');
  },

  /**
   * Get available candle connectors
   */
  async getAvailableConnectors(): Promise<string[]> {
    const client = getApiClient();
    return client.get<string[]>('/market-data/available-candle-connectors');
  },

  /**
   * Get prices for trading pairs
   */
  async getPrices(request: PriceRequest): Promise<PricesResponse> {
    const client = getApiClient();
    return client.post<PricesResponse>('/market-data/prices', request);
  },

  /**
   * Get funding info for perpetual
   */
  async getFundingInfo(connectorName: string, tradingPair: string): Promise<{
    trading_pair: string;
    funding_rate: number;
    next_funding_time: number;
    mark_price: number;
    index_price: number;
  }> {
    const client = getApiClient();
    return client.post('/market-data/funding-info', {
      connector_name: connectorName,
      trading_pair: tradingPair,
    });
  },

  /**
   * Get order book
   */
  async getOrderBook(
    connectorName: string,
    tradingPair: string,
    depth = 10
  ): Promise<OrderBook> {
    const client = getApiClient();
    return client.post<OrderBook>('/market-data/order-book', {
      connector_name: connectorName,
      trading_pair: tradingPair,
      depth,
    });
  },
};


