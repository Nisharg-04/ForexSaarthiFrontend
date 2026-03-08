// ═══════════════════════════════════════════════════════════════════════════════
// EXPOSURE BY TYPE CHART
// Pie/Donut chart showing receivables vs payables
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { cn, formatNumber, formatCurrency } from '../../../utils/helpers';
import { EXPOSURE_CHART_COLORS, EXPOSURE_TYPE_STYLES } from '../exposureConstants';
import { ExposureType } from '../types';

// Chart-specific data type (handles both old and new API field names)
interface TypeChartData {
  type: string;
  count: number;
  exposedAmount?: number;
  hedgedAmount?: number;
  unhedgedAmount?: number;
  totalExposedAmount?: number;
  totalHedgedAmount?: number;
  totalUnhedgedAmount?: number;
  hedgePercentage?: number;
}

// Support both data array format and simple receivables/payables props
interface ExposureByTypeChartProps {
  data?: TypeChartData[];
  receivables?: number;
  payables?: number;
  isDark?: boolean;
  height?: number;
  showLegend?: boolean;
  showValues?: boolean;
  className?: string;
}

// Helper to get label from type string
const getTypeLabel = (type: string): string => {
  const upperType = type.toUpperCase();
  if (upperType === 'RECEIVABLE' || upperType === 'RECEIVABLES') return 'Receivable';
  if (upperType === 'PAYABLE' || upperType === 'PAYABLES') return 'Payable';
  return type;
};

export const ExposureByTypeChart: React.FC<ExposureByTypeChartProps> = ({
  data,
  receivables,
  payables,
  isDark = false,
  height = 250,
  showLegend = true,
  showValues = true,
  className,
}) => {
  // Transform data for chart - support both data array and simple props
  const chartData = data 
    ? data.map((item) => ({
        name: getTypeLabel(item.type),
        value: item.exposedAmount ?? item.totalExposedAmount ?? 0,
        hedged: item.hedgedAmount ?? item.totalHedgedAmount ?? 0,
        unhedged: item.unhedgedAmount ?? item.totalUnhedgedAmount ?? 0,
        count: item.count || 0,
        type: item.type.toUpperCase(),
      }))
    : [
        {
          name: 'Receivable',
          value: receivables || 0,
          hedged: 0,
          unhedged: receivables || 0,
          count: 0,
          type: 'RECEIVABLE' as const,
        },
        {
          name: 'Payable',
          value: payables || 0,
          hedged: 0,
          unhedged: payables || 0,
          count: 0,
          type: 'PAYABLE' as const,
        },
      ];

  const COLORS = [EXPOSURE_CHART_COLORS.receivable, EXPOSURE_CHART_COLORS.payable];

  // Custom label
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
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
            {item.name}
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className={cn(isDark ? 'text-slate-400' : 'text-slate-600')}>
                Total Exposed:
              </span>
              <span className={cn('font-medium tabular-nums', isDark ? 'text-white' : 'text-slate-900')}>
                {formatNumber(item.value)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className={cn(isDark ? 'text-slate-400' : 'text-slate-600')}>
                Hedged:
              </span>
              <span className={cn('font-medium tabular-nums text-emerald-500')}>
                {formatNumber(item.hedged)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className={cn(isDark ? 'text-slate-400' : 'text-slate-600')}>
                Unhedged:
              </span>
              <span className={cn('font-medium tabular-nums text-red-500')}>
                {formatNumber(item.unhedged)}
              </span>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t border-slate-200 dark:border-slate-700">
              <span className={cn(isDark ? 'text-slate-400' : 'text-slate-600')}>
                Count:
              </span>
              <span className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                {item.count} exposures
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: entry.color }}
            />
            <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-600')}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0 || total === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border',
          isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
        )}
        style={{ height }}
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
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            innerRadius={50}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={2}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                stroke={isDark ? '#1e293b' : '#ffffff'}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend content={renderLegend} />}
        </PieChart>
      </ResponsiveContainer>

      {/* Summary Values */}
      {showValues && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          {chartData.map((item, index) => (
            <div
              key={item.type}
              className={cn(
                'text-center p-3 rounded-lg border',
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
              )}
            >
              <div
                className="w-2 h-2 rounded-full mx-auto mb-1"
                style={{ backgroundColor: COLORS[index] }}
              />
              <p className={cn('text-xs mb-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                {item.name}
              </p>
              <p
                className={cn(
                  'text-lg font-bold tabular-nums',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              >
                {formatNumber(item.value / 1000)}K
              </p>
              <p className={cn('text-[10px]', isDark ? 'text-slate-500' : 'text-slate-400')}>
                {item.count} exposures
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExposureByTypeChart;
