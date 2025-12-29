import { getApiClient } from '../client';
import type { GatewayStatus, GatewayConnector } from '../../types/api';

export const gatewayService = {
  /**
   * Get Gateway status
   */
  async getStatus(): Promise<GatewayStatus> {
    const client = getApiClient();
    return client.get<GatewayStatus>('/gateway/status');
  },

  /**
   * Start Gateway
   */
  async start(config: {
    passphrase: string;
    image?: string;
    port?: number;
    dev_mode?: boolean;
  }): Promise<{ message: string }> {
    const client = getApiClient();
    return client.post('/gateway/start', config);
  },

  /**
   * Stop Gateway
   */
  async stop(): Promise<{ message: string }> {
    const client = getApiClient();
    return client.post('/gateway/stop');
  },

  /**
   * Restart Gateway
   */
  async restart(config?: {
    passphrase: string;
    image?: string;
    port?: number;
    dev_mode?: boolean;
  }): Promise<{ message: string }> {
    const client = getApiClient();
    return client.post('/gateway/restart', config || null);
  },

  /**
   * Get Gateway logs
   */
  async getLogs(tail = 100): Promise<{ logs: string[] }> {
    const client = getApiClient();
    return client.get('/gateway/logs', { tail });
  },

  /**
   * List connectors
   */
  async listConnectors(): Promise<Record<string, GatewayConnector>> {
    const client = getApiClient();
    return client.get('/gateway/connectors');
  },

  /**
   * Get connector config
   */
  async getConnectorConfig(connectorName: string): Promise<Record<string, unknown>> {
    const client = getApiClient();
    return client.get(`/gateway/connectors/${connectorName}`);
  },

  /**
   * Update connector config
   */
  async updateConnectorConfig(
    connectorName: string,
    config: Record<string, unknown>
  ): Promise<{ message: string }> {
    const client = getApiClient();
    return client.post(`/gateway/connectors/${connectorName}`, config);
  },

  /**
   * List chains
   */
  async listChains(): Promise<Record<string, { networks: string[] }>> {
    const client = getApiClient();
    return client.get('/gateway/chains');
  },

  /**
   * List networks
   */
  async listNetworks(): Promise<{ networks: string[] }> {
    const client = getApiClient();
    return client.get('/gateway/networks');
  },

  /**
   * Get network config
   */
  async getNetworkConfig(networkId: string): Promise<Record<string, unknown>> {
    const client = getApiClient();
    return client.get(`/gateway/networks/${networkId}`);
  },

  /**
   * Update network config
   */
  async updateNetworkConfig(networkId: string, config: Record<string, unknown>): Promise<{ message: string }> {
    const client = getApiClient();
    return client.post(`/gateway/networks/${networkId}`, config);
  },

  /**
   * Get network tokens
   */
  async getNetworkTokens(networkId: string, search?: string): Promise<{ tokens: Array<{ symbol: string; address: string; decimals: number }> }> {
    const client = getApiClient();
    return client.get(`/gateway/networks/${networkId}/tokens`, { search });
  },

  /**
   * List pools
   */
  async listPools(connectorName: string, network: string): Promise<Array<{
    address: string;
    trading_pair: string;
    base: string;
    quote: string;
    fee_pct?: number;
  }>> {
    const client = getApiClient();
    return client.get('/gateway/pools', { connector_name: connectorName, network });
  },
};


