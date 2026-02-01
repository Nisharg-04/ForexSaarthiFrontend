import React, { useState, useEffect } from 'react';
import { X, AlertCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../../../utils/helpers';
import type { Trade } from '../types';
import { validateCancelReason } from '../tradeUtils';
import { CANCEL_REASON_VALIDATION } from '../tradeConstants';

interface CancelTradeModalProps {
  isOpen: boolean;
  trade: Trade | null;
  onClose: () => void;
  onConfirm: (cancelReason: string) => Promise<void>;
  isDark?: boolean;
  isLoading?: boolean;
}

export const CancelTradeModal: React.FC<CancelTradeModalProps> = ({
  isOpen,
  trade,
  onClose,
  onConfirm,
  isDark = false,
  isLoading = false,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setReason('');
      setError(undefined);
      setTouched(false);
      setSubmitError(null);
    }
  }, [isOpen]);

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setReason(value);
    
    if (touched) {
      setError(validateCancelReason(value));
    }
    setSubmitError(null);
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validateCancelReason(reason));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateCancelReason(reason);
    if (validationError) {
      setError(validationError);
      setTouched(true);
      return;
    }

    try {
      await onConfirm(reason.trim());
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message
          : 'An unexpected error occurred';
      setSubmitError(errorMessage || 'Failed to cancel trade. Please try again.');
    }
  };

  if (!isOpen || !trade) return null;

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
            'relative w-full max-w-md rounded-lg shadow-lg',
            isDark ? 'bg-slate-900' : 'bg-white'
          )}
        >
          {/* Header with Warning Icon */}
          <div className="pt-6 px-6">
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4',
                isDark ? 'bg-red-900/30' : 'bg-red-100'
              )}
            >
              <AlertTriangle
                className={cn('w-6 h-6', isDark ? 'text-red-400' : 'text-red-600')}
              />
            </div>

            <h2
              className={cn(
                'text-lg font-semibold text-center mb-2',
                isDark ? 'text-white' : 'text-slate-900'
              )}
            >
              Cancel Trade
            </h2>

            <p
              className={cn(
                'text-sm text-center mb-4',
                isDark ? 'text-slate-400' : 'text-slate-600'
              )}
            >
              Are you sure you want to cancel trade{' '}
              <span className="font-mono font-medium">{trade.tradeNumber}</span>?
              <br />
              This action cannot be undone.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 pb-4">
              {/* Submit Error Banner */}
              {submitError && (
                <div
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 rounded-lg text-sm mb-4',
                    isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'
                  )}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Cancel Reason */}
              <div>
                <label
                  htmlFor="cancelReason"
                  className={cn(
                    'block text-sm font-medium mb-1.5',
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  )}
                >
                  Cancel Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="cancelReason"
                  value={reason}
                  onChange={handleReasonChange}
                  onBlur={handleBlur}
                  placeholder="Please provide a detailed reason for cancellation..."
                  rows={4}
                  maxLength={CANCEL_REASON_VALIDATION.maxLength}
                  className={cn(
                    'w-full px-3 py-2 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2 resize-none',
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-teal-500/20',
                    touched && error && 'border-red-500 focus:border-red-500'
                  )}
                />
                <div className="flex justify-between mt-1">
                  {touched && error ? (
                    <p className="text-xs text-red-500">{error}</p>
                  ) : (
                    <span
                      className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}
                    >
                      Minimum {CANCEL_REASON_VALIDATION.minLength} characters
                    </span>
                  )}
                  <span className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                    {reason.length}/{CANCEL_REASON_VALIDATION.maxLength}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div
              className={cn(
                'flex gap-3 px-6 pb-6',
                isDark ? 'border-slate-800' : 'border-slate-200'
              )}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className={cn(
                  'flex-1 px-4 py-2.5 text-sm font-medium border rounded-lg transition-colors disabled:opacity-50',
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                )}
              >
                Keep Trade
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50',
                  isDark
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                )}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
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
                    Cancelling...
                  </span>
                ) : (
                  'Cancel Trade'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CancelTradeModal;
