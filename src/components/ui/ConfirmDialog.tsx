import React from 'react';
import { useAppSelector } from '../../hooks/useRedux';
import { cn } from '../../utils/helpers';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 transition-opacity",
          isDark ? "bg-black bg-opacity-50" : "bg-black bg-opacity-30"
        )}
        onClick={onCancel}
        aria-hidden="true"
      />
      
      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={cn(
          "relative w-full max-w-md rounded-lg shadow-lg",
          isDark ? "bg-slate-900" : "bg-white"
        )}>
          <div className="p-6">
            {/* Icon */}
            {variant === 'danger' && (
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4",
                isDark ? "bg-red-900/30" : "bg-red-100"
              )}>
                <svg className={cn(
                  "w-6 h-6",
                  isDark ? "text-red-400" : "text-red-600"
                )} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            )}
            
            {/* Content */}
            <h3 className={cn(
              "text-lg font-semibold text-center mb-2",
              isDark ? "text-white" : "text-slate-900"
            )}>
              {title}
            </h3>
            <p className={cn(
              "text-sm text-center",
              isDark ? "text-slate-400" : "text-slate-600"
            )}>
              {message}
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 px-6 pb-6">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className={cn(
                "flex-1 px-4 py-2.5 text-sm font-medium border rounded-md transition-colors disabled:opacity-50",
                isDark 
                  ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              )}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                "flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50",
                variant === 'danger'
                  ? isDark 
                    ? 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500'
                    : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                  : isDark
                    ? 'bg-cyan-600 text-white hover:bg-cyan-500 focus:ring-cyan-500'
                    : 'bg-slate-800 text-white hover:bg-slate-900 focus:ring-slate-500'
              )}
            >
              {isLoading ? 'Processing...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
