/**
 * Portfolio Tools
 * Tools for querying portfolio data
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
// Get Portfolio State
// ===================

interface PortfolioStateParams {
  account_names?: string[];
  connector_names?: string[];
}

export const getPortfolioStateTool: Tool<PortfolioStateParams> = {
  name: "get_portfolio_state",
  description:
    "현재 포트폴리오의 전체 상태를 조회합니다. 각 계정과 거래소별 토큰 잔액 및 USD 가치를 반환합니다.",
  category: "portfolio",
  isWrite: false,
  parameters: {
    type: "object",
    properties: {
      account_names: {
        type: "array",
        items: { type: "string" },
        description: "조회할 계정 이름 목록 (선택사항, 비워두면 전체 조회)",
      },
      connector_names: {
        type: "array",
        items: { type: "string" },
        description: "조회할 거래소 이름 목록 (선택사항)",
      },
    },
  },
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const data = await fetchWithAuth("/portfolio/state", context, {
        method: "POST",
        body: JSON.stringify(params),
      });

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get portfolio state",
      };
    }
  },
};

// ===================
// Get Portfolio Distribution
// ===================

interface PortfolioDistributionParams {
  account_names?: string[];
  connector_names?: string[];
}

export const getPortfolioDistributionTool: Tool<PortfolioDistributionParams> = {
  name: "get_portfolio_distribution",
  description:
    "포트폴리오의 토큰별 분포를 조회합니다. 각 토큰의 비중, 총 가치, 계정별 분포를 반환합니다.",
  category: "portfolio",
  isWrite: false,
  parameters: {
    type: "object",
    properties: {
      account_names: {
        type: "array",
        items: { type: "string" },
        description: "조회할 계정 이름 목록 (선택사항)",
      },
      connector_names: {
        type: "array",
        items: { type: "string" },
        description: "조회할 거래소 이름 목록 (선택사항)",
      },
    },
  },
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const data = await fetchWithAuth("/portfolio/distribution", context, {
        method: "POST",
        body: JSON.stringify(params),
      });

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get portfolio distribution",
      };
    }
  },
};

// ===================
// Get Portfolio History
// ===================

interface PortfolioHistoryParams {
  account_names?: string[];
  connector_names?: string[];
  start_time?: number;
  end_time?: number;
  limit?: number;
}

export const getPortfolioHistoryTool: Tool<PortfolioHistoryParams> = {
  name: "get_portfolio_history",
  description:
    "포트폴리오의 가치 변화 히스토리를 조회합니다. 시간별 총 가치 추이를 분석할 수 있습니다.",
  category: "portfolio",
  isWrite: false,
  parameters: {
    type: "object",
    properties: {
      account_names: {
        type: "array",
        items: { type: "string" },
        description: "조회할 계정 이름 목록 (선택사항)",
      },
      connector_names: {
        type: "array",
        items: { type: "string" },
        description: "조회할 거래소 이름 목록 (선택사항)",
      },
      start_time: {
        type: "number",
        description: "시작 시간 (Unix timestamp, 초 단위)",
      },
      end_time: {
        type: "number",
        description: "종료 시간 (Unix timestamp, 초 단위)",
      },
      limit: {
        type: "number",
        description: "반환할 최대 데이터 포인트 수 (기본값: 100)",
      },
    },
  },
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const data = await fetchWithAuth("/portfolio/history", context, {
        method: "POST",
        body: JSON.stringify(params),
      });

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get portfolio history",
      };
    }
  },
};

// ===================
// Get Accounts Distribution
// ===================

export const getAccountsDistributionTool: Tool<PortfolioDistributionParams> = {
  name: "get_accounts_distribution",
  description:
    "계정별 포트폴리오 분포를 조회합니다. 각 계정의 총 가치와 비중을 반환합니다.",
  category: "portfolio",
  isWrite: false,
  parameters: {
    type: "object",
    properties: {
      account_names: {
        type: "array",
        items: { type: "string" },
        description: "조회할 계정 이름 목록 (선택사항)",
      },
      connector_names: {
        type: "array",
        items: { type: "string" },
        description: "조회할 거래소 이름 목록 (선택사항)",
      },
    },
  },
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const data = await fetchWithAuth("/portfolio/accounts-distribution", context, {
        method: "POST",
        body: JSON.stringify(params),
      });

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get accounts distribution",
      };
    }
  },
};

// Export all portfolio tools
export const portfolioTools = [
  getPortfolioStateTool,
  getPortfolioDistributionTool,
  getPortfolioHistoryTool,
  getAccountsDistributionTool,
];

