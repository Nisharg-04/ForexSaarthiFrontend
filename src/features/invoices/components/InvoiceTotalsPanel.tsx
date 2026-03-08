import React, { useMemo } from 'react';
import { cn, formatCurrency } from '../../../utils/helpers';
import type { LineItemFormData, InputMode } from '../types';
import { calculateInvoiceTotals, parseNumericInput, type TaxDiscountInput } from '../invoiceUtils';

interface InvoiceTotalsPanelProps {
  lineItems: LineItemFormData[];
  currency: string;
  // Tax props
  taxMode: InputMode;
  taxPercent: number;
  taxAmount: number;
  onTaxModeChange?: (mode: InputMode) => void;
  onTaxPercentChange?: (value: string) => void;
  onTaxAmountChange?: (value: string) => void;
  // Discount props
  discountMode: InputMode;
  discountPercent: number;
  discountAmount: number;
  onDiscountModeChange?: (mode: InputMode) => void;
  onDiscountPercentChange?: (value: string) => void;
  onDiscountAmountChange?: (value: string) => void;
  // Other props
  isDark?: boolean;
  isEditable?: boolean;
}

export const InvoiceTotalsPanel: React.FC<InvoiceTotalsPanelProps> = ({
  lineItems,
  currency,
  taxMode,
  taxPercent,
  taxAmount,
  onTaxModeChange,
  onTaxPercentChange,
  onTaxAmountChange,
  discountMode,
  discountPercent,
  discountAmount,
  onDiscountModeChange,
  onDiscountPercentChange,
  onDiscountAmountChange,
  isDark = false,
  isEditable = true,
}) => {
  // Build tax/discount input for calculation
  const taxDiscountInput: TaxDiscountInput = useMemo(() => ({
    taxMode,
    taxPercent,
    taxAmount,
    discountMode,
    discountPercent,
    discountAmount,
  }), [taxMode, taxPercent, taxAmount, discountMode, discountPercent, discountAmount]);

  // Calculate totals from line items
  const totals = useMemo(() => {
    return calculateInvoiceTotals(lineItems, taxDiscountInput);
  }, [lineItems, taxDiscountInput]);

  // Mode toggle button component
  const ModeToggle: React.FC<{
    mode: InputMode;
    onModeChange?: (mode: InputMode) => void;
    disabled?: boolean;
  }> = ({ mode, onModeChange, disabled }) => (
    <div className={cn(
      'flex rounded overflow-hidden border',
      isDark ? 'border-slate-600' : 'border-slate-300'
    )}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onModeChange?.('percent')}
        className={cn(
          'px-1.5 py-0.5 text-xs transition-colors',
          mode === 'percent'
            ? isDark ? 'bg-cyan-600 text-white' : 'bg-teal-600 text-white'
            : isDark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        %
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onModeChange?.('amount')}
        className={cn(
          'px-1.5 py-0.5 text-xs transition-colors',
          mode === 'amount'
            ? isDark ? 'bg-cyan-600 text-white' : 'bg-teal-600 text-white'
            : isDark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        {currency}
      </button>
    </div>
  );

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

        {/* Discount Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Discount
              </span>
              {isEditable && (
                <ModeToggle
                  mode={discountMode}
                  onModeChange={onDiscountModeChange}
                  disabled={!isEditable}
                />
              )}
            </div>
            <span
              className={cn(
                'font-mono text-sm tabular-nums',
                totals.discountAmount > 0
                  ? isDark ? 'text-red-400' : 'text-red-600'
                  : isDark ? 'text-slate-500' : 'text-slate-400'
              )}
            >
              {totals.discountAmount > 0 ? '-' : ''}{formatCurrency(totals.discountAmount, currency, false)}
            </span>
          </div>
          {isEditable && (
            <div className="flex items-center gap-2">
              {discountMode === 'percent' ? (
                <>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => onDiscountPercentChange?.(e.target.value)}
                    min="0"
                    max="100"
                    step="0.5"
                    placeholder="0"
                    className={cn(
                      'flex-1 px-2 py-1.5 text-sm text-right rounded border font-mono',
                      isDark
                        ? 'bg-slate-800 border-slate-600 text-white focus:border-cyan-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500',
                      'focus:outline-none focus:ring-1',
                      isDark ? 'focus:ring-cyan-500/30' : 'focus:ring-teal-500/30'
                    )}
                  />
                  <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>%</span>
                </>
              ) : (
                <>
                  <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>{currency}</span>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => onDiscountAmountChange?.(e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={cn(
                      'flex-1 px-2 py-1.5 text-sm text-right rounded border font-mono',
                      isDark
                        ? 'bg-slate-800 border-slate-600 text-white focus:border-cyan-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500',
                      'focus:outline-none focus:ring-1',
                      isDark ? 'focus:ring-cyan-500/30' : 'focus:ring-teal-500/30'
                    )}
                  />
                </>
              )}
            </div>
          )}
          {!isEditable && (
            <span className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
              ({totals.discountPercent.toFixed(2)}%)
            </span>
          )}
        </div>

        {/* Tax Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Tax
              </span>
              {isEditable && (
                <ModeToggle
                  mode={taxMode}
                  onModeChange={onTaxModeChange}
                  disabled={!isEditable}
                />
              )}
            </div>
            <span
              className={cn(
                'font-mono text-sm tabular-nums',
                totals.taxAmount > 0
                  ? isDark ? 'text-amber-400' : 'text-amber-600'
                  : isDark ? 'text-slate-500' : 'text-slate-400'
              )}
            >
              {totals.taxAmount > 0 ? '+' : ''}{formatCurrency(totals.taxAmount, currency, false)}
            </span>
          </div>
          {isEditable && (
            <div className="flex items-center gap-2">
              {taxMode === 'percent' ? (
                <>
                  <input
                    type="number"
                    value={taxPercent}
                    onChange={(e) => onTaxPercentChange?.(e.target.value)}
                    min="0"
                    max="100"
                    step="0.5"
                    placeholder="0"
                    className={cn(
                      'flex-1 px-2 py-1.5 text-sm text-right rounded border font-mono',
                      isDark
                        ? 'bg-slate-800 border-slate-600 text-white focus:border-cyan-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500',
                      'focus:outline-none focus:ring-1',
                      isDark ? 'focus:ring-cyan-500/30' : 'focus:ring-teal-500/30'
                    )}
                  />
                  <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>%</span>
                </>
              ) : (
                <>
                  <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>{currency}</span>
                  <input
                    type="number"
                    value={taxAmount}
                    onChange={(e) => onTaxAmountChange?.(e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={cn(
                      'flex-1 px-2 py-1.5 text-sm text-right rounded border font-mono',
                      isDark
                        ? 'bg-slate-800 border-slate-600 text-white focus:border-cyan-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500',
                      'focus:outline-none focus:ring-1',
                      isDark ? 'focus:ring-cyan-500/30' : 'focus:ring-teal-500/30'
                    )}
                  />
                </>
              )}
            </div>
          )}
          {!isEditable && (
            <span className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
              ({totals.taxPercent.toFixed(2)}%)
            </span>
          )}
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
