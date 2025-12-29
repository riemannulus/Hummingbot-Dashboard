import { getApiClient } from '../client';
import type {
  ArchivedBot,
  ArchivedBotSummary,
  ArchivedBotPerformance,
  Trade,
  Order,
} from '../../types/api';

export const archivedBotsService = {
  /**
   * List all archived bot databases
   */
  async listDatabases(): Promise<string[]> {
    const client = getApiClient();
    return client.get<string[]>('/archived-bots/');
  },

  /**
   * Get database status
   */
  async getStatus(dbPath: string): Promise<{ status: string; tables: string[] }> {
    const client = getApiClient();
    const encodedPath = encodeURIComponent(dbPath);
    return client.get(`/archived-bots/${encodedPath}/status`);
  },

  /**
   * Get database summary
   */
  async getSummary(dbPath: string): Promise<ArchivedBotSummary> {
    const client = getApiClient();
    const encodedPath = encodeURIComponent(dbPath);
    return client.get<ArchivedBotSummary>(`/archived-bots/${encodedPath}/summary`);
  },

  /**
   * Get database performance metrics
   */
  async getPerformance(dbPath: string): Promise<ArchivedBotPerformance> {
    const client = getApiClient();
    const encodedPath = encodeURIComponent(dbPath);
    return client.get<ArchivedBotPerformance>(`/archived-bots/${encodedPath}/performance`);
  },

  /**
   * Get trades from archived bot
   */
  async getTrades(
    dbPath: string,
    options?: { limit?: number; offset?: number }
  ): Promise<{ trades: Trade[]; total: number }> {
    const client = getApiClient();
    const encodedPath = encodeURIComponent(dbPath);
    return client.get(`/archived-bots/${encodedPath}/trades`, options);
  },

  /**
   * Get orders from archived bot
   */
  async getOrders(
    dbPath: string,
    options?: { limit?: number; offset?: number; status?: string }
  ): Promise<{ orders: Order[]; total: number }> {
    const client = getApiClient();
    const encodedPath = encodeURIComponent(dbPath);
    return client.get(`/archived-bots/${encodedPath}/orders`, options);
  },

  /**
   * Get executors from archived bot
   */
  async getExecutors(dbPath: string): Promise<Array<{
    id: string;
    type: string;
    config: Record<string, unknown>;
    result: Record<string, unknown>;
  }>> {
    const client = getApiClient();
    const encodedPath = encodeURIComponent(dbPath);
    return client.get(`/archived-bots/${encodedPath}/executors`);
  },

  /**
   * Get positions from archived bot
   */
  async getPositions(
    dbPath: string,
    options?: { limit?: number; offset?: number }
  ): Promise<{ positions: Array<Record<string, unknown>>; total: number }> {
    const client = getApiClient();
    const encodedPath = encodeURIComponent(dbPath);
    return client.get(`/archived-bots/${encodedPath}/positions`, options);
  },

  /**
   * Get controllers from archived bot
   */
  async getControllers(dbPath: string): Promise<Array<{
    name: string;
    type: string;
    config: Record<string, unknown>;
  }>> {
    const client = getApiClient();
    const encodedPath = encodeURIComponent(dbPath);
    return client.get(`/archived-bots/${encodedPath}/controllers`);
  },
};


