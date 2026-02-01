import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil } from 'lucide-react';
import { cn, formatDate, formatCurrency } from '../../../utils/helpers';
import type { Invoice } from '../types';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { canEditInvoice } from '../invoiceUtils';
import { UserRole } from '../../../types';

interface InvoiceTableProps {
  invoices: Invoice[];
  isDark?: boolean;
  userRole?: UserRole;
  onView: (invoice: Invoice) => void;
  onEdit?: (invoice: Invoice) => void;
  selectedInvoiceId?: string | null;
  isLoading?: boolean;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  isDark = false,
  userRole,
  onView,
  onEdit,
  selectedInvoiceId,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  // Loading State - Skeleton
  if (isLoading) {
    return (
      <div
        className={cn(
          'rounded-lg border overflow-hidden',
          isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
        )}
      >
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className={cn('h-10', isDark ? 'bg-slate-800/50' : 'bg-slate-50')} />
          {/* Row skeletons */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className={cn(
                'flex items-center gap-4 px-4 py-3 border-t',
                isDark ? 'border-slate-800' : 'border-slate-100'
              )}
            >
              <div className={cn('h-4 rounded w-24', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
              <div className={cn('h-4 rounded w-20', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
              <div className={cn('h-4 rounded w-32', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
              <div className={cn('h-4 rounded w-24', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
              <div className={cn('h-4 rounded w-12', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
              <div className={cn('h-4 rounded w-24', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
              <div className={cn('h-4 rounded w-24', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
              <div className={cn('h-4 rounded w-16', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty State
  if (invoices.length === 0) {
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className={cn('text-lg font-medium mb-1', isDark ? 'text-white' : 'text-slate-900')}>
          No invoices found
        </h3>
        <p className={cn('text-sm mb-4', isDark ? 'text-slate-400' : 'text-slate-500')}>
          Create your first invoice to start tracking receivables.
        </p>
        <button
          onClick={() => navigate('/dashboard/invoices/new')}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            isDark
              ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
              : 'bg-teal-600 hover:bg-teal-700 text-white'
          )}
        >
          Create Invoice
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
        <table className="w-full text-sm">
          <thead>
            <tr
              className={cn(
                'text-left text-xs font-medium uppercase tracking-wider',
                isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'
              )}
            >
              <th scope="col" className="px-3 py-2.5 w-[120px]">Invoice No.</th>
              <th scope="col" className="px-3 py-2.5 w-[100px]">Date</th>
              <th scope="col" className="px-3 py-2.5 w-[180px]">Party</th>
              <th scope="col" className="px-3 py-2.5 w-[100px]">Trade</th>
              <th scope="col" className="px-3 py-2.5 w-[50px]">Ccy</th>
              <th scope="col" className="px-3 py-2.5 w-[110px] text-right">Amount</th>
              <th scope="col" className="px-3 py-2.5 w-[110px] text-right">Outstanding</th>
              <th scope="col" className="px-3 py-2.5 w-[100px]">Status</th>
              <th scope="col" className="px-3 py-2.5 w-[70px]"></th>
            </tr>
          </thead>
          <tbody
            className={cn(
              'divide-y',
              isDark ? 'divide-slate-800 bg-slate-900' : 'divide-slate-100 bg-white'
            )}
          >
            {invoices.map((invoice) => (
              <tr
                key={invoice.id}
                className={cn(
                  'transition-colors cursor-pointer',
                  selectedInvoiceId === invoice.id
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
                onClick={() => onView(invoice)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onView(invoice);
                  }
                }}
              >
                {/* Invoice Number */}
                <td className="px-3 py-2.5">
                  <span
                    className={cn(
                      'font-mono text-sm font-medium',
                      isDark ? 'text-cyan-400' : 'text-teal-600'
                    )}
                  >
                    {invoice.invoiceNumber}
                  </span>
                </td>

                {/* Invoice Date */}
                <td className="px-3 py-2.5">
                  <span className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
                    {formatDate(invoice.invoiceDate)}
                  </span>
                </td>

                {/* Party Name */}
                <td className="px-3 py-2.5">
                  <div
                    className={cn(
                      'text-sm truncate max-w-[180px]',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}
                    title={invoice.partyName}
                  >
                    {invoice.partyName || 'Unknown Party'}
                  </div>
                </td>

                {/* Trade Number */}
                <td className="px-3 py-2.5">
                  <span
                    className={cn(
                      'font-mono text-xs',
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    )}
                  >
                    {invoice.tradeNumber || '—'}
                  </span>
                </td>

                {/* Currency */}
                <td className="px-3 py-2.5">
                  <span
                    className={cn(
                      'font-mono text-xs font-medium',
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    )}
                  >
                    {invoice.currency}
                  </span>
                </td>

                {/* Invoice Amount */}
                <td className="px-3 py-2.5 text-right">
                  <span
                    className={cn(
                      'font-mono text-sm tabular-nums',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    {formatCurrency(invoice.invoiceAmount, invoice.currency, false)}
                  </span>
                </td>

                {/* Outstanding Amount */}
                <td className="px-3 py-2.5 text-right">
                  <span
                    className={cn(
                      'font-mono text-sm tabular-nums',
                      invoice.outstandingAmount > 0
                        ? isDark
                          ? 'text-amber-400'
                          : 'text-amber-600'
                        : isDark
                        ? 'text-emerald-400'
                        : 'text-emerald-600'
                    )}
                  >
                    {formatCurrency(invoice.outstandingAmount, invoice.currency, false)}
                  </span>
                </td>

                {/* Status */}
                <td className="px-3 py-2.5">
                  <InvoiceStatusBadge status={invoice.status} isDark={isDark} size="sm" />
                </td>

                {/* Actions */}
                <td className="px-3 py-2.5">
                  <div
                    className="flex items-center justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* View */}
                    <button
                      onClick={() => onView(invoice)}
                      className={cn(
                        'p-1.5 rounded-md transition-colors',
                        isDark
                          ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      )}
                      title="View invoice"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit (only if DRAFT) */}
                    {canEditInvoice(userRole, invoice) && onEdit && (
                      <button
                        onClick={() => onEdit(invoice)}
                        className={cn(
                          'p-1.5 rounded-md transition-colors',
                          isDark
                            ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                        )}
                        title="Edit invoice"
                      >
                        <Pencil className="w-4 h-4" />
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

export default InvoiceTable;
