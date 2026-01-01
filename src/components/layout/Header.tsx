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
    <header
      className={cn(
        'flex items-center justify-between bg-dark-800/50 border-b border-dark-700 backdrop-blur-sm sticky z-20',
        // Mobile: account for fixed mobile nav bar, smaller padding
        'top-14 h-14 px-4',
        // Desktop: normal positioning
        'md:top-0 md:h-16 md:px-6'
      )}
    >
      {/* Title */}
      <div className="min-w-0 flex-1">
        <h1 className="text-lg md:text-xl font-semibold text-white truncate">{title}</h1>
        {subtitle && (
          <p className="text-xs md:text-sm text-dark-400 truncate hidden sm:block">{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        {/* Last Updated - hidden on mobile */}
        {lastUpdated && (
          <span className="text-xs text-dark-400 hidden lg:inline">
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

        {/* User - hidden on small mobile */}
        <button className="hidden sm:flex items-center gap-2 p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors">
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
