import { getApiClient } from '../client';
import type { Controller, ControllerConfig } from '../../types/api';

export const controllersService = {
  /**
   * List controllers by type
   */
  async listControllers(): Promise<Record<string, string[]>> {
    const client = getApiClient();
    return client.get<Record<string, string[]>>('/controllers/');
  },

  /**
   * List controller configs
   */
  async listConfigs(): Promise<ControllerConfig[]> {
    const client = getApiClient();
    return client.get<ControllerConfig[]>('/controllers/configs/');
  },

  /**
   * Get controller config
   */
  async getConfig(configName: string): Promise<Record<string, unknown>> {
    const client = getApiClient();
    return client.get(`/controllers/configs/${configName}`);
  },

  /**
   * Create or update controller config
   */
  async saveConfig(configName: string, config: Record<string, unknown>): Promise<{ message: string }> {
    const client = getApiClient();
    return client.post(`/controllers/configs/${configName}`, config);
  },

  /**
   * Delete controller config
   */
  async deleteConfig(configName: string): Promise<{ message: string }> {
    const client = getApiClient();
    return client.delete(`/controllers/configs/${configName}`);
  },

  /**
   * Get controller content
   */
  async getController(
    controllerType: 'directional_trading' | 'market_making' | 'generic',
    controllerName: string
  ): Promise<{ name: string; type: string; content: string }> {
    const client = getApiClient();
    return client.get(`/controllers/${controllerType}/${controllerName}`);
  },

  /**
   * Create or update controller
   */
  async saveController(
    controllerType: 'directional_trading' | 'market_making' | 'generic',
    controllerName: string,
    content: string
  ): Promise<{ message: string }> {
    const client = getApiClient();
    return client.post(`/controllers/${controllerType}/${controllerName}`, { content });
  },

  /**
   * Delete controller
   */
  async deleteController(
    controllerType: 'directional_trading' | 'market_making' | 'generic',
    controllerName: string
  ): Promise<{ message: string }> {
    const client = getApiClient();
    return client.delete(`/controllers/${controllerType}/${controllerName}`);
  },

  /**
   * Get controller config template
   */
  async getConfigTemplate(
    controllerType: 'directional_trading' | 'market_making' | 'generic',
    controllerName: string
  ): Promise<Record<string, unknown>> {
    const client = getApiClient();
    return client.get(`/controllers/${controllerType}/${controllerName}/config/template`);
  },

  /**
   * Validate controller config
   */
  async validateConfig(
    controllerType: 'directional_trading' | 'market_making' | 'generic',
    controllerName: string,
    config: Record<string, unknown>
  ): Promise<{ valid: boolean; errors?: string[] }> {
    const client = getApiClient();
    return client.post(`/controllers/${controllerType}/${controllerName}/config/validate`, config);
  },

  /**
   * Get bot controller configs
   */
  async getBotConfigs(botName: string): Promise<ControllerConfig[]> {
    const client = getApiClient();
    return client.get<ControllerConfig[]>(`/controllers/bots/${botName}/configs`);
  },

  /**
   * Update bot controller config
   */
  async updateBotConfig(
    botName: string,
    controllerName: string,
    config: Record<string, unknown>
  ): Promise<{ message: string }> {
    const client = getApiClient();
    return client.post(`/controllers/bots/${botName}/${controllerName}/config`, config);
  },
};


