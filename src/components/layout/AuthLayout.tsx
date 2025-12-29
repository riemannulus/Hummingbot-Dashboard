import React from 'react';
import { Bot } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern bg-[size:50px_50px] opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-accent-green/20 via-accent-green/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-accent-teal/10 to-transparent rounded-full blur-3xl" />
      
      {/* Login Card */}
      <div className="relative w-full max-w-md mx-4">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-green to-accent-teal flex items-center justify-center shadow-lg shadow-accent-green/20">
            <Bot className="w-7 h-7 text-dark-900" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Hummingbot</h1>
            <p className="text-sm text-dark-400">Dashboard</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-dark-800/80 backdrop-blur-xl rounded-2xl border border-dark-700 p-8 shadow-2xl">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-dark-500 text-sm mt-6">
          © {new Date().getFullYear()} Hummingbot. All rights reserved.
        </p>
      </div>
    </div>
  );
}


