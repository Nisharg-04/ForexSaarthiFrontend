// ============================================================================
// ForexRateBadge Component - Compact Rate Display
// ============================================================================
// Shows exchange rate in a compact badge format
// Used in: Tables, cards, inline displays
// ============================================================================

import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { cn } from '../../../utils/helpers';
import { FOREX_BADGE_STYLES, CURRENCY_FLAGS } from '../forexConstants';

interface ForexRateBadgeProps {
  from: string;
  to: string;
  rate: number;
  isCached?: boolean;
  isStale?: boolean;
  trend?: 'up' | 'down' | 'stable';
  showFlags?: boolean;
  showTrend?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isDark?: boolean;
  className?: string;
}

export const ForexRateBadge: React.FC<ForexRateBadgeProps> = ({
  from,
  to,
  rate,
  isCached = false,
  isStale = false,
  trend,
  showFlags = true,
  showTrend = false,
  size = 'md',
  isDark = false,
  className,
}) => {
  const styles = isDark ? FOREX_BADGE_STYLES.dark : FOREX_BADGE_STYLES.light;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

  const formatRate = (value: number): string => {
    if (value >= 100) return value.toFixed(2);
    if (value >= 1) return value.toFixed(4);
    return value.toFixed(6);
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border font-medium',
        sizeClasses[size],
        styles.container,
        isStale && 'border-red-300 dark:border-red-700',
        className
      )}
      title={isStale ? 'Rate may be outdated' : isCached ? 'Using cached rate' : 'Live rate'}
    >
      {/* From currency */}
      {showFlags && (
        <span className="text-base">{CURRENCY_FLAGS[from] || '🏳️'}</span>
      )}
      <span className={styles.label}>{from}</span>
      
      {/* Arrow */}
      <span className={styles.label}>→</span>
      
      {/* To currency */}
      {showFlags && (
        <span className="text-base">{CURRENCY_FLAGS[to] || '🏳️'}</span>
      )}
      <span className={styles.label}>{to}</span>
      
      {/* Rate */}
      <span className={cn(styles.rate, 'ml-1')}>
        {formatRate(rate)}
      </span>
      
      {/* Trend indicator */}
      {showTrend && TrendIcon && (
        <TrendIcon
          className={cn(
            'w-3 h-3',
            trend === 'up' && 'text-emerald-500',
            trend === 'down' && 'text-red-500'
          )}
        />
      )}
      
      {/* Cached/Stale indicator */}
      {(isCached || isStale) && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full ml-1',
            isStale ? 'bg-red-500' : 'bg-amber-500'
          )}
          title={isStale ? 'Stale rate' : 'Cached rate'}
        />
      )}
      
      {/* Warning for stale rates */}
      {isStale && (
        <AlertCircle className={cn('w-3 h-3', styles.warning)} />
      )}
    </span>
  );
};

export default ForexRateBadge;
