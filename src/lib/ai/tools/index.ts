/**
 * AI Tools Index
 * Exports all built-in tools and registration helpers
 */

import { toolRegistry } from "../registry";
import { portfolioTools } from "./portfolio";
import { botTools } from "./bots";
import { marketTools } from "./market";

// Re-export individual tool arrays
export { portfolioTools } from "./portfolio";
export { botTools } from "./bots";
export { marketTools } from "./market";

// All tools combined
export const allTools = [...portfolioTools, ...botTools, ...marketTools];

/**
 * Register all built-in tools with the registry
 */
export function registerAllTools(): void {
  toolRegistry.registerAll(allTools);
}

/**
 * Get tool count by category
 */
export function getToolStats(): Record<string, number> {
  return {
    portfolio: portfolioTools.length,
    bots: botTools.length,
    market: marketTools.length,
    total: allTools.length,
  };
}

