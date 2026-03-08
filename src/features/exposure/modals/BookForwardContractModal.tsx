// ═══════════════════════════════════════════════════════════════════════════════
// BOOK FORWARD CONTRACT MODAL
// Modal for booking a forward contract against an exposure
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  X,
  FileText,
  DollarSign,
  Building2,
  Calendar,
  Loader2,
  AlertCircle,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { cn } from '../../../utils/helpers';
import { useBookForwardContractMutation } from '../api/hedgingApi';
import { formatHedgeAmount, formatRate, formatHedgeDate } from '../hedgingUtils';
import type { BookForwardFormData, BookForwardFormErrors, ExposureBriefInfo } from '../hedgingTypes';
import type { Exposure } from '../types';
import { FORWARD_CONTRACT_VALIDATION, COMMON_BANKS } from '../hedgingConstants';

// ─────────────────────────────────────────────────────────────────────────────────
// PROPS INTERFACE
// ─────────────────────────────────────────────────────────────────────────────────
interface BookForwardContractModalProps {
  exposure: Exposure | ExposureBriefInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  isDark?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────────
// INITIAL FORM DATA
// ─────────────────────────────────────────────────────────────────────────────────
const getInitialFormData = (exposure: Exposure | ExposureBriefInfo | null): BookForwardFormData => ({
  exposureId: exposure?.id || '',
  hedgeAmount: '',
  forwardRate: '',
  contractNumber: '',
  bankName: '',
  contractDate: new Date().toISOString().split('T')[0],
  maturityDate: exposure?.maturityDate?.split('T')[0] || '',
  premium: '',
  remarks: '',
});

// ─────────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────────
export const BookForwardContractModal: React.FC<BookForwardContractModalProps> = ({
  exposure,
  isOpen,
  onClose,
  onSuccess,
  isDark = false,
}) => {
  const [formData, setFormData] = useState<BookForwardFormData>(getInitialFormData(exposure));
  const [errors, setErrors] = useState<BookForwardFormErrors>({});
  const [showBankSuggestions, setShowBankSuggestions] = useState(false);

  const [bookForward, { isLoading }] = useBookForwardContractMutation();

  // Get unhedged amount from exposure
  const unhedgedAmount = useMemo(() => {
    if (!exposure) return 0;
    return 'unhedgedAmount' in exposure ? exposure.unhedgedAmount : 0;
  }, [exposure]);

  const currency = exposure?.currency || 'USD';
  const invoiceNumber = 'invoiceNumber' in (exposure || {}) ? (exposure as any).invoiceNumber : '';

  // Reset form when modal opens or exposure changes
  useEffect(() => {
    if (isOpen && exposure) {
      setFormData(getInitialFormData(exposure));
      setErrors({});
    }
  }, [isOpen, exposure]);

  // Calculate hedged value preview
  const hedgedValuePreview = useMemo(() => {
    const amount = parseFloat(formData.hedgeAmount) || 0;
    const rate = parseFloat(formData.forwardRate) || 0;
    return amount * rate;
  }, [formData.hedgeAmount, formData.forwardRate]);

  // Filter bank suggestions
  const filteredBanks = useMemo(() => {
    if (!formData.bankName) return COMMON_BANKS;
    const search = formData.bankName.toLowerCase();
    return COMMON_BANKS.filter((bank) => bank.toLowerCase().includes(search));
  }, [formData.bankName]);

  // ─────────────────────────────────────────────────────────────────────────────
  // VALIDATION
  // ─────────────────────────────────────────────────────────────────────────────
  const validateForm = useCallback((): BookForwardFormErrors => {
    const newErrors: BookForwardFormErrors = {};
    const amount = parseFloat(formData.hedgeAmount);
    const rate = parseFloat(formData.forwardRate);
    const premium = formData.premium ? parseFloat(formData.premium) : undefined;

    // Hedge amount validation
    if (!formData.hedgeAmount || isNaN(amount)) {
      newErrors.hedgeAmount = 'Hedge amount is required';
    } else if (amount < FORWARD_CONTRACT_VALIDATION.hedgeAmount.min) {
      newErrors.hedgeAmount = `Minimum amount is ${FORWARD_CONTRACT_VALIDATION.hedgeAmount.min}`;
    } else if (amount > unhedgedAmount) {
      newErrors.hedgeAmount = `Cannot exceed unhedged amount (${formatHedgeAmount(unhedgedAmount, currency)})`;
    }

    // Forward rate validation
    if (!formData.forwardRate || isNaN(rate)) {
      newErrors.forwardRate = 'Forward rate is required';
    } else if (rate < FORWARD_CONTRACT_VALIDATION.forwardRate.min) {
      newErrors.forwardRate = 'Invalid forward rate';
    } else if (rate > FORWARD_CONTRACT_VALIDATION.forwardRate.max) {
      newErrors.forwardRate = 'Forward rate too high';
    }

    // Contract number validation
    if (!formData.contractNumber.trim()) {
      newErrors.contractNumber = 'Contract number is required';
    } else if (formData.contractNumber.length > FORWARD_CONTRACT_VALIDATION.contractNumber.maxLength) {
      newErrors.contractNumber = `Maximum ${FORWARD_CONTRACT_VALIDATION.contractNumber.maxLength} characters`;
    }

    // Contract date validation
    if (!formData.contractDate) {
      newErrors.contractDate = 'Contract date is required';
    }

    // Maturity date validation (optional but must be after contract date if provided)
    if (formData.maturityDate && formData.contractDate) {
      if (formData.maturityDate < formData.contractDate) {
        newErrors.maturityDate = 'Maturity must be after contract date';
      }
    }

    // Premium validation (optional)
    if (premium !== undefined && !isNaN(premium)) {
      if (
        premium < FORWARD_CONTRACT_VALIDATION.premium.min ||
        premium > FORWARD_CONTRACT_VALIDATION.premium.max
      ) {
        newErrors.premium = `Premium must be between ${FORWARD_CONTRACT_VALIDATION.premium.min}% and ${FORWARD_CONTRACT_VALIDATION.premium.max}%`;
      }
    }

    return newErrors;
  }, [formData, unhedgedAmount, currency]);

  // ─────────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────
  const handleChange = useCallback((field: keyof BookForwardFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
  }, []);

  const handleBankSelect = useCallback((bank: string) => {
    setFormData((prev) => ({ ...prev, bankName: bank }));
    setShowBankSuggestions(false);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      if (!exposure) {
        setErrors({ general: 'No exposure selected' });
        return;
      }

      try {
        await bookForward({
          exposureId: exposure.id,
          hedgeAmount: parseFloat(formData.hedgeAmount),
          forwardRate: parseFloat(formData.forwardRate),
          contractNumber: formData.contractNumber.trim(),
          bankName: formData.bankName.trim() || undefined,
          contractDate: formData.contractDate || undefined,
          maturityDate: formData.maturityDate || undefined,
          premium: formData.premium ? parseFloat(formData.premium) : undefined,
          remarks: formData.remarks.trim() || undefined,
        }).unwrap();

        setFormData(getInitialFormData(null));
        setErrors({});
        onSuccess?.();
        onClose();
      } catch (error: any) {
        setErrors({
          general: error?.data?.message || 'Failed to book forward contract. Please try again.',
        });
      }
    },
    [formData, validateForm, bookForward, exposure, onSuccess, onClose]
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  if (!isOpen || !exposure) return null;

  const inputClasses = cn(
    'w-full px-3 py-2 text-sm rounded-lg border transition-colors',
    isDark
      ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-violet-500'
      : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-violet-500'
  );

  const labelClasses = cn('block text-xs font-medium mb-1.5', isDark ? 'text-slate-400' : 'text-slate-600');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-xl border shadow-xl',
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'flex items-center justify-between px-5 py-4 border-b flex-shrink-0',
            isDark ? 'border-slate-700' : 'border-slate-200'
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                isDark ? 'bg-violet-500/10' : 'bg-violet-50'
              )}
            >
              <FileText className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h2 className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                Book Forward Contract
              </h2>
              <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Invoice {invoiceNumber} • {currency}
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5">
          {/* Exposure Info Banner */}
          <div
            className={cn(
              'mb-5 p-3 rounded-lg border',
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
            )}
          >
            <div className="flex items-center justify-between text-sm">
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Unhedged Amount:</span>
              <span className={cn('font-semibold', isDark ? 'text-amber-400' : 'text-amber-600')}>
                {formatHedgeAmount(unhedgedAmount, currency)}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Hedge Amount */}
            <div>
              <label className={labelClasses}>
                Hedge Amount <span className="text-red-500">*</span>
              </label>
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
                  value={formData.hedgeAmount}
                  onChange={(e) => handleChange('hedgeAmount', e.target.value)}
                  placeholder="0.00"
                  className={cn(inputClasses, 'pl-9')}
                />
                <span
                  className={cn(
                    'absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium',
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  )}
                >
                  {currency}
                </span>
              </div>
              {errors.hedgeAmount && (
                <p className="mt-1 text-xs text-red-500">{errors.hedgeAmount}</p>
              )}
            </div>

            {/* Forward Rate */}
            <div>
              <label className={labelClasses}>
                Forward Rate <span className="text-red-500">*</span>
              </label>
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
                  value={formData.forwardRate}
                  onChange={(e) => handleChange('forwardRate', e.target.value)}
                  placeholder="83.5000"
                  className={cn(inputClasses, 'pl-9')}
                />
                <span
                  className={cn(
                    'absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium',
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  )}
                >
                  INR/{currency}
                </span>
              </div>
              {errors.forwardRate && <p className="mt-1 text-xs text-red-500">{errors.forwardRate}</p>}
            </div>

            {/* Contract Number */}
            <div>
              <label className={labelClasses}>
                Contract Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.contractNumber}
                onChange={(e) => handleChange('contractNumber', e.target.value)}
                placeholder="FWD-2026-001"
                className={inputClasses}
              />
              {errors.contractNumber && (
                <p className="mt-1 text-xs text-red-500">{errors.contractNumber}</p>
              )}
            </div>

            {/* Bank Name with Autocomplete */}
            <div className="relative">
              <label className={labelClasses}>Bank Name</label>
              <div className="relative">
                <Building2
                  className={cn(
                    'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  )}
                />
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => {
                    handleChange('bankName', e.target.value);
                    setShowBankSuggestions(true);
                  }}
                  onFocus={() => setShowBankSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowBankSuggestions(false), 200)}
                  placeholder="Select or type bank name"
                  className={cn(inputClasses, 'pl-9')}
                />
              </div>
              {showBankSuggestions && filteredBanks.length > 0 && (
                <div
                  className={cn(
                    'absolute z-10 w-full mt-1 max-h-40 overflow-y-auto rounded-lg border shadow-lg',
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                  )}
                >
                  {filteredBanks.slice(0, 8).map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => handleBankSelect(bank)}
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
              {errors.bankName && <p className="mt-1 text-xs text-red-500">{errors.bankName}</p>}
            </div>

            {/* Date Fields Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>
                  Contract Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar
                    className={cn(
                      'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    )}
                  />
                  <input
                    type="date"
                    value={formData.contractDate}
                    onChange={(e) => handleChange('contractDate', e.target.value)}
                    className={cn(inputClasses, 'pl-9')}
                  />
                </div>
                {errors.contractDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.contractDate}</p>
                )}
              </div>

              <div>
                <label className={labelClasses}>Maturity Date</label>
                <div className="relative">
                  <Calendar
                    className={cn(
                      'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    )}
                  />
                  <input
                    type="date"
                    value={formData.maturityDate}
                    onChange={(e) => handleChange('maturityDate', e.target.value)}
                    className={cn(inputClasses, 'pl-9')}
                  />
                </div>
                {errors.maturityDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.maturityDate}</p>
                )}
              </div>
            </div>

            {/* Premium */}
            <div>
              <label className={labelClasses}>Forward Premium/Discount (%)</label>
              <div className="relative">
                <Percent
                  className={cn(
                    'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  )}
                />
                <input
                  type="number"
                  step="0.01"
                  value={formData.premium}
                  onChange={(e) => handleChange('premium', e.target.value)}
                  placeholder="0.25"
                  className={cn(inputClasses, 'pl-9')}
                />
              </div>
              <p className={cn('mt-1 text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                Positive for premium, negative for discount
              </p>
              {errors.premium && <p className="mt-1 text-xs text-red-500">{errors.premium}</p>}
            </div>

            {/* Remarks */}
            <div>
              <label className={labelClasses}>Remarks</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => handleChange('remarks', e.target.value)}
                placeholder="Additional notes..."
                rows={2}
                className={inputClasses}
              />
              {errors.remarks && <p className="mt-1 text-xs text-red-500">{errors.remarks}</p>}
            </div>

            {/* Hedge Summary Preview */}
            {formData.hedgeAmount && formData.forwardRate && (
              <div
                className={cn(
                  'p-3 rounded-lg border',
                  isDark ? 'bg-violet-500/10 border-violet-500/20' : 'bg-violet-50 border-violet-200'
                )}
              >
                <h4
                  className={cn(
                    'text-xs font-semibold mb-2',
                    isDark ? 'text-violet-400' : 'text-violet-700'
                  )}
                >
                  Hedge Summary
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Amount in INR:</span>
                    <span className={cn('font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                      {formatHedgeAmount(hedgedValuePreview, 'INR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Forward Rate:</span>
                    <span className={cn('font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>
                      {formatRate(parseFloat(formData.forwardRate) || 0)} INR/{currency}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* General Error */}
            {errors.general && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-500">{errors.general}</span>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div
          className={cn(
            'flex items-center justify-end gap-3 px-5 py-4 border-t flex-shrink-0',
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
              'bg-violet-500 text-white hover:bg-violet-600 disabled:bg-violet-500/50'
            )}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Book Contract
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookForwardContractModal;
