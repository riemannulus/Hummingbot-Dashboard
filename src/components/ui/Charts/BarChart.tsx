import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CHART_COLORS } from '../../../lib/constants';
import { formatCurrency } from '../../../lib/utils';

interface BarChartData {
  name: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  height?: number;
  showGrid?: boolean;
  horizontal?: boolean;
  barSize?: number;
  formatValue?: (value: number) => string;
}

export function BarChart({
  data,
  height = 200,
  showGrid = false,
  horizontal = false,
  barSize = 20,
  formatValue = formatCurrency,
}: BarChartProps) {
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
          <p className="text-white font-medium">{label}</p>
          <p className="text-accent-green">{formatValue(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const colors = CHART_COLORS.palette;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={!horizontal}
            horizontal={horizontal}
          />
        )}
        {horizontal ? (
          <>
            <XAxis
              type="number"
              tick={{ fill: '#6b6b7a', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatValue(value)}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#6b6b7a', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={80}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey="name"
              tick={{ fill: '#6b6b7a', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: '#6b6b7a', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatValue(value)}
              width={60}
            />
          </>
        )}
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
        <Bar
          dataKey="value"
          barSize={barSize}
          radius={[4, 4, 4, 4]}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || colors[index % colors.length]}
            />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}


