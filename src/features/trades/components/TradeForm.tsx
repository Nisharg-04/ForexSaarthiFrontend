import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { cn } from '../../../utils/helpers';
import type { Trade, TradeFormData, TradeFormErrors } from '../types';
import { TradeType } from '../types';
import { TRADE_TYPE_OPTIONS } from '../tradeConstants';
import {
  validateTradeForm,
  hasTradeFormErrors,
  tradeToFormData,
  getEmptyTradeFormData,
} from '../tradeUtils';
import { useGetPartiesQuery } from '../../parties/api/partyApi';

interface TradeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TradeFormData) => Promise<void>;
  trade?: Trade | null;
  mode: 'create' | 'edit';
  isDark?: boolean;
  isLoading?: boolean;
}

export const TradeForm: React.FC<TradeFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  trade,
  mode,
  isDark = false,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<TradeFormData>(getEmptyTradeFormData());
  const [errors, setErrors] = useState<TradeFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch parties for dropdown
  const { data: partiesData, isLoading: isLoadingParties } = useGetPartiesQuery({ isActive: true });
  const parties = partiesData?.data || [];

  // Initialize form data when trade changes
  useEffect(() => {
    if (trade && mode === 'edit') {
      setFormData(tradeToFormData(trade));
    } else {
      setFormData(getEmptyTradeFormData());
    }
    setErrors({});
    setTouched({});
    setSubmitError(null);
  }, [trade, mode, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error on change
    if (errors[name as keyof TradeFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
    setSubmitError(null);
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate single field
    const fieldErrors = validateTradeForm(formData);
    if (fieldErrors[name as keyof TradeFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: fieldErrors[name as keyof TradeFormErrors],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateTradeForm(formData);
    setErrors(validationErrors);
    setTouched({
      partyId: true,
      tradeType: true,
      tradeReference: true,
      remarks: true,
    });

    if (hasTradeFormErrors(validationErrors)) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : 'An unexpected error occurred';
      setSubmitError(errorMessage || 'Failed to save trade. Please try again.');
    }
  };

  if (!isOpen) return null;

  const inputClasses = cn(
    'w-full px-3 py-2 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2',
    isDark
      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20'
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-teal-500/20'
  );

  const labelClasses = cn(
    'block text-sm font-medium mb-1.5',
    isDark ? 'text-slate-300' : 'text-slate-700'
  );

  const errorClasses = 'text-xs text-red-500 mt-1';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 transition-opacity',
          isDark ? 'bg-black bg-opacity-50' : 'bg-black bg-opacity-30'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={cn(
            'relative w-full max-w-lg rounded-lg shadow-lg',
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
            <h2 className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
              {mode === 'create' ? 'Create New Trade' : 'Edit Trade'}
            </h2>
            <button
              onClick={onClose}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              {/* Submit Error Banner */}
              {submitError && (
                <div
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 rounded-lg text-sm',
                    isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'
                  )}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Party Selection */}
              <div>
                <label htmlFor="partyId" className={labelClasses}>
                  Party <span className="text-red-500">*</span>
                </label>
                <select
                  id="partyId"
                  name="partyId"
                  value={formData.partyId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoadingParties}
                  className={cn(
                    inputClasses,
                    touched.partyId && errors.partyId && 'border-red-500 focus:border-red-500'
                  )}
                >
                  <option value="">Select a party...</option>
                  {parties.map((party) => (
                    <option key={party.id} value={party.id}>
                      {party.name} ({party.type})
                    </option>
                  ))}
                </select>
                {touched.partyId && errors.partyId && (
                  <p className={errorClasses}>{errors.partyId}</p>
                )}
              </div>

              {/* Trade Type */}
              <div>
                <label htmlFor="tradeType" className={labelClasses}>
                  Trade Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="tradeType"
                  name="tradeType"
                  value={formData.tradeType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={cn(
                    inputClasses,
                    touched.tradeType && errors.tradeType && 'border-red-500 focus:border-red-500'
                  )}
                >
                  {TRADE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {touched.tradeType && errors.tradeType && (
                  <p className={errorClasses}>{errors.tradeType}</p>
                )}
              </div>

              {/* Trade Reference */}
              <div>
                <label htmlFor="tradeReference" className={labelClasses}>
                  Trade Reference
                </label>
                <input
                  type="text"
                  id="tradeReference"
                  name="tradeReference"
                  value={formData.tradeReference}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., PO-2026-001"
                  maxLength={100}
                  className={cn(
                    inputClasses,
                    touched.tradeReference &&
                      errors.tradeReference &&
                      'border-red-500 focus:border-red-500'
                  )}
                />
                {touched.tradeReference && errors.tradeReference && (
                  <p className={errorClasses}>{errors.tradeReference}</p>
                )}
              </div>

              {/* Remarks */}
              <div>
                <label htmlFor="remarks" className={labelClasses}>
                  Remarks
                </label>
                <textarea
                  id="remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Additional notes or comments..."
                  rows={3}
                  maxLength={500}
                  className={cn(
                    inputClasses,
                    'resize-none',
                    touched.remarks && errors.remarks && 'border-red-500 focus:border-red-500'
                  )}
                />
                <div className="flex justify-between mt-1">
                  {touched.remarks && errors.remarks ? (
                    <p className={errorClasses}>{errors.remarks}</p>
                  ) : (
                    <span />
                  )}
                  <span className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                    {formData.remarks.length}/500
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className={cn(
                'flex justify-end gap-3 px-6 py-4 border-t',
                isDark ? 'border-slate-800' : 'border-slate-200'
              )}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className={cn(
                  'px-4 py-2 text-sm font-medium border rounded-lg transition-colors disabled:opacity-50',
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                )}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50',
                  isDark
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                )}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </span>
                ) : mode === 'create' ? (
                  'Create Trade'
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TradeForm;
