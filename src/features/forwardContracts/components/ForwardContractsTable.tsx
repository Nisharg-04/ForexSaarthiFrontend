// ═══════════════════════════════════════════════════════════════════════════════
// FORWARD CONTRACTS TABLE COMPONENT
// Displays list of forward contracts with columns and actions
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { Eye, Download, Edit2, Trash2, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '../../../utils/helpers';
import type { ForwardContract } from '../types';
import {
  formatForwardAmount,
  formatINRAmount,
  formatDate,
  formatForwardRate,
  formatPL,
  getStatusDisplay,
} from '../forwardUtils';
import { FORWARD_COLORS } from '../forwardConstants';

interface ForwardContractsTableProps {
  contracts: ForwardContract[];
  isLoading?: boolean;
  onView?: (contract: ForwardContract) => void;
  onEdit?: (contract: ForwardContract) => void;
  onClose?: (contract: ForwardContract) => void;
  onCancel?: (contract: ForwardContract) => void;
  onDownload?: (contract: ForwardContract) => void;
  isDark?: boolean;
}

export const ForwardContractsTable: React.FC<ForwardContractsTableProps> = ({
  contracts,
  isLoading = false,
  onView,
  onEdit,
  onClose,
  onCancel,
  onDownload,
  isDark = false,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return FORWARD_COLORS.statusActive;
      case 'CLOSED':
        return FORWARD_COLORS.statusClosed;
      case 'CANCELLED':
        return FORWARD_COLORS.statusCancelled;
      default:
        return FORWARD_COLORS.statusExpired;
    }
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-64 rounded-lg border',
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
        )}
      >
        <Loader2 className="w-6 h-6 animate-spin text-teal-600 dark:text-cyan-400" />
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center h-64 rounded-lg border',
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
        )}
      >
        <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
          No forward contracts found
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border" style={{ borderColor: isDark ? '#1e293b' : '#e2e8f0' }}>
      <table className="w-full text-sm">
        <thead>
          <tr
            className={cn(
              'border-b',
              isDark
                ? 'bg-slate-800/50 border-slate-700'
                : 'bg-slate-50 border-slate-200'
            )}
          >
            <th className="w-10" />
            <th className={cn('px-4 py-3 text-left font-semibold', isDark ? 'text-slate-300' : 'text-slate-700')}>
              Reference
            </th>
            <th className={cn('px-4 py-3 text-left font-semibold', isDark ? 'text-slate-300' : 'text-slate-700')}>
              Currency
            </th>
            <th className={cn('px-4 py-3 text-right font-semibold', isDark ? 'text-slate-300' : 'text-slate-700')}>
              Amount
            </th>
            <th className={cn('px-4 py-3 text-right font-semibold', isDark ? 'text-slate-300' : 'text-slate-700')}>
              Rate
            </th>
            <th className={cn('px-4 py-3 text-left font-semibold', isDark ? 'text-slate-300' : 'text-slate-700')}>
              Bank
            </th>
            <th className={cn('px-4 py-3 text-center font-semibold', isDark ? 'text-slate-300' : 'text-slate-700')}>
              Status
            </th>
            <th className={cn('px-4 py-3 text-right font-semibold', isDark ? 'text-slate-300' : 'text-slate-700')}>
              Gain/Loss
            </th>
            <th className={cn('px-4 py-3 text-center font-semibold', isDark ? 'text-slate-300' : 'text-slate-700')}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((contract) => {
            const isExpanded = expandedRows.has(contract.id);
            const { formatted: plFormatted, isGain } = formatPL(contract.gainLoss);

            return (
              <React.Fragment key={contract.id}>
                <tr
                  className={cn(
                    'border-b transition-colors',
                    isDark ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-200 hover:bg-slate-50'
                  )}
                >
                  {/* Expand Button */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleRow(contract.id)}
                      className={cn(
                        'p-1 rounded transition-colors',
                        isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-200'
                      )}
                    >
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 transition-transform',
                          isExpanded ? 'rotate-180' : '',
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        )}
                      />
                    </button>
                  </td>

                  {/* Contract Reference */}
                  <td className={cn('px-4 py-3 font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                    {contract.contractReference}
                  </td>

                  {/* Currency */}
                  <td className={cn('px-4 py-3', isDark ? 'text-slate-400' : 'text-slate-600')}>
                    {contract.currency}
                  </td>

                  {/* Amount */}
                  <td className={cn('px-4 py-3 text-right font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                    {formatForwardAmount(contract.contractAmount, contract.currency)}
                  </td>

                  {/* Forward Rate */}
                  <td className={cn('px-4 py-3 text-right', isDark ? 'text-slate-400' : 'text-slate-600')}>
                    {formatForwardRate(contract.forwardRate)}
                  </td>

                  {/* Bank Name */}
                  <td className={cn('px-4 py-3', isDark ? 'text-slate-400' : 'text-slate-600')}>
                    {contract.bankName}
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-3 text-center">
                    <span className={cn('inline-block px-2.5 py-0.5 rounded text-xs font-medium', getStatusColor(contract.status))}>
                      {getStatusDisplay(contract.status)}
                    </span>
                  </td>

                  {/* Gain/Loss */}
                  <td className={cn('px-4 py-3 text-right font-medium', isGain ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
                    {plFormatted}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {onView && (
                        <button
                          onClick={() => onView(contract)}
                          className={cn(
                            'p-1.5 rounded transition-colors',
                            isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-200'
                          )}
                          title="View details"
                        >
                          <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </button>
                      )}

                      {contract.status === 'ACTIVE' && (
                        <>
                          {onClose && (
                            <button
                              onClick={() => onClose(contract)}
                              className={cn(
                                'p-1.5 rounded transition-colors',
                                isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-200'
                              )}
                              title="Close contract"
                            >
                              <Edit2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            </button>
                          )}

                          {onCancel && (
                            <button
                              onClick={() => onCancel(contract)}
                              className={cn(
                                'p-1.5 rounded transition-colors',
                                isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-200'
                              )}
                              title="Cancel contract"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </button>
                          )}
                        </>
                      )}

                      {onDownload && (
                        <button
                          onClick={() => onDownload(contract)}
                          className={cn(
                            'p-1.5 rounded transition-colors',
                            isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-200'
                          )}
                          title="Download contract"
                        >
                          <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Expanded Details Row */}
                {isExpanded && (
                  <tr
                    className={cn(
                      'border-b',
                      isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                    )}
                  >
                    <td colSpan={9} className="px-4 py-4">
                      <div className="grid grid-cols-2 gap-6 text-sm">
                        <div>
                          <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                            Contract Date
                          </p>
                          <p className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                            {formatDate(contract.contractDate)}
                          </p>
                        </div>

                        <div>
                          <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                            Settlement Date
                          </p>
                          <p className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                            {formatDate(contract.settlementDate)}
                          </p>
                        </div>

                        <div>
                          <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                            Base Amount (INR)
                          </p>
                          <p className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                            {formatINRAmount(contract.baseAmount)}
                          </p>
                        </div>

                        <div>
                          <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                            Quarter
                          </p>
                          <p className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                            {contract.quarterDisplay}
                          </p>
                        </div>

                        {contract.remarks && (
                          <div className="col-span-2">
                            <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                              Remarks
                            </p>
                            <p className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                              {contract.remarks}
                            </p>
                          </div>
                        )}

                        {contract.closedDate && (
                          <div>
                            <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                              Closed Date
                            </p>
                            <p className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                              {formatDate(contract.closedDate)}
                            </p>
                          </div>
                        )}

                        {contract.closingRate && (
                          <div>
                            <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                              Closing Rate
                            </p>
                            <p className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                              {formatForwardRate(contract.closingRate)}
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
