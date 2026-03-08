// ============================================================================
// ForexWarningBanner Component - Non-Blocking Alerts
// ============================================================================
// Shows warnings about rate quality without blocking UI
// Used in: Invoice detail, exposure dashboard, trade summary
//
// ⚠️ Never blocks user actions
// ============================================================================

import React from 'react';
import { AlertTriangle, Info, Clock, WifiOff, X } from 'lucide-react';
import { cn } from '../../../utils/helpers';
import { FOREX_WARNINGS } from '../forexConstants';

type WarningType = 'stale' | 'cached' | 'provider' | 'network' | 'info';

interface ForexWarningBannerProps {
  type?: WarningType;
  message?: string;
  isVisible?: boolean;
  isDismissible?: boolean;
  onDismiss?: () => void;
  isDark?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const ForexWarningBanner: React.FC<ForexWarningBannerProps> = ({
  type = 'info',
  message,
  isVisible = true,
  isDismissible = true,
  onDismiss,
  isDark = false,
  size = 'sm',
  className,
}) => {
  if (!isVisible) return null;

  // Get default message based on type
  const defaultMessages: Record<WarningType, string> = {
    stale: FOREX_WARNINGS.STALE_RATES,
    cached: FOREX_WARNINGS.CACHED_RATES,
    provider: FOREX_WARNINGS.PROVIDER_ISSUE,
    network: FOREX_WARNINGS.NETWORK_ERROR,
    info: 'Rates are for reference only.',
  };

  const displayMessage = message || defaultMessages[type];

  // Get icon and colors based on type
  const config: Record<WarningType, {
    icon: typeof AlertTriangle;
    light: string;
    dark: string;
  }> = {
    stale: {
      icon: Clock,
      light: 'bg-red-50 border-red-200 text-red-800',
      dark: 'bg-red-900/20 border-red-800 text-red-300',
    },
    cached: {
      icon: WifiOff,
      light: 'bg-amber-50 border-amber-200 text-amber-800',
      dark: 'bg-amber-900/20 border-amber-800 text-amber-300',
    },
    provider: {
      icon: AlertTriangle,
      light: 'bg-orange-50 border-orange-200 text-orange-800',
      dark: 'bg-orange-900/20 border-orange-800 text-orange-300',
    },
    network: {
      icon: WifiOff,
      light: 'bg-red-50 border-red-200 text-red-800',
      dark: 'bg-red-900/20 border-red-800 text-red-300',
    },
    info: {
      icon: Info,
      light: 'bg-blue-50 border-blue-200 text-blue-800',
      dark: 'bg-blue-900/20 border-blue-800 text-blue-300',
    },
  };

  const { icon: Icon, light, dark } = config[type];

  const sizeClasses = {
    sm: 'px-3 py-2 text-xs gap-2',
    md: 'px-4 py-3 text-sm gap-3',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  };

  return (
    <div
      className={cn(
        'flex items-center rounded-md border',
        sizeClasses[size],
        isDark ? dark : light,
        className
      )}
      role="alert"
    >
      <Icon className={cn(iconSizes[size], 'flex-shrink-0')} />
      <span className="flex-1">{displayMessage}</span>
      {isDismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0 p-0.5 rounded hover:bg-black/10 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            isDark ? 'focus:ring-slate-500' : 'focus:ring-slate-400'
          )}
          aria-label="Dismiss warning"
        >
          <X className={iconSizes[size]} />
        </button>
      )}
    </div>
  );
};

export default ForexWarningBanner;
