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
  // Desktop collapsed state (persisted)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
    return saved === 'true';
  });

  // Mobile menu open state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(isCollapsed));
  }, [isCollapsed]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPath]);

  // Close mobile menu on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleNavigate = (path: string) => {
    setIsMobileMenuOpen(false);
    onNavigate(path);
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-grid-pattern bg-[size:50px_50px] pointer-events-none opacity-30" />
      
      {/* Gradient Accent */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-accent-green/5 to-transparent pointer-events-none" />
      
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <Sidebar
        currentPath={currentPath}
        onNavigate={handleNavigate}
        onLogout={onLogout}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
        onMobileOpen={() => setIsMobileMenuOpen(true)}
      />
      
      <main
        className={cn(
          'min-h-screen transition-all duration-300 relative',
          // Mobile: no margin (full width)
          // Desktop: margin based on sidebar state
          'md:ml-16 lg:ml-64',
          isCollapsed ? 'md:ml-16' : 'md:ml-16 lg:ml-64'
        )}
      >
        {children}
      </main>
    </div>
  );
}
