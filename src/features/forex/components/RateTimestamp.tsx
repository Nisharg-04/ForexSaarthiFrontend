// ============================================================================
// RateTimestamp Component - Shows Rate Freshness
// ============================================================================
// Displays timestamp with visual freshness indicator
// Used in: Rate displays, valuations, dashboards
// ============================================================================

import React, { useMemo } from 'react';
import { Clock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { cn } from '../../../utils/helpers';
import { RATE_FRESHNESS, RATE_STALE_THRESHOLD_MINUTES, RATE_WARNING_THRESHOLD_MINUTES } from '../forexConstants';

interface RateTimestampProps {
  timestamp: string;
  isCached?: boolean;
  provider?: string;
  showIcon?: boolean;
  showRelative?: boolean;
  showAbsolute?: boolean;
  size?: 'xs' | 'sm' | 'md';
  isDark?: boolean;
  className?: string;
}

export const RateTimestamp: React.FC<RateTimestampProps> = ({
  timestamp,
  isCached = false,
  provider,
  showIcon = true,
  showRelative = true,
  showAbsolute = false,
  size = 'sm',
  isDark = false,
  className,
}) => {
  // Calculate freshness status
  const freshness = useMemo(() => {
    const rateTime = parseISO(timestamp);
    const ageMinutes = (Date.now() - rateTime.getTime()) / (1000 * 60);

    if (isCached) return RATE_FRESHNESS.CACHED;
    if (ageMinutes > RATE_WARNING_THRESHOLD_MINUTES) return RATE_FRESHNESS.STALE;
    if (ageMinutes > RATE_STALE_THRESHOLD_MINUTES) return RATE_FRESHNESS.CACHED;
    if (ageMinutes > 15) return RATE_FRESHNESS.RECENT;
    return RATE_FRESHNESS.FRESH;
  }, [timestamp, isCached]);

  // Format timestamps
  const relativeTime = useMemo(() => {
    try {
      return formatDistanceToNow(parseISO(timestamp), { addSuffix: true });
    } catch {
      return '';
    }
  }, [timestamp]);

  const absoluteTime = useMemo(() => {
    try {
      return format(parseISO(timestamp), 'dd MMM yyyy, HH:mm:ss');
    } catch {
      return '';
    }
  }, [timestamp]);

  const sizeClasses = {
    xs: 'text-[10px] gap-0.5',
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
  };

  const colorClasses = {
    emerald: isDark ? 'text-emerald-400' : 'text-emerald-600',
    blue: isDark ? 'text-blue-400' : 'text-blue-600',
    amber: isDark ? 'text-amber-400' : 'text-amber-600',
    red: isDark ? 'text-red-400' : 'text-red-600',
  };

  const StatusIcon = {
    FRESH: CheckCircle,
    RECENT: Clock,
    CACHED: RefreshCw,
    STALE: AlertTriangle,
  }[freshness.label === 'Live' ? 'FRESH' : freshness.label === 'Recent' ? 'RECENT' : freshness.label === 'Cached' ? 'CACHED' : 'STALE'];

  return (
    <span
      className={cn(
        'inline-flex items-center',
        sizeClasses[size],
        colorClasses[freshness.color as keyof typeof colorClasses],
        className
      )}
      title={`${freshness.description}${provider ? ` • Source: ${provider}` : ''}\n${absoluteTime}`}
    >
      {showIcon && (
        <StatusIcon className={iconSizes[size]} />
      )}
      
      {/* Freshness indicator */}
      <span className="font-medium">
        {freshness.icon} {freshness.label}
      </span>
      
      {/* Relative time */}
      {showRelative && relativeTime && (
        <span className={cn(
          'opacity-75',
          isDark ? 'text-slate-400' : 'text-slate-500'
        )}>
          • {relativeTime}
        </span>
      )}
      
      {/* Absolute time */}
      {showAbsolute && absoluteTime && (
        <span className={cn(
          'opacity-75',
          isDark ? 'text-slate-400' : 'text-slate-500'
        )}>
          ({absoluteTime})
        </span>
      )}
    </span>
  );
};

export default RateTimestamp;
