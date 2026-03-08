// ═══════════════════════════════════════════════════════════════════════════════
// EXPOSURE SUMMARY CARDS COMPONENT
// Key metrics display for exposure dashboard
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { TrendingUp, Shield, AlertTriangle, CheckCircle2, Target, DollarSign } from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '../../../utils/helpers';
import type { ExposureSummary } from '../types';
import { HedgeProgressBar } from './HedgeProgressBar';
import { EXPOSURE_THRESHOLDS } from '../exposureConstants';

interface ExposureSummaryCardsProps {
  summary: ExposureSummary | undefined;
  isLoading?: boolean;
  isDark?: boolean;
  baseCurrency?: string;
  className?: string;
}

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconColor: string;
  trend?: 'up' | 'down' | 'neutral';
  isDark: boolean;
  isLoading?: boolean;
  children?: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  isDark,
  isLoading,
  children,
}) => {
  if (isLoading) {
    return (
      <div
        className={cn(
          'rounded-lg border p-4',
          isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
        )}
      >
        <div className="animate-pulse space-y-3">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-lg', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
            <div className={cn('h-4 w-24 rounded', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
          </div>
          <div className={cn('h-8 w-32 rounded', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
          <div className={cn('h-3 w-20 rounded', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-all duration-200 hover:shadow-md',
        isDark
          ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
          : 'bg-white border-slate-200 hover:border-slate-300'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center',
                iconColor
              )}
            >
              {icon}
            </div>
            <span
              className={cn(
                'text-xs font-medium uppercase tracking-wide',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              {title}
            </span>
          </div>

          <div
            className={cn(
              'text-2xl font-bold tabular-nums',
              isDark ? 'text-white' : 'text-slate-900'
            )}
          >
            {value}
          </div>

          {subtitle && (
            <p
              className={cn(
                'text-xs mt-1',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {children && <div className="mt-3">{children}</div>}
    </div>
  );
};

export const ExposureSummaryCards: React.FC<ExposureSummaryCardsProps> = ({
  summary,
  isLoading = false,
  isDark = false,
  baseCurrency = 'INR',
  className,
}) => {
  // Calculate metrics
  const totalCount = summary?.totalExposures || 0;
  const fullyHedgedCount = summary?.countByStatus?.FULLY_HEDGED || 0;
  const unhedgedCount = summary?.countByStatus?.UNHEDGED || 0;
  const settledCount = summary?.countByStatus?.SETTLED || 0;
  const overdueCount = summary?.countByStatus?.OVERDUE || 0;
  const overallHedgePct = summary?.overallHedgePercentage || 0;

  // Determine hedge status color
  const hedgeStatusColor =
    overallHedgePct >= EXPOSURE_THRESHOLDS.targetHedgePercentage
      ? isDark
        ? 'text-emerald-400'
        : 'text-emerald-600'
      : overallHedgePct >= 50
      ? isDark
        ? 'text-amber-400'
        : 'text-amber-600'
      : isDark
      ? 'text-red-400'
      : 'text-red-600';

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4", className)}>
      {/* Total Exposures */}
      <SummaryCard
        title="Total Exposures"
        value={totalCount}
        subtitle="Active positions"
        icon={<TrendingUp className="w-5 h-5 text-indigo-500" />}
        iconColor={isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}
        isDark={isDark}
        isLoading={isLoading}
      />

      {/* Fully Hedged */}
      <SummaryCard
        title="Fully Hedged"
        value={fullyHedgedCount}
        subtitle="100% covered"
        icon={<Shield className="w-5 h-5 text-emerald-500" />}
        iconColor={isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}
        isDark={isDark}
        isLoading={isLoading}
      />

      {/* Unhedged */}
      <SummaryCard
        title="Unhedged"
        value={unhedgedCount + (summary?.countByStatus?.PARTIALLY_HEDGED || 0)}
        subtitle={`${unhedgedCount} open, ${summary?.countByStatus?.PARTIALLY_HEDGED || 0} partial`}
        icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
        iconColor={isDark ? 'bg-red-500/10' : 'bg-red-50'}
        isDark={isDark}
        isLoading={isLoading}
      />

      {/* Settled */}
      <SummaryCard
        title="Settled"
        value={settledCount}
        subtitle="Completed"
        icon={<CheckCircle2 className="w-5 h-5 text-cyan-500" />}
        iconColor={isDark ? 'bg-cyan-500/10' : 'bg-cyan-50'}
        isDark={isDark}
        isLoading={isLoading}
      />

      {/* Overdue */}
      <SummaryCard
        title="Overdue"
        value={overdueCount}
        subtitle="Past maturity"
        icon={<AlertTriangle className="w-5 h-5 text-rose-500" />}
        iconColor={isDark ? 'bg-rose-500/10' : 'bg-rose-50'}
        isDark={isDark}
        isLoading={isLoading}
      />

      {/* Overall Hedge % */}
      <SummaryCard
        title="Hedge Coverage"
        value={`${overallHedgePct.toFixed(1)}%`}
        subtitle={`Target: ${EXPOSURE_THRESHOLDS.targetHedgePercentage}%`}
        icon={<Target className={cn('w-5 h-5', hedgeStatusColor)} />}
        iconColor={isDark ? 'bg-violet-500/10' : 'bg-violet-50'}
        isDark={isDark}
        isLoading={isLoading}
      >
        <HedgeProgressBar
          hedgePercentage={overallHedgePct}
          size="sm"
          isDark={isDark}
        />
      </SummaryCard>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────────
// COMPACT AMOUNT CARDS - For showing total amounts
// ─────────────────────────────────────────────────────────────────────────────────

interface AmountSummaryCardsProps {
  totalExposed?: number;
  totalReceivables?: number;
  totalPayables?: number;
  totalHedged: number;
  totalSettled?: number;
  totalUnhedged: number;
  currency?: string;
  isLoading?: boolean;
  isDark?: boolean;
  className?: string;
}

export const AmountSummaryCards: React.FC<AmountSummaryCardsProps> = ({
  totalExposed,
  totalReceivables,
  totalPayables,
  totalHedged,
  totalSettled,
  totalUnhedged,
  currency = 'INR',
  isLoading = false,
  isDark = false,
  className,
}) => {
  // Build cards based on available props
  const cards = [];

  if (totalExposed !== undefined) {
    cards.push({
      label: 'Total Exposed',
      value: totalExposed,
      color: isDark ? 'text-indigo-400' : 'text-indigo-600',
      bgColor: isDark ? 'bg-indigo-500/10' : 'bg-indigo-50',
    });
  }

  if (totalReceivables !== undefined) {
    cards.push({
      label: 'Receivables',
      value: totalReceivables,
      color: isDark ? 'text-green-400' : 'text-green-600',
      bgColor: isDark ? 'bg-green-500/10' : 'bg-green-50',
    });
  }

  if (totalPayables !== undefined) {
    cards.push({
      label: 'Payables',
      value: totalPayables,
      color: isDark ? 'text-orange-400' : 'text-orange-600',
      bgColor: isDark ? 'bg-orange-500/10' : 'bg-orange-50',
    });
  }

  cards.push({
    label: 'Hedged',
    value: totalHedged,
    color: isDark ? 'text-emerald-400' : 'text-emerald-600',
    bgColor: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50',
  });

  if (totalSettled !== undefined) {
    cards.push({
      label: 'Settled',
      value: totalSettled,
      color: isDark ? 'text-cyan-400' : 'text-cyan-600',
      bgColor: isDark ? 'bg-cyan-500/10' : 'bg-cyan-50',
    });
  }

  cards.push({
    label: 'Unhedged',
    value: totalUnhedged,
    color: isDark ? 'text-red-400' : 'text-red-600',
    bgColor: isDark ? 'bg-red-500/10' : 'bg-red-50',
  });

  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-3", className)}>
        {cards.map((_, i) => (
          <div
            key={i}
            className={cn(
              'rounded-lg border p-3',
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
            )}
          >
            <div className="animate-pulse space-y-2">
              <div className={cn('h-3 w-16 rounded', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
              <div className={cn('h-6 w-24 rounded', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-3", className)}>
      {cards.map((card) => (
        <div
          key={card.label}
          className={cn(
            'rounded-lg border p-3',
            isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
          )}
        >
          <p
            className={cn(
              'text-[10px] font-medium uppercase tracking-wide mb-1',
              isDark ? 'text-slate-400' : 'text-slate-500'
            )}
          >
            {card.label}
          </p>
          <p className={cn('text-lg font-bold tabular-nums', card.color)}>
            {formatCurrency(card.value, currency, false)}
          </p>
          <p className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
            {currency}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ExposureSummaryCards;
