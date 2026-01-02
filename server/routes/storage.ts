/**
 * Storage API Routes
 * Endpoints for AI settings and cached data
 */

import { withAuth } from "../middleware/auth";
import { getStorage } from "../storage";

/**
 * GET /storage/settings - Get AI settings
 */
export const getSettings = withAuth(async (_req: Request): Promise<Response> => {
  try {
    const storage = await getStorage();
    const settings = await storage.getAISettings();

    return new Response(JSON.stringify(settings), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error getting AI settings:", error);
    return new Response(
      JSON.stringify({ error: "Failed to get settings" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

/**
 * POST /storage/settings - Save AI settings
 */
export const saveSettings = withAuth(async (req: Request): Promise<Response> => {
  try {
    const body = await req.json();
    const storage = await getStorage();
    await storage.saveAISettings(body);

    const updated = await storage.getAISettings();
    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error saving AI settings:", error);
    return new Response(
      JSON.stringify({ error: "Failed to save settings" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

/**
 * GET /storage/analysis - Get cached analysis
 */
export const getAnalysis = withAuth(async (_req: Request): Promise<Response> => {
  try {
    const storage = await getStorage();
    const analysis = await storage.getCachedAnalysis();

    if (!analysis) {
      return new Response(
        JSON.stringify({ message: "No cached analysis available" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(analysis), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error getting cached analysis:", error);
    return new Response(
      JSON.stringify({ error: "Failed to get analysis" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

/**
 * GET /storage/analysis/history - Get analysis history
 */
export const getAnalysisHistory = withAuth(async (req: Request): Promise<Response> => {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    const storage = await getStorage();
    const history = await storage.getAnalysisHistory(limit);

    return new Response(JSON.stringify(history), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error getting analysis history:", error);
    return new Response(
      JSON.stringify({ error: "Failed to get analysis history" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

/**
 * GET /storage/chat-history - Get chat history
 */
export const getChatHistory = withAuth(async (req: Request): Promise<Response> => {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);

    const storage = await getStorage();
    const history = await storage.getChatHistory(limit);

    return new Response(JSON.stringify(history), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error getting chat history:", error);
    return new Response(
      JSON.stringify({ error: "Failed to get chat history" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

/**
 * DELETE /storage/chat-history - Clear chat history
 */
export const clearChatHistory = withAuth(async (_req: Request): Promise<Response> => {
  try {
    const storage = await getStorage();
    await storage.clearChatHistory();

    return new Response(
      JSON.stringify({ message: "Chat history cleared" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error clearing chat history:", error);
    return new Response(
      JSON.stringify({ error: "Failed to clear chat history" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

