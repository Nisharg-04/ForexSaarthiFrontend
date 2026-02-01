import React from 'react';
import { ArrowLeft, Calendar, Building2, FileText, Banknote } from 'lucide-react';
import { cn, formatDate } from '../../../utils/helpers';
import type { TradeForSelection } from '../types';
import { InvoiceTypeBadge } from './InvoiceTypeBadge';
import type { InvoiceType } from '../types';

interface InvoiceHeaderProps {
  trade: TradeForSelection | null;
  invoiceDate: string;
  dueDate: string;
  currency?: string;
  isDark?: boolean;
  onBack?: () => void;
  onInvoiceDateChange?: (date: string) => void;
  onDueDateChange?: (date: string) => void;
  isReadOnly?: boolean;
  invoiceNumber?: string;
}

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  trade,
  invoiceDate,
  dueDate,
  currency,
  isDark = false,
  onBack,
  onInvoiceDateChange,
  onDueDateChange,
  isReadOnly = false,
  invoiceNumber,
}) => {
  if (!trade) {
    return (
      <div
        className={cn(
          'p-6 rounded-lg border',
          isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
        )}
      >
        <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
          No trade selected
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden',
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      )}
    >
      {/* Header Bar */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 border-b',
          isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
        )}
      >
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              )}
              title="Back to invoices"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
              {invoiceNumber ? `Invoice: ${invoiceNumber}` : 'New Invoice'}
            </h2>
            <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Linked to Trade {trade.tradeNumber}
            </p>
          </div>
        </div>
        <InvoiceTypeBadge type={trade.tradeType as InvoiceType} isDark={isDark} />
      </div>

      {/* Content Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Trade Number */}
          <div>
            <label
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium mb-1.5',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              Trade Number
            </label>
            <p
              className={cn(
                'font-mono text-sm font-medium',
                isDark ? 'text-cyan-400' : 'text-teal-600'
              )}
            >
              {trade.tradeNumber}
            </p>
          </div>

          {/* Party */}
          <div>
            <label
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium mb-1.5',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              <Building2 className="w-3.5 h-3.5" />
              Party
            </label>
            <p
              className={cn('text-sm truncate', isDark ? 'text-white' : 'text-slate-900')}
              title={trade.partyName}
            >
              {trade.partyName}
            </p>
          </div>

          {/* Invoice Date */}
          <div>
            <label
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium mb-1.5',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              Invoice Date
            </label>
            {isReadOnly ? (
              <p className={cn('text-sm', isDark ? 'text-white' : 'text-slate-900')}>
                {formatDate(invoiceDate)}
              </p>
            ) : (
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => onInvoiceDateChange?.(e.target.value)}
                className={cn(
                  'w-full px-2.5 py-1.5 text-sm rounded border transition-colors',
                  'focus:outline-none focus:ring-2',
                  isDark
                    ? 'bg-slate-800 border-slate-600 text-white focus:ring-cyan-500/50'
                    : 'bg-white border-slate-300 text-slate-900 focus:ring-teal-500/50'
                )}
              />
            )}
          </div>

          {/* Due Date */}
          <div>
            <label
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium mb-1.5',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              Due Date
            </label>
            {isReadOnly ? (
              <p className={cn('text-sm', isDark ? 'text-white' : 'text-slate-900')}>
                {formatDate(dueDate)}
              </p>
            ) : (
              <input
                type="date"
                value={dueDate}
                onChange={(e) => onDueDateChange?.(e.target.value)}
                min={invoiceDate}
                className={cn(
                  'w-full px-2.5 py-1.5 text-sm rounded border transition-colors',
                  'focus:outline-none focus:ring-2',
                  isDark
                    ? 'bg-slate-800 border-slate-600 text-white focus:ring-cyan-500/50'
                    : 'bg-white border-slate-300 text-slate-900 focus:ring-teal-500/50'
                )}
              />
            )}
          </div>
        </div>

        {/* Currency indicator */}
        {currency && (
          <div
            className={cn(
              'mt-4 pt-4 border-t flex items-center gap-2',
              isDark ? 'border-slate-700' : 'border-slate-200'
            )}
          >
            <Banknote className={cn('w-4 h-4', isDark ? 'text-slate-500' : 'text-slate-400')} />
            <span className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Invoice Currency:
            </span>
            <span
              className={cn(
                'font-mono text-sm font-semibold',
                isDark ? 'text-white' : 'text-slate-900'
              )}
            >
              {currency}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceHeader;
