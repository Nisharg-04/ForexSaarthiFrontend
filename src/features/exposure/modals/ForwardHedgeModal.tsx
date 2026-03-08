// ═══════════════════════════════════════════════════════════════════════════════
// FORWARD HEDGE MODAL
// Modal for applying forward contract hedge to exposure
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { X, Shield, DollarSign, Calendar, Building2, FileText, Loader2, AlertCircle } from 'lucide-react';
import { cn, formatCurrency, formatDate } from '../../../utils/helpers';
import { useApplyForwardHedgeMutation } from '../api/exposureApi';
import type { Exposure, ForwardHedgeFormData, ForwardHedgeFormErrors } from '../types';
import { FORWARD_HEDGE_VALIDATION } from '../exposureConstants';

interface ForwardHedgeModalProps {
  exposure: Exposure;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  isDark?: boolean;
}

const getInitialFormData = (): ForwardHedgeFormData => ({
  amount: '',
  forwardRate: '',
  contractDate: new Date().toISOString().split('T')[0],
  settlementDate: '',
  bankName: '',
  contractReference: '',
  remarks: '',
});

export const ForwardHedgeModal: React.FC<ForwardHedgeModalProps> = ({
  exposure,
  isOpen,
  onClose,
  onSuccess,
  isDark = false,
}) => {
  const [formData, setFormData] = useState<ForwardHedgeFormData>(getInitialFormData);
  const [errors, setErrors] = useState<ForwardHedgeFormErrors>({});
  
  const [applyHedge, { isLoading }] = useApplyForwardHedgeMutation();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...getInitialFormData(),
        settlementDate: exposure.maturityDate?.split('T')[0] || '',
      });
      setErrors({});
    }
  }, [isOpen, exposure.maturityDate]);

  // Calculate hedged value preview
  const hedgedValuePreview = useMemo(() => {
    const amount = parseFloat(formData.amount) || 0;
    const rate = parseFloat(formData.forwardRate) || 0;
    return amount * rate;
  }, [formData.amount, formData.forwardRate]);

  // Validate form
  const validateForm = useCallback((): ForwardHedgeFormErrors => {
    const newErrors: ForwardHedgeFormErrors = {};
    const amount = parseFloat(formData.amount);
    const rate = parseFloat(formData.forwardRate);

    // Amount validation
    if (!formData.amount || isNaN(amount)) {
      newErrors.amount = 'Hedge amount is required';
    } else if (amount < FORWARD_HEDGE_VALIDATION.amount.min) {
      newErrors.amount = `Minimum amount is ${FORWARD_HEDGE_VALIDATION.amount.min}`;
    } else if (amount > exposure.unhedgedAmount) {
      newErrors.amount = `Cannot exceed unhedged amount (${formatCurrency(exposure.unhedgedAmount, exposure.currency, false)})`;
    }

    // Forward rate validation
    if (!formData.forwardRate || isNaN(rate)) {
      newErrors.forwardRate = 'Forward rate is required';
    } else if (rate < FORWARD_HEDGE_VALIDATION.forwardRate.min) {
      newErrors.forwardRate = 'Invalid forward rate';
    } else if (rate > FORWARD_HEDGE_VALIDATION.forwardRate.max) {
      newErrors.forwardRate = 'Forward rate too high';
    }

    // Contract date validation
    if (!formData.contractDate) {
      newErrors.contractDate = 'Contract date is required';
    }

    // Settlement date validation
    if (!formData.settlementDate) {
      newErrors.settlementDate = 'Settlement date is required';
    } else if (formData.contractDate && formData.settlementDate < formData.contractDate) {
      newErrors.settlementDate = 'Settlement must be after contract date';
    }

    // Bank name validation
    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    } else if (formData.bankName.length > FORWARD_HEDGE_VALIDATION.bankName.maxLength) {
      newErrors.bankName = `Maximum ${FORWARD_HEDGE_VALIDATION.bankName.maxLength} characters`;
    }

    return newErrors;
  }, [formData, exposure.unhedgedAmount, exposure.currency]);

  // Handle input changes
  const handleChange = useCallback((field: keyof ForwardHedgeFormData, value: string) => {
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
      await applyHedge({
        exposureId: exposure.id,
        data: {
          amount: parseFloat(formData.amount),
          forwardRate: parseFloat(formData.forwardRate),
          contractDate: formData.contractDate,
          settlementDate: formData.settlementDate,
          bankName: formData.bankName.trim(),
          contractReference: formData.contractReference.trim() || undefined,
          remarks: formData.remarks.trim() || undefined,
        },
      }).unwrap();

      setFormData(getInitialFormData());
      setErrors({});
      onSuccess?.();
      onClose();
    } catch (error: any) {
      setErrors({
        general: error?.data?.message || 'Failed to apply hedge. Please try again.',
      });
    }
  }, [formData, validateForm, applyHedge, exposure.id, onSuccess, onClose]);

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
          'relative w-full max-w-lg rounded-xl border shadow-xl',
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
                isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'
              )}
            >
              <Shield className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                Apply Forward Hedge
              </h2>
              <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Invoice {exposure.invoiceNumber} • {exposure.currency}
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

        {/* Exposure Summary */}
        <div
          className={cn(
            'mx-5 mt-4 p-3 rounded-lg',
            isDark ? 'bg-slate-800/50' : 'bg-slate-50'
          )}
        >
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className={cn('text-[10px] uppercase tracking-wide', isDark ? 'text-slate-500' : 'text-slate-400')}>
                Exposed
              </p>
              <p className={cn('text-sm font-semibold tabular-nums', isDark ? 'text-slate-200' : 'text-slate-700')}>
                {formatCurrency(exposure.exposedAmount, exposure.currency, false)}
              </p>
            </div>
            <div>
              <p className={cn('text-[10px] uppercase tracking-wide', isDark ? 'text-slate-500' : 'text-slate-400')}>
                Hedged
              </p>
              <p className={cn('text-sm font-semibold tabular-nums text-emerald-500')}>
                {formatCurrency(exposure.hedgedAmount, exposure.currency, false)}
              </p>
            </div>
            <div>
              <p className={cn('text-[10px] uppercase tracking-wide', isDark ? 'text-slate-500' : 'text-slate-400')}>
                Available
              </p>
              <p className={cn('text-sm font-semibold tabular-nums text-red-500')}>
                {formatCurrency(exposure.unhedgedAmount, exposure.currency, false)}
              </p>
            </div>
          </div>
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

          {/* Amount and Rate Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Hedge Amount */}
            <div>
              <label className={labelClasses}>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Hedge Amount ({exposure.currency}) *
                </span>
              </label>
              <input
                type="number"
                step="0.01"
                placeholder={`Max: ${formatCurrency(exposure.unhedgedAmount, exposure.currency, false)}`}
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className={cn(inputClasses, errors.amount && 'border-red-500')}
              />
              {errors.amount && (
                <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
              )}
            </div>

            {/* Forward Rate */}
            <div>
              <label className={labelClasses}>
                Forward Rate (INR/{exposure.currency}) *
              </label>
              <input
                type="number"
                step="0.0001"
                placeholder="e.g., 83.5000"
                value={formData.forwardRate}
                onChange={(e) => handleChange('forwardRate', e.target.value)}
                className={cn(inputClasses, errors.forwardRate && 'border-red-500')}
              />
              {errors.forwardRate && (
                <p className="text-xs text-red-500 mt-1">{errors.forwardRate}</p>
              )}
            </div>
          </div>

          {/* Hedged Value Preview */}
          {hedgedValuePreview > 0 && (
            <div
              className={cn(
                'p-3 rounded-lg text-center',
                isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'
              )}
            >
              <p className={cn('text-xs', isDark ? 'text-emerald-400/70' : 'text-emerald-600/70')}>
                Locked Value (INR)
              </p>
              <p className={cn('text-xl font-bold tabular-nums text-emerald-500')}>
                {formatCurrency(hedgedValuePreview, 'INR')}
              </p>
            </div>
          )}

          {/* Dates Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Contract Date */}
            <div>
              <label className={labelClasses}>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Contract Date *
                </span>
              </label>
              <input
                type="date"
                value={formData.contractDate}
                onChange={(e) => handleChange('contractDate', e.target.value)}
                className={cn(inputClasses, errors.contractDate && 'border-red-500')}
              />
              {errors.contractDate && (
                <p className="text-xs text-red-500 mt-1">{errors.contractDate}</p>
              )}
            </div>

            {/* Settlement Date */}
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
          </div>

          {/* Bank Name */}
          <div>
            <label className={labelClasses}>
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                Bank Name *
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g., HDFC Bank"
              value={formData.bankName}
              onChange={(e) => handleChange('bankName', e.target.value)}
              className={cn(inputClasses, errors.bankName && 'border-red-500')}
            />
            {errors.bankName && (
              <p className="text-xs text-red-500 mt-1">{errors.bankName}</p>
            )}
          </div>

          {/* Contract Reference */}
          <div>
            <label className={labelClasses}>
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Contract Reference
              </span>
            </label>
            <input
              type="text"
              placeholder="Bank contract number (optional)"
              value={formData.contractReference}
              onChange={(e) => handleChange('contractReference', e.target.value)}
              className={inputClasses}
            />
          </div>

          {/* Remarks */}
          <div>
            <label className={labelClasses}>Remarks</label>
            <textarea
              placeholder="Additional notes (optional)"
              value={formData.remarks}
              onChange={(e) => handleChange('remarks', e.target.value)}
              rows={2}
              className={cn(inputClasses, 'resize-none')}
            />
          </div>

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
              disabled={isLoading}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2',
                isDark
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Apply Hedge
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForwardHedgeModal;
