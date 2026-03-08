// ═══════════════════════════════════════════════════════════════════════════════
// RISK BY TYPE CHART - Risk Dashboard Component
// Donut chart showing Receivable Risk vs Payable Risk (Unhedged amounts only)
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
import { cn, formatNumber } from '../../../utils/helpers';

interface RiskByTypeChartProps {
  receivableUnhedged: number;
  payableUnhedged: number;
  receivableCount?: number;
  payableCount?: number;
  isDark?: boolean;
  height?: number;
  showLegend?: boolean;
  showRiskIndicators?: boolean;
  className?: string;
}

/**
 * Risk-based chart showing Receivable vs Payable UNHEDGED amounts
 * This is NOT an accounting view - it shows TRUE OPEN RISK only
 */
export const RiskByTypeChart: React.FC<RiskByTypeChartProps> = ({
  receivableUnhedged,
  payableUnhedged,
  receivableCount = 0,
  payableCount = 0,
  isDark = false,
  height = 280,
  showLegend = true,
  showRiskIndicators = true,
  className,
}) => {
  // CRITICAL: Using UNHEDGED amounts for risk view
  const chartData = [
    {
      name: 'Receivable Risk',
      value: receivableUnhedged,
      count: receivableCount,
      type: 'RECEIVABLE',
      color: '#14b8a6', // teal-500 for receivables
      description: 'Unhedged export receivables',
    },
    {
      name: 'Payable Risk',
      value: payableUnhedged,
      count: payableCount,
      type: 'PAYABLE',
      color: '#8b5cf6', // violet-500 for payables
      description: 'Unhedged import payables',
    },
  ];

  const COLORS = ['#14b8a6', '#8b5cf6'];
  const total = receivableUnhedged + payableUnhedged;

  // Custom label inside donut
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
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
        className="text-xs font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom tooltip showing risk details
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div
          className={cn(
            'rounded-lg border p-3 shadow-lg min-w-[180px]',
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: item.color }}
            />
            <p className={cn(
              'font-semibold',
              isDark ? 'text-white' : 'text-slate-900'
            )}>
              {item.name}
            </p>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-4">
              <span className={cn(isDark ? 'text-slate-400' : 'text-slate-600')}>
                Unhedged Value:
              </span>
              <span className={cn('font-semibold tabular-nums text-red-500')}>
                {formatNumber(item.value, 0)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className={cn(isDark ? 'text-slate-400' : 'text-slate-600')}>
                Exposures at Risk:
              </span>
              <span className={cn(
                'font-medium',
                isDark ? 'text-white' : 'text-slate-900'
              )}>
                {item.count}
              </span>
            </div>
            <div className={cn(
              'pt-1.5 mt-1 border-t text-xs',
              isDark ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-500'
            )}>
              {item.description}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom legend showing risk breakdown
  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex justify-center gap-6 mt-2">
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

  // Empty state
  if (total === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-lg border',
          isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200',
          className
        )}
        style={{ height }}
      >
        <div className={cn(
          'p-3 rounded-full mb-3',
          isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'
        )}>
          <svg className={cn('w-8 h-8', isDark ? 'text-emerald-400' : 'text-emerald-600')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className={cn('text-sm font-medium', isDark ? 'text-emerald-400' : 'text-emerald-600')}>
          All Exposures Hedged
        </p>
        <p className={cn('text-xs mt-1', isDark ? 'text-slate-500' : 'text-slate-400')}>
          No open FX risk detected
        </p>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height - (showRiskIndicators ? 80 : 0)}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={75}
            innerRadius={45}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={3}
            animationBegin={0}
            animationDuration={1000}
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

      {/* Risk Indicators */}
      {showRiskIndicators && (
        <div className="grid grid-cols-2 gap-3 mt-2">
          {chartData.map((item, index) => (
            <div
              key={item.type}
              className={cn(
                'text-center p-3 rounded-lg border transition-colors',
                isDark 
                  ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800' 
                  : 'bg-slate-50 border-slate-200 hover:bg-white hover:shadow-sm'
              )}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <p className={cn('text-xs font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  {item.type === 'RECEIVABLE' ? 'Receivable Risk' : 'Payable Risk'}
                </p>
              </div>
              <p className={cn(
                'text-lg font-bold tabular-nums',
                isDark ? 'text-red-400' : 'text-red-600'
              )}>
                {formatNumber(item.value / 1000, 0)}K
              </p>
              <p className={cn('text-[10px]', isDark ? 'text-slate-500' : 'text-slate-400')}>
                {item.count} unhedged
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiskByTypeChart;
