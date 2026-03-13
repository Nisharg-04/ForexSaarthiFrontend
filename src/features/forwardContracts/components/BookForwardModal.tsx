// ═══════════════════════════════════════════════════════════════════════════════
// BOOK FORWARD CONTRACT MODAL
// Modal for booking a new forward contract against an exposure
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  X,
  DollarSign,
  Building2,
  Calendar,
  Loader2,
  AlertCircle,
  TrendingUp,
  FileText,
  Hash,
} from 'lucide-react';
import { cn } from '../../../utils/helpers';
import { useBookForwardMutation } from '../api/forwardApi';
import type { BookForwardFormData, BookForwardFormErrors, ExposureBriefForBooking } from '../types';
import { COMMON_BANKS, FORWARD_VALIDATION } from '../forwardConstants';
import {
  formatForwardAmount,
  formatINRAmount,
  validateContractAmount,
  validateForwardRate,
  validateSettlementDate,
} from '../forwardUtils';

// ─────────────────────────────────────────────────────────────────────────────────
// PROPS INTERFACE
// ─────────────────────────────────────────────────────────────────────────────────
interface BookForwardModalProps {
  exposure: ExposureBriefForBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  isDark?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────────
// INITIAL FORM DATA
// ─────────────────────────────────────────────────────────────────────────────────
const getInitialFormData = (exposure: ExposureBriefForBooking | null): BookForwardFormData => ({
  exposureId: exposure?.id || '',
  contractAmount: '',
  forwardRate: '',
  bankName: '',
  contractReference: '',
  contractDate: new Date().toISOString().split('T')[0],
  settlementDate: exposure?.maturityDate?.split('T')[0] || '',
  remarks: '',
});

// ─────────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────────
export const BookForwardModal: React.FC<BookForwardModalProps> = ({
  exposure,
  isOpen,
  onClose,
  onSuccess,
  isDark = false,
}) => {
  const [formData, setFormData] = useState<BookForwardFormData>(getInitialFormData(exposure));
  const [errors, setErrors] = useState<BookForwardFormErrors>({});
  const [showBankSuggestions, setShowBankSuggestions] = useState(false);

  const [bookForward, { isLoading }] = useBookForwardMutation();

  // Get unhedged amount from exposure
  const unhedgedAmount = exposure?.unhedgedAmount || 0;
  const currency = exposure?.currency || 'USD';

  // Reset form when modal opens or exposure changes
  useEffect(() => {
    if (isOpen && exposure) {
      setFormData(getInitialFormData(exposure));
      setErrors({});
    }
  }, [isOpen, exposure]);

  // Calculate hedged value preview
  const hedgedValuePreview = useMemo(() => {
    const amount = parseFloat(formData.contractAmount) || 0;
    const rate = parseFloat(formData.forwardRate) || 0;
    return amount * rate;
  }, [formData.contractAmount, formData.forwardRate]);

  // Filter bank suggestions
  const filteredBanks = useMemo(() => {
    if (!formData.bankName) return COMMON_BANKS;
    const search = formData.bankName.toLowerCase();
    return COMMON_BANKS.filter((bank: string) => bank.toLowerCase().includes(search));
  }, [formData.bankName]);

  // ─────────────────────────────────────────────────────────────────────────────
  // VALIDATION
  // ─────────────────────────────────────────────────────────────────────────────
  const validate = useCallback((): boolean => {
    const newErrors: BookForwardFormErrors = {};

    // Contract Amount
    const amount = parseFloat(formData.contractAmount);
    const amountValidation = validateContractAmount(amount, unhedgedAmount);
    if (!amountValidation.valid) {
      newErrors.contractAmount = amountValidation.error;
    }

    // Forward Rate
    const rate = parseFloat(formData.forwardRate);
    const rateValidation = validateForwardRate(rate);
    if (!rateValidation.valid) {
      newErrors.forwardRate = rateValidation.error;
    }

    // Bank Name
    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }

    // Contract Reference
    if (!formData.contractReference.trim()) {
      newErrors.contractReference = 'Contract reference is required';
    } else if (formData.contractReference.length < FORWARD_VALIDATION.contractReferenceMinLength) {
      newErrors.contractReference = `Reference must be at least ${FORWARD_VALIDATION.contractReferenceMinLength} characters`;
    }

    // Contract Date
    if (!formData.contractDate) {
      newErrors.contractDate = 'Contract date is required';
    }

    // Settlement Date
    if (!formData.settlementDate) {
      newErrors.settlementDate = 'Settlement date is required';
    } else if (formData.contractDate) {
      const settlementValidation = validateSettlementDate(formData.settlementDate, formData.contractDate);
      if (!settlementValidation.valid) {
        newErrors.settlementDate = settlementValidation.error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, unhedgedAmount]);

  // ─────────────────────────────────────────────────────────────────────────────
  // SUBMIT HANDLER
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await bookForward({
        exposureId: formData.exposureId,
        contractAmount: parseFloat(formData.contractAmount),
        forwardRate: parseFloat(formData.forwardRate),
        bankName: formData.bankName.trim(),
        contractReference: formData.contractReference.trim(),
        contractDate: formData.contractDate,
        settlementDate: formData.settlementDate,
        remarks: formData.remarks.trim() || undefined,
      }).unwrap();

      onSuccess?.();
      onClose();
    } catch (error: any) {
      setErrors({
        general: error?.data?.message || 'Failed to book forward contract',
      });
    }
  };

