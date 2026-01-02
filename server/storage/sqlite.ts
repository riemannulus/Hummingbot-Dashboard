/**
 * SQLite Storage Implementation
 * Uses Bun's native SQLite support
 */

import { Database } from "bun:sqlite";
import type {
  IStorage,
  AISettings,
  CachedAnalysis,
  ChatMessage,
  ToolCall,
  PortfolioSnapshot,
} from "./interface";
import { DEFAULT_AI_SETTINGS } from "./interface";

export class SQLiteStorage implements IStorage {
  private db: Database;
  private initialized = false;

  constructor(dbPath: string = "./data/ai.db") {
    this.db = new Database(dbPath, { create: true });
    this.db.exec("PRAGMA journal_mode = WAL;");
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Create tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ai_settings (
        id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        model TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
        analysis_interval INTEGER NOT NULL DEFAULT 21600000,
        enabled INTEGER NOT NULL DEFAULT 1,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cached_analysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        summary TEXT NOT NULL,
        insights TEXT NOT NULL,
        portfolio_value REAL NOT NULL,
        change_24h REAL NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        tool_calls TEXT,
        tool_call_id TEXT,
        created_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_cached_analysis_created_at 
        ON cached_analysis(created_at DESC);
      
      CREATE INDEX IF NOT EXISTS idx_chat_history_created_at 
        ON chat_history(created_at DESC);

      CREATE TABLE IF NOT EXISTS portfolio_snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        total_value_usd REAL NOT NULL,
        state_json TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_timestamp 
        ON portfolio_snapshots(timestamp DESC);
    `);

    // Initialize default settings if not exists
    const existingSettings = this.db
      .query("SELECT id FROM ai_settings WHERE id = 1")
      .get();

    if (!existingSettings) {
      const stmt = this.db.prepare(`
        INSERT INTO ai_settings (id, model, analysis_interval, enabled, updated_at)
        VALUES (1, ?, ?, ?, ?)
      `);
      stmt.run(
        DEFAULT_AI_SETTINGS.model,
        DEFAULT_AI_SETTINGS.analysisInterval,
        DEFAULT_AI_SETTINGS.enabled ? 1 : 0,
        Date.now()
      );
    }

    this.initialized = true;
  }

  async close(): Promise<void> {
    this.db.close();
  }

  // ===================
  // AI Settings
  // ===================

  async getAISettings(): Promise<AISettings> {
    const row = this.db
      .query<
        { model: string; analysis_interval: number; enabled: number; updated_at: number },
        []
      >("SELECT model, analysis_interval, enabled, updated_at FROM ai_settings WHERE id = 1")
      .get();

    if (!row) {
      return DEFAULT_AI_SETTINGS;
    }

    return {
      model: row.model,
      analysisInterval: row.analysis_interval,
      enabled: row.enabled === 1,
      updatedAt: row.updated_at,
    };
  }

  async saveAISettings(settings: Partial<AISettings>): Promise<void> {
    const current = await this.getAISettings();
    const updated = { ...current, ...settings, updatedAt: Date.now() };

    const stmt = this.db.prepare(`
      UPDATE ai_settings 
      SET model = ?, analysis_interval = ?, enabled = ?, updated_at = ?
      WHERE id = 1
    `);

    stmt.run(
      updated.model,
      updated.analysisInterval,
      updated.enabled ? 1 : 0,
      updated.updatedAt
    );
  }

  // ===================
  // Analysis Cache
  // ===================

  async getCachedAnalysis(): Promise<CachedAnalysis | null> {
    const row = this.db
      .query<
        {
          id: number;
          summary: string;
          insights: string;
          portfolio_value: number;
          change_24h: number;
          created_at: number;
        },
        []
      >(
        "SELECT id, summary, insights, portfolio_value, change_24h, created_at FROM cached_analysis ORDER BY created_at DESC LIMIT 1"
      )
      .get();

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      summary: row.summary,
      insights: JSON.parse(row.insights),
      portfolioValue: row.portfolio_value,
      change24h: row.change_24h,
      createdAt: row.created_at,
    };
  }

  async saveCachedAnalysis(
    analysis: Omit<CachedAnalysis, "id" | "createdAt">
  ): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO cached_analysis (summary, insights, portfolio_value, change_24h, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      analysis.summary,
      JSON.stringify(analysis.insights),
      analysis.portfolioValue,
      analysis.change24h,
      Date.now()
    );

    // Keep only last 100 analyses
    this.db.exec(`
      DELETE FROM cached_analysis 
      WHERE id NOT IN (
        SELECT id FROM cached_analysis ORDER BY created_at DESC LIMIT 100
      )
    `);
  }

  async getAnalysisHistory(limit: number = 10): Promise<CachedAnalysis[]> {
    const rows = this.db
      .query<
        {
          id: number;
          summary: string;
          insights: string;
          portfolio_value: number;
          change_24h: number;
          created_at: number;
        },
        [number]
      >(
        "SELECT id, summary, insights, portfolio_value, change_24h, created_at FROM cached_analysis ORDER BY created_at DESC LIMIT ?"
      )
      .all(limit);

    return rows.map((row) => ({
      id: row.id,
      summary: row.summary,
      insights: JSON.parse(row.insights),
      portfolioValue: row.portfolio_value,
      change24h: row.change_24h,
      createdAt: row.created_at,
    }));
  }

  // ===================
  // Chat History
  // ===================

  async getChatHistory(limit: number = 50): Promise<ChatMessage[]> {
    const rows = this.db
      .query<
        {
          id: number;
          role: string;
          content: string;
          tool_calls: string | null;
          tool_call_id: string | null;
          created_at: number;
        },
        [number]
      >(
        "SELECT id, role, content, tool_calls, tool_call_id, created_at FROM chat_history ORDER BY created_at ASC LIMIT ?"
      )
      .all(limit);

    return rows.map((row) => ({
      id: row.id,
      role: row.role as ChatMessage["role"],
      content: row.content,
      toolCalls: row.tool_calls ? JSON.parse(row.tool_calls) : undefined,
      toolCallId: row.tool_call_id || undefined,
      createdAt: row.created_at,
    }));
  }

  async saveChatMessage(
    message: Omit<ChatMessage, "id" | "createdAt">
  ): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO chat_history (role, content, tool_calls, tool_call_id, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      message.role,
      message.content,
      message.toolCalls ? JSON.stringify(message.toolCalls) : null,
      message.toolCallId || null,
      Date.now()
    );

    // Keep only last 500 messages
    this.db.exec(`
      DELETE FROM chat_history 
      WHERE id NOT IN (
        SELECT id FROM chat_history ORDER BY created_at DESC LIMIT 500
      )
    `);
  }

  async clearChatHistory(): Promise<void> {
    this.db.exec("DELETE FROM chat_history");
  }

  // ===================
  // Portfolio Snapshots
  // ===================

  async savePortfolioSnapshot(
    snapshot: Omit<PortfolioSnapshot, "id">
  ): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO portfolio_snapshots (timestamp, total_value_usd, state_json)
      VALUES (?, ?, ?)
    `);

    stmt.run(snapshot.timestamp, snapshot.totalValueUsd, snapshot.stateJson);

    // Keep only last 1000 snapshots (about 250 days at 6h intervals)
    this.db.exec(`
      DELETE FROM portfolio_snapshots 
      WHERE id NOT IN (
        SELECT id FROM portfolio_snapshots ORDER BY timestamp DESC LIMIT 1000
      )
    `);
  }

  async getPortfolioHistory(
    startTime?: number,
    endTime?: number,
    limit: number = 100
  ): Promise<PortfolioSnapshot[]> {
    let query = "SELECT id, timestamp, total_value_usd, state_json FROM portfolio_snapshots";
    const conditions: string[] = [];
    const params: (number | string)[] = [];

    if (startTime !== undefined) {
      conditions.push("timestamp >= ?");
      params.push(startTime);
    }

    if (endTime !== undefined) {
      conditions.push("timestamp <= ?");
      params.push(endTime);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY timestamp DESC LIMIT ?";
    params.push(limit);

    const rows = this.db
      .query<
        {
          id: number;
          timestamp: number;
          total_value_usd: number;
          state_json: string;
        },
        (number | string)[]
      >(query)
      .all(...params);

    return rows.map((row) => ({
      id: row.id,
      timestamp: row.timestamp,
      totalValueUsd: row.total_value_usd,
      stateJson: row.state_json,
    }));
  }
}

