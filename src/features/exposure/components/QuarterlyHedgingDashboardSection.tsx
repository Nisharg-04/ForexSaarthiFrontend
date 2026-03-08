// ═══════════════════════════════════════════════════════════════════════════════
// QUARTERLY HEDGING DASHBOARD SECTION
// Enhanced metrics for quarterly hedging insights
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  RefreshCcw,
  FileText,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  ArrowRight,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../../../utils/helpers';
import { useAppSelector } from '../../../hooks/useRedux';
import { useGetHedgesByQuarterQuery } from '../api/hedgingApi';
import { useGetExposureDashboardQuery } from '../api/exposureApi';
import {
  getCurrentQuarter,
  getUpcomingQuarters,
  getQuarterLabel,
  formatHedgeAmount,
  formatPercentage,
  getRiskLevelFromHedgeRatio,
  getRiskLevelClasses,
} from '../hedgingUtils';
import { HEDGING_CHART_COLORS } from '../hedgingConstants';

// ─────────────────────────────────────────────────────────────────────────────────
// PROPS INTERFACE
// ─────────────────────────────────────────────────────────────────────────────────
interface QuarterlyHedgingDashboardSectionProps {
  isDark?: boolean;
  onApplyNaturalHedge?: (quarter: string, currency: string) => void;
  onBookForward?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────────
// QUARTERLY KPI CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────────
interface QuarterlyKPICardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ElementType;
  colorClass: string;
  format?: 'currency' | 'percent' | 'count';
  currency?: string;
  isDark?: boolean;
}

