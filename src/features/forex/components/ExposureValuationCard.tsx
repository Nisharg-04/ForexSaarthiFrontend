// ============================================================================
// ExposureValuationCard Component - Critical UX Component
// ============================================================================
// UI placement:
// - Invoice detail page
// - Exposure dashboard
// - Trade summary
//
// Display fields:
// - Exposure amount (original currency)
// - Valued amount (company base currency)
// - Effective rate
// - Rate timestamp
// - Provider
// - Disclaimer text
//
// ⚠️ Must clearly state: "Indicative valuation. Not for accounting posting."
// ============================================================================

import React from 'react';
import { TrendingUp, Info, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '../../../utils/helpers';
import { useExposureValuation } from '../hooks/useExposureValuation';
import { RateTimestamp } from './RateTimestamp';
import { ForexProviderBadge } from './ForexProviderBadge';
import { ForexWarningBanner } from './ForexWarningBanner';
import { CURRENCY_FLAGS, EXPOSURE_VALUATION_DISCLAIMER } from '../forexConstants';

interface ExposureValuationCardProps {
  exposureAmount: number;
  exposureCurrency: string;
  reportingCurrency?: string;
  title?: string;
  showDisclaimer?: boolean;
  showRefresh?: boolean;
  compact?: boolean;
  isDark?: boolean;
  className?: string;
}

export const ExposureValuationCard: React.FC<ExposureValuationCardProps> = ({
  exposureAmount,
  exposureCurrency,
  reportingCurrency = 'INR',
  title = 'Indicative Valuation',
  showDisclaimer = true,
  showRefresh = true,
  compact = false,
  isDark = false,
  className,
}) => {
  const {
    valuedAmount,
    effectiveRate,
    timestamp,
    provider,
    isCached,
    isStale,
    warning,
    disclaimer,
    isLoading,
    isFetching,
    isError,
    formattedExposure,
    formattedValued,
    formattedRate,
    refetch,
  } = useExposureValuation({
    exposureAmount,
    exposureCurrency,
    reportingCurrency,
  });

  // Same currency - no valuation needed
  if (exposureCurrency === reportingCurrency) {
    return null;
  }

  // Format currency with locale
  const formatAmount = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Compact view
  if (compact) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-md border',
          isDark
            ? 'bg-slate-800/50 border-slate-700 text-slate-300'
            : 'bg-slate-50 border-slate-200 text-slate-700',
          isStale && 'border-amber-400',
          className
        )}
      >
        <TrendingUp className="w-4 h-4 text-blue-500" />
        {isLoading ? (
          <span className="text-sm">Calculating...</span>
        ) : isError ? (
          <span className="text-sm text-red-500">Unable to value</span>
        ) : (
          <>
            <span className="text-sm font-medium">
              ≈ {formattedValued}
            </span>
            {isCached && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Cached rate" />
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border',
        isDark
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-slate-200',
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 border-b',
          isDark ? 'border-slate-700' : 'border-slate-200'
        )}
      >
        <div className="flex items-center gap-2">
          <TrendingUp className={cn('w-5 h-5', isDark ? 'text-blue-400' : 'text-blue-600')} />
          <h3 className={cn('font-medium', isDark ? 'text-slate-200' : 'text-slate-800')}>
            {title}
          </h3>
        </div>
        {showRefresh && (
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              isDark
                ? 'hover:bg-slate-700 text-slate-400'
                : 'hover:bg-slate-100 text-slate-500',
              isFetching && 'animate-spin'
            )}
            title="Refresh valuation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Warning Banner */}
        {(warning || isStale) && (
          <ForexWarningBanner
            type={isStale ? 'stale' : 'cached'}
            message={warning}
            isDark={isDark}
            size="sm"
          />
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <RefreshCw className={cn('w-6 h-6 animate-spin', isDark ? 'text-slate-500' : 'text-slate-400')} />
            <span className={cn('ml-2', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Fetching valuation...
            </span>
          </div>
        ) : isError ? (
          <div className={cn(
            'flex items-center justify-center py-6 text-red-500',
            isDark && 'text-red-400'
          )}>
            <AlertTriangle className="w-5 h-5 mr-2" />
            Unable to fetch valuation
          </div>
        ) : (
          <>
            {/* Valuation amounts */}
            <div className="grid grid-cols-2 gap-4">
              {/* Exposure Amount */}
              <div>
                <div className={cn('text-xs mb-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Exposure Amount
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{CURRENCY_FLAGS[exposureCurrency] || '🏳️'}</span>
                  <span className={cn('text-lg font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>
                    {formatAmount(exposureAmount, exposureCurrency)}
                  </span>
                </div>
              </div>

              {/* Valued Amount */}
              <div>
                <div className={cn('text-xs mb-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Valued Amount
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{CURRENCY_FLAGS[reportingCurrency] || '🏳️'}</span>
                  <span className={cn('text-lg font-semibold', isDark ? 'text-emerald-400' : 'text-emerald-600')}>
                    {formattedValued || '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Rate info */}
            <div className={cn(
              'flex items-center justify-between pt-3 border-t',
              isDark ? 'border-slate-700' : 'border-slate-200'
            )}>
              <div className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-600')}>
                {formattedRate}
              </div>
              {provider && (
                <ForexProviderBadge provider={provider} isDark={isDark} size="xs" />
              )}
            </div>

            {/* Timestamp */}
            {timestamp && (
              <div className="flex items-center justify-between">
                <RateTimestamp
                  timestamp={timestamp}
                  isCached={isCached}
                  provider={provider}
                  isDark={isDark}
                  size="xs"
                />
              </div>
            )}
          </>
        )}

        {/* Disclaimer */}
        {showDisclaimer && (
          <div className={cn(
            'flex items-start gap-2 pt-3 border-t',
            isDark ? 'border-slate-700' : 'border-slate-200'
          )}>
            <Info className={cn('w-4 h-4 flex-shrink-0 mt-0.5', isDark ? 'text-amber-400' : 'text-amber-600')} />
            <p className={cn('text-xs italic', isDark ? 'text-slate-400' : 'text-slate-500')}>
              {disclaimer || EXPOSURE_VALUATION_DISCLAIMER}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExposureValuationCard;
