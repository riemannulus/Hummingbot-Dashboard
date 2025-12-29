import { getApiClient } from '../client';
import type { GatewayWallet } from '../../types/api';

export const accountsService = {
  /**
   * List all accounts
   */
  async listAccounts(): Promise<string[]> {
    const client = getApiClient();
    return client.get<string[]>('/accounts/');
  },

  /**
   * List credentials for an account
   */
  async listCredentials(accountName: string): Promise<string[]> {
    const client = getApiClient();
    return client.get<string[]>(`/accounts/${accountName}/credentials`);
  },

  /**
   * Add a new account
   */
  async addAccount(accountName: string): Promise<{ message: string }> {
    const client = getApiClient();
    return client.post('/accounts/add-account', undefined);
  },

  /**
   * Delete an account
   */
  async deleteAccount(accountName: string): Promise<{ message: string }> {
    const client = getApiClient();
    return client.post('/accounts/delete-account', undefined);
  },

  /**
   * Add credential for account and connector
   */
  async addCredential(
    accountName: string,
    connectorName: string,
    credentials: Record<string, string>
  ): Promise<{ message: string }> {
    const client = getApiClient();
    return client.post(`/accounts/add-credential/${accountName}/${connectorName}`, credentials);
  },

  /**
   * Delete credential
   */
  async deleteCredential(accountName: string, connectorName: string): Promise<{ message: string }> {
    const client = getApiClient();
    return client.post(`/accounts/delete-credential/${accountName}/${connectorName}`);
  },

  /**
   * List Gateway wallets
   */
  async listGatewayWallets(): Promise<GatewayWallet[]> {
    const client = getApiClient();
    return client.get<GatewayWallet[]>('/accounts/gateway/wallets');
  },

  /**
   * Add Gateway wallet
   */
  async addGatewayWallet(chain: string, privateKey: string, network?: string): Promise<GatewayWallet> {
    const client = getApiClient();
    return client.post<GatewayWallet>('/accounts/gateway/add-wallet', {
      chain,
      private_key: privateKey,
      network,
    });
  },

  /**
   * Remove Gateway wallet
   */
  async removeGatewayWallet(chain: string, address: string): Promise<{ message: string }> {
    const client = getApiClient();
    return client.delete(`/accounts/gateway/${chain}/${address}`);
  },
};


