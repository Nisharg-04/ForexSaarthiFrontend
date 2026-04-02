// ═══════════════════════════════════════════════════════════════════════════════
// EXPOSURE DASHBOARD PAGE - RISK BASED (UNHEDGED DRIVEN)
// Route: /dashboard/exposures - Treasury Risk Dashboard
// ForexSaarthi - Professional Treasury & Risk Management
//
// ⚠️ CRITICAL: This is a RISK DASHBOARD, not an accounting view
// All charts and totals are based on UnhedgedAmount, NOT ExposedAmount
//
// Business Rule Reminder:
// ExposedAmount = HedgedAmount + SettledAmount + UnhedgedAmount
// RISK = UnhedgedAmount (what we display)
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  AlertTriangle,
  Calendar,
  ArrowRight,
  RefreshCw,
  Download,
  Filter,
  Shield,
  DollarSign,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  Table2,
} from 'lucide-react';

import { useAppSelector } from '../../../hooks/useRedux';
import { useGetExposureDashboardQuery } from '../api/exposureApi';
import { ExposureTable } from '../components/ExposureTable';
import { RiskKPICard } from '../components/RiskKPICard';
import { CircularHedgeCoverage } from '../components/CircularHedgeCoverage';
import { CurrencyBreakdownTable } from '../components/CurrencyBreakdownTable';
import { ExposureByCurrencyChart } from '../charts/ExposureByCurrencyChart';
import { RiskByTypeChart } from '../charts/RiskByTypeChart';
import { ForwardHedgeModal } from '../modals/ForwardHedgeModal';
import { NaturalHedgeModal } from '../modals/NaturalHedgeModal';
import { CloseHedgeModal } from '../modals/CloseHedgeModal';
import { QuarterlyHedgingDashboardSection } from '../components/QuarterlyHedgingDashboardSection';
import { QuarterlyNaturalHedgeModal } from '../modals/QuarterlyNaturalHedgeModal';
import { useExposurePermissions } from '../hooks/useExposurePermissions';
import type { Exposure, ExposureListItem, ExposureByCurrency, ExposureByType } from '../types';
import { formatCurrency } from '../exposureUtils';
import { cn } from '../../../utils/helpers';

// Auto-refresh interval (5 minutes)
const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000;

interface ExposureDashboardProps {
  isDark?: boolean;
}

// Helper to convert ExposureListItem to Exposure-like object for table
const mapListItemToExposure = (item: ExposureListItem): Exposure => ({
  id: item.id,
  companyId: '',
  invoiceId: item.invoiceId,
  tradeId: item.tradeId,
  partyId: '',
  invoiceNumber: item.invoiceNumber,
  tradeNumber: item.tradeNumber,
  partyName: item.partyName,
  exposureType: item.type as any,
  type: item.type as any,
  currency: item.currency,
  exposureDate: item.createdAt,
  invoiceDate: item.createdAt,
  maturityDate: item.maturityDate,
  exposedAmount: item.exposedAmount,
  originalAmount: item.exposedAmount,
  hedgedAmount: item.hedgedAmount,
  settledAmount: item.settledAmount,
  unhedgedAmount: item.unhedgedAmount,
  inrValue: item.exposedAmount,
  hedgedAmountINR: item.hedgedAmount,
  unhedgedAmountINR: item.unhedgedAmount,
  bookingRate: 1,
  hedgePercentage: item.hedgePercentage,
  settlementPercentage: item.settledAmount / item.exposedAmount * 100,
  daysToMaturity: item.daysToMaturity,
  status: item.hedgeStatus as any,
  hedges: [],
  createdAt: item.createdAt,
  updatedAt: item.createdAt,
});

/**
 * Filter exposures for risk view - exclude settled items
 * Only show exposures with unhedgedAmount > 0
 */
const filterForRiskView = (items: ExposureListItem[]): ExposureListItem[] => {
  return items.filter(item => !item.isSettled && item.unhedgedAmount > 0);
};

