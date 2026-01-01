import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Save, AlertCircle } from 'lucide-react';
import { controllersService } from '../../api';
import type { BotControllerConfig } from '../../types/api';

interface EditStrategyConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  botName: string;
  config: BotControllerConfig;
  onSave: () => void;
}

interface FormData {
  leverage: string;
  total_amount_quote: string;
  position_mode: string;
  start_price: string;
  end_price: string;
  limit_price: string;
  max_open_orders: string;
  min_spread_between_orders: string;
  order_frequency: string;
  stop_loss: string;
  take_profit: string;
  trailing_stop_activation: string;
  trailing_stop_delta: string;
}

export function EditStrategyConfigModal({
  isOpen,
  onClose,
  botName,
  config,
  onSave,
}: EditStrategyConfigModalProps) {
  const [formData, setFormData] = useState<FormData>({
    leverage: '',
    total_amount_quote: '',
    position_mode: '',
    start_price: '',
    end_price: '',
    limit_price: '',
    max_open_orders: '',
    min_spread_between_orders: '',
    order_frequency: '',
    stop_loss: '',
    take_profit: '',
    trailing_stop_activation: '',
    trailing_stop_delta: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && config) {
      setFormData({
        leverage: config.leverage?.toString() || '1',
        total_amount_quote: config.total_amount_quote?.toString() || '',
        position_mode: config.position_mode || 'HEDGE',
        start_price: config.start_price?.toString() || '',
        end_price: config.end_price?.toString() || '',
        limit_price: config.limit_price?.toString() || '',
        max_open_orders: config.max_open_orders?.toString() || '',
        min_spread_between_orders: config.min_spread_between_orders
          ? (config.min_spread_between_orders * 100).toString()
          : '',
        order_frequency: config.order_frequency?.toString() || '',
        stop_loss: config.stop_loss
          ? (parseFloat(config.stop_loss) * 100).toString()
          : '',
        take_profit: config.take_profit
          ? (parseFloat(config.take_profit) * 100).toString()
          : '',
        trailing_stop_activation: config.trailing_stop?.activation_price
          ? (parseFloat(config.trailing_stop.activation_price) * 100).toString()
          : '',
        trailing_stop_delta: config.trailing_stop?.trailing_delta
          ? (parseFloat(config.trailing_stop.trailing_delta) * 100).toString()
          : '',
      });
      setError(null);
    }
  }, [isOpen, config]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Build the config update payload
      const updatePayload: Record<string, unknown> = {
        ...config,
      };

      // Update numeric fields
      if (formData.leverage) {
        updatePayload.leverage = parseInt(formData.leverage);
      }
      if (formData.total_amount_quote) {
        updatePayload.total_amount_quote = parseFloat(formData.total_amount_quote);
      }
      if (formData.position_mode) {
        updatePayload.position_mode = formData.position_mode;
      }
      if (formData.start_price) {
        updatePayload.start_price = parseFloat(formData.start_price);
      }
      if (formData.end_price) {
        updatePayload.end_price = parseFloat(formData.end_price);
      }
      if (formData.limit_price) {
        updatePayload.limit_price = parseFloat(formData.limit_price);
      }
      if (formData.max_open_orders) {
        updatePayload.max_open_orders = parseInt(formData.max_open_orders);
      }
      if (formData.min_spread_between_orders) {
        updatePayload.min_spread_between_orders =
          parseFloat(formData.min_spread_between_orders) / 100;
      }
      if (formData.order_frequency) {
        updatePayload.order_frequency = parseInt(formData.order_frequency);
      }
      if (formData.stop_loss) {
        updatePayload.stop_loss = (parseFloat(formData.stop_loss) / 100).toString();
      }
      if (formData.take_profit) {
        updatePayload.take_profit = (parseFloat(formData.take_profit) / 100).toString();
      }

      // Handle trailing stop
      if (formData.trailing_stop_activation && formData.trailing_stop_delta) {
        updatePayload.trailing_stop = {
          activation_price: (parseFloat(formData.trailing_stop_activation) / 100).toString(),
          trailing_delta: (parseFloat(formData.trailing_stop_delta) / 100).toString(),
        };
      } else {
        delete updatePayload.trailing_stop;
      }

      await controllersService.updateBotConfig(botName, config.id, updatePayload);
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to update config:', err);
      setError(err instanceof Error ? err.message : 'Failed to update configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const positionModeOptions = [
    { value: 'HEDGE', label: 'Hedge' },
    { value: 'ONE_WAY', label: 'One Way' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Strategy Configuration"
      description={`${config?.id} • ${config?.trading_pair}`}
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-loss/10 border border-loss/20 rounded-lg text-loss text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">{error}</span>
          </div>
        )}

        {/* Basic Settings */}
        <div>
          <h3 className="text-sm font-medium text-dark-300 mb-3">Basic Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input
              label="Leverage"
              type="number"
              min="1"
              max="125"
              value={formData.leverage}
              onChange={(e) => handleChange('leverage', e.target.value)}
            />
            <Select
              label="Position Mode"
              value={formData.position_mode}
              onChange={(e) => handleChange('position_mode', e.target.value)}
              options={positionModeOptions}
            />
          </div>
        </div>

        {/* Position Settings */}
        <div>
          <h3 className="text-sm font-medium text-dark-300 mb-3">Position Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input
              label="Total Amount (Quote)"
              type="number"
              step="0.01"
              value={formData.total_amount_quote}
              onChange={(e) => handleChange('total_amount_quote', e.target.value)}
              placeholder="e.g., 100"
            />
            <Input
              label="Limit Price"
              type="number"
              step="0.01"
              value={formData.limit_price}
              onChange={(e) => handleChange('limit_price', e.target.value)}
              placeholder="Optional"
            />
            <Input
              label="Start Price"
              type="number"
              step="0.01"
              value={formData.start_price}
              onChange={(e) => handleChange('start_price', e.target.value)}
              placeholder="e.g., 3000"
            />
            <Input
              label="End Price"
              type="number"
              step="0.01"
              value={formData.end_price}
              onChange={(e) => handleChange('end_price', e.target.value)}
              placeholder="e.g., 3500"
            />
          </div>
        </div>

        {/* Grid Settings */}
        <div>
          <h3 className="text-sm font-medium text-dark-300 mb-3">Grid Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Input
              label="Max Open Orders"
              type="number"
              min="1"
              value={formData.max_open_orders}
              onChange={(e) => handleChange('max_open_orders', e.target.value)}
              placeholder="e.g., 5"
            />
            <Input
              label="Min Spread (%)"
              type="number"
              step="0.01"
              value={formData.min_spread_between_orders}
              onChange={(e) => handleChange('min_spread_between_orders', e.target.value)}
              placeholder="e.g., 0.5"
            />
            <Input
              label="Order Frequency (s)"
              type="number"
              min="1"
              value={formData.order_frequency}
              onChange={(e) => handleChange('order_frequency', e.target.value)}
              placeholder="e.g., 3"
            />
          </div>
        </div>

        {/* Risk Management */}
        <div>
          <h3 className="text-sm font-medium text-dark-300 mb-3">Risk Management</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input
              label="Stop Loss (%)"
              type="number"
              step="0.1"
              value={formData.stop_loss}
              onChange={(e) => handleChange('stop_loss', e.target.value)}
              placeholder="e.g., 5"
            />
            <Input
              label="Take Profit (%)"
              type="number"
              step="0.1"
              value={formData.take_profit}
              onChange={(e) => handleChange('take_profit', e.target.value)}
              placeholder="e.g., 10"
            />
            <Input
              label="Trailing Stop Activation (%)"
              type="number"
              step="0.1"
              value={formData.trailing_stop_activation}
              onChange={(e) => handleChange('trailing_stop_activation', e.target.value)}
              placeholder="e.g., 2"
            />
            <Input
              label="Trailing Stop Delta (%)"
              type="number"
              step="0.1"
              value={formData.trailing_stop_delta}
              onChange={(e) => handleChange('trailing_stop_delta', e.target.value)}
              placeholder="e.g., 0.5"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-4 border-t border-dark-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} className="w-full sm:w-auto">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

