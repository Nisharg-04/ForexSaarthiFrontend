import React, { useState } from 'react';
import { Save, Send, X, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '../../../utils/helpers';
import { UserRole } from '../../../types';
import type { Invoice } from '../types';
import { canIssueInvoice, canCancelInvoice, validateCancelReason } from '../invoiceUtils';

interface InvoiceActionsBarProps {
  invoice?: Invoice | null;
  userRole?: UserRole;
  isDark?: boolean;
  isNew?: boolean;
  isDirty?: boolean;
  isValid?: boolean;
  isSaving?: boolean;
  isIssuing?: boolean;
  isCancelling?: boolean;
  onSave: () => void;
  onIssue?: () => void;
  onCancel?: (reason: string) => void;
  onDiscard?: () => void;
}

export const InvoiceActionsBar: React.FC<InvoiceActionsBarProps> = ({
  invoice,
  userRole,
  isDark = false,
  isNew = false,
  isDirty = false,
  isValid = true,
  isSaving = false,
  isIssuing = false,
  isCancelling = false,
  onSave,
  onIssue,
  onCancel,
  onDiscard,
}) => {
  const [showIssueConfirm, setShowIssueConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState<string | null>(null);

  const canIssue = canIssueInvoice(userRole, invoice);
  const canCancel = canCancelInvoice(userRole, invoice);
  const isLoading = isSaving || isIssuing || isCancelling;

  const handleIssueClick = () => {
    setShowIssueConfirm(true);
  };

  const handleIssueConfirm = () => {
    setShowIssueConfirm(false);
    onIssue?.();
  };

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
    setCancelReason('');
    setCancelError(null);
  };

  const handleCancelConfirm = () => {
    const error = validateCancelReason(cancelReason);
    if (error) {
      setCancelError(error);
      return;
    }
    setShowCancelConfirm(false);
    onCancel?.(cancelReason);
  };

  return (
    <>
      {/* Actions Bar */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 rounded-lg border',
          isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
        )}
      >
        <div className="flex items-center gap-2">
          {/* Discard Button */}
          {onDiscard && (isDirty || isNew) && (
            <button
              type="button"
              onClick={onDiscard}
              disabled={isLoading}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isDark
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              )}
            >
              Discard
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Cancel Invoice Button (Admin only, Draft only) */}
          {!isNew && canCancel && onCancel && (
            <button
              type="button"
              onClick={handleCancelClick}
              disabled={isLoading}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isDark
                  ? 'border-red-500/30 text-red-400 hover:bg-red-900/30'
                  : 'border-red-200 text-red-600 hover:bg-red-50'
              )}
            >
              <X className="w-4 h-4" />
              Cancel Invoice
            </button>
          )}

          {/* Save Draft Button */}
          <button
            type="button"
            onClick={onSave}
            disabled={isLoading || !isDirty || !isValid}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isDark
                ? 'border-slate-600 text-white hover:bg-slate-700'
                : 'border-slate-300 text-slate-900 hover:bg-slate-100'
            )}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isNew ? 'Save Draft' : 'Save Changes'}
          </button>

          {/* Issue Invoice Button (Admin only) */}
          {canIssue && onIssue && (
            <button
              type="button"
              onClick={handleIssueClick}
              disabled={isLoading || isDirty}
              className={cn(
                'flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isDark
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              )}
              title={isDirty ? 'Save changes before issuing' : 'Issue this invoice'}
            >
              {isIssuing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Issue Invoice
            </button>
          )}
        </div>
      </div>

      {/* Issue Confirmation Modal */}
      {showIssueConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div
            className={cn(
              'w-full max-w-md rounded-lg shadow-xl',
              isDark ? 'bg-slate-800' : 'bg-white'
            )}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'p-2 rounded-full',
                    isDark ? 'bg-amber-500/10' : 'bg-amber-50'
                  )}
                >
                  <AlertTriangle
                    className={cn('w-6 h-6', isDark ? 'text-amber-400' : 'text-amber-600')}
                  />
                </div>
                <div className="flex-1">
                  <h3
                    className={cn(
                      'text-lg font-semibold',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    Issue Invoice?
                  </h3>
                  <div
                    className={cn(
                      'mt-3 text-sm space-y-2',
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    )}
                  >
                    <p className="font-medium">Issuing this invoice will:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Lock all invoice data (no further edits)</li>
                      <li>Create forex exposure for this amount</li>
                      <li>Enable payments & hedging</li>
                    </ul>
                    <p
                      className={cn(
                        'mt-3 font-medium',
                        isDark ? 'text-amber-400' : 'text-amber-600'
                      )}
                    >
                      ⚠️ This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={cn(
                'flex justify-end gap-3 px-6 py-4 border-t',
                isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
              )}
            >
              <button
                type="button"
                onClick={() => setShowIssueConfirm(false)}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
                  isDark
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                )}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleIssueConfirm}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  'bg-emerald-600 text-white hover:bg-emerald-700'
                )}
              >
                Yes, Issue Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div
            className={cn(
              'w-full max-w-md rounded-lg shadow-xl',
              isDark ? 'bg-slate-800' : 'bg-white'
            )}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={cn('p-2 rounded-full', isDark ? 'bg-red-500/10' : 'bg-red-50')}
                >
                  <X className={cn('w-6 h-6', isDark ? 'text-red-400' : 'text-red-600')} />
                </div>
                <div className="flex-1">
                  <h3
                    className={cn(
                      'text-lg font-semibold',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    Cancel Invoice?
                  </h3>
                  <p
                    className={cn(
                      'mt-2 text-sm',
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    )}
                  >
                    This will permanently cancel the invoice. This action cannot be undone.
                  </p>
                  <div className="mt-4">
                    <label
                      className={cn(
                        'block text-sm font-medium mb-1.5',
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      )}
                    >
                      Reason for cancellation <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => {
                        setCancelReason(e.target.value);
                        setCancelError(null);
                      }}
                      rows={3}
                      placeholder="Enter reason for cancellation (min 10 characters)..."
                      className={cn(
                        'w-full px-3 py-2 text-sm rounded-lg border transition-colors',
                        'focus:outline-none focus:ring-2',
                        cancelError && 'border-red-500',
                        isDark
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-cyan-500/50'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-teal-500/50'
                      )}
                    />
                    {cancelError && (
                      <p className="mt-1 text-xs text-red-500">{cancelError}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div
              className={cn(
                'flex justify-end gap-3 px-6 py-4 border-t',
                isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
              )}
            >
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
                  isDark
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                )}
              >
                Keep Invoice
              </button>
              <button
                type="button"
                onClick={handleCancelConfirm}
                disabled={!cancelReason.trim()}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'bg-red-600 text-white hover:bg-red-700'
                )}
              >
                Cancel Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InvoiceActionsBar;
