import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CHART_COLORS } from '../../../lib/constants';
import { formatCurrency, formatPercentage } from '../../../lib/utils';

interface DonutChartData {
  name: string;
  value: number;
  percentage?: number;
  color?: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({
  data,
  height = 200,
  innerRadius = 50,
  outerRadius = 80,
  showLegend = true,
  centerLabel,
  centerValue,
}: DonutChartProps) {
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

  const colors = CHART_COLORS.palette;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 shadow-xl">
          <p className="text-white font-medium">{item.name}</p>
          <p className="text-dark-300 text-sm">{formatCurrency(item.value)}</p>
          {item.percentage !== undefined && (
            <p className="text-accent-green text-sm">{item.percentage.toFixed(1)}%</p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => (
    <div className="flex flex-wrap gap-3 justify-center mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-dark-300">{entry.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || colors[index % colors.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend content={<CustomLegend />} />}
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Label */}
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center" style={{ marginBottom: showLegend ? 30 : 0 }}>
            {centerValue && (
              <p className="text-xl font-bold text-white">{centerValue}</p>
            )}
            {centerLabel && (
              <p className="text-xs text-dark-400">{centerLabel}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


