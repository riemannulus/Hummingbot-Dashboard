import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { CHART_COLORS } from '../../../lib/constants';
import { formatCurrency, formatTime } from '../../../lib/utils';

interface LineChartProps {
  data: Array<{ timestamp: number; value: number; [key: string]: unknown }>;
  height?: number;
  showGrid?: boolean;
  showArea?: boolean;
  valueKey?: string;
  color?: string;
  formatValue?: (value: number) => string;
  formatLabel?: (timestamp: number) => string;
}

export function LineChart({
  data,
  height = 200,
  showGrid = false,
  showArea = true,
  valueKey = 'value',
  color = CHART_COLORS.primary,
  formatValue = formatCurrency,
  formatLabel = formatTime,
}: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-dark-400"
        style={{ height }}
      >
        No data available
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 shadow-xl">
          <p className="text-dark-400 text-xs mb-1">{formatLabel(label)}</p>
          <p className="text-white font-semibold">{formatValue(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const ChartComponent = showArea ? AreaChart : RechartsLineChart;
  const DataComponent = showArea ? Area : Line;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />
        )}
        <XAxis
          dataKey="timestamp"
          tick={{ fill: '#6b6b7a', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatLabel}
          minTickGap={50}
        />
        <YAxis
          tick={{ fill: '#6b6b7a', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatValue(value)}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        {showArea ? (
          <Area
            type="monotone"
            dataKey={valueKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${color.replace('#', '')})`}
          />
        ) : (
          <Line
            type="monotone"
            dataKey={valueKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color }}
          />
        )}
        <defs>
          <linearGradient
            id={`gradient-${color.replace('#', '')}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
      </ChartComponent>
    </ResponsiveContainer>
  );
}


