import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { cn } from '../../lib/utils';
import { STORAGE_KEYS } from '../../lib/constants';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export function MainLayout({
  children,
  currentPath,
  onNavigate,
  onLogout,
}: MainLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(isCollapsed));
  }, [isCollapsed]);

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-grid-pattern bg-[size:50px_50px] pointer-events-none opacity-30" />
      
      {/* Gradient Accent */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-accent-green/5 to-transparent pointer-events-none" />
      
      <Sidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        onLogout={onLogout}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      
      <main
        className={cn(
          'min-h-screen transition-all duration-300 relative',
          isCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        {children}
      </main>
    </div>
  );
}


