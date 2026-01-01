import React, { useState, useEffect } from 'react';
import { Plus, Check, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { botsService, controllersService, accountsService } from '../../api';
import { cn } from '../../lib/utils';
import type { ControllerConfig } from '../../types/api';

interface DeployBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeployBotModal({ isOpen, onClose, onSuccess }: DeployBotModalProps) {
  const [instanceName, setInstanceName] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('master_account');
  const [selectedConfigs, setSelectedConfigs] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [configs, setConfigs] = useState<ControllerConfig[]>([]);
  const [loadingConfigs, setLoadingConfigs] = useState(false);

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoadingConfigs(true);

      Promise.all([accountsService.listAccounts(), controllersService.listConfigs()])
        .then(([accountsData, configsData]) => {
          setAccounts(accountsData || []);
          setConfigs(configsData || []);
        })
        .catch((err) => {
          console.error('Failed to load modal data:', err);
        })
        .finally(() => {
          setLoadingConfigs(false);
        });
    }
  }, [isOpen]);

  const handleToggleConfig = (configId: string) => {
    setSelectedConfigs((prev) =>
      prev.includes(configId) ? prev.filter((id) => id !== configId) : [...prev, configId]
    );
  };

  const handleDeploy = async () => {
    if (!instanceName.trim()) {
      setError('Instance name is required');
      return;
    }
    if (selectedConfigs.length === 0) {
      setError('Select at least one controller config');
      return;
    }

    setIsDeploying(true);
    setError(null);

    try {
      await botsService.deployV2Controllers({
        instance_name: instanceName,
        credentials_profile: selectedAccount,
        controllers_config: selectedConfigs,
      });
      onSuccess();
      onClose();
      setInstanceName('');
      setSelectedConfigs([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deploy bot');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Deploy New Bot" size="lg">
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-loss/10 border border-loss/20 rounded-lg text-loss text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">Instance Name</label>
          <Input
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value)}
            placeholder="e.g., my_trading_bot"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">Account</label>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="input w-full"
          >
            {(accounts.length > 0 ? accounts : ['master_account']).map((acc) => (
              <option key={acc} value={acc}>
                {acc}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Controller Configs ({selectedConfigs.length} selected)
          </label>
          <div className="max-h-64 overflow-y-auto border border-dark-600 rounded-lg">
            {loadingConfigs ? (
              <div className="p-4 text-center text-dark-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading configs...
              </div>
            ) : configs.length === 0 ? (
              <div className="p-4 text-center text-dark-400">No controller configs available</div>
            ) : (
              configs.map((config) => (
                <div
                  key={config.id}
                  onClick={() => handleToggleConfig(config.id)}
                  className={cn(
                    'flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-dark-700 last:border-b-0',
                    selectedConfigs.includes(config.id)
                      ? 'bg-accent-green/10'
                      : 'hover:bg-dark-700/50'
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded border flex items-center justify-center flex-shrink-0',
                      selectedConfigs.includes(config.id)
                        ? 'bg-accent-green border-accent-green'
                        : 'border-dark-500'
                    )}
                  >
                    {selectedConfigs.includes(config.id) && (
                      <Check className="w-3 h-3 text-dark-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white">{config.id}</div>
                    <div className="text-sm text-dark-400 truncate">
                      {config.controller_name} • {config.trading_pair} • {config.connector_name}
                    </div>
                  </div>
                  <Badge variant="info" className="flex-shrink-0">
                    {config.controller_type}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleDeploy}
            disabled={isDeploying || !instanceName.trim() || selectedConfigs.length === 0}
            className="flex-1"
          >
            {isDeploying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Deploy Bot
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

