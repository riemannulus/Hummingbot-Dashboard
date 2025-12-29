import { getApiClient } from '../client';
import type {
  BotStatus,
  BotRun,
  BotHistory,
  BotDetailedHistory,
  BotControllerConfig,
  StartBotRequest,
  StopBotRequest,
  V2ScriptDeployment,
  V2ControllerDeployment,
} from '../../types/api';

export const botsService = {
  /**
   * Get status of all active bots
   */
  async getStatus(): Promise<{ status: string; data: Record<string, BotStatus> }> {
    const client = getApiClient();
    return client.get<{ status: string; data: Record<string, BotStatus> }>('/bot-orchestration/status');
  },

  /**
   * Get MQTT connection status
   */
  async getMqttStatus(): Promise<{
    connected: boolean;
    broker: string;
    discovered_bots: string[];
  }> {
    const client = getApiClient();
    return client.get('/bot-orchestration/mqtt');
  },

  /**
   * Get status of a specific bot
   */
  async getBotStatus(botName: string): Promise<BotStatus> {
    const client = getApiClient();
    const response = await client.get<{ status: string; data: BotStatus }>(`/bot-orchestration/${botName}/status`);
    return response.data;
  },

  /**
   * Get bot trading history with detailed trade data
   */
  async getBotHistory(
    botName: string,
    options?: { days?: number; verbose?: boolean; precision?: number }
  ): Promise<BotDetailedHistory> {
    const client = getApiClient();
    return client.get<BotDetailedHistory>(`/bot-orchestration/${botName}/history`, {
      ...options,
      verbose: true, // Always get detailed data
    });
  },

  /**
   * Get controller configurations for a specific bot
   */
  async getBotControllerConfigs(botName: string): Promise<BotControllerConfig[]> {
    const client = getApiClient();
    return client.get<BotControllerConfig[]>(`/controllers/bots/${botName}/configs`);
  },

  /**
   * Start a bot
   */
  async startBot(request: StartBotRequest): Promise<{ status: string; message: string }> {
    const client = getApiClient();
    return client.post('/bot-orchestration/start-bot', request);
  },

  /**
   * Stop a bot
   */
  async stopBot(request: StopBotRequest): Promise<{ status: string; message: string }> {
    const client = getApiClient();
    return client.post('/bot-orchestration/stop-bot', request);
  },

  /**
   * Stop and archive a bot
   */
  async stopAndArchiveBot(
    botName: string,
    options?: { skip_order_cancellation?: boolean; archive_locally?: boolean; s3_bucket?: string }
  ): Promise<{ status: string; message: string }> {
    const client = getApiClient();
    return client.post(`/bot-orchestration/stop-and-archive-bot/${botName}`, undefined);
  },

  /**
   * Get bot runs with filtering
   */
  async getBotRuns(filters?: {
    bot_name?: string;
    account_name?: string;
    strategy_type?: string;
    strategy_name?: string;
    run_status?: string;
    deployment_status?: string;
    limit?: number;
    offset?: number;
  }): Promise<BotRun[]> {
    const client = getApiClient();
    const response = await client.get<{ status: string; data: BotRun[] }>('/bot-orchestration/bot-runs', filters);
    return response.data || [];
  },

  /**
   * Get bot run by ID
   */
  async getBotRunById(botRunId: number): Promise<BotRun> {
    const client = getApiClient();
    return client.get<BotRun>(`/bot-orchestration/bot-runs/${botRunId}`);
  },

  /**
   * Get bot run statistics
   */
  async getBotRunStats(): Promise<{
    total_runs: number;
    running: number;
    stopped: number;
    errors: number;
  }> {
    const client = getApiClient();
    return client.get('/bot-orchestration/bot-runs/stats');
  },

  /**
   * Deploy a V2 script
   */
  async deployV2Script(deployment: V2ScriptDeployment): Promise<{ status: string; message: string }> {
    const client = getApiClient();
    return client.post('/bot-orchestration/deploy-v2-script', deployment);
  },

  /**
   * Deploy V2 controllers
   */
  async deployV2Controllers(deployment: V2ControllerDeployment): Promise<{ status: string; message: string }> {
    const client = getApiClient();
    return client.post('/bot-orchestration/deploy-v2-controllers', deployment);
  },
};

