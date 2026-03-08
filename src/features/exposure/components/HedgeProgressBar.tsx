// ═══════════════════════════════════════════════════════════════════════════════
// HEDGE PROGRESS BAR COMPONENT
// Visual representation of hedge coverage percentage
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { cn } from '../../../utils/helpers';
import { EXPOSURE_THRESHOLDS } from '../exposureConstants';

interface HedgeProgressBarProps {
  hedgePercentage: number;
  settlementPercentage?: number;
  showLabels?: boolean;
  showValues?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isDark?: boolean;
  className?: string;
}

export const HedgeProgressBar: React.FC<HedgeProgressBarProps> = ({
  hedgePercentage,
  settlementPercentage = 0,
  showLabels = false,
  showValues = true,
  size = 'sm',
  isDark = false,
  className,
}) => {
  // Normalize percentages
  const hedgePct = Math.min(100, Math.max(0, hedgePercentage));
  const settledPct = Math.min(100 - hedgePct, Math.max(0, settlementPercentage));
  const unhedgedPct = 100 - hedgePct - settledPct;

  // Size variants
  const heightClasses = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  // Determine color based on coverage level
  const getHedgeColor = () => {
    if (hedgePct >= EXPOSURE_THRESHOLDS.targetHedgePercentage) {
      return isDark ? 'bg-emerald-500' : 'bg-emerald-500';
    }
    if (hedgePct >= 50) {
      return isDark ? 'bg-amber-500' : 'bg-amber-500';
    }
    if (hedgePct > 0) {
      return isDark ? 'bg-orange-500' : 'bg-orange-500';
    }
    return isDark ? 'bg-slate-700' : 'bg-slate-300';
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Labels Row */}
      {showLabels && (
        <div className="flex justify-between text-[10px] mb-1">
          <span className={cn(isDark ? 'text-slate-400' : 'text-slate-500')}>
            Hedge Coverage
          </span>
          {showValues && (
            <span
              className={cn(
                'font-medium tabular-nums',
                hedgePct >= 80
                  ? isDark
                    ? 'text-emerald-400'
                    : 'text-emerald-600'
                  : hedgePct >= 50
                  ? isDark
                    ? 'text-amber-400'
                    : 'text-amber-600'
                  : isDark
                  ? 'text-red-400'
                  : 'text-red-600'
              )}
            >
              {hedgePct.toFixed(0)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden flex',
          heightClasses[size],
          isDark ? 'bg-slate-700' : 'bg-slate-200'
        )}
      >
        {/* Hedged Section */}
        {hedgePct > 0 && (
          <div
            className={cn('transition-all duration-300', getHedgeColor())}
            style={{ width: `${hedgePct}%` }}
            title={`Hedged: ${hedgePct.toFixed(1)}%`}
          />
        )}
        
        {/* Settled Section */}
        {settledPct > 0 && (
          <div
            className={cn(
              'transition-all duration-300',
              isDark ? 'bg-cyan-500' : 'bg-cyan-500'
            )}
            style={{ width: `${settledPct}%` }}
            title={`Settled: ${settledPct.toFixed(1)}%`}
          />
        )}
      </div>

      {/* Value Labels (if showLabels but no showValues in header) */}
      {showLabels && !showValues && (
        <div className="flex justify-between text-[10px] mt-1">
          {hedgePct > 0 && (
            <span className={cn(isDark ? 'text-emerald-400' : 'text-emerald-600')}>
              {hedgePct.toFixed(0)}% hedged
            </span>
          )}
          {settledPct > 0 && (
            <span className={cn(isDark ? 'text-cyan-400' : 'text-cyan-600')}>
              {settledPct.toFixed(0)}% settled
            </span>
          )}
          {unhedgedPct > 0 && (
            <span className={cn(isDark ? 'text-slate-400' : 'text-slate-500')}>
              {unhedgedPct.toFixed(0)}% open
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────────
// STACKED BREAKDOWN BAR - Shows exposed, hedged, settled, unhedged
// ─────────────────────────────────────────────────────────────────────────────────

interface ExposureBreakdownBarProps {
  exposedAmount: number;
  hedgedAmount: number;
  settledAmount: number;
  unhedgedAmount: number;
  showLegend?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isDark?: boolean;
  className?: string;
}

export const ExposureBreakdownBar: React.FC<ExposureBreakdownBarProps> = ({
  exposedAmount,
  hedgedAmount,
  settledAmount,
  unhedgedAmount,
  showLegend = true,
  size = 'md',
  isDark = false,
  className,
}) => {
  const total = exposedAmount || 1; // Prevent division by zero
  const hedgedPct = (hedgedAmount / total) * 100;
  const settledPct = (settledAmount / total) * 100;
  const unhedgedPct = (unhedgedAmount / total) * 100;

  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Stacked Bar */}
      <div
        className={cn(
          'w-full rounded overflow-hidden flex',
          heightClasses[size],
          isDark ? 'bg-slate-700' : 'bg-slate-200'
        )}
      >
        {/* Settled */}
        {settledPct > 0 && (
          <div
            className={cn('transition-all duration-300', isDark ? 'bg-cyan-500' : 'bg-cyan-500')}
            style={{ width: `${settledPct}%` }}
            title={`Settled: ${settledPct.toFixed(1)}%`}
          />
        )}
        
        {/* Hedged */}
        {hedgedPct > 0 && (
          <div
            className={cn('transition-all duration-300', isDark ? 'bg-emerald-500' : 'bg-emerald-500')}
            style={{ width: `${hedgedPct}%` }}
            title={`Hedged: ${hedgedPct.toFixed(1)}%`}
          />
        )}
        
        {/* Unhedged */}
        {unhedgedPct > 0 && (
          <div
            className={cn('transition-all duration-300', isDark ? 'bg-red-500/50' : 'bg-red-400')}
            style={{ width: `${unhedgedPct}%` }}
            title={`Unhedged: ${unhedgedPct.toFixed(1)}%`}
          />
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px]">
          {settledPct > 0 && (
            <div className="flex items-center gap-1">
              <div className={cn('w-2 h-2 rounded-sm', isDark ? 'bg-cyan-500' : 'bg-cyan-500')} />
              <span className={cn(isDark ? 'text-slate-400' : 'text-slate-600')}>
                Settled ({settledPct.toFixed(0)}%)
              </span>
            </div>
          )}
          {hedgedPct > 0 && (
            <div className="flex items-center gap-1">
              <div className={cn('w-2 h-2 rounded-sm', isDark ? 'bg-emerald-500' : 'bg-emerald-500')} />
              <span className={cn(isDark ? 'text-slate-400' : 'text-slate-600')}>
                Hedged ({hedgedPct.toFixed(0)}%)
              </span>
            </div>
          )}
          {unhedgedPct > 0 && (
            <div className="flex items-center gap-1">
              <div className={cn('w-2 h-2 rounded-sm', isDark ? 'bg-red-500/50' : 'bg-red-400')} />
              <span className={cn(isDark ? 'text-slate-400' : 'text-slate-600')}>
                Unhedged ({unhedgedPct.toFixed(0)}%)
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HedgeProgressBar;
