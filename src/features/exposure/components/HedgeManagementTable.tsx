// ═══════════════════════════════════════════════════════════════════════════════
// HEDGE MANAGEMENT TABLE
// Table component for displaying and managing hedge records
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  MoreVertical,
  XCircle,
  Eye,
  RefreshCw,
  FileText,
  Loader2,
} from 'lucide-react';
import { cn } from '../../../utils/helpers';
import {
  formatHedgeAmount,
  formatRate,
  formatHedgeDate,
  getHedgeTypeLabel,
  isHedgeActive,
} from '../hedgingUtils';
import type { HedgeRecordResponse, HedgeFilters } from '../hedgingTypes';
import {
  HEDGE_RECORD_STATUS_STYLES,
  HEDGE_RECORD_TYPE_STYLES,
  HEDGE_MANAGEMENT_TABLE_COLUMNS,
} from '../hedgingConstants';

// ─────────────────────────────────────────────────────────────────────────────────
// PROPS INTERFACE
// ─────────────────────────────────────────────────────────────────────────────────
interface HedgeManagementTableProps {
  hedges: HedgeRecordResponse[];
  isLoading?: boolean;
  onClose?: (hedge: HedgeRecordResponse) => void;
  onView?: (hedge: HedgeRecordResponse) => void;
  isDark?: boolean;
  emptyMessage?: string;
}

// ─────────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────────
export const HedgeManagementTable: React.FC<HedgeManagementTableProps> = ({
  hedges,
  isLoading = false,
  onClose,
  onView,
  isDark = false,
  emptyMessage = 'No hedge records found',
}) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'createdAt',
    direction: 'desc',
  });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Sort hedges
  const sortedHedges = useMemo(() => {
    if (!hedges || hedges.length === 0) return [];

    return [...hedges].sort((a, b) => {
      const key = sortConfig.key as keyof HedgeRecordResponse;
      const aVal = a[key];
      const bVal = b[key];

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [hedges, sortConfig]);

  // Handle sort
  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  // Toggle menu
  const toggleMenu = useCallback((id: string) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  }, []);

  // Close menu when clicking outside
  const closeAllMenus = useCallback(() => {
    setOpenMenuId(null);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div
        className={cn(
          'rounded-lg border p-8 flex items-center justify-center',
          isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
        )}
      >
        <Loader2 className={cn('w-6 h-6 animate-spin', isDark ? 'text-slate-500' : 'text-slate-400')} />
        <span className={cn('ml-2 text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
          Loading hedges...
        </span>
      </div>
    );
  }

  if (!hedges || hedges.length === 0) {
    return (
      <div
        className={cn(
          'rounded-lg border p-8 text-center',
          isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
        )}
      >
        <RefreshCw className={cn('w-8 h-8 mx-auto mb-3', isDark ? 'text-slate-600' : 'text-slate-300')} />
        <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden',
        isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
      )}
      onClick={closeAllMenus}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead>
            <tr className={isDark ? 'bg-slate-800' : 'bg-slate-50'}>
              {HEDGE_MANAGEMENT_TABLE_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider',
                    col.sortable && 'cursor-pointer hover:bg-opacity-80',
                    isDark ? 'text-slate-400' : 'text-slate-600',
                    'align' in col && col.align === 'right' && 'text-right'
                  )}
                  style={{ width: col.width }}
                >
                  <div className={cn('flex items-center gap-1', 'align' in col && col.align === 'right' && 'justify-end')}>
                    {col.label}
                    {col.sortable && sortConfig.key === col.key && (
                      sortConfig.direction === 'asc' ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className={cn('divide-y', isDark ? 'divide-slate-700' : 'divide-slate-100')}>
            {sortedHedges.map((hedge) => {
              const typeStyle = HEDGE_RECORD_TYPE_STYLES[hedge.type];
              const statusStyle = HEDGE_RECORD_STATUS_STYLES[hedge.status];
              const canClose = isHedgeActive(hedge);

              return (
                <tr
                  key={hedge.id}
                  className={cn(
                    'transition-colors',
                    isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
                  )}
                >
                  {/* ID */}
                  <td className={cn('px-4 py-3 text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                    <span className="font-mono text-xs">{hedge.id.slice(0, 8)}...</span>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border',
                        isDark ? typeStyle.dark : typeStyle.light
                      )}
                    >
                      <span>{typeStyle.icon}</span>
                      {typeStyle.label}
                    </span>
                  </td>

                  {/* Currency */}
                  <td className={cn('px-4 py-3 text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-600')}>
                    {hedge.currency}
                  </td>

                  {/* Amount */}
                  <td className={cn('px-4 py-3 text-sm text-right font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                    {formatHedgeAmount(hedge.hedgeAmount, hedge.currency)}
                  </td>

                  {/* Rate */}
                  <td className={cn('px-4 py-3 text-sm text-right', isDark ? 'text-slate-300' : 'text-slate-600')}>
                    {hedge.rate ? formatRate(hedge.rate) : '—'}
                  </td>

                  {/* Quarter */}
                  <td className={cn('px-4 py-3 text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
                    {hedge.quarter}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border',
                        isDark ? statusStyle.dark : statusStyle.light
                      )}
                    >
                      <span>{statusStyle.icon}</span>
                      {statusStyle.label}
                    </span>
                  </td>

                  {/* Created At */}
                  <td className={cn('px-4 py-3 text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    {formatHedgeDate(hedge.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMenu(hedge.id);
                        }}
                        className={cn(
                          'p-1.5 rounded-lg transition-colors',
                          isDark
                            ? 'hover:bg-slate-700 text-slate-400'
                            : 'hover:bg-slate-100 text-slate-500'
                        )}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === hedge.id && (
                        <div
                          className={cn(
                            'absolute right-0 top-full mt-1 w-40 py-1 rounded-lg shadow-lg border z-20',
                            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                          )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {onView && (
                            <button
                              onClick={() => {
                                onView(hedge);
                                setOpenMenuId(null);
                              }}
                              className={cn(
                                'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                                isDark
                                  ? 'text-slate-300 hover:bg-slate-700'
                                  : 'text-slate-700 hover:bg-slate-50'
                              )}
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                          )}
                          {canClose && onClose && (
                            <button
                              onClick={() => {
                                onClose(hedge);
                                setOpenMenuId(null);
                              }}
                              className={cn(
                                'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                                'text-red-500 hover:bg-red-50',
                                isDark && 'hover:bg-red-500/10'
                              )}
                            >
                              <XCircle className="w-4 h-4" />
                              Close Hedge
                            </button>
                          )}
                          {!canClose && (
                            <div
                              className={cn(
                                'px-3 py-2 text-xs',
                                isDark ? 'text-slate-500' : 'text-slate-400'
                              )}
                            >
                              Hedge is already {hedge.status.toLowerCase()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer with count */}
      <div
        className={cn(
          'px-4 py-2 border-t text-xs',
          isDark ? 'border-slate-700 text-slate-500' : 'border-slate-100 text-slate-400'
        )}
      >
        Showing {sortedHedges.length} hedge record{sortedHedges.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default HedgeManagementTable;
