/**
 * Tool Registry
 * MCP-style registry for managing AI tools
 */

import type {
  Tool,
  ToolContext,
  ToolResult,
  GeminiTool,
  GeminiFunctionDeclaration,
} from "./types";

class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  /**
   * Register a new tool
   */
  register<TParams, TResult>(tool: Tool<TParams, TResult>): void {
    if (this.tools.has(tool.name)) {
      console.warn(`Tool "${tool.name}" is already registered. Overwriting.`);
    }
    this.tools.set(tool.name, tool as Tool);
  }

  /**
   * Register multiple tools at once
   */
  registerAll(tools: Tool[]): void {
    for (const tool of tools) {
      this.register(tool);
    }
  }

  /**
   * Unregister a tool
   */
  unregister(name: string): boolean {
    return this.tools.delete(name);
  }

  /**
   * Get a tool by name
   */
  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  /**
   * Check if a tool exists
   */
  has(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Get all registered tools
   */
  getAll(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tools by category
   */
  getByCategory(category: Tool["category"]): Tool[] {
    return this.getAll().filter((tool) => tool.category === category);
  }

  /**
   * Get only read tools (safe operations)
   */
  getReadTools(): Tool[] {
    return this.getAll().filter((tool) => !tool.isWrite);
  }

  /**
   * Get only write tools (modifying operations)
   */
  getWriteTools(): Tool[] {
    return this.getAll().filter((tool) => tool.isWrite);
  }

  /**
   * Execute a tool by name
   */
  async execute(
    name: string,
    params: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const tool = this.tools.get(name);

    if (!tool) {
      return {
        success: false,
        error: `Tool "${name}" not found`,
      };
    }

    try {
      return await tool.execute(params, context);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`Tool "${name}" execution error:`, error);
      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Convert tools to Gemini function declarations format
   */
  toGeminiTools(): GeminiTool {
    const functionDeclarations: GeminiFunctionDeclaration[] = this.getAll().map(
      (tool) => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      })
    );

    return { functionDeclarations };
  }

  /**
   * Get tool names for display
   */
  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Get tool count
   */
  get size(): number {
    return this.tools.size;
  }

  /**
   * Clear all registered tools
   */
  clear(): void {
    this.tools.clear();
  }
}

// Singleton instance
export const toolRegistry = new ToolRegistry();

// Export class for testing
export { ToolRegistry };

