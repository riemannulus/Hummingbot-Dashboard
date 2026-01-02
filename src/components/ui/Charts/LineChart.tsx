import React, { useMemo } from 'react';
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
  // Calculate Y-axis domain focusing on stable range (excluding initial outliers)
  const yDomain = useMemo((): [number, number] => {
    if (!data || data.length === 0) return [0, 100];
    
    const values = data.map((d) => d[valueKey] as number).filter((v) => typeof v === 'number' && !isNaN(v));
    if (values.length === 0) return [0, 100];
    
    const max = Math.max(...values);
    const lastValue = values[values.length - 1];
    
    // Find the stable range: skip initial points that are significantly lower than current value
    // (indicating portfolio startup phase)
    const stableThreshold = lastValue * 0.5; // Consider values above 50% of last value as "stable"
    const stableValues = values.filter((v) => v >= stableThreshold);
    
    let min: number;
    if (stableValues.length > 0 && stableValues.length !== values.length) {
      // There are outliers at the beginning - use stable range
      min = Math.min(...stableValues);
    } else {
      // No significant outliers, use all data
      min = Math.min(...values);
    }
    
    const range = max - min;
    
    // Add 10% padding, minimum padding of 1% of max value
    const padding = Math.max(range * 0.1, max * 0.01) || 10;
    const domainMin = Math.max(0, min - padding);
    const domainMax = max + padding;
    
    return [domainMin, domainMax];
  }, [data, valueKey]);

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
          width={80}
          domain={yDomain}
          allowDataOverflow
        />
        <Tooltip content={<CustomTooltip />} />
        {showArea ? (
          <Area
            type="monotone"
            dataKey={valueKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${color.replace('#', '')})`}
            isAnimationActive={false}
          />
        ) : (
          <Line
            type="monotone"
            dataKey={valueKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color }}
            isAnimationActive={false}
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
