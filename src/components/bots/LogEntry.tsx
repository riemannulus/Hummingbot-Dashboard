import React from 'react';
import { cn } from '../../lib/utils';
import type { BotLogEntry } from '../../types/api';

interface LogEntryProps {
  log: BotLogEntry;
  type: 'error' | 'general';
}

function getLevelColor(level: string): string {
  switch (level.toUpperCase()) {
    case 'ERROR':
      return 'text-loss';
    case 'WARNING':
      return 'text-warning';
    case 'INFO':
      return 'text-accent-blue';
    case 'DEBUG':
      return 'text-dark-400';
    default:
      return 'text-dark-300';
  }
}

function getLevelBg(level: string): string {
  switch (level.toUpperCase()) {
    case 'ERROR':
      return 'bg-loss/10';
    case 'WARNING':
      return 'bg-warning/10';
    case 'INFO':
      return 'bg-accent-blue/10';
    default:
      return 'bg-dark-700';
  }
}

function formatTimestamp(ts: number): string {
  // API returns timestamp in seconds, JS Date expects milliseconds
  const msTimestamp = ts < 1e12 ? ts * 1000 : ts;
  return new Date(msTimestamp).toLocaleString();
}

export function LogEntry({ log, type }: LogEntryProps) {
  return (
    <div
      className={cn(
        'px-3 py-2 border-b border-dark-700 last:border-b-0 hover:bg-dark-700/30 transition-colors',
        type === 'error' && 'bg-loss/5'
      )}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        {/* Level Badge */}
        <span
          className={cn(
            'px-1.5 py-0.5 text-xs font-medium rounded flex-shrink-0',
            getLevelBg(log.level_name),
            getLevelColor(log.level_name)
          )}
        >
          {log.level_name}
        </span>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white break-words font-mono">{log.msg}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-dark-400">
            <span>{formatTimestamp(log.timestamp)}</span>
            {log.logger_name && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline truncate max-w-[200px]">{log.logger_name}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

