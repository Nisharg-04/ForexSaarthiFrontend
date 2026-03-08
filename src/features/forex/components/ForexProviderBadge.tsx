// ============================================================================
// ForexProviderBadge Component - Data Source Indicator
// ============================================================================
// Shows the forex data provider with appropriate styling
// Used in: Rate displays, dashboards, valuations
// ============================================================================

import React from 'react';
import { Database, Globe, Building2, CloudOff } from 'lucide-react';
import { cn } from '../../../utils/helpers';
import { FOREX_PROVIDERS } from '../forexConstants';

interface ForexProviderBadgeProps {
  provider: string;
  showIcon?: boolean;
  showDescription?: boolean;
  size?: 'xs' | 'sm' | 'md';
  isDark?: boolean;
  className?: string;
}

export const ForexProviderBadge: React.FC<ForexProviderBadgeProps> = ({
  provider,
  showIcon = true,
  showDescription = false,
  size = 'sm',
  isDark = false,
  className,
}) => {
  // Get provider info or fallback
  const providerInfo = FOREX_PROVIDERS[provider.toLowerCase()] || {
    name: provider,
    description: 'Exchange rate provider',
  };

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-0.5',
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
  };

  // Select icon based on provider type
  const getIcon = () => {
    const lowerProvider = provider.toLowerCase();
    if (lowerProvider === 'rbi') return Building2;
    if (lowerProvider === 'fallback' || lowerProvider === 'cached') return CloudOff;
    if (lowerProvider.includes('exchange')) return Globe;
    return Database;
  };

  const Icon = getIcon();
  const isFallback = provider.toLowerCase() === 'fallback' || provider.toLowerCase() === 'cached';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded font-medium',
        sizeClasses[size],
        isDark
          ? isFallback
            ? 'bg-amber-900/30 text-amber-400 border border-amber-800'
            : 'bg-slate-800 text-slate-300 border border-slate-700'
          : isFallback
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : 'bg-slate-100 text-slate-600 border border-slate-200',
        className
      )}
      title={providerInfo.description}
    >
      {showIcon && (
        <Icon className={cn(iconSizes[size], isFallback && 'text-amber-500')} />
      )}
      <span>{providerInfo.name}</span>
      {showDescription && (
        <span className="opacity-60">• {providerInfo.description}</span>
      )}
    </span>
  );
};

export default ForexProviderBadge;
