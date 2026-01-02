/**
 * AI Tool Types
 * MCP-style tool definitions for function calling
 */

// ===================
// JSON Schema Types
// ===================

export interface JSONSchemaProperty {
  type: "string" | "number" | "boolean" | "object" | "array";
  description?: string;
  enum?: string[];
  items?: JSONSchemaProperty;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  default?: unknown;
}

export interface JSONSchema {
  type: "object";
  properties: Record<string, JSONSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

// ===================
// Tool Types
// ===================

export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Tool<TParams = unknown, TResult = unknown> {
  /** Unique tool name (snake_case) */
  name: string;
  /** Human-readable description for the AI */
  description: string;
  /** JSON Schema for parameters */
  parameters: JSONSchema;
  /** Tool category for organization */
  category: "portfolio" | "bots" | "market" | "trading" | "system";
  /** Whether this tool can modify data */
  isWrite: boolean;
  /** Execute the tool with validated parameters */
  execute: (params: TParams, context: ToolContext) => Promise<ToolResult<TResult>>;
}

export interface ToolContext {
  /** Authorization header for API calls */
  authHeader: string;
  /** Username extracted from auth */
  username: string;
  /** API base URL (server-side needs full URL) */
  apiBase?: string;
}

// ===================
// Chat Message Types
// ===================

export interface ToolCallRequest {
  id: string;
  name: string;
  arguments: string;
}

export interface ToolCallResponse {
  id: string;
  name: string;
  result: ToolResult;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolCalls?: ToolCallRequest[];
  toolCallId?: string;
}

// ===================
// Gemini API Types
// ===================

export interface GeminiFunctionDeclaration {
  name: string;
  description: string;
  parameters: JSONSchema;
}

export interface GeminiTool {
  functionDeclarations: GeminiFunctionDeclaration[];
}

export interface GeminiFunctionCall {
  name: string;
  args: Record<string, unknown>;
}

export interface GeminiContent {
  role: "user" | "model" | "function";
  parts: GeminiPart[];
}

export type GeminiPart =
  | { text: string }
  | { functionCall: GeminiFunctionCall }
  | { functionResponse: { name: string; response: unknown } };

// ===================
// AI Settings Types (Frontend)
// ===================

export interface AISettings {
  model: string;
  analysisInterval: number;
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

// Available Gemini models
export const GEMINI_MODELS = [
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash (Recommended)" },
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
] as const;

// Analysis interval options
export const ANALYSIS_INTERVALS = [
  { value: 3600000, label: "1 hour" },
  { value: 10800000, label: "3 hours" },
  { value: 21600000, label: "6 hours (Default)" },
  { value: 43200000, label: "12 hours" },
  { value: 86400000, label: "24 hours" },
  { value: 0, label: "Disabled" },
] as const;

