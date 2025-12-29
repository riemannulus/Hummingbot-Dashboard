import { getApiClient } from '../client';
import type {
  PortfolioState,
  PortfolioStateRequest,
  PortfolioHistoryRequest,
  PortfolioHistoryItem,
  PortfolioDistributionRequest,
  PortfolioDistribution,
  AccountDistribution,
  PaginatedResponse,
} from '../../types/api';

export const portfolioService = {
  /**
   * Get current portfolio state across all accounts and connectors
   */
  async getState(request: PortfolioStateRequest = {}): Promise<PortfolioState> {
    const client = getApiClient();
    return client.post<PortfolioState>('/portfolio/state', request);
  },

  /**
   * Get portfolio history with optional filtering
   */
  async getHistory(request: PortfolioHistoryRequest = {}): Promise<PaginatedResponse<PortfolioHistoryItem>> {
    const client = getApiClient();
    return client.post<PaginatedResponse<PortfolioHistoryItem>>('/portfolio/history', request);
  },

  /**
   * Get portfolio distribution by tokens
   */
  async getDistribution(request: PortfolioDistributionRequest = {}): Promise<PortfolioDistribution> {
    const client = getApiClient();
    return client.post<PortfolioDistribution>('/portfolio/distribution', request);
  },

  /**
   * Get portfolio distribution by accounts
   */
  async getAccountsDistribution(request: PortfolioDistributionRequest = {}): Promise<{ accounts: AccountDistribution[]; total_value_usd: number }> {
    const client = getApiClient();
    return client.post<{ accounts: AccountDistribution[]; total_value_usd: number }>('/portfolio/accounts-distribution', request);
  },
};


