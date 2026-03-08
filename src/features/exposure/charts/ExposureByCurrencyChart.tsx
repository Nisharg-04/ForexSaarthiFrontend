// ═══════════════════════════════════════════════════════════════════════════════
// EXPOSURE BY CURRENCY CHART
// Bar chart showing exposure distribution across currencies
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { cn, formatCurrency, formatNumber } from '../../../utils/helpers';
import { CURRENCY_CHART_COLORS, EXPOSURE_CHART_COLORS } from '../exposureConstants';

// Chart-specific data type (normalized from API)
interface CurrencyChartData {
  currency: string;
  exposedAmount?: number;
  hedgedAmount?: number;
  unhedgedAmount?: number;
  totalExposedAmount?: number;
  totalHedgedAmount?: number;
  totalUnhedgedAmount?: number;
  count: number;
}

interface ExposureByCurrencyChartProps {
  data: CurrencyChartData[];
  isDark?: boolean;
  height?: number;
  showLegend?: boolean;
  className?: string;
}

export const ExposureByCurrencyChart: React.FC<ExposureByCurrencyChartProps> = ({
  data,
  isDark = false,
  height = 300,
  showLegend = true,
  className,
}) => {
  // Transform data for chart - handle both old and new field names
  const chartData = data.map((item) => ({
    currency: item.currency,
    exposed: item.exposedAmount ?? item.totalExposedAmount ?? 0,
    hedged: item.hedgedAmount ?? item.totalHedgedAmount ?? 0,
    unhedged: item.unhedgedAmount ?? item.totalUnhedgedAmount ?? 0,
    count: item.count,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={cn(
            'rounded-lg border p-3 shadow-lg',
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          )}
        >
          <p
            className={cn(
              'font-medium mb-2',
              isDark ? 'text-white' : 'text-slate-900'
            )}
          >
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: entry.color }}
              />
              <span className={cn(isDark ? 'text-slate-400' : 'text-slate-600')}>
                {entry.name}:
              </span>
              <span
                className={cn(
                  'font-medium tabular-nums',
                  isDark ? 'text-slate-200' : 'text-slate-800'
                )}
              >
                {formatNumber(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!data.length) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-[300px] rounded-lg border',
          isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
        )}
      >
        <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
          No exposure data available
        </p>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? '#334155' : '#e2e8f0'}
            vertical={false}
          />
          <XAxis
            dataKey="currency"
            tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
            axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => formatNumber(value / 1000) + 'K'}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: 10 }}
              formatter={(value) => (
                <span className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-600')}>
                  {value}
                </span>
              )}
            />
          )}
          <Bar
            dataKey="hedged"
            name="Hedged"
            stackId="a"
            fill={EXPOSURE_CHART_COLORS.hedged}
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="unhedged"
            name="Unhedged"
            stackId="a"
            fill={EXPOSURE_CHART_COLORS.unhedged}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExposureByCurrencyChart;
