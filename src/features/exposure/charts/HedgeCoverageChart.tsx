// ═══════════════════════════════════════════════════════════════════════════════
// HEDGE COVERAGE CHART
// Horizontal bar chart showing hedge coverage by currency
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
  ReferenceLine,
  Cell,
} from 'recharts';
import { cn, formatNumber } from '../../../utils/helpers';
import type { HedgeCoverage } from '../types';
import { EXPOSURE_THRESHOLDS, EXPOSURE_CHART_COLORS } from '../exposureConstants';

interface HedgeCoverageChartProps {
  data: HedgeCoverage[];
  isDark?: boolean;
  height?: number;
  showTarget?: boolean;
  targetPercentage?: number;
  className?: string;
}

export const HedgeCoverageChart: React.FC<HedgeCoverageChartProps> = ({
  data,
  isDark = false,
  height = 250,
  showTarget = true,
  targetPercentage: propTargetPercentage,
  className,
}) => {
  const targetPercentage = propTargetPercentage ?? EXPOSURE_THRESHOLDS.targetHedgePercentage;

  // Transform and sort data
  const chartData = [...data]
    .sort((a, b) => b.hedgePercentage - a.hedgePercentage)
    .map((item) => ({
      currency: item.currency,
      hedgePercentage: Math.min(100, item.hedgePercentage),
      unhedgedAmount: item.unhedgedAmount,
      targetPercentage: item.targetPercentage || targetPercentage,
    }));

  // Get bar color based on percentage
  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return '#10b981'; // emerald
    if (percentage >= 50) return '#f59e0b'; // amber
    if (percentage > 0) return '#f97316';   // orange
    return '#ef4444';                        // red
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
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
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className={cn(isDark ? 'text-slate-400' : 'text-slate-600')}>
                Hedge Coverage:
              </span>
              <span
                className={cn('font-medium tabular-nums')}
                style={{ color: getBarColor(item.hedgePercentage) }}
              >
                {item.hedgePercentage.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className={cn(isDark ? 'text-slate-400' : 'text-slate-600')}>
                Unhedged Value:
              </span>
              <span className={cn('font-medium tabular-nums text-red-500')}>
                {formatNumber(item.unhedgedAmount)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className={cn(isDark ? 'text-slate-400' : 'text-slate-600')}>
                Target:
              </span>
              <span className={cn('font-medium tabular-nums', isDark ? 'text-slate-300' : 'text-slate-700')}>
                {item.targetPercentage}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!data.length) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border',
          isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
        )}
        style={{ height }}
      >
        <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
          No hedge coverage data available
        </p>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? '#334155' : '#e2e8f0'}
            horizontal={true}
            vertical={false}
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
            axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis
            type="category"
            dataKey="currency"
            tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Target Line */}
          {showTarget && (
            <ReferenceLine
              x={targetPercentage}
              stroke={isDark ? '#38bdf8' : '#0891b2'}
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `Target ${targetPercentage}%`,
                position: 'top',
                fill: isDark ? '#38bdf8' : '#0891b2',
                fontSize: 10,
              }}
            />
          )}
          
          <Bar
            dataKey="hedgePercentage"
            radius={[0, 4, 4, 0]}
            barSize={20}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(entry.hedgePercentage)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-600')}>
            ≥80% (Good)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-600')}>
            50-79% (Moderate)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-600')}>
            &lt;50% (Low)
          </span>
        </div>
      </div>
    </div>
  );
};

export default HedgeCoverageChart;
