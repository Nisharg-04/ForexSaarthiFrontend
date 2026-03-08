// ═══════════════════════════════════════════════════════════════════════════════
// CIRCULAR HEDGE COVERAGE - Risk Dashboard Component
// Circular progress indicator showing hedge coverage percentage with color coding
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { cn } from '../../../utils/helpers';

interface CircularHedgeCoverageProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  isDark?: boolean;
  className?: string;
}

/**
 * Circular progress indicator for hedge coverage
 * Color coding:
 * - ≥80% = Green (Fully protected)
 * - 50-80% = Orange (Partial protection)
 * - <50% = Red (At risk)
 */
export const CircularHedgeCoverage: React.FC<CircularHedgeCoverageProps> = ({
  percentage,
  size = 'md',
  showLabel = true,
  label = 'Hedge Coverage',
  isDark = false,
  className,
}) => {
  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  
  // Size configurations
  const sizeConfig = {
    sm: { svgSize: 80, strokeWidth: 6, fontSize: 'text-sm', labelSize: 'text-[10px]' },
    md: { svgSize: 120, strokeWidth: 8, fontSize: 'text-xl', labelSize: 'text-xs' },
    lg: { svgSize: 160, strokeWidth: 10, fontSize: 'text-3xl', labelSize: 'text-sm' },
  };
  
  const config = sizeConfig[size];
  const radius = (config.svgSize - config.strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;
  
  // Color based on percentage (Treasury risk thresholds)
  const getColor = (pct: number): string => {
    if (pct >= 80) return '#10b981'; // emerald-500 - Fully protected
    if (pct >= 50) return '#f59e0b'; // amber-500 - Partial protection
    return '#ef4444'; // red-500 - At risk
  };
  
  const getColorClass = (pct: number): string => {
    if (pct >= 80) return isDark ? 'text-emerald-400' : 'text-emerald-600';
    if (pct >= 50) return isDark ? 'text-amber-400' : 'text-amber-600';
    return isDark ? 'text-red-400' : 'text-red-600';
  };
  
  const getBgColorClass = (pct: number): string => {
    if (pct >= 80) return isDark ? 'bg-emerald-500/10' : 'bg-emerald-50';
    if (pct >= 50) return isDark ? 'bg-amber-500/10' : 'bg-amber-50';
    return isDark ? 'bg-red-500/10' : 'bg-red-50';
  };
  
  const getStatusLabel = (pct: number): string => {
    if (pct >= 80) return 'Protected';
    if (pct >= 50) return 'Partial';
    return 'At Risk';
  };
  
  const color = getColor(clampedPercentage);
  const trackColor = isDark ? '#374151' : '#e5e7eb'; // gray-700 : gray-200
  
  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative">
        <svg
          width={config.svgSize}
          height={config.svgSize}
          className="transform -rotate-90"
        >
          {/* Background track */}
          <circle
            cx={config.svgSize / 2}
            cy={config.svgSize / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={config.strokeWidth}
            fill="none"
          />
          {/* Progress arc */}
          <circle
            cx={config.svgSize / 2}
            cy={config.svgSize / 2}
            r={radius}
            stroke={color}
            strokeWidth={config.strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(
            config.fontSize,
            'font-bold tabular-nums',
            getColorClass(clampedPercentage)
          )}>
            {clampedPercentage.toFixed(1)}%
          </span>
          <span className={cn(
            config.labelSize,
            'px-2 py-0.5 rounded-full font-medium mt-1',
            getBgColorClass(clampedPercentage),
            getColorClass(clampedPercentage)
          )}>
            {getStatusLabel(clampedPercentage)}
          </span>
        </div>
      </div>
      
      {showLabel && (
        <p className={cn(
          'mt-2 font-medium',
          config.labelSize,
          isDark ? 'text-gray-400' : 'text-gray-600'
        )}>
          {label}
        </p>
      )}
    </div>
  );
};

export default CircularHedgeCoverage;
