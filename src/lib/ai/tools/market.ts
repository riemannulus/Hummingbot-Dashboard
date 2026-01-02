/**
 * Market Data Tools
 * Tools for querying market data
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
// Get Market Prices
// ===================

interface MarketPricesParams {
  connector_name: string;
  trading_pairs: string[];
}

export const getMarketPricesTool: Tool<MarketPricesParams> = {
  name: "get_market_prices",
  description:
    "특정 거래소의 거래쌍 가격을 조회합니다. 실시간 시장 가격 정보를 반환합니다.",
  category: "market",
  isWrite: false,
  parameters: {
    type: "object",
    properties: {
      connector_name: {
        type: "string",
        description: "거래소 이름 (예: binance_perpetual, kucoin)",
      },
      trading_pairs: {
        type: "array",
        items: { type: "string" },
        description: "조회할 거래쌍 목록 (예: ['BTC-USDT', 'ETH-USDT'])",
      },
    },
    required: ["connector_name", "trading_pairs"],
  },
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const data = await fetchWithAuth("/market-data/prices", context, {
        method: "POST",
        body: JSON.stringify(params),
      });

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get market prices",
      };
    }
  },
};

// ===================
// Get Candles
// ===================

interface CandlesParams {
  connector_name: string;
  trading_pair: string;
  interval?: string;
  max_records?: number;
}

export const getCandlesTool: Tool<CandlesParams> = {
  name: "get_candles",
  description:
    "캔들스틱 차트 데이터를 조회합니다. 기술적 분석을 위한 OHLCV 데이터를 반환합니다.",
  category: "market",
  isWrite: false,
  parameters: {
    type: "object",
    properties: {
      connector_name: {
        type: "string",
        description: "거래소 이름",
      },
      trading_pair: {
        type: "string",
        description: "거래쌍 (예: BTC-USDT)",
      },
      interval: {
        type: "string",
        description: "캔들 간격 (예: 1m, 5m, 15m, 1h, 4h, 1d)",
      },
      max_records: {
        type: "number",
        description: "반환할 최대 캔들 수 (기본값: 100)",
      },
    },
    required: ["connector_name", "trading_pair"],
  },
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const data = await fetchWithAuth("/market-data/candles", context, {
        method: "POST",
        body: JSON.stringify(params),
      });

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get candles",
      };
    }
  },
};

// ===================
// Get Order Book
// ===================

interface OrderBookParams {
  connector_name: string;
  trading_pair: string;
  depth?: number;
}

export const getOrderBookTool: Tool<OrderBookParams> = {
  name: "get_order_book",
  description:
    "오더북(호가창) 데이터를 조회합니다. 매수/매도 호가와 수량을 반환합니다.",
  category: "market",
  isWrite: false,
  parameters: {
    type: "object",
    properties: {
      connector_name: {
        type: "string",
        description: "거래소 이름",
      },
      trading_pair: {
        type: "string",
        description: "거래쌍 (예: BTC-USDT)",
      },
      depth: {
        type: "number",
        description: "호가 깊이 (기본값: 10)",
      },
    },
    required: ["connector_name", "trading_pair"],
  },
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const data = await fetchWithAuth("/market-data/order-book", context, {
        method: "POST",
        body: JSON.stringify({
          connector_name: params.connector_name,
          trading_pair: params.trading_pair,
          depth: params.depth ?? 10,
        }),
      });

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get order book",
      };
    }
  },
};

// ===================
// Get Funding Info (Perpetual)
// ===================

interface FundingInfoParams {
  connector_name: string;
  trading_pair: string;
}

export const getFundingInfoTool: Tool<FundingInfoParams> = {
  name: "get_funding_info",
  description:
    "선물 거래쌍의 펀딩 정보를 조회합니다. 펀딩 비율, 마크 가격, 인덱스 가격을 반환합니다.",
  category: "market",
  isWrite: false,
  parameters: {
    type: "object",
    properties: {
      connector_name: {
        type: "string",
        description: "거래소 이름 (perpetual 거래소만 지원)",
      },
      trading_pair: {
        type: "string",
        description: "거래쌍 (예: BTC-USDT)",
      },
    },
    required: ["connector_name", "trading_pair"],
  },
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const data = await fetchWithAuth("/market-data/funding-info", context, {
        method: "POST",
        body: JSON.stringify(params),
      });

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get funding info",
      };
    }
  },
};

// ===================
// Get Available Connectors
// ===================

export const getAvailableConnectorsTool: Tool = {
  name: "get_available_connectors",
  description:
    "사용 가능한 거래소 목록을 조회합니다.",
  category: "market",
  isWrite: false,
  parameters: {
    type: "object",
    properties: {},
  },
  execute: async (_params, context): Promise<ToolResult> => {
    try {
      const data = await fetchWithAuth(
        "/market-data/available-candle-connectors",
        context,
        { method: "GET" }
      );

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get available connectors",
      };
    }
  },
};

// Export all market tools
export const marketTools = [
  getMarketPricesTool,
  getCandlesTool,
  getOrderBookTool,
  getFundingInfoTool,
  getAvailableConnectorsTool,
];

