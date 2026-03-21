// ═══════════════════════════════════════════════════════════════════════════════
// QUARTERLY EXPOSURE REPORT VIEW
// Detailed quarterly report showing hedging status and breakdown
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback } from 'react';
import {
  Calendar,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  FileText,
  RefreshCcw,
  Plus,
  ChevronDown,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { cn } from '../../../utils/helpers';
import { useAppSelector } from '../../../hooks/useRedux';
import { useGetQuarterlyReportQuery, useLazyGetQuarterlyReportQuery } from '../api/hedgingApi';
import {
  getUpcomingQuarters,
  getCurrentQuarter,
  getQuarterLabel,
  formatHedgeAmount,
  formatRate,
  formatPercentage,
  formatHedgeDate,
  getRiskLevelFromHedgeRatio,
  getRiskLevelClasses,
} from '../hedgingUtils';
import type { QuarterlyExposureReportResponse, HedgeRecordResponse, ExposureBriefInfo } from '../hedgingTypes';
import { HEDGING_CHART_COLORS, HEDGE_RECORD_TYPE_STYLES, HEDGE_RECORD_STATUS_STYLES } from '../hedgingConstants';
import { QuarterlyNaturalHedgeModal } from '../modals/QuarterlyNaturalHedgeModal';
import { BookForwardContractModal } from '../modals/BookForwardContractModal';

// ─────────────────────────────────────────────────────────────────────────────────
// PROPS INTERFACE
// ─────────────────────────────────────────────────────────────────────────────────
interface QuarterlyReportViewProps {
  isDark?: boolean;
  onApplyNaturalHedge?: (quarter: string, currency: string) => void;
  onBookForward?: (exposure: ExposureBriefInfo) => void;
}

// Available currencies
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'SGD'];

