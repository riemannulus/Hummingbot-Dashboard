/**
 * AI API Routes
 * Endpoints for AI chat and analysis
 */

import { withAuth, extractUsername } from "../middleware/auth";
import { getStorage } from "../storage";
import { getGeminiClient, isGeminiConfigured, setGeminiModel } from "../ai/client";
import { SYSTEM_PROMPT, ANALYSIS_PROMPT } from "../ai/prompts";
import type { GeminiContent, GeminiTool } from "../../src/lib/ai/types";

// Tool definitions for Gemini (imported dynamically to avoid circular deps)
import { allTools } from "../../src/lib/ai/tools";
import { toolRegistry } from "../../src/lib/ai/registry";

// Register all tools on startup
for (const tool of allTools) {
  toolRegistry.register(tool);
}

/**
 * GET /ai/status - Check AI service status
 */
export const getStatus = withAuth(async (_req: Request): Promise<Response> => {
  const configured = isGeminiConfigured();
  const storage = await getStorage();
  const settings = await storage.getAISettings();

  return new Response(
    JSON.stringify({
      configured,
      enabled: settings.enabled,
      model: settings.model,
      toolCount: toolRegistry.size,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});

/**
 * POST /ai/chat - Send a chat message
 */
export const chat = withAuth(async (req: Request): Promise<Response> => {
  if (!isGeminiConfigured()) {
    return new Response(
      JSON.stringify({ error: "Gemini API key not configured" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization") || "";
    const username = extractUsername(authHeader) || "user";

    // Get settings and update model
    const storage = await getStorage();
    const settings = await storage.getAISettings();
    const client = getGeminiClient();
    setGeminiModel(settings.model);

    // Build conversation contents
    const contents: GeminiContent[] = [
      ...history.map((msg: { role: string; content: string }) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    // Create tools configuration
    const geminiTools: GeminiTool = toolRegistry.toGeminiTools();

    // Initial request to Gemini
    let response = await client.chat({
      contents,
      tools: [geminiTools],
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
    });

    // Handle function calls (multi-turn)
    let result = client.parseFunctionCalls(response);
    const toolResults: { name: string; result: unknown }[] = [];

    // Server-side API base (directly to backend, not via proxy to avoid deadlock)
    const serverApiBase = process.env.API_BASE || "http://localhost:8000";

    while (result.functionCalls.length > 0) {
      // Execute all function calls
      for (const fc of result.functionCalls) {
        const toolResult = await toolRegistry.execute(fc.name, fc.args, {
          authHeader,
          username,
          apiBase: serverApiBase,
        });
        toolResults.push({ name: fc.name, result: toolResult });

        // Add function call and response to contents
        contents.push({
          role: "model",
          parts: [{ functionCall: fc }],
        });
        contents.push(
          client.createFunctionResponseContent(fc.name, toolResult)
        );
      }

      // Continue conversation with function results
      response = await client.chat({
        contents,
        tools: [geminiTools],
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
      });

      result = client.parseFunctionCalls(response);
    }

    const assistantMessage = result.textResponse || "응답을 생성할 수 없습니다.";

    // Save to chat history
    await storage.saveChatMessage({ role: "user", content: message });
    await storage.saveChatMessage({ role: "assistant", content: assistantMessage });

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        toolsUsed: toolResults.map((t) => t.name),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process chat",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

/**
 * POST /ai/analyze - Trigger portfolio analysis
 */
export const analyze = withAuth(async (req: Request): Promise<Response> => {
  if (!isGeminiConfigured()) {
    return new Response(
      JSON.stringify({ error: "Gemini API key not configured" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const username = extractUsername(authHeader) || "user";

    const storage = await getStorage();
    const settings = await storage.getAISettings();
    const client = getGeminiClient();
    setGeminiModel(settings.model);

    // Server-side API base (directly to backend, not via proxy to avoid deadlock)
    const serverApiBase = process.env.API_BASE || "http://localhost:8000";

    // Step 1: Get portfolio data using tools
    const portfolioState = await toolRegistry.execute(
      "get_portfolio_state",
      {},
      { authHeader, username, apiBase: serverApiBase }
    );

    const portfolioDistribution = await toolRegistry.execute(
      "get_portfolio_distribution",
      {},
      { authHeader, username, apiBase: serverApiBase }
    );

    const botsStatus = await toolRegistry.execute(
      "get_bots_status",
      {},
      { authHeader, username, apiBase: serverApiBase }
    );

    // Step 2: Build analysis request
    const dataContext = `
## 현재 포트폴리오 데이터

### 포트폴리오 상태
${JSON.stringify(portfolioState.data, null, 2)}

### 토큰 분포
${JSON.stringify(portfolioDistribution.data, null, 2)}

### 봇 상태
${JSON.stringify(botsStatus.data, null, 2)}
`;

    const contents: GeminiContent[] = [
      {
        role: "user",
        parts: [{ text: dataContext + "\n\n" + ANALYSIS_PROMPT }],
      },
    ];

    // Step 3: Get analysis from Gemini
    const response = await client.chat({
      contents,
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: {
        temperature: 0.5,
        topP: 0.9,
        maxOutputTokens: 2048,
      },
    });

    const result = client.parseFunctionCalls(response);
    const analysisText = result.textResponse || "";

    // Step 4: Try to extract JSON from response
    let analysisData = {
      summary: analysisText.slice(0, 200),
      insights: [] as string[],
      portfolioValue: 0,
      change24h: 0,
    };

    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*"summary"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        analysisData = {
          summary: parsed.summary || analysisData.summary,
          insights: parsed.insights || [],
          portfolioValue: parsed.portfolioValue || 0,
          change24h: parsed.change24h || 0,
        };
      }
    } catch {
      // Use default values if JSON parsing fails
      console.warn("Failed to parse analysis JSON, using text summary");
    }

    // Step 5: Save analysis
    await storage.saveCachedAnalysis(analysisData);

    return new Response(
      JSON.stringify({
        ...analysisData,
        fullText: analysisText,
        createdAt: Date.now(),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI analysis error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to analyze portfolio",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

/**
 * GET /ai/tools - List available tools
 */
export const getTools = withAuth(async (_req: Request): Promise<Response> => {
  const tools = toolRegistry.getAll().map((t) => ({
    name: t.name,
    description: t.description,
    category: t.category,
    isWrite: t.isWrite,
  }));

  return new Response(JSON.stringify(tools), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

