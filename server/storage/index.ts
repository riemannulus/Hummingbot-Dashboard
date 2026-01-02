/**
 * Storage Factory
 * Creates the appropriate storage implementation based on configuration
 */

import type { IStorage, StorageConfig } from "./interface";
import { SQLiteStorage } from "./sqlite";

let storageInstance: IStorage | null = null;

/**
 * Get or create the storage instance
 */
export async function getStorage(config?: StorageConfig): Promise<IStorage> {
  if (storageInstance) {
    return storageInstance;
  }

  const storageType = config?.type || "sqlite";

  switch (storageType) {
    case "sqlite":
      storageInstance = new SQLiteStorage(config?.sqlitePath || "./data/ai.db");
      break;
    case "redis":
      // Future implementation
      throw new Error("Redis storage not yet implemented");
    case "postgres":
      // Future implementation
      throw new Error("PostgreSQL storage not yet implemented");
    default:
      throw new Error(`Unknown storage type: ${storageType}`);
  }

  await storageInstance.initialize();
  return storageInstance;
}

/**
 * Close the storage connection
 */
export async function closeStorage(): Promise<void> {
  if (storageInstance) {
    await storageInstance.close();
    storageInstance = null;
  }
}

// Re-export types
export * from "./interface";

