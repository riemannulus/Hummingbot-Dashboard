import React, { useState, useEffect } from 'react';
import { Brain, RefreshCw, Save, Clock, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { GEMINI_MODELS, ANALYSIS_INTERVALS } from '../../lib/ai/types';
import type { AISettings } from '../../lib/ai/types';

interface AIStatus {
  configured: boolean;
  enabled: boolean;
  model: string;
  toolCount: number;
}

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

export function AISettingsTab() {
  const [status, setStatus] = useState<AIStatus | null>(null);
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local form state
  const [model, setModel] = useState('gemini-2.0-flash');
  const [analysisInterval, setAnalysisInterval] = useState(21600000);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    setError(null);

    try {
      const [statusData, settingsData] = await Promise.all([
        fetchWithAuth<AIStatus>('/ai/status'),
        fetchWithAuth<AISettings>('/storage/settings'),
      ]);

      setStatus(statusData);
      setSettings(settingsData);

      // Update local form state
      setModel(settingsData.model);
      setAnalysisInterval(settingsData.analysisInterval);
      setEnabled(settingsData.enabled);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }

  async function saveSettings() {
    setIsSaving(true);
    setError(null);

    try {
      const updated = await fetchWithAuth<AISettings>('/storage/settings', {
        method: 'POST',
        body: JSON.stringify({
          model,
          analysisInterval,
          enabled,
        }),
      });

      setSettings(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }

  const hasChanges =
    settings &&
    (model !== settings.model ||
      analysisInterval !== settings.analysisInterval ||
      enabled !== settings.enabled);

  if (isLoading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4 p-6">
          <div className="h-6 bg-dark-700 rounded w-1/3" />
          <div className="h-4 bg-dark-700 rounded w-2/3" />
          <div className="h-32 bg-dark-700 rounded" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-accent-green" />
              AI Assistant Status
            </CardTitle>
            <CardDescription>
              Google Gemini API를 사용한 포트폴리오 분석
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`status-dot ${status?.configured ? 'online' : 'offline'}`}
            />
            <span
              className={status?.configured ? 'text-profit' : 'text-dark-400'}
            >
              {status?.configured ? 'Configured' : 'Not Configured'}
            </span>
          </div>
        </CardHeader>

        <div className="px-5 pb-5">
          {!status?.configured && (
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg mb-4">
              <p className="text-warning text-sm">
                ⚠️ GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. AI 기능을
                사용하려면 서버에 API 키를 설정하세요.
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-dark-700/30 rounded-lg">
              <p className="text-dark-400 text-sm">Model</p>
              <p className="text-white font-medium mt-1">{status?.model || '-'}</p>
            </div>
            <div className="p-4 bg-dark-700/30 rounded-lg">
              <p className="text-dark-400 text-sm">Available Tools</p>
              <p className="text-white font-medium mt-1">{status?.toolCount || 0}</p>
            </div>
            <div className="p-4 bg-dark-700/30 rounded-lg">
              <p className="text-dark-400 text-sm">Status</p>
              <Badge variant={enabled ? 'success' : 'neutral'} className="mt-1">
                {enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>AI Settings</CardTitle>
          <CardDescription>AI 분석 기능 설정을 관리합니다</CardDescription>
        </CardHeader>

        <div className="px-5 pb-5 space-y-6">
          {error && (
            <div className="p-4 bg-loss/10 border border-loss/20 rounded-lg">
              <p className="text-loss text-sm">{error}</p>
            </div>
          )}

          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 bg-dark-700/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-accent-green" />
              <div>
                <p className="font-medium text-white">AI 기능 활성화</p>
                <p className="text-sm text-dark-400">
                  AI 분석 및 챗봇 기능을 활성화합니다
                </p>
              </div>
            </div>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enabled ? 'bg-accent-green' : 'bg-dark-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Gemini Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-accent-green"
            >
              {GEMINI_MODELS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-dark-400 mt-1">
              사용할 Gemini 모델을 선택합니다. Flash 모델이 빠르고 경제적입니다.
            </p>
          </div>

          {/* Analysis Interval */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              자동 분석 주기
            </label>
            <select
              value={analysisInterval}
              onChange={(e) => setAnalysisInterval(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-accent-green"
            >
              {ANALYSIS_INTERVALS.map((interval) => (
                <option key={interval.value} value={interval.value}>
                  {interval.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-dark-400 mt-1">
              포트폴리오 자동 분석 주기를 설정합니다. API 사용량 최적화를 위해
              캐시된 결과가 표시됩니다.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-dark-700">
            <Button
              variant="primary"
              onClick={saveSettings}
              isLoading={isSaving}
              disabled={!hasChanges}
            >
              <Save className="w-4 h-4" />
              Save Settings
            </Button>
            <Button variant="secondary" onClick={loadData}>
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Last Analysis Info */}
      {settings && (
        <Card>
          <CardHeader>
            <CardTitle>Last Updated</CardTitle>
          </CardHeader>
          <div className="px-5 pb-5">
            <p className="text-dark-400">
              Settings last updated:{' '}
              <span className="text-white">
                {new Date(settings.updatedAt).toLocaleString()}
              </span>
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

