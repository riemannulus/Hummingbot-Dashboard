/**
 * Bot Tools
 * Tools for querying and managing trading bots
 */

import type { Tool, ToolContext, ToolResult } from "../types";

// Default API base for client-side, server should pass full URL via context
const DEFAULT_API_BASE = "/api";

async function fetchWithAuth<T>(
  endpoint: string,
  context: ToolContext,
  options: RequestInit = {}
): Promise<T> {
  const apiBase = context.apiBase || DEFAULT_API_BASE;
  const response = await fetch(`${apiBase}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: context.authHeader,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ===================
// Get All Bots Status
// ===================

export const getBotsStatusTool: Tool = {
  name: "get_bots_status",
  description:
    "모든 활성화된 트레이딩 봇의 상태를 조회합니다. 각 봇의 실행 상태, 성과, 에러 로그를 반환합니다.",
  category: "bots",
  isWrite: false,
  parameters: {
    type: "object",
    properties: {},
  },
  execute: async (_params, context): Promise<ToolResult> => {
    try {
      const data = await fetchWithAuth("/bot-orchestration/status", context, {
        method: "GET",
      });

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get bots status",
      };
    }
  },
};

// ===================
// Get Specific Bot Status
// ===================

interface BotNameParams {
  bot_name: string;
}

export const getBotStatusTool: Tool<BotNameParams> = {
  name: "get_bot_status",
  description:
    "특정 봇의 상세 상태를 조회합니다. 실행 상태, 컨트롤러별 성과, 에러 로그를 반환합니다.",
  category: "bots",
  isWrite: false,
  parameters: {
    type: "object",
    properties: {
      bot_name: {
        type: "string",
        description: "조회할 봇의 이름",
      },
    },
    required: ["bot_name"],
  },
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const data = await fetchWithAuth(
        `/bot-orchestration/${encodeURIComponent(params.bot_name)}/status`,
        context,
        { method: "GET" }
      );

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get bot status",
      };
    }
  },
};

// ===================
// Get Bot Performance/History
// ===================

interface BotHistoryParams {
  bot_name: string;
  days?: number;
}

export const getBotPerformanceTool: Tool<BotHistoryParams> = {
  name: "get_bot_performance",
  description:
    "특정 봇의 트레이딩 성과와 히스토리를 조회합니다. 거래 내역, PnL, 승률 등을 반환합니다.",
  category: "bots",
  isWrite: false,
  parameters: {
    type: "object",
    properties: {
      bot_name: {
        type: "string",
        description: "조회할 봇의 이름",
      },
      days: {
        type: "number",
        description: "조회할 기간 (일 수, 기본값: 7)",
      },
    },
    required: ["bot_name"],
  },
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const queryParams = new URLSearchParams();
      if (params.days) queryParams.set("days", String(params.days));
      queryParams.set("verbose", "true");

      const query = queryParams.toString();
      const data = await fetchWithAuth(
        `/bot-orchestration/${encodeURIComponent(params.bot_name)}/history${query ? `?${query}` : ""}`,
        context,
        { method: "GET" }
      );

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get bot performance",
      };
    }
  },
};

// ===================
// Get Bot Controller Configs
// ===================

export const getBotConfigsTool: Tool<BotNameParams> = {
  name: "get_bot_configs",
  description:
    "특정 봇의 컨트롤러 설정을 조회합니다. 전략 파라미터, 거래쌍, 레버리지 등을 반환합니다.",
  category: "bots",
  isWrite: false,
  parameters: {
    type: "object",
    properties: {
      bot_name: {
        type: "string",
        description: "조회할 봇의 이름",
      },
    },
    required: ["bot_name"],
  },
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const data = await fetchWithAuth(
        `/controllers/bots/${encodeURIComponent(params.bot_name)}/configs`,
        context,
        { method: "GET" }
      );

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get bot configs",
      };
    }
  },
};

// ===================
// Start Bot
// ===================

interface StartBotParams {
  bot_name: string;
  script?: string;
  conf?: string;
}

export const startBotTool: Tool<StartBotParams> = {
  name: "start_bot",
  description:
    "봇을 시작합니다. 봇이 이미 실행 중인 경우 에러를 반환합니다.",
  category: "bots",
  isWrite: true,
  parameters: {
    type: "object",
    properties: {
      bot_name: {
        type: "string",
        description: "시작할 봇의 이름",
      },
      script: {
        type: "string",
        description: "사용할 스크립트 파일명 (선택사항)",
      },
      conf: {
        type: "string",
        description: "사용할 설정 파일명 (선택사항)",
      },
    },
    required: ["bot_name"],
  },
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const data = await fetchWithAuth("/bot-orchestration/start-bot", context, {
        method: "POST",
        body: JSON.stringify({
          bot_name: params.bot_name,
          script: params.script,
          conf: params.conf,
        }),
      });

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to start bot",
      };
    }
  },
};

// ===================
// Stop Bot
// ===================

interface StopBotParams {
  bot_name: string;
  skip_order_cancellation?: boolean;
}

export const stopBotTool: Tool<StopBotParams> = {
  name: "stop_bot",
  description:
    "실행 중인 봇을 중지합니다. 기본적으로 열린 주문을 모두 취소합니다.",
  category: "bots",
  isWrite: true,
  parameters: {
    type: "object",
    properties: {
      bot_name: {
        type: "string",
        description: "중지할 봇의 이름",
      },
      skip_order_cancellation: {
        type: "boolean",
        description: "주문 취소를 건너뛸지 여부 (기본값: false)",
      },
    },
    required: ["bot_name"],
  },
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const data = await fetchWithAuth("/bot-orchestration/stop-bot", context, {
        method: "POST",
        body: JSON.stringify({
          bot_name: params.bot_name,
          skip_order_cancellation: params.skip_order_cancellation ?? false,
        }),
      });

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to stop bot",
      };
    }
  },
};

// ===================
// Update Bot Config (via stop and redeploy)
// ===================

interface UpdateBotConfigParams {
  bot_name: string;
  action: "restart" | "stop_and_archive";
}

export const updateBotTool: Tool<UpdateBotConfigParams> = {
  name: "update_bot",
  description:
    "봇을 재시작하거나 중지 후 아카이브합니다. 설정 변경 후 적용을 위해 사용합니다.",
  category: "bots",
  isWrite: true,
  parameters: {
    type: "object",
    properties: {
      bot_name: {
        type: "string",
        description: "업데이트할 봇의 이름",
      },
      action: {
        type: "string",
        enum: ["restart", "stop_and_archive"],
        description: "수행할 작업 (restart: 재시작, stop_and_archive: 중지 후 아카이브)",
      },
    },
    required: ["bot_name", "action"],
  },
  execute: async (params, context): Promise<ToolResult> => {
    try {
      if (params.action === "stop_and_archive") {
        const data = await fetchWithAuth(
          `/bot-orchestration/stop-and-archive-bot/${encodeURIComponent(params.bot_name)}`,
          context,
          { method: "POST" }
        );
        return { success: true, data };
      }

      // For restart: stop then start
      await fetchWithAuth("/bot-orchestration/stop-bot", context, {
        method: "POST",
        body: JSON.stringify({ bot_name: params.bot_name }),
      });

      // Wait a moment for the bot to fully stop
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const data = await fetchWithAuth("/bot-orchestration/start-bot", context, {
        method: "POST",
        body: JSON.stringify({ bot_name: params.bot_name }),
      });

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update bot",
      };
    }
  },
};

// ===================
// Get Bot Runs
// ===================

interface BotRunsParams {
  bot_name?: string;
  run_status?: string;
  limit?: number;
}

export const getBotRunsTool: Tool<BotRunsParams> = {
  name: "get_bot_runs",
  description:
    "봇 실행 기록을 조회합니다. 필터링 옵션으로 특정 봇이나 상태의 실행 기록을 조회할 수 있습니다.",
  category: "bots",
  isWrite: false,
  parameters: {
    type: "object",
    properties: {
      bot_name: {
        type: "string",
        description: "필터링할 봇 이름 (선택사항)",
      },
      run_status: {
        type: "string",
        enum: ["CREATED", "RUNNING", "STOPPED", "ERROR"],
        description: "필터링할 실행 상태 (선택사항)",
      },
      limit: {
        type: "number",
        description: "반환할 최대 기록 수 (기본값: 50)",
      },
    },
  },
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const queryParams = new URLSearchParams();
      if (params.bot_name) queryParams.set("bot_name", params.bot_name);
      if (params.run_status) queryParams.set("run_status", params.run_status);
      if (params.limit) queryParams.set("limit", String(params.limit));

      const query = queryParams.toString();
      const data = await fetchWithAuth(
        `/bot-orchestration/bot-runs${query ? `?${query}` : ""}`,
        context,
        { method: "GET" }
      );

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get bot runs",
      };
    }
  },
};

// Export all bot tools
export const botTools = [
  getBotsStatusTool,
  getBotStatusTool,
  getBotPerformanceTool,
  getBotConfigsTool,
  startBotTool,
  stopBotTool,
  updateBotTool,
  getBotRunsTool,
];

