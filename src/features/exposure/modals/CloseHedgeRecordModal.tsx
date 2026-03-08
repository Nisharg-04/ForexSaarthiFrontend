// ═══════════════════════════════════════════════════════════════════════════════
// CLOSE HEDGE RECORD MODAL
// Modal for closing an active hedge record
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback, useEffect } from 'react';
import { X, XCircle, Loader2, AlertCircle, DollarSign, TrendingUp } from 'lucide-react';
import { cn } from '../../../utils/helpers';
import { useCloseHedgeRecordMutation } from '../api/hedgingApi';
import { formatHedgeAmount, formatRate, getHedgeTypeLabel } from '../hedgingUtils';
import type { HedgeRecordResponse, CloseHedgeFormData, CloseHedgeFormErrors } from '../hedgingTypes';
import { CLOSE_HEDGE_VALIDATION, HEDGE_RECORD_TYPE_STYLES } from '../hedgingConstants';

// ─────────────────────────────────────────────────────────────────────────────────
// PROPS INTERFACE
// ─────────────────────────────────────────────────────────────────────────────────
interface CloseHedgeRecordModalProps {
  hedge: HedgeRecordResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  isDark?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────────
// INITIAL FORM DATA
// ─────────────────────────────────────────────────────────────────────────────────
const getInitialFormData = (hedge: HedgeRecordResponse | null): CloseHedgeFormData => ({
  hedgeId: hedge?.id || '',
  settlementRate: hedge?.rate?.toString() || '',
  gainLoss: '',
  remarks: '',
});

// ─────────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────────
export const CloseHedgeRecordModal: React.FC<CloseHedgeRecordModalProps> = ({
  hedge,
  isOpen,
  onClose,
  onSuccess,
  isDark = false,
}) => {
  const [formData, setFormData] = useState<CloseHedgeFormData>(getInitialFormData(hedge));
  const [errors, setErrors] = useState<CloseHedgeFormErrors>({});

  const [closeHedge, { isLoading }] = useCloseHedgeRecordMutation();

  // Reset form when modal opens or hedge changes
  useEffect(() => {
    if (isOpen && hedge) {
      setFormData(getInitialFormData(hedge));
      setErrors({});
    }
  }, [isOpen, hedge]);

  // ─────────────────────────────────────────────────────────────────────────────
  // VALIDATION
  // ─────────────────────────────────────────────────────────────────────────────
  const validateForm = useCallback((): CloseHedgeFormErrors => {
    const newErrors: CloseHedgeFormErrors = {};
    const rate = formData.settlementRate ? parseFloat(formData.settlementRate) : undefined;

    // Settlement rate validation (optional)
    if (rate !== undefined && !isNaN(rate)) {
      if (
        rate < CLOSE_HEDGE_VALIDATION.settlementRate.min ||
        rate > CLOSE_HEDGE_VALIDATION.settlementRate.max
      ) {
        newErrors.settlementRate = 'Invalid settlement rate';
      }
    }

    return newErrors;
  }, [formData]);

  // ─────────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────
  const handleChange = useCallback((field: keyof CloseHedgeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      if (!hedge) {
        setErrors({ general: 'No hedge selected' });
        return;
      }

      try {
        await closeHedge({
          hedgeId: hedge.id,
          data: {
            settlementRate: formData.settlementRate ? parseFloat(formData.settlementRate) : undefined,
            gainLoss: formData.gainLoss ? parseFloat(formData.gainLoss) : undefined,
            remarks: formData.remarks.trim() || undefined,
          },
        }).unwrap();

        setFormData(getInitialFormData(null));
        setErrors({});
        onSuccess?.();
        onClose();
      } catch (error: any) {
        setErrors({
          general: error?.data?.message || 'Failed to close hedge. Please try again.',
        });
      }
    },
    [formData, validateForm, closeHedge, hedge, onSuccess, onClose]
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  if (!isOpen || !hedge) return null;

  const typeStyle = HEDGE_RECORD_TYPE_STYLES[hedge.type];

  const inputClasses = cn(
    'w-full px-3 py-2 text-sm rounded-lg border transition-colors',
    isDark
      ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-red-500'
      : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-red-500'
  );

  const labelClasses = cn('block text-xs font-medium mb-1.5', isDark ? 'text-slate-400' : 'text-slate-600');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-md rounded-xl border shadow-xl',
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'flex items-center justify-between px-5 py-4 border-b',
            isDark ? 'border-slate-700' : 'border-slate-200'
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                isDark ? 'bg-red-500/10' : 'bg-red-50'
              )}
            >
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                Close Hedge
              </h2>
              <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                {getHedgeTypeLabel(hedge.type)} • {hedge.currency}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Hedge Info Summary */}
          <div
            className={cn(
              'p-3 rounded-lg border',
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded border',
                  isDark ? typeStyle.dark : typeStyle.light
                )}
              >
                {typeStyle.label}
              </span>
              <span className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                {hedge.quarter}
              </span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Hedge Amount:</span>
                <span className={cn('font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                  {formatHedgeAmount(hedge.hedgeAmount, hedge.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Original Rate:</span>
                <span className={cn('font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>
                  {formatRate(hedge.rate)}
                </span>
              </div>
              {hedge.type === 'NATURAL' && (
                <>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Receivable:</span>
                    <span className={cn('font-medium', isDark ? 'text-teal-400' : 'text-teal-600')}>
                      {hedge.receivableInvoiceNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Payable:</span>
                    <span className={cn('font-medium', isDark ? 'text-indigo-400' : 'text-indigo-600')}>
                      {hedge.payableInvoiceNumber}
                    </span>
                  </div>
                </>
              )}
              {hedge.type === 'FORWARD' && hedge.contractNumber && (
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Contract:</span>
                  <span className={cn('font-medium', isDark ? 'text-violet-400' : 'text-violet-600')}>
                    {hedge.contractNumber}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Warning for Natural Hedge */}
          {hedge.type === 'NATURAL' && hedge.linkedHedgeId && (
            <div
              className={cn(
                'p-3 rounded-lg border flex items-start gap-2',
                isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'
              )}
            >
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className={cn('text-xs', isDark ? 'text-amber-300' : 'text-amber-700')}>
                This is a natural hedge pair. Closing this hedge will also close the linked hedge record.
              </p>
            </div>
          )}

          {/* Settlement Rate */}
          <div>
            <label className={labelClasses}>Settlement Rate (Optional)</label>
            <div className="relative">
              <TrendingUp
                className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
                  isDark ? 'text-slate-500' : 'text-slate-400'
                )}
              />
              <input
                type="number"
                step="0.0001"
                value={formData.settlementRate}
                onChange={(e) => handleChange('settlementRate', e.target.value)}
                placeholder={`Original: ${formatRate(hedge.rate)}`}
                className={cn(inputClasses, 'pl-9')}
              />
            </div>
            <p className={cn('mt-1 text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
              Rate at which the hedge was settled
            </p>
            {errors.settlementRate && (
              <p className="mt-1 text-xs text-red-500">{errors.settlementRate}</p>
            )}
          </div>

          {/* Gain/Loss */}
          <div>
            <label className={labelClasses}>Gain/Loss (Optional)</label>
            <div className="relative">
              <DollarSign
                className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
                  isDark ? 'text-slate-500' : 'text-slate-400'
                )}
              />
              <input
                type="number"
                step="0.01"
                value={formData.gainLoss}
                onChange={(e) => handleChange('gainLoss', e.target.value)}
                placeholder="Positive for gain, negative for loss"
                className={cn(inputClasses, 'pl-9')}
              />
            </div>
            {errors.gainLoss && <p className="mt-1 text-xs text-red-500">{errors.gainLoss}</p>}
          </div>

          {/* Remarks */}
          <div>
            <label className={labelClasses}>Closure Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => handleChange('remarks', e.target.value)}
              placeholder="Reason for closing, additional notes..."
              rows={2}
              className={inputClasses}
            />
            {errors.remarks && <p className="mt-1 text-xs text-red-500">{errors.remarks}</p>}
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-500">{errors.general}</span>
            </div>
          )}
        </form>

        {/* Footer */}
        <div
          className={cn(
            'flex items-center justify-end gap-3 px-5 py-4 border-t',
            isDark ? 'border-slate-700' : 'border-slate-200'
          )}
        >
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isDark
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            )}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className={cn(
              'flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-colors',
              'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-500/50'
            )}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Close Hedge
          </button>
        </div>
      </div>
    </div>
  );
};

export default CloseHedgeRecordModal;
