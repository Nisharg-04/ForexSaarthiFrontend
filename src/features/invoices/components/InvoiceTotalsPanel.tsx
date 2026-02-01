import React, { useMemo } from 'react';
import { cn, formatCurrency } from '../../../utils/helpers';
import type { LineItemFormData } from '../types';
import { parseNumericInput, calculateLineTotal, roundToDecimal } from '../invoiceUtils';

interface InvoiceTotalsPanelProps {
  lineItems: LineItemFormData[];
  currency: string;
  isDark?: boolean;
}

export const InvoiceTotalsPanel: React.FC<InvoiceTotalsPanelProps> = ({
  lineItems,
  currency,
  isDark = false,
}) => {
  // Calculate totals from line items
  const totals = useMemo(() => {
    const lineCount = lineItems.filter(
      (item) => item.description.trim() && parseNumericInput(item.quantity) > 0
    ).length;

    const subtotal = lineItems.reduce((sum, item) => {
      const qty = parseNumericInput(item.quantity);
      const price = parseNumericInput(item.unitPrice);
      return sum + calculateLineTotal(qty, price);
    }, 0);

    return {
      lineCount,
      subtotal: roundToDecimal(subtotal),
      invoiceAmount: roundToDecimal(subtotal), // For now, same as subtotal (can add tax/discount later)
    };
  }, [lineItems]);

  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden',
        isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'px-4 py-3 border-b',
          isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
        )}
      >
        <h3 className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
          Invoice Totals
        </h3>
      </div>

      {/* Totals Grid */}
      <div className="p-4 space-y-3">
        {/* Line Items Count */}
        <div className="flex items-center justify-between">
          <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Line Items
          </span>
          <span className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>
            {totals.lineCount}
          </span>
        </div>

        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Subtotal
          </span>
          <span
            className={cn(
              'font-mono text-sm tabular-nums',
              isDark ? 'text-slate-300' : 'text-slate-700'
            )}
          >
            {formatCurrency(totals.subtotal, currency, false)}
          </span>
        </div>

        {/* Divider */}
        <div className={cn('border-t', isDark ? 'border-slate-700' : 'border-slate-200')} />

        {/* Invoice Amount (Total) */}
        <div className="flex items-center justify-between">
          <span className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
            Invoice Amount
          </span>
          <div className="text-right">
            <div className="flex items-baseline gap-1.5">
              <span
                className={cn(
                  'font-mono text-xs',
                  isDark ? 'text-slate-400' : 'text-slate-500'
                )}
              >
                {currency}
              </span>
              <span
                className={cn(
                  'font-mono text-lg font-semibold tabular-nums',
                  isDark ? 'text-emerald-400' : 'text-emerald-600'
                )}
              >
                {formatCurrency(totals.invoiceAmount, currency, false)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Currency Note */}
      <div
        className={cn(
          'px-4 py-2 border-t text-xs',
          isDark ? 'border-slate-700 text-slate-500 bg-slate-800/30' : 'border-slate-200 text-slate-400 bg-slate-50/50'
        )}
      >
        All amounts in <span className="font-semibold">{currency}</span>
      </div>
    </div>
  );
};

export default InvoiceTotalsPanel;
