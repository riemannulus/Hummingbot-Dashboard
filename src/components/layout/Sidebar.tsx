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
  Menu,
  X,
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
  // Mobile props
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  onMobileOpen?: () => void;
}

export function Sidebar({
  currentPath,
  onNavigate,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onMobileClose,
  onMobileOpen,
}: SidebarProps) {
  return (
    <>
      {/* Mobile Header Bar with Hamburger */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-dark-800 border-b border-dark-700 flex items-center justify-between px-4 z-30 md:hidden">
        <button
          onClick={onMobileOpen}
          className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-green to-accent-teal flex items-center justify-center">
            <Bot className="w-4 h-4 text-dark-900" />
          </div>
          <span className="font-bold text-white">Hummingbot</span>
        </div>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>

      {/* Sidebar - Desktop: always visible, Mobile: slide-in drawer */}
      <aside
        className={cn(
          'fixed top-0 h-full bg-dark-800 border-r border-dark-700 flex flex-col transition-all duration-300 z-50',
          // Mobile: slide from left, full width drawer
          'left-0 w-64 -translate-x-full md:translate-x-0',
          isMobileOpen && 'translate-x-0',
          // Desktop: fixed width based on collapse state
          'md:w-16 lg:w-64',
          isCollapsed && 'md:w-16 lg:w-16'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-dark-700">
          {/* Mobile: always show logo, Desktop: show based on collapse */}
          <div className={cn('flex items-center gap-2', 'md:hidden', !isCollapsed && 'lg:flex')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-green to-accent-teal flex items-center justify-center">
              <Bot className="w-5 h-5 text-dark-900" />
            </div>
            <span className="font-bold text-lg text-white">Hummingbot</span>
          </div>
          
          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors md:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className={cn(
              'p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors hidden md:block',
              isCollapsed && 'mx-auto'
            )}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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
                  // Mobile: always show label
                  // Desktop: hide label when collapsed
                  'md:justify-center md:px-0',
                  !isCollapsed && 'lg:justify-start lg:px-3'
                )}
                title={item.label}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {/* Mobile: always show, Desktop: based on collapse */}
                <span className={cn('md:hidden', !isCollapsed && 'lg:inline')}>{item.label}</span>
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
              'md:justify-center md:px-0',
              !isCollapsed && 'lg:justify-start lg:px-3'
            )}
            title="Logout"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={cn('md:hidden', !isCollapsed && 'lg:inline')}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
