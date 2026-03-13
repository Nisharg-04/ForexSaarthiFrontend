// ═══════════════════════════════════════════════════════════════════════════════
// CANCEL FORWARD CONTRACT MODAL
// Modal for cancelling an active forward contract
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { cn } from '../../../utils/helpers';
import { useCancelForwardMutation } from '../api/forwardApi';
import type {
  ForwardContract,
  CancelForwardFormData,
  CancelForwardFormErrors,
} from '../types';
import {
  formatForwardAmount,
  formatINRAmount,
  formatRate,
  formatForwardDate,
  calculateGainLoss,
} from '../forwardUtils';

// ─────────────────────────────────────────────────────────────────────────────────
// PROPS INTERFACE
// ─────────────────────────────────────────────────────────────────────────────────
interface CancelForwardModalProps {
  contract: ForwardContract | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  isDark?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────────
// CANCELLATION REASONS
// ─────────────────────────────────────────────────────────────────────────────────
const CANCELLATION_REASONS = [
  { value: 'EXPOSURE_CANCELLED', label: 'Underlying exposure cancelled' },
  { value: 'BUSINESS_DECISION', label: 'Business decision' },
  { value: 'RATE_MISMATCH', label: 'Rate no longer favorable' },
  { value: 'COUNTERPARTY_ISSUE', label: 'Counterparty issue' },
  { value: 'REGULATORY', label: 'Regulatory requirement' },
  { value: 'OTHER', label: 'Other reason' },
];

// ─────────────────────────────────────────────────────────────────────────────────
// INITIAL FORM DATA
// ─────────────────────────────────────────────────────────────────────────────────
const getInitialFormData = (): CancelForwardFormData => ({
  reason: '',
  closingRate: '',
  remarks: '',
});

// ─────────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────────
export const CancelForwardModal: React.FC<CancelForwardModalProps> = ({
  contract,
  isOpen,
  onClose,
  onSuccess,
  isDark = false,
}) => {
  const [formData, setFormData] = useState<CancelForwardFormData>(getInitialFormData());
  const [errors, setErrors] = useState<CancelForwardFormErrors>({});

  const [cancelForward, { isLoading }] = useCancelForwardMutation();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && contract) {
      setFormData(getInitialFormData());
      setErrors({});
    }
  }, [isOpen, contract]);

  // Calculate cancellation cost preview
  const cancellationCost = useMemo(() => {
    if (!contract) return { amount: 0, isGain: false };
    
    const closingRate = parseFloat(formData.closingRate);
    if (isNaN(closingRate) || closingRate <= 0) return { amount: 0, isGain: false };

    const cost = calculateGainLoss(
      contract.contractAmount,
      contract.forwardRate,
      closingRate,
      contract.exposureType || 'RECEIVABLE'
    );

    return {
      amount: cost,
      isGain: cost > 0,
      isNeutral: cost === 0,
    };
  }, [contract, formData.closingRate]);

  // ─────────────────────────────────────────────────────────────────────────────
  // VALIDATION
  // ─────────────────────────────────────────────────────────────────────────────
  const validate = useCallback((): boolean => {
    const newErrors: CancelForwardFormErrors = {};

    // Cancellation Reason
    if (!formData.reason) {
      newErrors.reason = 'Please select a cancellation reason';
    }

    // Closing Rate (optional but must be valid if provided)
    if (formData.closingRate) {
      const rate = parseFloat(formData.closingRate);
      if (isNaN(rate) || rate <= 0) {
        newErrors.closingRate = 'Enter a valid closing rate';
      } else if (rate > 1000) {
        newErrors.closingRate = 'Closing rate seems too high';
      }
    }

    // Remarks required for "OTHER" reason
    if (formData.reason === 'OTHER' && !formData.remarks?.trim()) {
      newErrors.remarks = 'Please specify the reason for cancellation';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // ─────────────────────────────────────────────────────────────────────────────
  // SUBMIT HANDLER
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contract || !validate()) return;

    try {
      await cancelForward({
        id: contract.id,
        data: {
          reason: formData.reason,
          closingRate: formData.closingRate ? parseFloat(formData.closingRate) : undefined,
        },
      }).unwrap();

      onSuccess?.();
      onClose();
    } catch (error: any) {
      setErrors({
        general: error?.data?.message || 'Failed to cancel forward contract',
      });
    }
  };

  // Field change handler
  const handleChange = (field: keyof CancelForwardFormData, value: string) => {
    setFormData((prev: CancelForwardFormData) => ({ ...prev, [field]: value }));
    if (errors[field as keyof CancelForwardFormErrors]) {
      setErrors((prev: CancelForwardFormErrors) => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof CancelForwardFormErrors];
        return newErrors;
      });
    }
  };

  if (!isOpen || !contract) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-md mx-4 rounded-xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col',
          isDark ? 'bg-slate-900' : 'bg-white'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'flex items-center justify-between px-6 py-4 border-b',
            isDark ? 'border-slate-800' : 'border-slate-200'
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'p-2 rounded-lg',
                isDark ? 'bg-amber-900/30' : 'bg-amber-100'
              )}
            >
              <AlertTriangle className={cn('w-5 h-5', isDark ? 'text-amber-400' : 'text-amber-600')} />
            </div>
            <div>
              <h2 className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                Cancel Forward Contract
              </h2>
              <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                {contract.contractReference}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Warning Banner */}
          <div
            className={cn(
              'flex items-start gap-3 p-4 rounded-lg mb-6',
              isDark ? 'bg-amber-900/20' : 'bg-amber-50'
            )}
          >
            <AlertTriangle className={cn('w-5 h-5 flex-shrink-0 mt-0.5', isDark ? 'text-amber-400' : 'text-amber-600')} />
            <div>
              <p className={cn('text-sm font-medium', isDark ? 'text-amber-400' : 'text-amber-800')}>
                This action cannot be undone
              </p>
              <p className={cn('text-xs mt-1', isDark ? 'text-amber-400/70' : 'text-amber-700')}>
                Cancelling will permanently mark this contract as cancelled. 
                If applicable, any cancellation charges will need to be recorded separately.
              </p>
            </div>
          </div>

          {/* Contract Info */}
          <div
            className={cn(
              'p-4 rounded-lg border mb-6',
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
            )}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Amount
                </p>
                <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                  {formatForwardAmount(contract.contractAmount, contract.currency)}
                </p>
              </div>
              <div>
                <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Forward Rate
                </p>
                <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                  {formatRate(contract.forwardRate)}
                </p>
              </div>
              <div>
                <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Bank
                </p>
                <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                  {contract.bankName}
                </p>
              </div>
              <div>
                <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Settlement Date
                </p>
                <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                  {formatForwardDate(contract.settlementDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {errors.general && (
            <div
              className={cn(
                'flex items-center gap-2 p-3 rounded-lg mb-4',
                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              )}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Cancellation Reason */}
            <div>
              <label
                className={cn('block text-sm font-medium mb-1.5', isDark ? 'text-slate-300' : 'text-slate-700')}
              >
                Cancellation Reason *
              </label>
              <select
                value={formData.reason}
                onChange={(e) => handleChange('reason', e.target.value)}
                className={cn(
                  'w-full h-10 px-3 text-sm rounded-lg border transition-colors',
                  errors.reason
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : isDark
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-cyan-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500',
                  'focus:outline-none focus:ring-1'
                )}
              >
                <option value="">Select reason...</option>
                {CANCELLATION_REASONS.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
              {errors.reason && (
                <p className="mt-1 text-xs text-red-500">{errors.reason}</p>
              )}
            </div>

            {/* Closing Rate (Optional) */}
            <div>
              <label
                className={cn('block text-sm font-medium mb-1.5', isDark ? 'text-slate-300' : 'text-slate-700')}
              >
                Closing/Cancellation Rate (INR/{contract.currency})
              </label>
              <div className="relative">
                <TrendingUp
                  className={cn(
                    'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  )}
                />
                <input
                  type="number"
                  step="0.0001"
                  value={formData.closingRate}
                  onChange={(e) => handleChange('closingRate', e.target.value)}
                  placeholder="Optional - for P&L calculation"
                  className={cn(
                    'w-full h-10 pl-10 pr-3 text-sm rounded-lg border transition-colors',
                    errors.closingRate
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : isDark
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-cyan-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500',
                    'focus:outline-none focus:ring-1'
                  )}
                />
              </div>
              {errors.closingRate && (
                <p className="mt-1 text-xs text-red-500">{errors.closingRate}</p>
              )}
              <p className={cn('text-xs mt-1', isDark ? 'text-slate-500' : 'text-slate-400')}>
                Enter if bank charged a cancellation rate
              </p>
            </div>

            {/* P&L Preview */}
            {formData.closingRate && cancellationCost.amount !== 0 && (
              <div
                className={cn(
                  'p-4 rounded-lg border',
                  cancellationCost.isGain
                    ? isDark
                      ? 'bg-green-900/20 border-green-800'
                      : 'bg-green-50 border-green-200'
                    : isDark
                      ? 'bg-red-900/20 border-red-800'
                      : 'bg-red-50 border-red-200'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {cancellationCost.isGain ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    )}
                    <span
                      className={cn(
                        'text-sm font-medium',
                        cancellationCost.isGain ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      Cancellation {cancellationCost.isGain ? 'Gain' : 'Cost'}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'text-lg font-bold',
                      cancellationCost.isGain ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {cancellationCost.isGain ? '+' : ''}
                    {formatINRAmount(cancellationCost.amount)}
                  </span>
                </div>
              </div>
            )}

            {/* Remarks */}
            <div>
              <label
                className={cn('block text-sm font-medium mb-1.5', isDark ? 'text-slate-300' : 'text-slate-700')}
              >
                Remarks {formData.reason === 'OTHER' && '*'}
              </label>
              <div className="relative">
                <FileText
                  className={cn(
                    'absolute left-3 top-3 w-4 h-4',
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  )}
                />
                <textarea
                  value={formData.remarks}
                  onChange={(e) => handleChange('remarks', e.target.value)}
                  placeholder={formData.reason === 'OTHER' ? "Please specify..." : "Additional notes..."}
                  rows={3}
                  className={cn(
                    'w-full pl-10 pr-3 py-2 text-sm rounded-lg border transition-colors resize-none',
                    errors.remarks
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : isDark
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-cyan-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500',
                    'focus:outline-none focus:ring-1',
                    isDark ? 'focus:ring-cyan-500' : 'focus:ring-teal-500'
                  )}
                />
              </div>
              {errors.remarks && (
                <p className="mt-1 text-xs text-red-500">{errors.remarks}</p>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div
          className={cn(
            'flex items-center justify-end gap-3 px-6 py-4 border-t',
            isDark ? 'border-slate-800' : 'border-slate-200'
          )}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              isDark
                ? 'text-slate-300 hover:bg-slate-800'
                : 'text-slate-700 hover:bg-slate-100'
            )}
          >
            Keep Contract
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              isDark
                ? 'bg-amber-600 text-white hover:bg-amber-700 disabled:bg-amber-800'
                : 'bg-amber-600 text-white hover:bg-amber-700 disabled:bg-amber-400'
            )}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Cancelling...' : 'Cancel Contract'}
          </button>
        </div>
      </div>
    </div>
  );
};
