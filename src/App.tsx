import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth, LoginForm } from './features/auth';
import { DashboardPage } from './features/dashboard';
import { PortfolioPage } from './features/portfolio';
import { BotsPage, BotDetailPage } from './features/bots';
import { TradingPage } from './features/trading';
import { SettingsPage } from './features/settings';
import { AIChat } from './features/ai';
import { MainLayout } from './components/layout/MainLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { ROUTES } from './lib/constants';

// Helper to extract bot name from path like /bots/grid_eth-20251229-094716
function extractBotNameFromPath(path: string): string | null {
  const match = path.match(/^\/bots\/(.+)$/);
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }
  return null;
}

function AppRouter() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Handle browser navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigate function
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && currentPath !== ROUTES.LOGIN) {
      navigate(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, currentPath]);

  // Redirect to dashboard after login
  useEffect(() => {
    if (isAuthenticated && currentPath === ROUTES.LOGIN) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, currentPath]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent-green/20 border-t-accent-green rounded-full animate-spin" />
          <p className="text-dark-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Login page
  if (!isAuthenticated || currentPath === ROUTES.LOGIN) {
    return (
      <AuthLayout>
        <LoginForm onSuccess={() => navigate(ROUTES.DASHBOARD)} />
      </AuthLayout>
    );
  }

  // Render page based on current path
  const renderPage = () => {
    // Check for bot detail page
    const botName = extractBotNameFromPath(currentPath);
    if (botName) {
      return (
        <BotDetailPage
          botName={botName}
          onBack={() => navigate(ROUTES.BOTS)}
        />
      );
    }

    switch (true) {
      case currentPath === ROUTES.DASHBOARD || currentPath === '/':
        return <DashboardPage onNavigate={navigate} />;
      case currentPath === ROUTES.PORTFOLIO:
        return <PortfolioPage />;
      case currentPath === ROUTES.BOTS:
        return <BotsPage onNavigate={navigate} />;
      case currentPath === ROUTES.TRADING:
        return <TradingPage />;
      case currentPath.startsWith(ROUTES.SETTINGS):
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={navigate} />;
    }
  };

  return (
    <>
      <MainLayout
        currentPath={currentPath}
        onNavigate={navigate}
        onLogout={logout}
      >
        {renderPage()}
      </MainLayout>
      <AIChat />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

