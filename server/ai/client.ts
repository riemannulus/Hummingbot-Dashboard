/**
 * Gemini API Client
 * Handles communication with Google Generative Language API
 */

import type { GeminiTool, GeminiContent, GeminiFunctionCall } from "../../src/lib/ai/types";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export interface GeminiClientConfig {
  apiKey: string;
  model?: string;
}

export interface GeminiChatRequest {
  contents: GeminiContent[];
  tools?: GeminiTool[];
  systemInstruction?: { parts: { text: string }[] };
  generationConfig?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
  };
}

export interface GeminiCandidate {
  content: GeminiContent;
  finishReason: string;
  index: number;
}

export interface GeminiChatResponse {
  candidates: GeminiCandidate[];
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export interface FunctionCallResult {
  functionCalls: GeminiFunctionCall[];
  textResponse?: string;
}

export class GeminiClient {
  private apiKey: string;
  private model: string;

  constructor(config: GeminiClientConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || "gemini-2.0-flash";
  }

  /**
   * Set the model to use
   */
  setModel(model: string): void {
    this.model = model;
  }

  /**
   * Get current model
   */
  getModel(): string {
    return this.model;
  }

  /**
   * Send a chat request to Gemini
   */
  async chat(request: GeminiChatRequest): Promise<GeminiChatResponse> {
    const url = `${GEMINI_API_BASE}/models/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Parse function calls from response
   */
  parseFunctionCalls(response: GeminiChatResponse): FunctionCallResult {
    const candidate = response.candidates?.[0];
    if (!candidate) {
      return { functionCalls: [] };
    }

    const functionCalls: GeminiFunctionCall[] = [];
    let textResponse: string | undefined;

    for (const part of candidate.content.parts) {
      if ("functionCall" in part) {
        functionCalls.push(part.functionCall);
      } else if ("text" in part) {
        textResponse = part.text;
      }
    }

    return { functionCalls, textResponse };
  }

  /**
   * Create function response content for multi-turn conversation
   */
  createFunctionResponseContent(
    name: string,
    response: unknown
  ): GeminiContent {
    return {
      role: "function",
      parts: [
        {
          functionResponse: {
            name,
            response,
          },
        },
      ],
    };
  }

  /**
   * Create user message content
   */
  createUserContent(text: string): GeminiContent {
    return {
      role: "user",
      parts: [{ text }],
    };
  }

  /**
   * Create model message content
   */
  createModelContent(text: string): GeminiContent {
    return {
      role: "model",
      parts: [{ text }],
    };
  }
}

// Singleton instance (lazy initialization)
let geminiClient: GeminiClient | null = null;

/**
 * Get or create the Gemini client
 */
export function getGeminiClient(): GeminiClient {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    geminiClient = new GeminiClient({ apiKey });
  }
  return geminiClient;
}

/**
 * Update the Gemini client model
 */
export function setGeminiModel(model: string): void {
  const client = getGeminiClient();
  client.setModel(model);
}

/**
 * Check if Gemini API key is configured
 */
export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

