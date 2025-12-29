import React from 'react';
import { RefreshCw, Bell, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatRelativeTime } from '../../lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  lastUpdated?: number | null;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export function Header({
  title,
  subtitle,
  lastUpdated,
  isRefreshing,
  onRefresh,
}: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-dark-800/50 border-b border-dark-700 backdrop-blur-sm sticky top-0 z-30">
      {/* Title */}
      <div>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        {subtitle && (
          <p className="text-sm text-dark-400">{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Last Updated */}
        {lastUpdated && (
          <span className="text-xs text-dark-400">
            Updated {formatRelativeTime(lastUpdated)}
          </span>
        )}

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw
              className={cn('w-4 h-4', isRefreshing && 'animate-spin')}
            />
          </button>
        )}

        {/* Notifications */}
        <button className="relative p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors">
          <Bell className="w-4 h-4" />
          {/* Notification badge */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-green rounded-full" />
        </button>

        {/* User */}
        <button className="flex items-center gap-2 p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors">
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}


