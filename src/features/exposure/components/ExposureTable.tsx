// ═══════════════════════════════════════════════════════════════════════════════
// EXPOSURE TABLE COMPONENT
// Data-dense table for exposure list view
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, MoreVertical, Shield, ArrowUpRight, ArrowDownLeft, FileText } from 'lucide-react';
import { cn, formatDate, formatCurrency } from '../../../utils/helpers';
import type { Exposure } from '../types';
import type { UserRole } from '../../../types';
import { ExposureStatusBadge } from './ExposureStatusBadge';
import { HedgeProgressBar } from './HedgeProgressBar';
import { EXPOSURE_TYPE_STYLES } from '../exposureConstants';
import {
  formatDaysToMaturity,
  getMaturityColorClass,
  canApplyForwardHedge,
  canApplyNaturalHedge,
} from '../exposureUtils';

interface ExposureTableProps {
  exposures: Exposure[];
  isDark?: boolean;
  userRole?: UserRole;
  onView?: (exposure: Exposure) => void;
  onApplyHedge?: (exposure: Exposure) => void;
  onApplyForwardHedge?: (exposure: Exposure) => void;
  onBookForward?: (exposure: Exposure) => void;
  onApplyNaturalHedge?: (exposure: Exposure) => void;
  onCloseHedge?: (exposure: Exposure) => void;
  selectedExposureId?: string | null;
  isLoading?: boolean;
  compact?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export const ExposureTable: React.FC<ExposureTableProps> = ({
  exposures,
  isDark = false,
  userRole,
  onView,
  onApplyHedge,
  onApplyForwardHedge,
  onBookForward,
  onApplyNaturalHedge,
  onCloseHedge,
  selectedExposureId,
  isLoading = false,
  compact = false,
  sortBy,
  sortOrder,
  onSort,
}) => {
  const navigate = useNavigate();

  // Handle row click
  const handleRowClick = useCallback(
    (exposure: Exposure) => {
      if (onView) {
        onView(exposure);
      } else {
        navigate(`/dashboard/exposures/${exposure.id}`);
      }
    },
    [navigate, onView]
  );

  // Loading Skeleton
  if (isLoading) {
    return (
      <div
        className={cn(
          'rounded-lg border overflow-hidden',
          isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
        )}
      >
        <div className="animate-pulse">
          <div className={cn('h-10', isDark ? 'bg-slate-800/50' : 'bg-slate-50')} />
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'flex items-center gap-3 px-3 py-3 border-t',
                isDark ? 'border-slate-800' : 'border-slate-100'
              )}
            >
              {Array.from({ length: compact ? 6 : 10 }).map((_, j) => (
                <div
                  key={j}
                  className={cn(
                    'h-4 rounded',
                    isDark ? 'bg-slate-700' : 'bg-slate-200',
                    j === 0 ? 'w-20' : j === 1 ? 'w-16' : j === 2 ? 'w-28' : 'w-20'
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty State
  if (exposures.length === 0) {
    return (
      <div
        className={cn(
          'text-center py-12 rounded-lg border',
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
        )}
      >
        <div
          className={cn(
            'w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center',
            isDark ? 'bg-slate-800' : 'bg-slate-100'
          )}
        >
          <Shield className={cn('w-7 h-7', isDark ? 'text-slate-600' : 'text-slate-400')} />
        </div>
        <h3 className={cn('text-lg font-medium mb-1', isDark ? 'text-white' : 'text-slate-900')}>
          No exposures found
        </h3>
        <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
          Exposures are created automatically when invoices are issued.
        </p>
      </div>
    );
  }

  // Compact Mode (for dashboard widgets)
  if (compact) {
    return (
      <div
        className={cn(
          'overflow-hidden rounded-lg border',
          isDark ? 'border-slate-700' : 'border-slate-200'
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr
                className={cn(
                  'text-left text-[10px] font-medium uppercase tracking-wider',
                  isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'
                )}
              >
                <th className="px-3 py-2">Invoice</th>
                <th className="px-3 py-2">Party</th>
                <th className="px-3 py-2">Ccy</th>
                <th className="px-3 py-2 text-right">Unhedged</th>
                <th className="px-3 py-2 text-right">Days</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody
              className={cn(
                'divide-y',
                isDark ? 'divide-slate-800 bg-slate-900' : 'divide-slate-100 bg-white'
              )}
            >
              {exposures.map((exposure) => (
                <tr
                  key={exposure.id}
                  onClick={() => handleRowClick(exposure)}
                  className={cn(
                    'cursor-pointer transition-colors',
                    isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                  )}
                >
                  <td className="px-3 py-2">
                    <span className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                      {exposure.invoiceNumber}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={cn('truncate max-w-[100px] block', isDark ? 'text-slate-300' : 'text-slate-700')}>
                      {exposure.partyName}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded text-[10px] font-medium',
                        isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {exposure.currency}
                    </span>
                  </td>
                  <td
                    className={cn(
                      'px-3 py-2 text-right font-medium tabular-nums',
                      isDark ? 'text-red-400' : 'text-red-600'
                    )}
                  >
                    {formatCurrency(exposure.unhedgedAmount, exposure.currency, false)}
                  </td>
                  <td
                    className={cn(
                      'px-3 py-2 text-right tabular-nums',
                      getMaturityColorClass(exposure.daysToMaturity, isDark)
                    )}
                  >
                    {formatDaysToMaturity(exposure.daysToMaturity)}
                  </td>
                  <td className="px-3 py-2">
                    <ExposureStatusBadge status={exposure.status} isDark={isDark} size="xs" showIcon={false} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Full Table
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border',
        isDark ? 'border-slate-700' : 'border-slate-200'
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr
              className={cn(
                'text-left text-xs font-medium uppercase tracking-wider',
                isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'
              )}
            >
              <th className="px-3 py-2.5 w-[100px]">Invoice</th>
              <th className="px-3 py-2.5 w-[90px]">Trade</th>
              <th className="px-3 py-2.5 w-[140px]">Party</th>
              <th className="px-3 py-2.5 w-[70px]">Type</th>
              <th className="px-3 py-2.5 w-[50px]">Ccy</th>
              <th className="px-3 py-2.5 w-[100px] text-right">Exposed</th>
              <th className="px-3 py-2.5 w-[100px] text-right">Hedged</th>
              <th className="px-3 py-2.5 w-[100px] text-right">Unhedged</th>
              <th className="px-3 py-2.5 w-[90px]">Hedge %</th>
              <th className="px-3 py-2.5 w-[90px]">Maturity</th>
              <th className="px-3 py-2.5 w-[60px] text-right">Days</th>
              <th className="px-3 py-2.5 w-[100px]">Status</th>
              <th className="px-3 py-2.5 w-[50px]"></th>
            </tr>
          </thead>
          <tbody
            className={cn(
              'divide-y',
              isDark ? 'divide-slate-800 bg-slate-900' : 'divide-slate-100 bg-white'
            )}
          >
            {exposures.map((exposure) => {
              const typeStyle = EXPOSURE_TYPE_STYLES[exposure.type];
              console.log(exposure)
              const isSelected = selectedExposureId === exposure.id;
              const canHedge = canApplyForwardHedge(exposure, userRole);

              return (
                <tr
                  key={exposure.id}
                  onClick={() => handleRowClick(exposure)}
                  className={cn(
                    'cursor-pointer transition-colors',
                    isSelected
                      ? isDark
                        ? 'bg-cyan-500/10'
                        : 'bg-teal-50'
                      : isDark
                      ? 'hover:bg-slate-800/50'
                      : 'hover:bg-slate-50'
                  )}
                >
                  {/* Invoice Number */}
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        'font-medium',
                        isDark ? 'text-white' : 'text-slate-900'
                      )}
                    >
                      {exposure.invoiceNumber}
                    </span>
                  </td>

                  {/* Trade Number */}
                  <td className="px-3 py-2.5">
                    <span className={cn(isDark ? 'text-slate-400' : 'text-slate-600')}>
                      {exposure.tradeNumber}
                    </span>
                  </td>

                  {/* Party Name */}
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        'truncate max-w-[130px] block',
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      )}
                      title={exposure.partyName}
                    >
                      {exposure.partyName}
                    </span>
                  </td>

                  {/* Exposure Type */}
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border',
                        isDark ? typeStyle.dark : typeStyle.light
                      )}
                    >
                      {exposure.exposureType === 'RECEIVABLE' ? (
                        <ArrowDownLeft className="w-3 h-3" />
                      ) : (
                        <ArrowUpRight className="w-3 h-3" />
                      )}
                      {typeStyle.shortLabel}
                    </span>
                  </td>

                  {/* Currency */}
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded text-[10px] font-medium',
                        isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {exposure.currency}
                    </span>
                  </td>

                  {/* Exposed Amount */}
                  <td
                    className={cn(
                      'px-3 py-2.5 text-right font-medium tabular-nums',
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    )}
                  >
                    {formatCurrency(exposure.exposedAmount, exposure.currency, false)}
                  </td>

                  {/* Hedged Amount */}
                  <td
                    className={cn(
                      'px-3 py-2.5 text-right font-medium tabular-nums',
                      isDark ? 'text-emerald-400' : 'text-emerald-600'
                    )}
                  >
                    {formatCurrency(exposure.hedgedAmount, exposure.currency, false)}
                  </td>

                  {/* Unhedged Amount */}
                  <td
                    className={cn(
                      'px-3 py-2.5 text-right font-medium tabular-nums',
                      exposure.unhedgedAmount > 0
                        ? isDark
                          ? 'text-red-400'
                          : 'text-red-600'
                        : isDark
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    )}
                  >
                    {formatCurrency(exposure.unhedgedAmount, exposure.currency, false)}
                  </td>

                  {/* Hedge Percentage */}
                  <td className="px-3 py-2.5">
                    <HedgeProgressBar
                      hedgePercentage={exposure.hedgePercentage}
                      showLabels={false}
                      showValues={false}
                      size="xs"
                      isDark={isDark}
                    />
                    <span
                      className={cn(
                        'text-[10px] tabular-nums mt-0.5 block',
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      )}
                    >
                      {exposure.hedgePercentage.toFixed(0)}%
                    </span>
                  </td>

                  {/* Maturity Date */}
                  <td className={cn('px-3 py-2.5', isDark ? 'text-slate-400' : 'text-slate-600')}>
                    {formatDate(exposure.maturityDate, 'dd MMM')}
                  </td>

                  {/* Days to Maturity */}
                  <td
                    className={cn(
                      'px-3 py-2.5 text-right font-medium tabular-nums',
                      getMaturityColorClass(exposure.daysToMaturity, isDark)
                    )}
                  >
                    {exposure.daysToMaturity < 0 ? (
                      <span className="text-red-500">{Math.abs(exposure.daysToMaturity)}d late</span>
                    ) : exposure.daysToMaturity === 0 ? (
                      'Today'
                    ) : (
                      `${exposure.daysToMaturity}d`
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2.5">
                    <ExposureStatusBadge
                      status={exposure.status}
                      isDark={isDark}
                      size="xs"
                      showIcon={false}
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(exposure);
                        }}
                        className={cn(
                          'p-1 rounded transition-colors',
                          isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                        )}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {canHedge && onBookForward && exposure.unhedgedAmount > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBookForward(exposure);
                          }}
                          className={cn(
                            'p-1 rounded transition-colors',
                            isDark
                              ? 'hover:bg-violet-500/20 text-violet-400'
                              : 'hover:bg-violet-100 text-violet-600'
                          )}
                          title="Book Forward Contract"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      {canHedge && onApplyHedge && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onApplyHedge(exposure);
                          }}
                          className={cn(
                            'p-1 rounded transition-colors',
                            isDark
                              ? 'hover:bg-cyan-500/20 text-cyan-400'
                              : 'hover:bg-teal-100 text-teal-600'
                          )}
                          title="Apply Hedge"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExposureTable;
