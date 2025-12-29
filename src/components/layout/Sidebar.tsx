import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  Bot,
  ArrowLeftRight,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ROUTES } from '../../lib/constants';

const icons = {
  LayoutDashboard,
  Wallet,
  Bot,
  ArrowLeftRight,
  Settings,
};

interface NavItem {
  path: string;
  label: string;
  icon: keyof typeof icons;
}

const navItems: NavItem[] = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: ROUTES.PORTFOLIO, label: 'Portfolio', icon: 'Wallet' },
  { path: ROUTES.BOTS, label: 'Bots', icon: 'Bot' },
  { path: ROUTES.TRADING, label: 'Trading', icon: 'ArrowLeftRight' },
  { path: ROUTES.SETTINGS, label: 'Settings', icon: 'Settings' },
];

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  currentPath,
  onNavigate,
  onLogout,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-dark-800 border-r border-dark-700 flex flex-col transition-all duration-300 z-40',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-dark-700">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-green to-accent-teal flex items-center justify-center">
              <Bot className="w-5 h-5 text-dark-900" />
            </div>
            <span className="font-bold text-lg text-white">Hummingbot</span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className={cn(
            'p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors',
            isCollapsed && 'mx-auto'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = icons[item.icon];
          const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');

          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={cn(
                'w-full sidebar-link',
                isActive && 'active',
                isCollapsed && 'justify-center px-0'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-dark-700">
        <button
          onClick={onLogout}
          className={cn(
            'w-full sidebar-link text-dark-400 hover:text-loss',
            isCollapsed && 'justify-center px-0'
          )}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}