// ─────────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────────
export const QuarterlyReportView: React.FC<QuarterlyReportViewProps> = ({
  isDark: propIsDark,
  onApplyNaturalHedge,
  onBookForward,
}) => {
  const theme = useAppSelector((state) => state.ui?.theme);
  const isDark = propIsDark ?? theme === 'dark';

  // State
  const [selectedQuarter, setSelectedQuarter] = useState(getCurrentQuarter());
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  
  // Modal states
  const [naturalHedgeModalOpen, setNaturalHedgeModalOpen] = useState(false);
  const [bookForwardModal, setBookForwardModal] = useState<{ open: boolean; exposure?: ExposureBriefInfo }>({ open: false });

  // Quarters for selection
  const quarters = useMemo(() => getUpcomingQuarters(8), []);

  // Fetch report data
  const {
    data: reportData,
    isLoading,
    isFetching,
    refetch,
  } = useGetQuarterlyReportQuery(
    { quarter: selectedQuarter, currency: selectedCurrency },
    { skip: !selectedQuarter || !selectedCurrency }
  );

  const report = reportData?.data;
  const summary = report?.summary;
console.log(reportData)

  // Calculate totals from exposure arrays as fallback when summary values are missing/zero
  const calculatedTotals = useMemo(() => {
    const totalReceivables = report?.receivables?.reduce(
      (sum, exp) => sum + (exp.exposedAmount || 0),
      0
    ) || 0;
    const totalPayables = report?.payables?.reduce(
      (sum, exp) => sum + (exp.exposedAmount || 0),
      0
    ) || 0;
    
    return {
      totalReceivables: summary?.totalReceivables || totalReceivables,
      totalPayables: summary?.totalPayables || totalPayables,
    };
  }, [report?.receivables, report?.payables, summary?.totalReceivables, summary?.totalPayables]);

  // Helper to get exposure info by ID for natural hedges display
  const getExposureInfo = useCallback((exposureId: string | undefined) => {
    if (!exposureId) return null;
    // Search in receivables
    const receivable = report?.receivables?.find(exp => exp.id === exposureId);
    if (receivable) return { invoiceNumber: receivable.invoiceNumber, partyName: receivable.partyName, type: 'RECEIVABLE' };
    // Search in payables
    const payable = report?.payables?.find(exp => exp.id === exposureId);
    if (payable) return { invoiceNumber: payable.invoiceNumber, partyName: payable.partyName, type: 'PAYABLE' };
    return null;
  }, [report?.receivables, report?.payables]);

  // Calculated values
  const riskLevel = useMemo(() => {
    if (!summary) return 'medium';
    return getRiskLevelFromHedgeRatio(summary.hedgeRatio);
  }, [summary]);

  // Theme classes
  const bgClass = isDark ? 'bg-slate-900' : 'bg-slate-50';
  const cardBgClass = isDark ? 'bg-slate-800' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-slate-900';
  const mutedTextClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const borderClass = isDark ? 'border-slate-700' : 'border-slate-200';

  return (
    <div className={cn('min-h-screen', bgClass)}>
      {/* Header */}
      <div className={cn('border-b', borderClass, cardBgClass)}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={cn('text-2xl font-bold', textClass)}>Quarterly Exposure Report</h1>
              <p className={cn('text-sm mt-1', mutedTextClass)}>
                {getQuarterLabel(selectedQuarter)} • {selectedCurrency}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Quarter Selector */}
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                className={cn(
                  'px-3 py-2 text-sm rounded-lg border font-medium',
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-slate-200 text-slate-900'
                )}
              >
                {quarters.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>

              {/* Currency Selector */}
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className={cn(
                  'px-3 py-2 text-sm rounded-lg border font-medium',
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-slate-200 text-slate-900'
                )}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isDark
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
                Refresh
              </button>

              <button
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isDark
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {isLoading ? (
          // Loading State
          <div
            className={cn(
              'p-12 rounded-lg border flex items-center justify-center',
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            )}
          >
            <RefreshCw className={cn('w-6 h-6 animate-spin', mutedTextClass)} />
            <span className={cn('ml-2', mutedTextClass)}>Loading report...</span>
          </div>
        ) : !report ? (
          // No Data State
          <div
            className={cn(
              'p-12 rounded-lg border text-center',
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            )}
          >
            <FileText className={cn('w-12 h-12 mx-auto mb-4', mutedTextClass)} />
            <p className={cn('text-lg font-medium', textClass)}>No data available</p>
            <p className={cn('text-sm mt-1', mutedTextClass)}>
              No exposures found for {selectedQuarter} in {selectedCurrency}
            </p>
          </div>
        ) : (
          <>
            {/* Summary Section */}
            <div
              className={cn(
                'rounded-lg border overflow-hidden',
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              )}
            >
              <div className={cn('px-5 py-4 border-b', borderClass)}>
                <h2 className={cn('text-lg font-semibold', textClass)}>Summary</h2>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-4 gap-6">
                  {/* Total Receivables */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-teal-500" />
                      <span className={cn('text-sm font-medium', mutedTextClass)}>Total Receivables</span>
                    </div>
                    <p className={cn('text-2xl font-bold', isDark ? 'text-teal-400' : 'text-teal-600')}>
                      {formatHedgeAmount(calculatedTotals.totalReceivables, selectedCurrency)}
                    </p>
                  </div>

                  {/* Total Payables */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-4 h-4 text-indigo-500" />
                      <span className={cn('text-sm font-medium', mutedTextClass)}>Total Payables</span>
                    </div>
                    <p className={cn('text-2xl font-bold', isDark ? 'text-indigo-400' : 'text-indigo-600')}>
                      {formatHedgeAmount(calculatedTotals.totalPayables, selectedCurrency)}
                    </p>
                  </div>

                  {/* Net Position */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn('text-sm font-medium', mutedTextClass)}>Net Position</span>
                    </div>
                    <p className={cn('text-2xl font-bold', textClass)}>
                      {formatHedgeAmount(summary?.netPosition || 0, selectedCurrency)}
                    </p>
                    <p className={cn('text-xs mt-1', mutedTextClass)}>
                      {(summary?.netPosition || 0) > 0 ? 'Net Receivable' : 'Net Payable'}
                    </p>
                  </div>

                  {/* Risk at Exposure */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className={cn('text-sm font-medium', mutedTextClass)}>Net Exposure at Risk</span>
                    </div>
                    <p className={cn('text-2xl font-bold', isDark ? 'text-amber-400' : 'text-amber-600')}>
                      {formatHedgeAmount(summary?.netExposureAtRisk || 0, selectedCurrency)}
                    </p>
                  </div>
                </div>

                {/* Hedge Breakdown */}
                <div className={cn('mt-6 pt-6 border-t grid grid-cols-4 gap-6', borderClass)}>
                  {/* Natural Hedged */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCcw className="w-4 h-4 text-cyan-500" />
                      <span className={cn('text-sm font-medium', mutedTextClass)}>Natural Hedged</span>
                    </div>
                    <p className={cn('text-xl font-bold', isDark ? 'text-cyan-400' : 'text-cyan-600')}>
                      {formatHedgeAmount(summary?.naturallyHedged || 0, selectedCurrency)}
                    </p>
                  </div>

                  {/* Forward Hedged */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-violet-500" />
                      <span className={cn('text-sm font-medium', mutedTextClass)}>Forward Hedged</span>
                    </div>
                    <p className={cn('text-xl font-bold', isDark ? 'text-violet-400' : 'text-violet-600')}>
                      {formatHedgeAmount(summary?.forwardHedged || 0, selectedCurrency)}
                    </p>
                  </div>

                  {/* Total Hedged */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      <span className={cn('text-sm font-medium', mutedTextClass)}>Total Hedged</span>
                    </div>
                    <p className={cn('text-xl font-bold', isDark ? 'text-emerald-400' : 'text-emerald-600')}>
                      {formatHedgeAmount(summary?.totalHedged || 0, selectedCurrency)}
                    </p>
                  </div>

                  {/* Hedge Ratio */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn('text-sm font-medium', mutedTextClass)}>Hedge Percentage</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className={cn('text-xl font-bold', textClass)}>
                        {formatPercentage(summary?.hedgePercentage || 0)}
                      </p>
                      <span
                        className={cn(
                          'px-2 py-0.5 text-xs font-medium rounded',
                          getRiskLevelClasses(riskLevel, isDark)
                        )}
                      >
                        {riskLevel === 'low' ? 'Good' : riskLevel === 'medium' ? 'Fair' : 'At Risk'}
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          riskLevel === 'low'
                            ? 'bg-emerald-500'
                            : riskLevel === 'medium'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        )}
                        style={{ width: `${Math.min(100, summary?.hedgePercentage || 0)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Natural Hedges Section */}
            <div
              className={cn(
                'rounded-lg border overflow-hidden',
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              )}
            >
              <div className={cn('px-5 py-4 border-b flex items-center justify-between', borderClass)}>
                <div className="flex items-center gap-2">
                  <RefreshCcw className="w-5 h-5 text-cyan-500" />
                  <h2 className={cn('text-lg font-semibold', textClass)}>
                    Natural Hedges ({report.naturalHedges?.length || 0})
                  </h2>
                </div>
<button
                  onClick={() => {
                    if (onApplyNaturalHedge) {
                      onApplyNaturalHedge(selectedQuarter, selectedCurrency);
                    } else {
                      setNaturalHedgeModalOpen(true);
                    }
                  }}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    isDark
                      ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                      : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                  )}
                >
                  <Plus className="w-4 h-4" />
                  Add Natural Hedge
                </button>
              </div>
              <div className="overflow-x-auto">
                {report.naturalHedges && report.naturalHedges.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className={isDark ? 'bg-slate-800/50' : 'bg-slate-50'}>
                        <th className={cn('px-4 py-3 text-left text-xs font-semibold uppercase', mutedTextClass)}>
                          Receivable
                        </th>
                        <th className={cn('px-4 py-3 text-left text-xs font-semibold uppercase', mutedTextClass)}>
                          Payable
                        </th>
                        <th className={cn('px-4 py-3 text-right text-xs font-semibold uppercase', mutedTextClass)}>
                          Amount
                        </th>
                        <th className={cn('px-4 py-3 text-right text-xs font-semibold uppercase', mutedTextClass)}>
                          Rate
                        </th>
                        <th className={cn('px-4 py-3 text-center text-xs font-semibold uppercase', mutedTextClass)}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className={cn('divide-y', isDark ? 'divide-slate-700' : 'divide-slate-100')}>
                      {report.naturalHedges.map((hedge) => {
                        // Try to get info from direct fields first, fallback to lookup by exposure ID
                        const receivableInfo = hedge.payableExposure.invoiceNumber 
                          ? { invoiceNumber: hedge.receivableInvoiceNumber, partyName: '' }
                          : getExposureInfo(hedge.receivableExposureId);
                        const payableInfo = hedge.payableInvoiceNumber
                          ? { invoiceNumber: hedge.payableInvoiceNumber, partyName: '' }
                          : getExposureInfo(hedge.payableExposureId);
                        
                        return (
                          <tr key={hedge.id} className={cn('transition-colors', isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50')}>
                            <td className={cn('px-4 py-3 text-sm font-medium', isDark ? 'text-teal-400' : 'text-teal-600')}>
                              {hedge.receivableExposure.invoiceNumber }
                              {receivableInfo?.partyName && (
                                <span className={cn('block text-xs', mutedTextClass)}>{receivableInfo.partyName}</span>
                              )}
                            </td>
                            <td className={cn('px-4 py-3 text-sm font-medium', isDark ? 'text-indigo-400' : 'text-indigo-600')}>
                                {hedge.payableExposure.invoiceNumber }
                              {payableInfo?.partyName && (
                                <span className={cn('block text-xs', mutedTextClass)}>{payableInfo.partyName}</span>
                              )}
                            </td>
                            <td className={cn('px-4 py-3 text-sm text-right font-semibold', textClass)}>
                              {formatHedgeAmount(hedge.hedgeAmount, hedge.currency)}
                            </td>
                            <td className={cn('px-4 py-3 text-sm text-right', mutedTextClass)}>
                              {hedge.hedgeRate && hedge.hedgeRate > 0 ? hedge.hedgeRate : '-'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border',
                                  isDark
                                    ? HEDGE_RECORD_STATUS_STYLES[hedge.status]?.dark
                                    : HEDGE_RECORD_STATUS_STYLES[hedge.status]?.light
                                )}
                              >
                                {HEDGE_RECORD_STATUS_STYLES[hedge.status]?.icon} {hedge.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className={cn('p-8 text-center', mutedTextClass)}>
                    No natural hedges for this quarter
                  </div>
                )}
              </div>
            </div>

            {/* Forward Contracts Section */}
            <div
              className={cn(
                'rounded-lg border overflow-hidden',
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              )}
            >
              <div className={cn('px-5 py-4 border-b flex items-center justify-between', borderClass)}>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-violet-500" />
                  <h2 className={cn('text-lg font-semibold', textClass)}>
                    Forward Contracts ({report.forwardContracts?.length || 0})
                  </h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                {report.forwardContracts && report.forwardContracts.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className={isDark ? 'bg-slate-800/50' : 'bg-slate-50'}>
                        <th className={cn('px-4 py-3 text-left text-xs font-semibold uppercase', mutedTextClass)}>
                          Contract #
                        </th>
                        <th className={cn('px-4 py-3 text-left text-xs font-semibold uppercase', mutedTextClass)}>
                          Bank
                        </th>
                        <th className={cn('px-4 py-3 text-right text-xs font-semibold uppercase', mutedTextClass)}>
                          Amount
                        </th>
                        <th className={cn('px-4 py-3 text-right text-xs font-semibold uppercase', mutedTextClass)}>
                          Rate
                        </th>
                        <th className={cn('px-4 py-3 text-left text-xs font-semibold uppercase', mutedTextClass)}>
                          Maturity
                        </th>
                        <th className={cn('px-4 py-3 text-center text-xs font-semibold uppercase', mutedTextClass)}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className={cn('divide-y', isDark ? 'divide-slate-700' : 'divide-slate-100')}>
                      {report.forwardContracts.map((contract) => (
                        <tr
                          key={contract.id}
                          className={cn('transition-colors', isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50')}
                        >
                          <td className={cn('px-4 py-3 text-sm font-medium', textClass)}>
                            {contract.contractNumber || '-'}
                          </td>
                          <td className={cn('px-4 py-3 text-sm', mutedTextClass)}>
                            {contract.bankName || '-'}
                          </td>
                          <td className={cn('px-4 py-3 text-sm text-right font-semibold', textClass)}>
                            {formatHedgeAmount(contract.hedgeAmount, contract.currency)}
                          </td>
                          <td className={cn('px-4 py-3 text-sm text-right', mutedTextClass)}>
                            {contract.rate ? formatRate(contract.rate) : '-'}
                          </td>
                          <td className={cn('px-4 py-3 text-sm', mutedTextClass)}>
                            {contract.maturityDate ? formatHedgeDate(contract.maturityDate) : '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border',
                                isDark
                                  ? HEDGE_RECORD_STATUS_STYLES[contract.status]?.dark
                                  : HEDGE_RECORD_STATUS_STYLES[contract.status]?.light
                              )}
                            >
                              {HEDGE_RECORD_STATUS_STYLES[contract.status]?.icon} {contract.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className={cn('p-8 text-center', mutedTextClass)}>
                    No forward contracts for this quarter
                  </div>
                )}
              </div>
            </div>

            {/* Unhedged Exposures Section */}
            {report.unhedgedExposures && report.unhedgedExposures.length > 0 && (
              <div
                className={cn(
                  'rounded-lg border overflow-hidden',
                  isDark ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'
                )}
              >
                <div className={cn('px-5 py-4 border-b flex items-center justify-between', isDark ? 'border-amber-500/20' : 'border-amber-200')}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h2 className={cn('text-lg font-semibold', textClass)}>
                      Unhedged Exposures ({report.unhedgedExposures.length})
                    </h2>
                    <span className={cn('text-xs px-2 py-0.5 rounded', isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700')}>
                      Action Required
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={isDark ? 'bg-slate-800/50' : 'bg-amber-100/50'}>
                        <th className={cn('px-4 py-3 text-left text-xs font-semibold uppercase', mutedTextClass)}>
                          Invoice
                        </th>
                        <th className={cn('px-4 py-3 text-left text-xs font-semibold uppercase', mutedTextClass)}>
                          Party
                        </th>
                        <th className={cn('px-4 py-3 text-left text-xs font-semibold uppercase', mutedTextClass)}>
                          Type
                        </th>
                        <th className={cn('px-4 py-3 text-right text-xs font-semibold uppercase', mutedTextClass)}>
                          Unhedged Amount
                        </th>
                        <th className={cn('px-4 py-3 text-left text-xs font-semibold uppercase', mutedTextClass)}>
                          Due Date
                        </th>
                        <th className={cn('px-4 py-3 text-center text-xs font-semibold uppercase', mutedTextClass)}>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className={cn('divide-y', isDark ? 'divide-slate-700' : 'divide-amber-100')}>
                      {report.unhedgedExposures.map((exp) => (
                        <tr
                          key={exp.id}
                          className={cn('transition-colors', isDark ? 'hover:bg-slate-700/30' : 'hover:bg-amber-100/50')}
                        >
                          <td className={cn('px-4 py-3 text-sm font-medium', textClass)}>
                            {exp.invoiceNumber}
                          </td>
                          <td className={cn('px-4 py-3 text-sm', mutedTextClass)}>
                            {exp.partyName}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                'text-xs font-medium px-2 py-0.5 rounded',
                                exp.type === 'RECEIVABLE'
                                  ? isDark
                                    ? 'bg-teal-500/20 text-teal-400'
                                    : 'bg-teal-100 text-teal-700'
                                  : isDark
                                  ? 'bg-indigo-500/20 text-indigo-400'
                                  : 'bg-indigo-100 text-indigo-700'
                              )}
                            >
                              {exp.type}
                            </span>
                          </td>
                          <td className={cn('px-4 py-3 text-sm text-right font-semibold', isDark ? 'text-amber-400' : 'text-amber-600')}>
                            {formatHedgeAmount(exp.unhedgedAmount, exp.currency)}
                          </td>
                          <td className={cn('px-4 py-3 text-sm', mutedTextClass)}>
                            {formatHedgeDate(exp.maturityDate)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setBookForwardModal({ open: true, exposure: exp as ExposureBriefInfo })}
                              className={cn(
                                'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors',
                                isDark
                                  ? 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
                                  : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
                              )}
                            >
                              <FileText className="w-3 h-3" />
                              Book Forward
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Natural Hedge Modal */}
      <QuarterlyNaturalHedgeModal
        isOpen={naturalHedgeModalOpen}
        onClose={() => setNaturalHedgeModalOpen(false)}
        isDark={isDark}
        preselectedQuarter={selectedQuarter}
        preselectedCurrency={selectedCurrency}
      />

      {/* Book Forward Contract Modal */}
      <BookForwardContractModal
        isOpen={bookForwardModal.open}
        onClose={() => setBookForwardModal({ open: false })}
        isDark={isDark}
        exposure={bookForwardModal.exposure || null}
      />
    </div>
  );
};

export default QuarterlyReportView;
