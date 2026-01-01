import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { useBotsList } from '../../hooks/bots';
import { BotStatsCards, DeployBotModal } from '../../components/bots';
import { getBotColumns, getRunColumns } from './utils';

interface BotsPageProps {
  onNavigate?: (path: string) => void;
}

export function BotsPage({ onNavigate }: BotsPageProps) {
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);

  const {
    botList,
    runningBots,
    stoppedBots,
    botRuns,
    isLoading,
    runsLoading,
    isRefreshing,
    lastUpdated,
    refresh,
    stopBot,
  } = useBotsList();

  const handleViewBotDetails = (botName: string) => {
    if (onNavigate) {
      onNavigate(`/bots/${encodeURIComponent(botName)}`);
    }
  };

  const handleStopBot = async () => {
    if (!selectedBot) return;
    await stopBot.execute({ bot_name: selectedBot });
    setShowStopConfirm(false);
    setSelectedBot(null);
    refresh();
  };

  const botColumns = getBotColumns({
    onViewDetails: handleViewBotDetails,
    onStop: (botName) => {
      setSelectedBot(botName);
      setShowStopConfirm(true);
    },
  });

  const runColumns = getRunColumns();

  return (
    <div className="animate-fade-in">
      <Header
        title="Bot Management"
        subtitle="Monitor and control your trading bots"
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
      />

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Stats */}
        <BotStatsCards
          botList={botList}
          runningBots={runningBots}
          stoppedBots={stoppedBots}
        />

        {/* Tabs */}
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active Bots ({botList.length})</TabsTrigger>
            <TabsTrigger value="history">Run History ({botRuns?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <Card padding="none">
              <div className="p-5 border-b border-dark-700 flex items-center justify-between">
                <CardTitle>Bot Instances</CardTitle>
                <Button variant="primary" size="sm" onClick={() => setShowDeployModal(true)}>
                  <Plus className="w-4 h-4" />
                  Deploy Bot
                </Button>
              </div>
              <Table
                columns={botColumns}
                data={botList}
                keyExtractor={(row) => row.name}
                isLoading={isLoading}
                emptyMessage="No bots found. Deploy your first bot to get started."
              />
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card padding="none">
              <div className="p-5 border-b border-dark-700">
                <CardTitle>Bot Run History</CardTitle>
              </div>
              <Table
                columns={runColumns}
                data={botRuns || []}
                keyExtractor={(row) => String(row.id)}
                isLoading={runsLoading}
                emptyMessage="No bot runs recorded yet."
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        isOpen={showStopConfirm}
        onClose={() => setShowStopConfirm(false)}
        onConfirm={handleStopBot}
        title="Stop Bot"
        message={`Are you sure you want to stop "${selectedBot}"? This will cancel all open orders.`}
        confirmText="Stop Bot"
        variant="danger"
        isLoading={stopBot.isLoading}
      />

      <DeployBotModal
        isOpen={showDeployModal}
        onClose={() => setShowDeployModal(false)}
        onSuccess={refresh}
      />
    </div>
  );
}