  // Field change handler
  const handleChange = (field: keyof BookForwardFormData, value: string) => {
    setFormData((prev: BookForwardFormData) => ({ ...prev, [field]: value }));
    if (errors[field as keyof BookForwardFormErrors]) {
      setErrors((prev: BookForwardFormErrors) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

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
                isDark ? 'bg-cyan-900/30' : 'bg-teal-100'
              )}
            >
              <TrendingUp className={cn('w-5 h-5', isDark ? 'text-cyan-400' : 'text-teal-600')} />
            </div>
            <div>
              <h2 className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                Book Forward Contract
              </h2>
              {exposure && (
                <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  {exposure.invoiceNumber} • {exposure.partyName}
                </p>
              )}
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
          {/* Exposure Info Card */}
          {exposure && (
            <div
              className={cn(
                'p-4 rounded-lg border mb-6',
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
              )}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Total Exposure
                  </p>
                  <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                    {formatForwardAmount(exposure.totalAmount, currency)}
                  </p>
                </div>
                <div>
                  <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Already Hedged
                  </p>
                  <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                    {formatForwardAmount(exposure.hedgedAmount, currency)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Available for Hedging
                  </p>
                  <p className={cn('text-lg font-semibold', isDark ? 'text-cyan-400' : 'text-teal-600')}>
                    {formatForwardAmount(unhedgedAmount, currency)}
                  </p>
                </div>
              </div>
            </div>
          )}

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
            {/* Contract Amount */}
            <div>
              <label
                className={cn('block text-sm font-medium mb-1.5', isDark ? 'text-slate-300' : 'text-slate-700')}
              >
                Contract Amount ({currency}) *
              </label>
              <div className="relative">
                <DollarSign
                  className={cn(
                    'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  )}
                />
                <input
                  type="number"
                  step="0.01"
                  value={formData.contractAmount}
                  onChange={(e) => handleChange('contractAmount', e.target.value)}
                  placeholder={`Max: ${unhedgedAmount.toLocaleString()}`}
                  className={cn(
                    'w-full h-10 pl-10 pr-3 text-sm rounded-lg border transition-colors',
                    errors.contractAmount
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : isDark
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-cyan-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500',
                    'focus:outline-none focus:ring-1'
                  )}
                />
              </div>
              {errors.contractAmount && (
                <p className="mt-1 text-xs text-red-500">{errors.contractAmount}</p>
              )}
            </div>

            {/* Forward Rate */}
            <div>
              <label
                className={cn('block text-sm font-medium mb-1.5', isDark ? 'text-slate-300' : 'text-slate-700')}
              >
                Forward Rate (INR/{currency}) *
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
                  value={formData.forwardRate}
                  onChange={(e) => handleChange('forwardRate', e.target.value)}
                  placeholder="e.g., 83.5000"
                  className={cn(
                    'w-full h-10 pl-10 pr-3 text-sm rounded-lg border transition-colors',
                    errors.forwardRate
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : isDark
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-cyan-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500',
                    'focus:outline-none focus:ring-1'
                  )}
                />
              </div>
              {errors.forwardRate && (
                <p className="mt-1 text-xs text-red-500">{errors.forwardRate}</p>
              )}
            </div>

            {/* Hedged Value Preview */}
            {hedgedValuePreview > 0 && (
              <div
                className={cn(
                  'p-3 rounded-lg border',
                  isDark ? 'bg-cyan-900/20 border-cyan-800' : 'bg-teal-50 border-teal-200'
                )}
              >
                <p className={cn('text-xs', isDark ? 'text-cyan-400' : 'text-teal-600')}>
                  Hedged Value (INR)
                </p>
                <p className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                  {formatINRAmount(hedgedValuePreview)}
                </p>
              </div>
            )}

            {/* Bank Name */}
            <div className="relative">
              <label
                className={cn('block text-sm font-medium mb-1.5', isDark ? 'text-slate-300' : 'text-slate-700')}
              >
                Bank Name *
              </label>
              <div className="relative">
                <Building2
                  className={cn(
                    'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  )}
                />
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                  onFocus={() => setShowBankSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowBankSuggestions(false), 200)}
                  placeholder="Select or type bank name"
                  className={cn(
                    'w-full h-10 pl-10 pr-3 text-sm rounded-lg border transition-colors',
                    errors.bankName
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : isDark
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-cyan-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500',
                    'focus:outline-none focus:ring-1'
                  )}
                />
              </div>
              {showBankSuggestions && filteredBanks.length > 0 && (
                <div
                  className={cn(
                    'absolute z-10 w-full mt-1 rounded-lg border shadow-lg max-h-40 overflow-y-auto',
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                  )}
                >
                  {filteredBanks.map((bank: string) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => {
                        handleChange('bankName', bank);
                        setShowBankSuggestions(false);
                      }}
                      className={cn(
                        'w-full px-3 py-2 text-left text-sm transition-colors',
                        isDark
                          ? 'hover:bg-slate-700 text-slate-300'
                          : 'hover:bg-slate-50 text-slate-700'
                      )}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              )}
              {errors.bankName && (
                <p className="mt-1 text-xs text-red-500">{errors.bankName}</p>
              )}
            </div>

            {/* Contract Reference */}
            <div>
              <label
                className={cn('block text-sm font-medium mb-1.5', isDark ? 'text-slate-300' : 'text-slate-700')}
              >
                Contract Reference *
              </label>
              <div className="relative">
                <Hash
                  className={cn(
                    'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  )}
                />
                <input
                  type="text"
                  value={formData.contractReference}
                  onChange={(e) => handleChange('contractReference', e.target.value)}
                  placeholder="Bank contract number"
                  className={cn(
                    'w-full h-10 pl-10 pr-3 text-sm rounded-lg border transition-colors',
                    errors.contractReference
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : isDark
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-cyan-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500',
                    'focus:outline-none focus:ring-1'
                  )}
                />
              </div>
              {errors.contractReference && (
                <p className="mt-1 text-xs text-red-500">{errors.contractReference}</p>
              )}
            </div>

            {/* Dates Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Contract Date */}
              <div>
                <label
                  className={cn('block text-sm font-medium mb-1.5', isDark ? 'text-slate-300' : 'text-slate-700')}
                >
                  Contract Date *
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
                    value={formData.contractDate}
                    onChange={(e) => handleChange('contractDate', e.target.value)}
                    className={cn(
                      'w-full h-10 pl-10 pr-3 text-sm rounded-lg border transition-colors',
                      errors.contractDate
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : isDark
                          ? 'bg-slate-800 border-slate-700 text-white focus:border-cyan-500'
                          : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500',
                      'focus:outline-none focus:ring-1'
                    )}
                  />
                </div>
                {errors.contractDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.contractDate}</p>
                )}
              </div>

              {/* Settlement Date */}
              <div>
                <label
                  className={cn('block text-sm font-medium mb-1.5', isDark ? 'text-slate-300' : 'text-slate-700')}
                >
                  Settlement Date *
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
                    value={formData.settlementDate}
                    onChange={(e) => handleChange('settlementDate', e.target.value)}
                    className={cn(
                      'w-full h-10 pl-10 pr-3 text-sm rounded-lg border transition-colors',
                      errors.settlementDate
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : isDark
                          ? 'bg-slate-800 border-slate-700 text-white focus:border-cyan-500'
                          : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500',
                      'focus:outline-none focus:ring-1'
                    )}
                  />
                </div>
                {errors.settlementDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.settlementDate}</p>
                )}
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label
                className={cn('block text-sm font-medium mb-1.5', isDark ? 'text-slate-300' : 'text-slate-700')}
              >
                Remarks
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
                  placeholder="Optional notes..."
                  rows={2}
                  maxLength={FORWARD_VALIDATION.remarksMaxLength}
                  className={cn(
                    'w-full pl-10 pr-3 py-2 text-sm rounded-lg border transition-colors resize-none',
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-cyan-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500',
                    'focus:outline-none focus:ring-1',
                    isDark ? 'focus:ring-cyan-500' : 'focus:ring-teal-500'
                  )}
                />
              </div>
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
                ? 'bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-cyan-800'
                : 'bg-teal-600 text-white hover:bg-teal-700 disabled:bg-teal-400'
            )}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Booking...' : 'Book Forward'}
          </button>
        </div>
      </div>
    </div>
  );
};
