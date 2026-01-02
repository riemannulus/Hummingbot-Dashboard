/**
 * Analysis Scheduler
 * Periodically runs portfolio analysis and caches results
 * Also collects portfolio snapshots for history
 */

import { getStorage } from "../storage";
import { getGeminiClient, isGeminiConfigured, setGeminiModel } from "./client";
import { SYSTEM_PROMPT, ANALYSIS_PROMPT } from "./prompts";
import { toolRegistry } from "../../src/lib/ai/registry";
import { allTools } from "../../src/lib/ai/tools";
import type { GeminiContent, Tool } from "../../src/lib/ai/types";

const API_BASE = process.env.API_BASE || "http://localhost:8000";

// Register tools if not already registered
for (const tool of allTools) {
  if (!toolRegistry.has(tool.name)) {
    toolRegistry.register(tool as Tool);
  }
}

let schedulerInterval: ReturnType<typeof setInterval> | null = null;
let lastRunTime = 0;
let lastSnapshotTime = 0;

/**
 * Fetch portfolio history from Hummingbot API and store snapshots
 */
async function collectPortfolioSnapshots(): Promise<void> {
  const storage = await getStorage();
  
  try {
    // Get stored credentials from environment or use defaults
    // Default credentials from CLAUDE.md: admin / yjamtc167
    const username = process.env.HB_API_USERNAME || "admin";
    const password = process.env.HB_API_PASSWORD || "yjamtc167";
    const authHeader = "Basic " + Buffer.from(`${username}:${password}`).toString("base64");

    // Fetch portfolio history from Hummingbot API (without time filters to get all available data)
    const response = await fetch(`${API_BASE}/portfolio/history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify({ limit: 200 }),
    });

    if (!response.ok) {
      console.warn(`⚠️ Failed to fetch portfolio history: ${response.status}`);
      return;
    }

    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      console.log("📊 No portfolio history data available from API");
      return;
    }

    // Get existing snapshots to avoid duplicates
    const existingSnapshots = await storage.getPortfolioHistory(undefined, undefined, 1000);
    const existingTimestamps = new Set(existingSnapshots.map(s => s.timestamp));

    let newSnapshotsCount = 0;

    for (const item of data.data) {
      // Parse timestamp from ISO string
      const timestamp = Math.floor(new Date(item.timestamp).getTime() / 1000);
      
      // Skip if we already have this timestamp
      if (existingTimestamps.has(timestamp)) {
        continue;
      }

      // Calculate total value from state
      let totalValue = 0;
      if (item.state) {
        for (const account of Object.values(item.state)) {
          for (const connectorBalances of Object.values(account as Record<string, unknown[]>)) {
            if (Array.isArray(connectorBalances)) {
              for (const token of connectorBalances as { value?: number }[]) {
                totalValue += token.value || 0;
              }
            }
          }
        }
      }

      // Save snapshot
      await storage.savePortfolioSnapshot({
        timestamp,
        totalValueUsd: totalValue,
        stateJson: JSON.stringify(item.state),
      });
      
      newSnapshotsCount++;
    }

    if (newSnapshotsCount > 0) {
      console.log(`📊 Saved ${newSnapshotsCount} new portfolio snapshots`);
    }
  } catch (error) {
    console.error("❌ Error collecting portfolio snapshots:", error);
  }
}

/**
 * Run analysis with stored credentials
 * Note: For scheduled analysis, we need a way to make API calls.
 * Since we don't have stored credentials, we'll use a service account approach
 * or skip API calls and just use cached data.
 */
async function runScheduledAnalysis(): Promise<void> {
  if (!isGeminiConfigured()) {
    console.log("⏭️ Skipping scheduled analysis: Gemini API not configured");
    return;
  }

  const storage = await getStorage();
  const settings = await storage.getAISettings();

  if (!settings.enabled) {
    console.log("⏭️ Skipping scheduled analysis: AI is disabled");
    return;
  }

  // Check if enough time has passed since last run
  const now = Date.now();
  if (now - lastRunTime < settings.analysisInterval) {
    return;
  }

  console.log("🔄 Running scheduled portfolio analysis...");
  lastRunTime = now;

  try {
    const client = getGeminiClient();
    setGeminiModel(settings.model);

    // For scheduled analysis without auth, we create a summary based on last known data
    // In a production setup, you'd want to use service account credentials
    const lastAnalysis = await storage.getCachedAnalysis();

    // Build a simple analysis request
    const contents: GeminiContent[] = [
      {
        role: "user",
        parts: [
          {
            text: lastAnalysis
              ? `이전 분석 데이터를 기반으로 간략한 포트폴리오 상태 업데이트를 제공해주세요.

이전 분석:
- 요약: ${lastAnalysis.summary}
- 포트폴리오 가치: $${lastAnalysis.portfolioValue.toLocaleString()}
- 24시간 변화: ${lastAnalysis.change24h}%
- 인사이트: ${lastAnalysis.insights.join(", ")}

현재 시간 기준으로 주의사항이나 리마인더가 있다면 알려주세요.

응답 형식 (JSON):
{
  "summary": "간단한 상태 요약",
  "insights": ["인사이트1", "인사이트2"],
  "portfolioValue": ${lastAnalysis.portfolioValue},
  "change24h": ${lastAnalysis.change24h}
}`
              : ANALYSIS_PROMPT,
          },
        ],
      },
    ];

    const response = await client.chat({
      contents,
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: {
        temperature: 0.5,
        topP: 0.9,
        maxOutputTokens: 1024,
      },
    });

    const result = client.parseFunctionCalls(response);
    const analysisText = result.textResponse || "";

    // Parse JSON from response
    let analysisData = {
      summary: lastAnalysis?.summary || "분석 데이터 없음",
      insights: lastAnalysis?.insights || [],
      portfolioValue: lastAnalysis?.portfolioValue || 0,
      change24h: lastAnalysis?.change24h || 0,
    };

    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*"summary"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        analysisData = {
          summary: parsed.summary || analysisData.summary,
          insights: parsed.insights || analysisData.insights,
          portfolioValue: parsed.portfolioValue || analysisData.portfolioValue,
          change24h: parsed.change24h || analysisData.change24h,
        };
      }
    } catch {
      console.warn("Failed to parse scheduled analysis JSON");
    }

    // Save analysis
    await storage.saveCachedAnalysis(analysisData);
    console.log("✅ Scheduled analysis completed");
  } catch (error) {
    console.error("❌ Scheduled analysis error:", error);
  }
}

/**
 * Start the analysis scheduler
 */
export async function startScheduler(): Promise<void> {
  if (schedulerInterval) {
    console.log("Scheduler already running");
    return;
  }

  const storage = await getStorage();
  const settings = await storage.getAISettings();

  if (settings.analysisInterval <= 0) {
    console.log("📅 Analysis scheduler disabled (interval = 0)");
    return;
  }

  // Check interval every minute, but only run analysis based on settings
  const CHECK_INTERVAL = 60 * 1000; // 1 minute
  const SNAPSHOT_INTERVAL = 5 * 60 * 1000; // 5 minutes for snapshot collection

  schedulerInterval = setInterval(async () => {
    try {
      // Re-read settings in case they changed
      const currentSettings = await storage.getAISettings();
      
      // Collect portfolio snapshots more frequently
      const now = Date.now();
      if (now - lastSnapshotTime >= SNAPSHOT_INTERVAL) {
        lastSnapshotTime = now;
        await collectPortfolioSnapshots();
      }
      
      if (currentSettings.analysisInterval <= 0) {
        return;
      }

      await runScheduledAnalysis();
    } catch (error) {
      console.error("Scheduler error:", error);
    }
  }, CHECK_INTERVAL);

  console.log(
    `📅 Analysis scheduler configured (interval: ${settings.analysisInterval / 1000 / 60 / 60}h)`
  );

  // Run initial snapshot collection and analysis check after a short delay
  setTimeout(async () => {
    try {
      await collectPortfolioSnapshots();
      await runScheduledAnalysis();
    } catch (error) {
      console.error("Initial scheduler run error:", error);
    }
  }, 5000);
}

/**
 * Stop the analysis scheduler
 */
export function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log("📅 Analysis scheduler stopped");
  }
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus(): {
  running: boolean;
  lastRunTime: number;
} {
  return {
    running: schedulerInterval !== null,
    lastRunTime,
  };
}

