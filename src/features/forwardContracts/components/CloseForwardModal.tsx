// ═══════════════════════════════════════════════════════════════════════════════
// CLOSE FORWARD CONTRACT MODAL
// Modal for closing a forward contract with closing rate entry
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  X,
  TrendingUp,
  Calendar,
  Loader2,
  AlertCircle,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../../../utils/helpers';
import { useCloseForwardMutation } from '../api/forwardApi';
import type { ForwardContract, CloseForwardFormData, CloseForwardFormErrors } from '../types';
import {
  calculateGainLoss,
  formatForwardRate,
  formatINRAmount,
  validateClosingRate,
  calculateGainLossPercentage,
  formatDate,
} from '../forwardUtils';
import { FORWARD_VALIDATION } from '../forwardConstants';

interface CloseForwardModalProps {
  contract: ForwardContract | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  isDark?: boolean;
}

const getInitialFormData = (): CloseForwardFormData => ({
  closingRate: '',
  closedDate: new Date().toISOString().split('T')[0],
  remarks: '',
});

export const CloseForwardModal: React.FC<CloseForwardModalProps> = ({
  contract,
  isOpen,
  onClose,
  onSuccess,
  isDark = false,
}) => {
  const [formData, setFormData] = useState<CloseForwardFormData>(getInitialFormData());
  const [errors, setErrors] = useState<CloseForwardFormErrors>({});

  const [closeForward, { isLoading }] = useCloseForwardMutation();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setErrors({});
    }
  }, [isOpen]);

  // Calculate P&L preview
  const plPreview = useMemo(() => {
    if (!contract || !formData.closingRate) return null;
    const closingRate = parseFloat(formData.closingRate);
    const gainLoss = calculateGainLoss(
      contract.forwardRate,
      closingRate,
      contract.contractAmount,
      contract.exposureType
    );
    const percentage = calculateGainLossPercentage(gainLoss, contract.baseAmount);
    return { gainLoss, percentage };
  }, [formData.closingRate, contract]);

  const validate = useCallback((): boolean => {
    const newErrors: CloseForwardFormErrors = {};

    // Closing Rate
    const rate = parseFloat(formData.closingRate);
    const rateValidation = validateClosingRate(rate);
    if (!rateValidation.valid) {
      newErrors.closingRate = rateValidation.error;
    }

    // Closed Date
    if (!formData.closedDate) {
      newErrors.closedDate = 'Closing date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contract || !validate()) return;

    try {
      await closeForward({
        id: contract.id,
        data: {
          closingRate: parseFloat(formData.closingRate),
          closedDate: formData.closedDate,
          remarks: formData.remarks.trim() || undefined,
        },
      }).unwrap();

      onSuccess?.();
      onClose();
    } catch (error: any) {
      setErrors({
        general: error?.data?.message || 'Failed to close forward contract',
      });
    }
  };

  const handleChange = (field: keyof CloseForwardFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof CloseForwardFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen || !contract) return null;

  const { gainLoss, percentage } = plPreview || { gainLoss: 0, percentage: 0 };

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
          'relative w-full max-w-lg mx-4 rounded-xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col',
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
              <TrendingUp className={cn('w-5 h-5', isDark ? 'text-amber-400' : 'text-amber-600')} />
            </div>
            <div>
              <h2 className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                Close Forward Contract
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
          {/* Contract Info Card */}
          <div
            className={cn(
              'p-4 rounded-lg border mb-6',
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
            )}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Booked Rate
                  </p>
                  <p className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                    {formatForwardRate(contract.forwardRate)}
                  </p>
                </div>
                <ArrowRight className={cn('w-5 h-5', isDark ? 'text-slate-500' : 'text-slate-400')} />
                <div>
                  <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Closing Rate
                  </p>
                  <p className={cn('text-lg font-semibold', isDark ? 'text-cyan-400' : 'text-teal-600')}>
                    {formData.closingRate ? formatForwardRate(parseFloat(formData.closingRate)) : '-'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t" style={{ borderColor: isDark ? '#1e293b' : '#e2e8f0' }}>
                <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Contract Amount
                </p>
                <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                  {contract.currency} {contract.contractAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
            {/* Closing Rate */}
            <div>
              <label
                className={cn('block text-sm font-medium mb-1.5', isDark ? 'text-slate-300' : 'text-slate-700')}
              >
                Closing Rate (INR/{contract.currency}) *
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
                  placeholder={`e.g., ${formatForwardRate(contract.forwardRate)}`}
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
            </div>

            {/* P&L Preview */}
            {plPreview && (
              <div
                className={cn(
                  'p-4 rounded-lg border',
                  gainLoss >= 0
                    ? isDark
                      ? 'bg-green-900/20 border-green-800'
                      : 'bg-green-50 border-green-200'
                    : isDark
                      ? 'bg-red-900/20 border-red-800'
                      : 'bg-red-50 border-red-200'
                )}
              >
                <p className={cn('text-xs', gainLoss >= 0 ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-red-400' : 'text-red-600'))}>
                  Estimated Gain/Loss
                </p>
                <div className="flex items-baseline justify-between mt-1">
                  <p
                    className={cn(
                      'text-2xl font-bold',
                      gainLoss >= 0
                        ? isDark
                          ? 'text-green-400'
                          : 'text-green-600'
                        : isDark
                          ? 'text-red-400'
                          : 'text-red-600'
                    )}
                  >
                    {formatINRAmount(gainLoss)}
                  </p>
                  <p className={cn('text-sm font-semibold', gainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
                    {(gainLoss >= 0 ? '+' : '')}{percentage.toFixed(2)}%
                  </p>
                </div>
              </div>
            )}

            {/* Closing Date */}
            <div>
              <label
                className={cn('block text-sm font-medium mb-1.5', isDark ? 'text-slate-300' : 'text-slate-700')}
              >
                Closing Date *
              </label>
              <div className="relative">
                <Calendar
                  className={cn(
                    'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  )}
                />
                <input
                  type="date"
                  value={formData.closedDate}
                  onChange={(e) => handleChange('closedDate', e.target.value)}
                  className={cn(
                    'w-full h-10 pl-10 pr-3 text-sm rounded-lg border transition-colors',
                    errors.closedDate
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : isDark
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-cyan-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500',
                    'focus:outline-none focus:ring-1'
                  )}
                />
              </div>
              {errors.closedDate && (
                <p className="mt-1 text-xs text-red-500">{errors.closedDate}</p>
              )}
            </div>

            {/* Remarks */}
            <div>
              <label
                className={cn('block text-sm font-medium mb-1.5', isDark ? 'text-slate-300' : 'text-slate-700')}
              >
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => handleChange('remarks', e.target.value)}
                placeholder="Optional closing notes..."
                rows={3}
                maxLength={FORWARD_VALIDATION.remarksMaxLength}
                className={cn(
                  'w-full px-3 py-2 text-sm rounded-lg border transition-colors resize-none',
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-cyan-500'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500',
                  'focus:outline-none focus:ring-1',
                  isDark ? 'focus:ring-cyan-500' : 'focus:ring-teal-500'
                )}
              />
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
            Cancel
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
            {isLoading ? 'Closing...' : 'Close Forward'}
          </button>
        </div>
      </div>
    </div>
  );
};
