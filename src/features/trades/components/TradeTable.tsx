import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { cn, formatDate } from '../../../utils/helpers';
import type { Trade } from '../types';
import { TradeStageBadge } from './TradeStageBadge';
import { TradeTypeBadge } from './TradeTypeBadge';
import { canEditTrade, canCancelTrade } from '../tradeUtils';
import { UserRole } from '../../../types';

interface TradeTableProps {
  trades: Trade[];
  isDark?: boolean;
  userRole?: UserRole;
  onView: (trade: Trade) => void;
  onEdit?: (trade: Trade) => void;
  onCancel?: (trade: Trade) => void;
  selectedTradeId?: string | null;
  isLoading?: boolean;
}

export const TradeTable: React.FC<TradeTableProps> = ({
  trades,
  isDark = false,
  userRole,
  onView,
  onEdit,
  onCancel,
  selectedTradeId,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const canEdit = (trade: Trade) => canEditTrade(userRole, trade);
  const canCancel = (trade: Trade) => canCancelTrade(userRole, trade);

  // Loading State
  if (isLoading) {
    return (
      <div
        className={cn(
          'rounded-lg border overflow-hidden',
          isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
        )}
      >
        <div className="animate-pulse p-8">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <div className={cn('h-4 rounded w-24', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
                <div className={cn('h-4 rounded w-32', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
                <div className={cn('h-4 rounded w-20', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
                <div className={cn('h-4 rounded flex-1', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty State
  if (trades.length === 0) {
    return (
      <div
        className={cn(
          'text-center py-16 rounded-lg border',
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        )}
      >
        <div
          className={cn(
            'w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center',
            isDark ? 'bg-slate-800' : 'bg-slate-100'
          )}
        >
          <svg
            className={cn('w-8 h-8', isDark ? 'text-slate-600' : 'text-slate-400')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        </div>
        <h3 className={cn('text-lg font-medium mb-1', isDark ? 'text-white' : 'text-slate-900')}>
          No trades found
        </h3>
        <p className={cn('text-sm mb-4', isDark ? 'text-slate-400' : 'text-slate-500')}>
          Create your first trade to get started.
        </p>
        <button
          onClick={() => navigate('/dashboard/trades/create')}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            isDark
              ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
              : 'bg-teal-600 hover:bg-teal-700 text-white'
          )}
        >
          Create Trade
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border',
        isDark ? 'border-slate-800' : 'border-slate-200'
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className={cn(
                'text-left text-xs font-medium uppercase tracking-wider',
                isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'
              )}
            >
              <th scope="col" className="px-4 py-3">Trade No.</th>
              <th scope="col" className="px-4 py-3">Party</th>
              <th scope="col" className="px-4 py-3">Type</th>
              <th scope="col" className="px-4 py-3">Reference</th>
              <th scope="col" className="px-4 py-3">Stage</th>
              <th scope="col" className="px-4 py-3">Created</th>
              <th scope="col" className="px-4 py-3">Updated</th>
              <th scope="col" className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody
            className={cn(
              'divide-y',
              isDark ? 'divide-slate-800 bg-slate-900' : 'divide-slate-100 bg-white'
            )}
          >
            {trades.map((trade) => (
              <tr
                key={trade.id}
                className={cn(
                  'transition-colors cursor-pointer',
                  selectedTradeId === trade.id
                    ? isDark
                      ? 'bg-slate-800'
                      : 'bg-slate-50'
                    : isDark
                    ? 'hover:bg-slate-800/50'
                    : 'hover:bg-slate-50/50',
                  'focus-within:ring-2 focus-within:ring-inset',
                  isDark ? 'focus-within:ring-cyan-500' : 'focus-within:ring-teal-500'
                )}
                tabIndex={0}
                onClick={() => onView(trade)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onView(trade);
                  }
                }}
              >
                {/* Trade Number */}
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'font-mono text-sm font-medium',
                      isDark ? 'text-cyan-400' : 'text-teal-600'
                    )}
                  >
                    {trade.tradeNumber}
                  </span>
                </td>

                {/* Party */}
                <td className="px-4 py-3">
                  <div className={cn('text-sm', isDark ? 'text-white' : 'text-slate-900')}>
                    {trade.partyName || 'Unknown Party'}
                  </div>
                </td>

                {/* Trade Type */}
                <td className="px-4 py-3">
                  <TradeTypeBadge type={trade.tradeType} isDark={isDark} />
                </td>

                {/* Reference */}
                <td className="px-4 py-3">
                  <span className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
                    {trade.tradeReference || '—'}
                  </span>
                </td>

                {/* Stage */}
                <td className="px-4 py-3">
                  <TradeStageBadge stage={trade.tradeStage} isDark={isDark} />
                </td>

                {/* Created Date */}
                <td className="px-4 py-3">
                  <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    {formatDate(trade.createdAt)}
                  </span>
                </td>

                {/* Updated Date */}
                <td className="px-4 py-3">
                  <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    {formatDate(trade.updatedAt)}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    {/* View */}
                    <button
                      onClick={() => onView(trade)}
                      className={cn(
                        'p-1.5 rounded-md transition-colors',
                        isDark
                          ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      )}
                      title="View trade"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit (only if DRAFT) */}
                    {canEdit(trade) && onEdit && (
                      <button
                        onClick={() => onEdit(trade)}
                        className={cn(
                          'p-1.5 rounded-md transition-colors',
                          isDark
                            ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                        )}
                        title="Edit trade"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}

                    {/* Cancel (if allowed) */}
                    {canCancel(trade) && onCancel && (
                      <button
                        onClick={() => onCancel(trade)}
                        className={cn(
                          'p-1.5 rounded-md transition-colors',
                          isDark
                            ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30'
                            : 'text-red-400 hover:text-red-600 hover:bg-red-50'
                        )}
                        title="Cancel trade"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeTable;
