import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { useBotDetail } from '../../hooks/bots';
import {
  BotPerformanceCards,
  TradesTab,
  ConfigTab,
  StatsTab,
  LogsTab,
  EditStrategyConfigModal,
} from '../../components/bots';
import type { BotControllerConfig } from '../../types/api';

interface BotDetailPageProps {
  botName: string;
  onBack: () => void;
}

export function BotDetailPage({ botName, onBack }: BotDetailPageProps) {
  const [editingConfig, setEditingConfig] = useState<BotControllerConfig | null>(null);

  const {
    status,
    configs,
    trades,
    stats,
    performance,
    isLoading,
    isRefreshing,
    lastUpdated,
    refresh,
    fetchData,
  } = useBotDetail(botName);

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="p-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Bots
          </Button>
          <div className="space-y-6">
            <Skeleton height={100} />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} height={80} />
              ))}
            </div>
            <Skeleton height={400} />
          </div>
        </div>
      </div>
    );
  }

  const totalLogs = (status?.error_logs?.length || 0) + (status?.general_logs?.length || 0);

  return (
    <div className="animate-fade-in">
      <Header
        title={botName}
        subtitle={`Strategy: ${configs[0]?.controller_name || 'Unknown'} • ${configs[0]?.trading_pair || ''}`}
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
      />

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          Back to Bots
        </Button>

        {/* Status & Performance */}
        <BotPerformanceCards
          status={status?.status || 'unknown'}
          performance={performance}
          stats={stats}
        />

        {/* Tabs */}
        <Tabs defaultValue="trades">
          <TabsList>
            <TabsTrigger value="trades">Trade History ({trades.length})</TabsTrigger>
            <TabsTrigger value="config">Strategy Config</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="logs">Logs ({totalLogs})</TabsTrigger>
          </TabsList>

          <TabsContent value="trades">
            <TradesTab trades={trades} />
          </TabsContent>

          <TabsContent value="config">
            <ConfigTab configs={configs} onEditConfig={setEditingConfig} />
          </TabsContent>

          <TabsContent value="stats">
            <StatsTab stats={stats} performance={performance} trades={trades} />
          </TabsContent>

          <TabsContent value="logs">
            <LogsTab
              errorLogs={status?.error_logs || []}
              generalLogs={status?.general_logs || []}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Strategy Config Modal */}
      {editingConfig && (
        <EditStrategyConfigModal
          isOpen={!!editingConfig}
          onClose={() => setEditingConfig(null)}
          botName={botName}
          config={editingConfig}
          onSave={fetchData}
        />
      )}
    </div>
  );
}
