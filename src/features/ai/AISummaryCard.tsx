import React, { useState, useEffect } from 'react';
import { Brain, RefreshCw, Clock, TrendingUp, TrendingDown, Lightbulb, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../lib/utils';
import type { CachedAnalysis } from '../../lib/ai/types';

async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const stored = localStorage.getItem('hb_auth_credentials');
  let authHeader = '';

  if (stored) {
    try {
      const decoded = atob(stored);
      const credentials = JSON.parse(decoded);
      authHeader = `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`;
    } catch {
      // Ignore parse errors
    }
  }

  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      ...(authHeader && { Authorization: authHeader }),
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function AISummaryCard() {
  const [analysis, setAnalysis] = useState<CachedAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysis();
  }, []);

  async function loadAnalysis() {
    try {
      const data = await fetchWithAuth<CachedAnalysis>('/storage/analysis');
      setAnalysis(data);
      setError(null);
    } catch (err) {
      // 404 means no analysis yet, which is fine
      if (err instanceof Error && err.message.includes('404')) {
        setAnalysis(null);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load analysis');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function triggerAnalysis() {
    setIsRefreshing(true);
    setError(null);

    try {
      const data = await fetchWithAuth<CachedAnalysis>('/ai/analyze', {
        method: 'POST',
      });
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run analysis');
    } finally {
      setIsRefreshing(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="animate-pulse p-5">
          <div className="h-5 bg-dark-700 rounded w-1/3 mb-4" />
          <div className="h-4 bg-dark-700 rounded w-full mb-2" />
          <div className="h-4 bg-dark-700 rounded w-2/3" />
        </div>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent-green" />
            AI Analysis
          </CardTitle>
        </CardHeader>
        <div className="px-5 pb-5">
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-dark-500 mx-auto mb-3" />
            <p className="text-dark-400 mb-4">아직 분석 결과가 없습니다</p>
            <Button
              variant="primary"
              size="sm"
              onClick={triggerAnalysis}
              isLoading={isRefreshing}
            >
              <RefreshCw className="w-4 h-4" />
              지금 분석하기
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Ensure values are numbers
  const portfolioValue = typeof analysis.portfolioValue === 'number' ? analysis.portfolioValue : Number(analysis.portfolioValue) || 0;
  const change24h = typeof analysis.change24h === 'number' ? analysis.change24h : Number(analysis.change24h) || 0;
  const isPositive = change24h >= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-accent-green" />
          AI Analysis
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-dark-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(analysis.createdAt)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={triggerAnalysis}
            isLoading={isRefreshing}
            className="p-1.5"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <div className="px-5 pb-5 space-y-4">
        {error && (
          <div className="p-3 bg-loss/10 border border-loss/20 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-loss" />
            <p className="text-loss text-sm">{error}</p>
          </div>
        )}

        {/* Portfolio Summary */}
        <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-xl">
          <div>
            <p className="text-sm text-dark-400">Portfolio Value</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(portfolioValue)}
            </p>
          </div>
          <div
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
              isPositive ? 'bg-profit/20 text-profit' : 'bg-loss/20 text-loss'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="font-medium">
              {isPositive ? '+' : ''}
              {change24h.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Summary */}
        <div>
          <p className="text-dark-200 text-sm leading-relaxed">{analysis.summary}</p>
        </div>

        {/* Insights */}
        {analysis.insights.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-dark-400 uppercase tracking-wide flex items-center gap-1">
              <Lightbulb className="w-3 h-3" />
              Key Insights
            </p>
            <ul className="space-y-1.5">
              {analysis.insights.slice(0, 4).map((insight, i) => (
                <li
                  key={i}
                  className="text-sm text-dark-300 flex items-start gap-2"
                >
                  <span className="text-accent-green mt-1">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}