export const ExposureDashboard: React.FC<ExposureDashboardProps> = ({ isDark: propIsDark }) => {
  const navigate = useNavigate();
  const theme = useAppSelector((state) => state.ui?.theme);
  const isDark = propIsDark ?? theme === 'dark';
  
  const permissions = useExposurePermissions();
  
  // Modal state
  const [forwardHedgeModal, setForwardHedgeModal] = useState<{ open: boolean; exposure?: Exposure }>({
    open: false,
  });
  const [naturalHedgeModal, setNaturalHedgeModal] = useState<{ open: boolean; exposure?: Exposure }>({
    open: false,
  });
  const [closeHedgeModal, setCloseHedgeModal] = useState<{ open: boolean; exposure?: Exposure }>({
    open: false,
  });
  
  // Quarterly hedging modals
  const [quarterlyNaturalHedgeModal, setQuarterlyNaturalHedgeModal] = useState<{ open: boolean; quarter?: string; currency?: string }>({
    open: false,
  });
  
  // Toggle for showing settled exposures (default: hide)
  const [showSettled, setShowSettled] = useState(false);

  // Fetch dashboard data with auto-refresh
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isFetching: isDashboardFetching,
    refetch: refetchDashboard,
  } = useGetExposureDashboardQuery(undefined, {
    pollingInterval: AUTO_REFRESH_INTERVAL,
    refetchOnMountOrArgChange: true,
  });

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    refetchDashboard();
  }, [refetchDashboard]);

  // Transform API data for RISK-BASED charts
  // ⚠️ CRITICAL: Use totalUnhedgedAmount for all risk views, NOT totalExposedAmount
  const { byCurrencyData, receivableRisk, payableRisk, totals, calculatedUnhedgedValue, maturingSoon, overdue } = useMemo(() => {
    const apiData = dashboardData?.data;
    
    // Currency breakdown for table (keeps all fields)
    const byCurrencyData: ExposureByCurrency[] = apiData?.byCurrency || [];
    
    // ⚠️ Calculate totalUnhedgedValueInBaseCurrency from byCurrency if backend returns 0
    // Formula: SUM(totalUnhedgedAmount × currentRate) for each currency
    const calculatedUnhedgedValue = byCurrencyData.reduce((sum, curr) => {
      const rate = curr.currentRate || 1; // Default to 1 if no rate
      return sum + (curr.totalUnhedgedAmount * rate);
    }, 0);
    
    // ⚠️ CRITICAL: Extract UNHEDGED amounts by type for risk chart
    const byTypeData: ExposureByType[] = apiData?.byType || [];
    const receivableType = byTypeData.find(t => t.type.toUpperCase() === 'RECEIVABLE');
    const payableType = byTypeData.find(t => t.type.toUpperCase() === 'PAYABLE');
    
    const receivableRisk = {
      unhedged: receivableType?.totalUnhedgedAmount || 0,
      count: receivableType?.count || 0,
    };
    const payableRisk = {
      unhedged: payableType?.totalUnhedgedAmount || 0,
      count: payableType?.count || 0,
    };
    
    // Filter maturing soon - ONLY show items with unhedged risk
    const maturingSoonRaw = apiData?.maturingSoon || [];
    const maturingSoonFiltered = showSettled ? maturingSoonRaw : filterForRiskView(maturingSoonRaw);
    
    // Filter overdue - ONLY show items with unhedged risk
    const overdueRaw = apiData?.overdue || [];
    const overdueFiltered = showSettled ? overdueRaw : filterForRiskView(overdueRaw);
    
    return {
      byCurrencyData,
      receivableRisk,
      payableRisk,
      totals: apiData?.totals,
      calculatedUnhedgedValue,
      maturingSoon: maturingSoonFiltered.map(mapListItemToExposure),
      overdue: overdueFiltered.map(mapListItemToExposure),
    };
 
  }, [dashboardData, showSettled]);
  
  // Debug logging for Risk Summary
  console.log('=== RISK SUMMARY DEBUG ===');
  console.log('Dashboard Generated At:', dashboardData?.data?.generatedAt);
  console.log('Full Dashboard Data:', dashboardData?.data);
  console.log('byType from API:', dashboardData?.data?.byType);
  console.log('Receivable Risk (unhedged amount in FCY):', receivableRisk);
  console.log('Payable Risk (unhedged amount in FCY):', payableRisk);
  console.log('Net Unhedged Position displayed:', receivableRisk.unhedged - payableRisk.unhedged);
  console.log('WARNING: Net Unhedged Position is calculated from raw FCY amounts across multiple currencies!');
  console.log('byCurrency data:', dashboardData?.data?.byCurrency);
  console.log('==========================');

  // Action handlers
  const handleApplyForwardHedge = (exposure: Exposure) => {
    setForwardHedgeModal({ open: true, exposure });
  };

  const handleApplyNaturalHedge = (exposure: Exposure) => {
    setNaturalHedgeModal({ open: true, exposure });
  };

  const handleCloseHedge = (exposure: Exposure) => {
    setCloseHedgeModal({ open: true, exposure });
  };

  const handleExportDashboard = useCallback(() => {
    if (!dashboardData?.data) return;

    const escapeCsv = (value: string | number | undefined | null) => {
      const text = value == null ? '' : String(value);
      if (/[",\n]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };

    const rows: Array<Array<string | number | undefined | null>> = [];

    rows.push(['Exposure Dashboard Export']);
    rows.push(['Generated At', dashboardData.data.generatedAt || new Date().toISOString()]);
    rows.push([]);

    rows.push(['Summary']);
    rows.push(['Metric', 'Value']);
    rows.push(['Total Active Exposures', totals?.totalCount || 0]);
    rows.push(['Fully Hedged Count', totals?.fullyHedgedCount || 0]);
    rows.push(['Partially Hedged Count', totals?.partiallyHedgedCount || 0]);
    rows.push(['Unhedged Count', totals?.unhedgedCount || 0]);
    rows.push(['Settled Count', totals?.settledCount || 0]);
    rows.push(['Overall Hedge Percentage', totals?.overallHedgePercentage || 0]);
    rows.push(['Total Open FX Risk (Base)', totals?.totalUnhedgedValueInBaseCurrency || calculatedUnhedgedValue || 0]);
    rows.push([]);

    rows.push(['Currency Breakdown']);
    rows.push([
      'Currency',
      'Count',
      'Total Exposed Amount',
      'Total Hedged Amount',
      'Total Unhedged Amount',
      'Current Rate',
      'Value In Base Currency',
      'Net Position',
      'Hedge Percentage',
    ]);
    byCurrencyData.forEach((currency) => {
      rows.push([
        currency.currency,
        currency.count,
        currency.totalExposedAmount,
        currency.totalHedgedAmount,
        currency.totalUnhedgedAmount,
        currency.currentRate,
        currency.valueInBaseCurrency,
        currency.netPosition,
        currency.hedgePercentage,
      ]);
    });
    rows.push([]);

    rows.push(['Maturing Soon (Current View)']);
    rows.push(['Invoice', 'Trade', 'Party', 'Currency', 'Unhedged Amount', 'Days To Maturity', 'Status']);
    maturingSoon.forEach((item) => {
      rows.push([
        item.invoiceNumber,
        item.tradeNumber,
        item.partyName,
        item.currency,
        item.unhedgedAmount,
        item.daysToMaturity,
        item.status,
      ]);
    });
    rows.push([]);

    rows.push(['Overdue (Current View)']);
    rows.push(['Invoice', 'Trade', 'Party', 'Currency', 'Unhedged Amount', 'Days To Maturity', 'Status']);
    overdue.forEach((item) => {
      rows.push([
        item.invoiceNumber,
        item.tradeNumber,
        item.partyName,
        item.currency,
        item.unhedgedAmount,
        item.daysToMaturity,
        item.status,
      ]);
    });

    const csv = rows.map((row) => row.map((cell) => escapeCsv(cell)).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `exposure-dashboard-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [dashboardData, totals, calculatedUnhedgedValue, byCurrencyData, maturingSoon, overdue]);

  // Theme classes (Dark Navy + Emerald Green theme)
  const bgClass = isDark ? 'bg-slate-900' : 'bg-slate-50';
  const cardBgClass = isDark ? 'bg-slate-800' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-slate-900';
  const textMutedClass = isDark ? 'text-slate-400' : 'text-slate-600';
  const borderClass = isDark ? 'border-slate-700' : 'border-slate-200';

  // Loading state
  if (isDashboardLoading) {
    return (
      <div className={`min-h-screen ${bgClass} p-6`}>
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className={`h-8 w-64 ${isDark ? 'bg-slate-700' : 'bg-slate-200'} rounded animate-pulse`} />
            <div className="flex gap-2">
              <div className={`h-9 w-24 ${isDark ? 'bg-slate-700' : 'bg-slate-200'} rounded animate-pulse`} />
            </div>
          </div>
          
          {/* KPI Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`${cardBgClass} rounded-xl p-5 border ${borderClass} animate-pulse`}>
                <div className={`h-4 w-28 ${isDark ? 'bg-slate-700' : 'bg-slate-200'} rounded mb-3`} />
                <div className={`h-8 w-36 ${isDark ? 'bg-slate-700' : 'bg-slate-200'} rounded`} />
              </div>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`${cardBgClass} rounded-xl p-5 border ${borderClass} h-80 animate-pulse`}>
                <div className={`h-5 w-40 ${isDark ? 'bg-slate-700' : 'bg-slate-200'} rounded mb-4`} />
                <div className={`h-56 ${isDark ? 'bg-slate-700' : 'bg-slate-200'} rounded`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} p-4 md:p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={cn('text-2xl font-bold', textClass)}>Treasury Risk Dashboard</h1>
            <p className={cn('text-sm mt-1', textMutedClass)}>
              Real-time FX exposure risk monitoring • Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isDashboardFetching}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
                'transition-all border',
                borderClass,
                isDark 
                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' 
                  : 'bg-white text-slate-700 hover:bg-slate-50',
                'disabled:opacity-50'
              )}
            >
              <RefreshCw className={cn('h-4 w-4', isDashboardFetching && 'animate-spin')} />
              {isDashboardFetching ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={handleExportDashboard}
              disabled={!dashboardData?.data}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
                'transition-all border',
                borderClass,
                isDark 
                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' 
                  : 'bg-white text-slate-700 hover:bg-slate-50',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-inherit'
              )}
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <Link
              to="/dashboard/exposures/list"
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
                'transition-all',
                'bg-blue-600 text-white hover:bg-blue-700'
              )}
            >
              <Filter className="h-4 w-4" />
              All Exposures
            </Link>
          </div>
        </div>

        {/* ROW 1: TOP KPI CARDS - Risk Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Primary KPI: Total Open FX Risk */}
          <RiskKPICard
            title="Total Open FX Risk"
            value={totals?.totalUnhedgedValueInBaseCurrency || calculatedUnhedgedValue || 0}
            subtitle="Unhedged exposure in base currency"
            icon={AlertTriangle}
            variant="danger"
            format="currency"
            currency="INR"
            isDark={isDark}
            size="md"
          />
          
          {/* Hedge Coverage - Circular Indicator */}
          <div className={cn(
            'rounded-xl border p-4 flex flex-col items-center justify-center',
            cardBgClass,
            borderClass
          )}>
            <CircularHedgeCoverage
              percentage={totals?.overallHedgePercentage || 0}
              size="md"
              showLabel={true}
              label="Hedge Coverage"
              isDark={isDark}
            />
          </div>
          
          {/* Fully Hedged Count */}
          <RiskKPICard
            title="Fully Hedged"
            value={totals?.fullyHedgedCount || 0}
            subtitle="100% coverage"
            icon={CheckCircle2}
            variant="success"
            format="count"
            isDark={isDark}
            size="md"
          />
          
          {/* Unhedged Count */}
          <RiskKPICard
            title="Unhedged"
            value={totals?.unhedgedCount || 0}
            subtitle="At full risk"
            icon={XCircle}
            variant="danger"
            format="count"
            isDark={isDark}
            size="md"
          />
        </div>

        {/* ROW 2: CHARTS - Risk Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Receivables vs Payables Risk - UNHEDGED amounts */}
          <div className={cn('rounded-xl border p-5', cardBgClass, borderClass)}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className={cn('h-5 w-5', isDark ? 'text-purple-400' : 'text-purple-600')} />
                <h2 className={cn('font-semibold', textClass)}>Open Risk by Type</h2>
              </div>
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-700'
              )}>
                Unhedged Only
              </span>
            </div>
            <RiskByTypeChart
              receivableUnhedged={receivableRisk.unhedged}
              payableUnhedged={payableRisk.unhedged}
              receivableCount={receivableRisk.count}
              payableCount={payableRisk.count}
              isDark={isDark}
              height={300}
              showRiskIndicators={true}
            />
          </div>

          {/* Currency Exposure Chart */}
          <div className={cn('rounded-xl border p-5', cardBgClass, borderClass)}>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className={cn('h-5 w-5', isDark ? 'text-blue-400' : 'text-blue-600')} />
              <h2 className={cn('font-semibold', textClass)}>Exposure by Currency</h2>
            </div>
            <ExposureByCurrencyChart
              data={byCurrencyData}
              isDark={isDark}
              height={260}
            />
          </div>

          {/* Risk Summary Panel */}
          <div className={cn('rounded-xl border p-5', cardBgClass, borderClass)}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className={cn('h-5 w-5', isDark ? 'text-teal-400' : 'text-teal-600')} />
              <h2 className={cn('font-semibold', textClass)}>Risk Summary</h2>
            </div>
            
            <div className="space-y-4">
              {/* Net Unhedged Position */}
              <div className={cn(
                'p-4 rounded-lg border',
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
              )}>
                <p className={cn('text-xs font-medium mb-1', textMutedClass)}>Net Unhedged Position</p>
                <p className={cn('text-xl font-bold tabular-nums', textClass)}>
                  {formatCurrency(receivableRisk.unhedged - payableRisk.unhedged, 'INR')}
                </p>
                <p className={cn('text-xs mt-1', textMutedClass)}>Receivable Risk - Payable Risk</p>
              </div>
              
              {/* Total Exposures */}
              <div className={cn(
                'p-4 rounded-lg border',
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
              )}>
                <p className={cn('text-xs font-medium mb-1', textMutedClass)}>Total Active Exposures</p>
                <p className={cn('text-xl font-bold', textClass)}>{totals?.totalCount || 0}</p>
                <div className="flex gap-3 mt-2 text-xs">
                  <span className={isDark ? 'text-amber-400' : 'text-amber-600'}>
                    {totals?.partiallyHedgedCount || 0} partial
                  </span>
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                    {totals?.settledCount || 0} settled
                  </span>
                </div>
              </div>
              
              {/* Risk Alert */}
              {(totals?.unhedgedCount || 0) > 0 && (
                <div className={cn(
                  'p-4 rounded-lg border',
                  isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'
                )}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={cn(
                      'h-4 w-4 mt-0.5 flex-shrink-0',
                      isDark ? 'text-red-400' : 'text-red-600'
                    )} />
                    <div>
                      <p className={cn('text-sm font-medium', isDark ? 'text-red-400' : 'text-red-700')}>
                        {totals?.unhedgedCount} exposures at risk
                      </p>
                      <p className={cn('text-xs mt-0.5', isDark ? 'text-red-400/70' : 'text-red-600')}>
                        Consider applying hedges to reduce FX exposure
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ROW 3: CURRENCY BREAKDOWN TABLE */}
        <div className={cn('rounded-xl border p-5', cardBgClass, borderClass)}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Table2 className={cn('h-5 w-5', isDark ? 'text-indigo-400' : 'text-indigo-600')} />
              <h2 className={cn('font-semibold', textClass)}>Currency Breakdown</h2>
            </div>
            <span className={cn('text-xs', textMutedClass)}>Sorted by unhedged risk (highest first)</span>
          </div>
          <CurrencyBreakdownTable
            data={byCurrencyData}
            isDark={isDark}
            showNetPosition={true}
          />
        </div>

        {/* ROW 3.5: QUARTERLY HEDGING SECTION */}
        <div className={cn('rounded-xl border p-5', cardBgClass, borderClass)}>
          <QuarterlyHedgingDashboardSection
            isDark={isDark}
            onApplyNaturalHedge={(quarter, currency) => setQuarterlyNaturalHedgeModal({ open: true, quarter, currency })}
            onBookForward={() => navigate('/dashboard/exposures/hedges')}
          />
        </div>

        {/* ROW 4: MATURING SOON & OVERDUE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Maturing Soon - Only UNHEDGED */}
          <div className={cn('rounded-xl border', cardBgClass, borderClass)}>
            <div className={cn('flex items-center justify-between p-4 border-b', borderClass)}>
              <div className="flex items-center gap-2">
                <Clock className={cn('h-5 w-5', isDark ? 'text-amber-400' : 'text-amber-600')} />
                <h2 className={cn('font-semibold', textClass)}>Maturing Soon</h2>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700'
                )}>
                  Next 30 days
                </span>
              </div>
              <div className="flex items-center gap-3">
                <label className={cn('flex items-center gap-1.5 text-xs cursor-pointer', textMutedClass)}>
                  <input
                    type="checkbox"
                    checked={showSettled}
                    onChange={(e) => setShowSettled(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Show settled
                </label>
                <Link
                  to="/dashboard/exposures/list?maturityDays=30"
                  className={cn('text-xs hover:underline inline-flex items-center gap-1', isDark ? 'text-blue-400' : 'text-blue-600')}
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
            <div className="p-4">
              {maturingSoon.length === 0 ? (
                <div className={cn('text-center py-8', textMutedClass)}>
                  <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">No unhedged exposures maturing soon</p>
                  <p className="text-sm mt-1">All near-term exposures are hedged or settled</p>
                </div>
              ) : (
                <ExposureTable
                  exposures={maturingSoon}
                  isDark={isDark}
                  compact
                  onApplyForwardHedge={permissions.canHedge ? handleApplyForwardHedge : undefined}
                  onApplyNaturalHedge={permissions.canHedge ? handleApplyNaturalHedge : undefined}
                />
              )}
            </div>
          </div>

          {/* Overdue Exposures - Only UNHEDGED */}
          <div className={cn('rounded-xl border', cardBgClass, borderClass)}>
            <div className={cn('flex items-center justify-between p-4 border-b', borderClass)}>
              <div className="flex items-center gap-2">
                <AlertTriangle className={cn('h-5 w-5', isDark ? 'text-red-400' : 'text-red-600')} />
                <h2 className={cn('font-semibold', textClass)}>Overdue Exposures</h2>
                {overdue.length > 0 && (
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-700'
                  )}>
                    {overdue.length} at risk
                  </span>
                )}
              </div>
              <Link
                to="/dashboard/exposures/list?status=OVERDUE"
                className={cn('text-xs hover:underline inline-flex items-center gap-1', isDark ? 'text-blue-400' : 'text-blue-600')}
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="p-4">
              {overdue.length === 0 ? (
                <div className={cn('text-center py-8', textMutedClass)}>
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50 text-emerald-500" />
                  <p className="font-medium">No overdue unhedged exposures</p>
                  <p className="text-sm mt-1">All overdue items are hedged or settled</p>
                </div>
              ) : (
                <ExposureTable
                  exposures={overdue}
                  isDark={isDark}
                  compact
                  onApplyForwardHedge={permissions.canHedge ? handleApplyForwardHedge : undefined}
                  onCloseHedge={permissions.canCloseHedge ? handleCloseHedge : undefined}
                />
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        {forwardHedgeModal.exposure && (
          <ForwardHedgeModal
            isOpen={forwardHedgeModal.open}
            onClose={() => setForwardHedgeModal({ open: false })}
            exposure={forwardHedgeModal.exposure}
            isDark={isDark}
          />
        )}

        {naturalHedgeModal.exposure && (
          <NaturalHedgeModal
            isOpen={naturalHedgeModal.open}
            onClose={() => setNaturalHedgeModal({ open: false })}
            exposure={naturalHedgeModal.exposure}
            isDark={isDark}
          />
        )}

        {closeHedgeModal.exposure && (
          <CloseHedgeModal
            isOpen={closeHedgeModal.open}
            onClose={() => setCloseHedgeModal({ open: false })}
            exposure={closeHedgeModal.exposure}
            isDark={isDark}
          />
        )}

        {/* Quarterly Hedging Modals */}
        <QuarterlyNaturalHedgeModal
          isOpen={quarterlyNaturalHedgeModal.open}
          onClose={() => setQuarterlyNaturalHedgeModal({ open: false })}
          isDark={isDark}
          preselectedQuarter={quarterlyNaturalHedgeModal.quarter}
          preselectedCurrency={quarterlyNaturalHedgeModal.currency}
        />

      </div>
    </div>
  );
};

export default ExposureDashboard;
