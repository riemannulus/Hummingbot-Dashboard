import { getApiClient } from '../client';
import type { Script, ScriptConfig } from '../../types/api';

export const scriptsService = {
  /**
   * List all scripts
   */
  async listScripts(): Promise<string[]> {
    const client = getApiClient();
    return client.get<string[]>('/scripts/');
  },

  /**
   * List script configs
   */
  async listConfigs(): Promise<ScriptConfig[]> {
    const client = getApiClient();
    return client.get<ScriptConfig[]>('/scripts/configs/');
  },

  /**
   * Get script config
   */
  async getConfig(configName: string): Promise<Record<string, unknown>> {
    const client = getApiClient();
    return client.get(`/scripts/configs/${configName}`);
  },

  /**
   * Create or update script config
   */
  async saveConfig(configName: string, config: Record<string, unknown>): Promise<{ message: string }> {
    const client = getApiClient();
    return client.post(`/scripts/configs/${configName}`, config);
  },

  /**
   * Delete script config
   */
  async deleteConfig(configName: string): Promise<{ message: string }> {
    const client = getApiClient();
    return client.delete(`/scripts/configs/${configName}`);
  },

  /**
   * Get script content
   */
  async getScript(scriptName: string): Promise<{ name: string; content: string }> {
    const client = getApiClient();
    return client.get(`/scripts/${scriptName}`);
  },

  /**
   * Create or update script
   */
  async saveScript(scriptName: string, content: string): Promise<{ message: string }> {
    const client = getApiClient();
    return client.post(`/scripts/${scriptName}`, { content });
  },

  /**
   * Delete script
   */
  async deleteScript(scriptName: string): Promise<{ message: string }> {
    const client = getApiClient();
    return client.delete(`/scripts/${scriptName}`);
  },

  /**
   * Get script config template
   */
  async getConfigTemplate(scriptName: string): Promise<Record<string, unknown>> {
    const client = getApiClient();
    return client.get(`/scripts/${scriptName}/config/template`);
  },
};


