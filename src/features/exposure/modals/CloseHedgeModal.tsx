// ═══════════════════════════════════════════════════════════════════════════════
// CLOSE HEDGE MODAL
// Modal for closing an active hedge on an exposure
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback, useEffect } from 'react';
import { X, XCircle, Calendar, Loader2, AlertCircle, AlertTriangle } from 'lucide-react';
import { cn, formatCurrency, formatDate } from '../../../utils/helpers';
import { useCloseHedgeMutation } from '../api/exposureApi';
import type { Exposure, Hedge, CloseHedgeFormData, CloseHedgeFormErrors } from '../types';
import { HEDGE_TYPE_STYLES, HEDGE_STATUS_STYLES } from '../exposureConstants';
import { getActiveHedges } from '../exposureUtils';

interface CloseHedgeModalProps {
  exposure: Exposure;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  isDark?: boolean;
  preselectedHedgeId?: string;
}

export const CloseHedgeModal: React.FC<CloseHedgeModalProps> = ({
  exposure,
  isOpen,
  onClose,
  onSuccess,
  isDark = false,
  preselectedHedgeId,
}) => {
  const [formData, setFormData] = useState<CloseHedgeFormData>({
    hedgeId: preselectedHedgeId || '',
    settlementDate: new Date().toISOString().split('T')[0],
    remarks: '',
  });
  const [errors, setErrors] = useState<CloseHedgeFormErrors>({});
  
  const [closeHedge, { isLoading }] = useCloseHedgeMutation();

  const activeHedges = getActiveHedges(exposure);
  const selectedHedge = activeHedges.find(h => h.id === formData.hedgeId);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        hedgeId: preselectedHedgeId || (activeHedges[0]?.id || ''),
        settlementDate: new Date().toISOString().split('T')[0],
        remarks: '',
      });
      setErrors({});
    }
  }, [isOpen, preselectedHedgeId, activeHedges]);

  // Validate form
  const validateForm = useCallback((): CloseHedgeFormErrors => {
    const newErrors: CloseHedgeFormErrors = {};

    if (!formData.hedgeId) {
      newErrors.hedgeId = 'Select a hedge to close';
    }

    if (!formData.settlementDate) {
      newErrors.settlementDate = 'Settlement date is required';
    }

    return newErrors;
  }, [formData]);

  // Handle input changes
  const handleChange = useCallback((field: keyof CloseHedgeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined, general: undefined }));
  }, []);

  // Handle submit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await closeHedge({
        exposureId: exposure.id,
        data: {
          hedgeId: formData.hedgeId,
          settlementDate: formData.settlementDate,
          remarks: formData.remarks.trim() || undefined,
        },
      }).unwrap();

      setFormData({ hedgeId: '', settlementDate: '', remarks: '' });
      setErrors({});
      onSuccess?.();
      onClose();
    } catch (error: any) {
      setErrors({
        general: error?.data?.message || 'Failed to close hedge. Please try again.',
      });
    }
  }, [formData, validateForm, closeHedge, exposure.id, onSuccess, onClose]);

  if (!isOpen) return null;

  const inputClasses = cn(
    'w-full px-3 py-2 text-sm rounded-lg border transition-colors',
    isDark
      ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-cyan-500'
      : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-teal-500'
  );

  const labelClasses = cn(
    'block text-xs font-medium mb-1.5',
    isDark ? 'text-slate-400' : 'text-slate-600'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

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
                isDark ? 'bg-amber-500/10' : 'bg-amber-50'
              )}
            >
              <XCircle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                Close Hedge
              </h2>
              <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Invoice {exposure.invoiceNumber}
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

        {/* Warning */}
        <div
          className={cn(
            'mx-5 mt-4 p-3 rounded-lg flex items-start gap-2',
            isDark ? 'bg-amber-500/10' : 'bg-amber-50'
          )}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className={cn('text-xs', isDark ? 'text-amber-400' : 'text-amber-700')}>
            Closing a hedge will reduce your hedge coverage. The unhedged amount will increase.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Error Banner */}
          {errors.general && (
            <div
              className={cn(
                'flex items-start gap-2 p-3 rounded-lg text-sm',
                isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
              )}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Select Hedge */}
          <div>
            <label className={labelClasses}>Select Hedge to Close *</label>
            
            {activeHedges.length === 0 ? (
              <div
                className={cn(
                  'text-center py-6 rounded-lg border',
                  isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                )}
              >
                <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  No active hedges to close
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeHedges.map((hedge) => {
                  const typeStyle = HEDGE_TYPE_STYLES[hedge.hedgeType];
                  const isSelected = formData.hedgeId === hedge.id;

                  return (
                    <div
                      key={hedge.id}
                      onClick={() => handleChange('hedgeId', hedge.id)}
                      className={cn(
                        'p-3 rounded-lg border cursor-pointer transition-all',
                        isSelected
                          ? isDark
                            ? 'bg-amber-500/10 border-amber-500'
                            : 'bg-amber-50 border-amber-500'
                          : isDark
                          ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={cn(
                                'px-1.5 py-0.5 rounded text-[10px] font-medium border',
                                isDark ? typeStyle.dark : typeStyle.light
                              )}
                            >
                              {typeStyle.label}
                            </span>
                            {hedge.bankName && (
                              <span className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                                {hedge.bankName}
                              </span>
                            )}
                          </div>
                          <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                            Contract: {formatDate(hedge.contractDate, 'dd MMM yyyy')}
                            {hedge.forwardRate && ` @ ${hedge.forwardRate.toFixed(4)}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={cn('text-sm font-semibold tabular-nums', isDark ? 'text-white' : 'text-slate-900')}>
                            {formatCurrency(hedge.amount, exposure.currency, false)}
                          </p>
                          <p className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                            {exposure.currency}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {errors.hedgeId && (
              <p className="text-xs text-red-500 mt-1">{errors.hedgeId}</p>
            )}
          </div>

          {/* Settlement Date */}
          {selectedHedge && (
            <>
              <div>
                <label className={labelClasses}>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Settlement Date *
                  </span>
                </label>
                <input
                  type="date"
                  value={formData.settlementDate}
                  onChange={(e) => handleChange('settlementDate', e.target.value)}
                  className={cn(inputClasses, errors.settlementDate && 'border-red-500')}
                />
                {errors.settlementDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.settlementDate}</p>
                )}
              </div>

              {/* Impact Preview */}
              <div
                className={cn(
                  'p-3 rounded-lg',
                  isDark ? 'bg-slate-800/50' : 'bg-slate-50'
                )}
              >
                <p className={cn('text-xs text-center mb-2', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  After Closing
                </p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className={cn('text-sm font-semibold tabular-nums', isDark ? 'text-emerald-400' : 'text-emerald-600')}>
                      {formatCurrency(
                        exposure.hedgedAmount - selectedHedge.amount,
                        exposure.currency,
                        false
                      )}
                    </p>
                    <p className={cn('text-[10px]', isDark ? 'text-slate-500' : 'text-slate-400')}>
                      New Hedged Amount
                    </p>
                  </div>
                  <div>
                    <p className={cn('text-sm font-semibold tabular-nums text-red-500')}>
                      {formatCurrency(
                        exposure.unhedgedAmount + selectedHedge.amount,
                        exposure.currency,
                        false
                      )}
                    </p>
                    <p className={cn('text-[10px]', isDark ? 'text-slate-500' : 'text-slate-400')}>
                      New Unhedged Amount
                    </p>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className={labelClasses}>Remarks</label>
                <textarea
                  placeholder="Reason for closing (optional)"
                  value={formData.remarks}
                  onChange={(e) => handleChange('remarks', e.target.value)}
                  rows={2}
                  className={cn(inputClasses, 'resize-none')}
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
                isDark
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedHedge}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50',
                isDark
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Closing...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Close Hedge
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CloseHedgeModal;
