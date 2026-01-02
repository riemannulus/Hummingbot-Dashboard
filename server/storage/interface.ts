/**
 * Storage Interface
 * Abstract interface for data persistence
 * Initial implementation: SQLite
 * Future implementations: Redis, PostgreSQL
 */

// ===================
// Type Definitions
// ===================

export interface AISettings {
  model: string;
  analysisInterval: number; // milliseconds
  enabled: boolean;
  updatedAt: number;
}

export interface CachedAnalysis {
  id?: number;
  summary: string;
  insights: string[];
  portfolioValue: number;
  change24h: number;
  createdAt: number;
}

export interface ChatMessage {
  id?: number;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolCalls?: ToolCall[];
  toolCallId?: string;
  createdAt: number;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: string;
}

export interface PortfolioSnapshot {
  id?: number;
  timestamp: number;
  totalValueUsd: number;
  stateJson: string; // JSON string of the full portfolio state
}

// ===================
// Default Values
// ===================

export const DEFAULT_AI_SETTINGS: AISettings = {
  model: "gemini-2.0-flash",
  analysisInterval: 6 * 60 * 60 * 1000, // 6 hours
  enabled: true,
  updatedAt: Date.now(),
};

// ===================
// Storage Interface
// ===================

export interface IStorage {
  // Lifecycle
  initialize(): Promise<void>;
  close(): Promise<void>;

  // AI Settings
  getAISettings(): Promise<AISettings>;
  saveAISettings(settings: Partial<AISettings>): Promise<void>;

  // Analysis Cache
  getCachedAnalysis(): Promise<CachedAnalysis | null>;
  saveCachedAnalysis(analysis: Omit<CachedAnalysis, "id" | "createdAt">): Promise<void>;
  getAnalysisHistory(limit?: number): Promise<CachedAnalysis[]>;

  // Chat History
  getChatHistory(limit?: number): Promise<ChatMessage[]>;
  saveChatMessage(message: Omit<ChatMessage, "id" | "createdAt">): Promise<void>;
  clearChatHistory(): Promise<void>;

  // Portfolio Snapshots
  savePortfolioSnapshot(snapshot: Omit<PortfolioSnapshot, "id">): Promise<void>;
  getPortfolioHistory(startTime?: number, endTime?: number, limit?: number): Promise<PortfolioSnapshot[]>;
}

// ===================
// Storage Factory
// ===================

export type StorageType = "sqlite" | "redis" | "postgres";

export interface StorageConfig {
  type: StorageType;
  // SQLite
  sqlitePath?: string;
  // Redis (future)
  redisUrl?: string;
  // PostgreSQL (future)
  postgresUrl?: string;
}

