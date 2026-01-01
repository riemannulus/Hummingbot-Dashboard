import React from 'react';
import { Settings, Edit2 } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { BotControllerConfig } from '../../types/api';

interface ConfigTabProps {
  configs: BotControllerConfig[];
  onEditConfig: (config: BotControllerConfig) => void;
}

export function ConfigTab({ configs, onEditConfig }: ConfigTabProps) {
  if (configs.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <div className="text-center py-8 text-dark-400">
          No controller configurations found for this bot.
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      {configs.map((config) => (
        <Card key={config.id}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-accent-green" />
                <CardTitle>{config.id}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info">{config.controller_type}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditConfig(config)}
                  className="text-dark-400 hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-dark-400 text-sm">Controller</div>
                <div className="text-white font-medium">{config.controller_name}</div>
              </div>
              <div>
                <div className="text-dark-400 text-sm">Trading Pair</div>
                <div className="text-white font-medium">{config.trading_pair}</div>
              </div>
              <div>
                <div className="text-dark-400 text-sm">Connector</div>
                <div className="text-white font-medium">{config.connector_name}</div>
              </div>
              <div>
                <div className="text-dark-400 text-sm">Leverage</div>
                <div className="text-white font-medium">{config.leverage || 1}x</div>
              </div>
            </div>

            {/* Position Settings */}
            <div className="pt-4 border-t border-dark-700">
              <div className="text-dark-300 text-sm font-medium mb-3">Position Settings</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-dark-400 text-sm">Total Amount (Quote)</div>
                  <div className="text-white font-medium tabular-nums">
                    ${config.total_amount_quote || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-dark-400 text-sm">Position Mode</div>
                  <div className="text-white font-medium">{config.position_mode || '-'}</div>
                </div>
                {config.start_price && (
                  <div>
                    <div className="text-dark-400 text-sm">Start Price</div>
                    <div className="text-white font-medium tabular-nums">${config.start_price}</div>
                  </div>
                )}
                {config.end_price && (
                  <div>
                    <div className="text-dark-400 text-sm">End Price</div>
                    <div className="text-white font-medium tabular-nums">${config.end_price}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Management */}
            {(config.stop_loss || config.take_profit) && (
              <div className="pt-4 border-t border-dark-700">
                <div className="text-dark-300 text-sm font-medium mb-3">Risk Management</div>
                <div className="grid grid-cols-2 gap-4">
                  {config.stop_loss && (
                    <div>
                      <div className="text-dark-400 text-sm">Stop Loss</div>
                      <div className="text-loss font-medium">
                        {(parseFloat(config.stop_loss) * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}
                  {config.take_profit && (
                    <div>
                      <div className="text-dark-400 text-sm">Take Profit</div>
                      <div className="text-profit font-medium">
                        {(parseFloat(config.take_profit) * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}
                  {config.trailing_stop && (
                    <>
                      <div>
                        <div className="text-dark-400 text-sm">Trailing Activation</div>
                        <div className="text-white font-medium">
                          {(parseFloat(config.trailing_stop.activation_price) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-dark-400 text-sm">Trailing Delta</div>
                        <div className="text-white font-medium">
                          {(parseFloat(config.trailing_stop.trailing_delta) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Grid Settings */}
            {config.max_open_orders && (
              <div className="pt-4 border-t border-dark-700">
                <div className="text-dark-300 text-sm font-medium mb-3">Grid Settings</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-dark-400 text-sm">Max Open Orders</div>
                    <div className="text-white font-medium">{config.max_open_orders}</div>
                  </div>
                  {config.min_spread_between_orders && (
                    <div>
                      <div className="text-dark-400 text-sm">Min Spread</div>
                      <div className="text-white font-medium">
                        {(config.min_spread_between_orders * 100).toFixed(2)}%
                      </div>
                    </div>
                  )}
                  {config.order_frequency && (
                    <div>
                      <div className="text-dark-400 text-sm">Order Frequency</div>
                      <div className="text-white font-medium">{config.order_frequency}s</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

