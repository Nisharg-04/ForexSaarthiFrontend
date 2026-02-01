import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth, useAppSelector } from '../../../hooks/useRedux';
import { cn } from '../../../utils/helpers';
import { useCreateTradeMutation } from '../api/tradeApi';
import { useGetPartiesQuery } from '../../parties/api/partyApi';
import type { TradeFormData, TradeFormErrors } from '../types';
import { TradeType } from '../types';
import { TRADE_TYPE_OPTIONS } from '../tradeConstants';
import { validateTradeForm, hasTradeFormErrors, getEmptyTradeFormData } from '../tradeUtils';

export const CreateTradePage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';

  // Form State
  const [formData, setFormData] = useState<TradeFormData>(getEmptyTradeFormData());
  const [errors, setErrors] = useState<TradeFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // API Hooks
  const [createTrade, { isLoading: isCreating }] = useCreateTradeMutation();
  const { data: partiesData, isLoading: isLoadingParties } = useGetPartiesQuery({ isActive: true });
  const parties = partiesData?.data || [];

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    },
    [errors]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    },
    [formData]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
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
        const result = await createTrade({
          partyId: formData.partyId,
          tradeType: formData.tradeType,
          tradeReference: formData.tradeReference || undefined,
          remarks: formData.remarks || undefined,
        }).unwrap();

        // Navigate to the new trade's details page
        if (result.data?.id) {
          navigate(`/dashboard/trades/${result.data.id}`);
        } else {
          navigate('/dashboard/trades');
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : typeof error === 'object' && error !== null && 'data' in error
            ? (error as { data?: { message?: string } }).data?.message
            : 'An unexpected error occurred';
        setSubmitError(errorMessage || 'Failed to create trade. Please try again.');
      }
    },
    [formData, createTrade, navigate]
  );

  const inputClasses = cn(
    'w-full px-3 py-2 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2',
    isDark
      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20'
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-teal-500/20'
  );

  const labelClasses = cn('block text-sm font-medium mb-1.5', isDark ? 'text-slate-300' : 'text-slate-700');

  const errorClasses = 'text-xs text-red-500 mt-1';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/trades')}
          className={cn(
            'p-2 rounded-lg transition-colors',
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          )}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div>
          <h1 className={cn('text-xl font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
            Create New Trade
          </h1>
          <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Create a new trade in draft mode
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div
        className={cn(
          'rounded-lg border p-6',
          isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
        )}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
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
            {touched.partyId && errors.partyId && <p className={errorClasses}>{errors.partyId}</p>}
            {isLoadingParties && (
              <p className={cn('text-xs mt-1', isDark ? 'text-slate-500' : 'text-slate-400')}>
                Loading parties...
              </p>
            )}
          </div>

          {/* Trade Type */}
          <div>
            <label htmlFor="tradeType" className={labelClasses}>
              Trade Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              {TRADE_TYPE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors',
                    formData.tradeType === option.value
                      ? isDark
                        ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400'
                        : 'bg-teal-50 border-teal-500 text-teal-700'
                      : isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                      : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
                  )}
                >
                  <input
                    type="radio"
                    name="tradeType"
                    value={option.value}
                    checked={formData.tradeType === option.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="text-lg">{option.value === TradeType.EXPORT ? '📤' : '📥'}</span>
                  <span className="font-medium">{option.label}</span>
                </label>
              ))}
            </div>
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
              placeholder="e.g., PO-2026-001, Contract #123"
              maxLength={100}
              className={cn(
                inputClasses,
                touched.tradeReference && errors.tradeReference && 'border-red-500 focus:border-red-500'
              )}
            />
            {touched.tradeReference && errors.tradeReference && (
              <p className={errorClasses}>{errors.tradeReference}</p>
            )}
            <p className={cn('text-xs mt-1', isDark ? 'text-slate-500' : 'text-slate-400')}>
              Optional reference number for your records
            </p>
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
              placeholder="Additional notes or comments about this trade..."
              rows={4}
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

          {/* Info Banner */}
          <div
            className={cn(
              'flex items-start gap-3 px-4 py-3 rounded-lg',
              isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-600'
            )}
          >
            <span className="text-xl">📝</span>
            <div className="text-sm">
              <p className="font-medium">Trade will be created in Draft mode</p>
              <p className={cn('mt-0.5', isDark ? 'text-slate-400' : 'text-slate-500')}>
                You can edit the trade and submit it for approval when ready.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/trades')}
              disabled={isCreating}
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
              disabled={isCreating}
              className={cn(
                'px-6 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50',
                isDark
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              )}
            >
              {isCreating ? (
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
                  Creating...
                </span>
              ) : (
                'Create Trade'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTradePage;