const QuarterlyKPICard: React.FC<QuarterlyKPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorClass,
  format = 'currency',
  currency = 'USD',
  isDark = false,
}) => {
  const textClass = isDark ? 'text-white' : 'text-slate-900';
  const mutedTextClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const cardBgClass = isDark ? 'bg-slate-800' : 'bg-white';
  const borderClass = isDark ? 'border-slate-700' : 'border-slate-200';

  const formattedValue = useMemo(() => {
    if (format === 'percent') return formatPercentage(value);
    if (format === 'count') return value.toLocaleString();
    return formatHedgeAmount(value, currency);
  }, [value, format, currency]);

  return (
    <div className={cn('rounded-lg border p-4', cardBgClass, borderClass)}>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('p-1.5 rounded-lg', colorClass)}>
          <Icon className="w-4 h-4" />
        </div>
        <span className={cn('text-xs font-medium', mutedTextClass)}>{title}</span>
      </div>
      <p className={cn('text-2xl font-bold tabular-nums', textClass)}>{formattedValue}</p>
      {subtitle && <p className={cn('text-xs mt-1', mutedTextClass)}>{subtitle}</p>}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────────
// CURRENCY HEDGING CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────────
interface CurrencyHedgingCardProps {
  currency: string;
  receivableUnhedged: number;
  payableUnhedged: number;
  naturalHedgePotential: number;
  netExposureAtRisk: number;
  hedgeRatio: number;
  isDark?: boolean;
  onApplyNaturalHedge?: () => void;
  onBookForward?: () => void;
}

const CurrencyHedgingCard: React.FC<CurrencyHedgingCardProps> = ({
  currency,
  receivableUnhedged,
  payableUnhedged,
  naturalHedgePotential,
  netExposureAtRisk,
  hedgeRatio,
  isDark = false,
  onApplyNaturalHedge,
  onBookForward,
}) => {
  const textClass = isDark ? 'text-white' : 'text-slate-900';
  const mutedTextClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const cardBgClass = isDark ? 'bg-slate-800' : 'bg-white';
  const borderClass = isDark ? 'border-slate-700' : 'border-slate-200';

  const riskLevel = getRiskLevelFromHedgeRatio(hedgeRatio);

  return (
    <div className={cn('rounded-lg border overflow-hidden', cardBgClass, borderClass)}>
      {/* Header */}
      <div className={cn('px-4 py-3 border-b flex items-center justify-between', borderClass)}>
        <div className="flex items-center gap-2">
          <span className={cn('text-lg font-bold', textClass)}>{currency}</span>
          <span
            className={cn(
              'px-2 py-0.5 text-xs font-medium rounded',
              getRiskLevelClasses(riskLevel, isDark)
            )}
          >
            {formatPercentage(hedgeRatio)} hedged
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Receivable/Payable Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className={cn('text-xs font-medium mb-1', mutedTextClass)}>Receivable Unhedged</p>
            <p className={cn('text-sm font-semibold', isDark ? 'text-teal-400' : 'text-teal-600')}>
              {formatHedgeAmount(receivableUnhedged, currency)}
            </p>
          </div>
          <div>
            <p className={cn('text-xs font-medium mb-1', mutedTextClass)}>Payable Unhedged</p>
            <p className={cn('text-sm font-semibold', isDark ? 'text-indigo-400' : 'text-indigo-600')}>
              {formatHedgeAmount(payableUnhedged, currency)}
            </p>
          </div>
        </div>

        {/* Natural Hedge Potential */}
        {naturalHedgePotential > 0 && (
          <div className={cn('p-3 rounded-lg border', isDark ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-cyan-50 border-cyan-200')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCcw className={cn('w-4 h-4', isDark ? 'text-cyan-400' : 'text-cyan-600')} />
                <div>
                  <p className={cn('text-xs font-medium', isDark ? 'text-cyan-400' : 'text-cyan-700')}>
                    Natural Hedge Potential
                  </p>
                  <p className={cn('text-sm font-bold', textClass)}>
                    {formatHedgeAmount(naturalHedgePotential, currency)}
                  </p>
                </div>
              </div>
              {onApplyNaturalHedge && (
                <button
                  onClick={onApplyNaturalHedge}
                  className={cn(
                    'px-2 py-1 text-xs font-medium rounded transition-colors',
                    isDark
                      ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                      : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                  )}
                >
                  Apply
                </button>
              )}
            </div>
          </div>
        )}

        {/* Net Exposure at Risk */}
        <div className={cn('p-3 rounded-lg', isDark ? 'bg-slate-700/50' : 'bg-slate-100')}>
          <p className={cn('text-xs font-medium mb-1', mutedTextClass)}>Net Exposure at Risk</p>
          <p className={cn('text-lg font-bold', isDark ? 'text-amber-400' : 'text-amber-600')}>
            {formatHedgeAmount(netExposureAtRisk, currency)}
          </p>
        </div>

        {/* Action Buttons */}
        {onBookForward && netExposureAtRisk > 0 && (
          <button
            onClick={onBookForward}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              isDark
                ? 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
                : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
            )}
          >
            <FileText className="w-4 h-4" />
            Book Forward Contract
          </button>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────────
// QUARTERLY BREAKDOWN CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────────
interface QuarterlyBreakdownCardProps {
  quarter: string;
  totalReceivables: number;
  totalPayables: number;
  hedgedAmount: number;
  unhedgedAmount: number;
  hedgeRatio: number;
  currency?: string;
  isDark?: boolean;
  isCurrentQuarter?: boolean;
}

const QuarterlyBreakdownCard: React.FC<QuarterlyBreakdownCardProps> = ({
  quarter,
  totalReceivables,
  totalPayables,
  hedgedAmount,
  unhedgedAmount,
  hedgeRatio,
  currency = 'INR',
  isDark = false,
  isCurrentQuarter = false,
}) => {
  const textClass = isDark ? 'text-white' : 'text-slate-900';
  const mutedTextClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const borderClass = isDark ? 'border-slate-700' : 'border-slate-200';
  const riskLevel = getRiskLevelFromHedgeRatio(hedgeRatio);

  return (
    <div
      className={cn(
        'p-4 rounded-lg border transition-all',
        isDark ? 'bg-slate-800' : 'bg-white',
        borderClass,
        isCurrentQuarter && (isDark ? 'ring-2 ring-blue-500/50' : 'ring-2 ring-blue-200')
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className={cn('w-4 h-4', isDark ? 'text-blue-400' : 'text-blue-600')} />
          <span className={cn('font-semibold', textClass)}>{quarter}</span>
          {isCurrentQuarter && (
            <span className={cn('px-1.5 py-0.5 text-xs rounded', isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700')}>
              Current
            </span>
          )}
        </div>
        <span className={cn('px-2 py-0.5 text-xs font-medium rounded', getRiskLevelClasses(riskLevel, isDark))}>
          {formatPercentage(hedgeRatio)}
        </span>
      </div>

      {/* Mini breakdown */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className={mutedTextClass}>Receivables:</span>
          <span className={cn('ml-1 font-medium', isDark ? 'text-teal-400' : 'text-teal-600')}>
            {formatHedgeAmount(totalReceivables, currency)}
          </span>
        </div>
        <div>
          <span className={mutedTextClass}>Payables:</span>
          <span className={cn('ml-1 font-medium', isDark ? 'text-indigo-400' : 'text-indigo-600')}>
            {formatHedgeAmount(totalPayables, currency)}
          </span>
        </div>
        <div>
          <span className={mutedTextClass}>Hedged:</span>
          <span className={cn('ml-1 font-medium', isDark ? 'text-emerald-400' : 'text-emerald-600')}>
            {formatHedgeAmount(hedgedAmount, currency)}
          </span>
        </div>
        <div>
          <span className={mutedTextClass}>At Risk:</span>
          <span className={cn('ml-1 font-medium', isDark ? 'text-amber-400' : 'text-amber-600')}>
            {formatHedgeAmount(unhedgedAmount, currency)}
          </span>
        </div>
      </div>

      {/* Hedge progress bar */}
      <div className="mt-3">
        <div className={cn('h-1.5 rounded-full overflow-hidden', isDark ? 'bg-slate-700' : 'bg-slate-200')}>
          <div
            className={cn(
              'h-full rounded-full transition-all',
              riskLevel === 'low' ? 'bg-emerald-500' : riskLevel === 'medium' ? 'bg-amber-500' : 'bg-red-500'
            )}
            style={{ width: `${Math.min(100, hedgeRatio)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────────
export const QuarterlyHedgingDashboardSection: React.FC<QuarterlyHedgingDashboardSectionProps> = ({
  isDark: propIsDark,
  onApplyNaturalHedge,
  onBookForward,
}) => {
  const theme = useAppSelector((state) => state.ui?.theme);
  const isDark = propIsDark ?? theme === 'dark';

  const currentQuarter = getCurrentQuarter();
  const upcomingQuarters = useMemo(() => getUpcomingQuarters(4), []);

  // Fetch current quarter hedges
  const { data: hedgesData, isLoading: isHedgesLoading } = useGetHedgesByQuarterQuery(currentQuarter);

  // Fetch dashboard data for currency breakdown
  const { data: dashboardData } = useGetExposureDashboardQuery();

  // Theme classes
  const textClass = isDark ? 'text-white' : 'text-slate-900';
  const mutedTextClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const cardBgClass = isDark ? 'bg-slate-800' : 'bg-white';
  const borderClass = isDark ? 'border-slate-700' : 'border-slate-200';

  // Calculate metrics from hedges data
  const hedgeMetrics = useMemo(() => {
    const hedges = hedgesData?.data || [];
    const naturalHedges = hedges.filter((h) => h.type === 'NATURAL');
    const forwardContracts = hedges.filter((h) => h.type === 'FORWARD');
    const activeHedges = hedges.filter((h) => h.status === 'ACTIVE');

    const totalNaturalAmount = naturalHedges.reduce((sum, h) => sum + h.hedgeAmount, 0);
    const totalForwardAmount = forwardContracts.reduce((sum, h) => sum + h.hedgeAmount, 0);
    const totalHedgedAmount = totalNaturalAmount + totalForwardAmount;

    return {
      totalHedges: hedges.length,
      naturalHedges: naturalHedges.length,
      forwardContracts: forwardContracts.length,
      activeHedges: activeHedges.length,
      totalNaturalAmount,
      totalForwardAmount,
      totalHedgedAmount,
    };
  }, [hedgesData]);

  // Currency exposure breakdown from dashboard data
  // REQUIRES: API to include receivableUnhedgedAmount & payableUnhedgedAmount per currency
  interface SimpleCurrencyBreakdown {
    currency: string;
    receivableUnhedged: number;
    payableUnhedged: number;
    naturalHedgePotential: number;
    netExposureAtRisk: number;
    hedgeRatio: number;
  }

  const currencyBreakdowns: SimpleCurrencyBreakdown[] = useMemo(() => {
    const byCurrency = dashboardData?.data?.byCurrency || [];
    
    // Check if API provides receivable/payable breakdown per currency
    // If not, return empty array (don't show fake data)
    const hasRecPayData = byCurrency.some((curr: any) => 
      curr.receivableUnhedgedAmount !== undefined || curr.payableUnhedgedAmount !== undefined
    );
    
    if (!hasRecPayData) {
      return []; // API doesn't have receivable/payable per currency yet
    }
    
    return byCurrency.map((curr: any) => {
      const receivableUnhedged = curr.receivableUnhedgedAmount || 0;
      const payableUnhedged = curr.payableUnhedgedAmount || 0;
      return {
        currency: curr.currency,
        receivableUnhedged,
        payableUnhedged,
        naturalHedgePotential: Math.min(receivableUnhedged, payableUnhedged),
        netExposureAtRisk: Math.abs(receivableUnhedged - payableUnhedged),
        hedgeRatio: curr.hedgePercentage || 0,
      };
    });
  }, [dashboardData]);

  // Quarterly breakdown from API (byQuarter field if available)
  // This field may not exist in the current API - will gracefully fallback to empty
  const quarterlyBreakdowns = useMemo(() => {
    // Safely access byQuarter - it may not exist in current API response
    const byQuarter = (dashboardData?.data as any)?.byQuarter;
    if (!byQuarter || !Array.isArray(byQuarter) || byQuarter.length === 0) {
      return []; // Return empty array if no real data
    }
    
    // Group by quarter and aggregate
    const quarterMap = new Map<string, {
      quarter: string;
      totalReceivables: number;
      totalPayables: number;
      hedgedAmount: number;
      unhedgedAmount: number;
      hedgeRatio: number;
    }>();
    
    byQuarter.forEach((item: any) => {
      const existing = quarterMap.get(item.quarter);
      if (existing) {
        existing.totalReceivables += item.receivableAmount || 0;
        existing.totalPayables += item.payableAmount || 0;
        existing.unhedgedAmount += item.netExposureAtRisk || 0;
      } else {
        quarterMap.set(item.quarter, {
          quarter: item.quarter,
          totalReceivables: item.receivableAmount || 0,
          totalPayables: item.payableAmount || 0,
          hedgedAmount: 0, // Will need to calculate from hedges
          unhedgedAmount: item.netExposureAtRisk || 0,
          hedgeRatio: 0, // Will calculate below
        });
      }
    });
    
    // Calculate hedge ratio for each quarter
    return Array.from(quarterMap.values()).map(q => {
      const totalExposure = q.totalReceivables + q.totalPayables;
      const hedgeRatio = totalExposure > 0 ? ((totalExposure - q.unhedgedAmount) / totalExposure) * 100 : 0;
      return {
        ...q,
        hedgedAmount: totalExposure - q.unhedgedAmount,
        hedgeRatio: Math.min(100, Math.max(0, hedgeRatio)),
      };
    }).sort((a, b) => a.quarter.localeCompare(b.quarter));
  }, [dashboardData]);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', isDark ? 'bg-violet-500/20' : 'bg-violet-100')}>
            <Shield className={cn('w-5 h-5', isDark ? 'text-violet-400' : 'text-violet-600')} />
          </div>
          <div>
            <h2 className={cn('text-lg font-semibold', textClass)}>Quarterly Hedging Overview</h2>
            <p className={cn('text-sm', mutedTextClass)}>
              {getQuarterLabel(currentQuarter)} hedging status and insights
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/exposures/hedges"
            className={cn(
              'inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            )}
          >
            View All Hedges
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Hedging KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuarterlyKPICard
          title="Natural Hedges"
          value={hedgeMetrics.naturalHedges}
          subtitle={`${formatHedgeAmount(hedgeMetrics.totalNaturalAmount, 'INR')} covered`}
          icon={RefreshCcw}
          colorClass={isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-600'}
          format="count"
          isDark={isDark}
        />
        <QuarterlyKPICard
          title="Forward Contracts"
          value={hedgeMetrics.forwardContracts}
          subtitle={`${formatHedgeAmount(hedgeMetrics.totalForwardAmount, 'INR')} covered`}
          icon={FileText}
          colorClass={isDark ? 'bg-violet-500/20 text-violet-400' : 'bg-violet-100 text-violet-600'}
          format="count"
          isDark={isDark}
        />
        <QuarterlyKPICard
          title="Total Hedged"
          value={hedgeMetrics.totalHedgedAmount}
          subtitle={`${hedgeMetrics.activeHedges} active hedges`}
          icon={Shield}
          colorClass={isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}
          format="currency"
          currency="INR"
          isDark={isDark}
        />
        <QuarterlyKPICard
          title="Active Hedges"
          value={hedgeMetrics.activeHedges}
          subtitle={`of ${hedgeMetrics.totalHedges} total`}
          icon={TrendingUp}
          colorClass={isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}
          format="count"
          isDark={isDark}
        />
      </div>

      {/* Currency Breakdown Cards */}
      <div>
        <h3 className={cn('text-sm font-semibold mb-3', textClass)}>Currency Hedging Status</h3>
        {currencyBreakdowns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currencyBreakdowns.slice(0, 6).map((curr) => (
              <CurrencyHedgingCard
                key={curr.currency}
                currency={curr.currency}
                receivableUnhedged={curr.receivableUnhedged}
                payableUnhedged={curr.payableUnhedged}
                naturalHedgePotential={curr.naturalHedgePotential}
                netExposureAtRisk={curr.netExposureAtRisk}
                hedgeRatio={curr.hedgeRatio}
                isDark={isDark}
                onApplyNaturalHedge={
                  onApplyNaturalHedge && curr.naturalHedgePotential > 0
                    ? () => onApplyNaturalHedge(currentQuarter, curr.currency)
                    : undefined
                }
                onBookForward={onBookForward}
              />
            ))}
          </div>
        ) : (
          <div className={cn(
            'p-6 rounded-lg border text-center',
            isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
          )}>
            <RefreshCcw className={cn('w-8 h-8 mx-auto mb-2 opacity-50', mutedTextClass)} />
            <p className={cn('text-sm font-medium', mutedTextClass)}>
              Currency hedging breakdown not available
            </p>
            <p className={cn('text-xs mt-1', mutedTextClass)}>
              API needs receivableUnhedgedAmount & payableUnhedgedAmount per currency
            </p>
          </div>
        )}
      </div>

      {/* Quarterly Breakdown Timeline */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className={cn('text-sm font-semibold', textClass)}>Quarterly Breakdown</h3>
          <Link
            to="/dashboard/exposures/quarterly-report"
            className={cn(
              'text-xs font-medium inline-flex items-center gap-1 hover:underline',
              isDark ? 'text-blue-400' : 'text-blue-600'
            )}
          >
            View Full Report
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {quarterlyBreakdowns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quarterlyBreakdowns.map((qb, idx) => (
              <QuarterlyBreakdownCard
                key={qb.quarter}
                quarter={qb.quarter}
                totalReceivables={qb.totalReceivables}
                totalPayables={qb.totalPayables}
                hedgedAmount={qb.hedgedAmount}
                unhedgedAmount={qb.unhedgedAmount}
                hedgeRatio={qb.hedgeRatio}
                isDark={isDark}
                isCurrentQuarter={idx === 0}
              />
            ))}
          </div>
        ) : (
          <div className={cn(
            'p-6 rounded-lg border text-center',
            isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
          )}>
            <Calendar className={cn('w-8 h-8 mx-auto mb-2 opacity-50', mutedTextClass)} />
            <p className={cn('text-sm font-medium', mutedTextClass)}>
              No quarterly breakdown data available
            </p>
            <p className={cn('text-xs mt-1', mutedTextClass)}>
              Quarterly data will appear once exposures have maturity dates assigned
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className={cn('rounded-lg border p-4', cardBgClass, borderClass)}>
        <h3 className={cn('text-sm font-semibold mb-3', textClass)}>Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {onApplyNaturalHedge && (
            <button
              onClick={() => onApplyNaturalHedge(currentQuarter, 'USD')}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                isDark
                  ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                  : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
              )}
            >
              <RefreshCcw className="w-4 h-4" />
              Apply Quarterly Natural Hedge
            </button>
          )}
          {onBookForward && (
            <button
              onClick={onBookForward}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                isDark
                  ? 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
                  : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
              )}
            >
              <FileText className="w-4 h-4" />
              Book Forward Contract
            </button>
          )}
          <Link
            to="/dashboard/exposures/quarterly-report"
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isDark
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            )}
          >
            <Calendar className="w-4 h-4" />
            View Quarterly Report
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuarterlyHedgingDashboardSection;
