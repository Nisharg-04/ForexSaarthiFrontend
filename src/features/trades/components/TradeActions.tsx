import React from 'react';
import { Pencil, Send, CheckCircle, XCircle, Lock } from 'lucide-react';
import { cn } from '../../../utils/helpers';
import type { Trade } from '../types';
import { UserRole } from '../../../types';
import {
  canEditTrade,
  canSubmitTrade,
  canApproveTrade,
  canCancelTrade,
  canCloseTrade,
} from '../tradeUtils';

interface TradeActionsProps {
  trade: Trade;
  userRole?: UserRole;
  isDark?: boolean;
  onEdit?: () => void;
  onSubmit?: () => void;
  onApprove?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  isSubmitting?: boolean;
  isApproving?: boolean;
  isClosing?: boolean;
}

export const TradeActions: React.FC<TradeActionsProps> = ({
  trade,
  userRole,
  isDark = false,
  onEdit,
  onSubmit,
  onApprove,
  onCancel,
  onClose,
  isSubmitting = false,
  isApproving = false,
  isClosing = false,
}) => {
  const showEdit = canEditTrade(userRole, trade);
  const showSubmit = canSubmitTrade(userRole, trade);
  const showApprove = canApproveTrade(userRole, trade);
  const showCancel = canCancelTrade(userRole, trade);
  const showClose = canCloseTrade(userRole, trade);

  const hasActions = showEdit || showSubmit || showApprove || showCancel || showClose;

  if (!hasActions) {
    return null;
  }

  const buttonBaseClasses = 'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50';

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
      )}
    >
      <h3 className={cn('text-sm font-semibold mb-4', isDark ? 'text-white' : 'text-slate-900')}>
        Actions
      </h3>

      <div className="flex flex-wrap gap-3">
        {/* Edit Button */}
        {showEdit && onEdit && (
          <button
            onClick={onEdit}
            className={cn(
              buttonBaseClasses,
              isDark
                ? 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            )}
          >
            <Pencil className="w-4 h-4" />
            Edit Trade
          </button>
        )}

        {/* Submit for Approval Button */}
        {showSubmit && onSubmit && (
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className={cn(
              buttonBaseClasses,
              isDark
                ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            )}
          >
            {isSubmitting ? (
              <>
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
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit for Approval
              </>
            )}
          </button>
        )}

        {/* Approve Button (Admin Only) */}
        {showApprove && onApprove && (
          <button
            onClick={onApprove}
            disabled={isApproving}
            className={cn(
              buttonBaseClasses,
              'bg-emerald-600 hover:bg-emerald-700 text-white'
            )}
          >
            {isApproving ? (
              <>
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
                Approving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Approve Trade
              </>
            )}
          </button>
        )}

        {/* Close Trade Button */}
        {showClose && onClose && (
          <button
            onClick={onClose}
            disabled={isClosing}
            className={cn(
              buttonBaseClasses,
              'bg-blue-600 hover:bg-blue-700 text-white'
            )}
          >
            {isClosing ? (
              <>
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
                Closing...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Close Trade
              </>
            )}
          </button>
        )}

        {/* Cancel Button */}
        {showCancel && onCancel && (
          <button
            onClick={onCancel}
            className={cn(
              buttonBaseClasses,
              'bg-red-600 hover:bg-red-700 text-white'
            )}
          >
            <XCircle className="w-4 h-4" />
            Cancel Trade
          </button>
        )}
      </div>
    </div>
  );
};

export default TradeActions;
