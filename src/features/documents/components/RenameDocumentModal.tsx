import React, { useState, useEffect } from 'react';
import { X, Pencil, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../../../utils/helpers';
import type { Document } from '../types';
import { useRenameDocumentMutation } from '../api/documentApi';

interface RenameDocumentModalProps {
  isOpen: boolean;
  document: Document | null;
  onClose: () => void;
  onSuccess?: () => void;
  isDark?: boolean;
}

export const RenameDocumentModal: React.FC<RenameDocumentModalProps> = ({
  isOpen,
  document,
  onClose,
  onSuccess,
  isDark = false,
}) => {
  const [renameDocument, { isLoading }] = useRenameDocumentMutation();
  const [documentName, setDocumentName] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Reset form when document changes
  useEffect(() => {
    if (document) {
      setDocumentName(document.documentName);
    }
    setError(null);
  }, [document]);

  const handleClose = () => {
    setDocumentName('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!document) return;

    if (!documentName.trim()) {
      setError('Please enter a document name');
      return;
    }

    if (documentName.trim() === document.documentName) {
      handleClose();
      return;
    }

    try {
      await renameDocument({
        id: document.id,
        documentName: documentName.trim(),
      }).unwrap();

      onSuccess?.();
      handleClose();
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      setError(apiError?.data?.message || 'Failed to rename document');
    }
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={cn(
            'relative w-full max-w-md rounded-xl shadow-xl border',
            isDark
              ? 'bg-slate-900 border-slate-700'
              : 'bg-white border-slate-200'
          )}
        >
          {/* Header */}
          <div
            className={cn(
              'flex items-center justify-between px-6 py-4 border-b',
              isDark ? 'border-slate-700' : 'border-slate-200'
            )}
          >
            <h2
              className={cn(
                'text-lg font-semibold',
                isDark ? 'text-white' : 'text-slate-900'
              )}
            >
              Rename Document
            </h2>
            <button
              onClick={handleClose}
              className={cn(
                'p-1 rounded-md transition-colors',
                isDark
                  ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              )}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Error Message */}
            {error && (
              <div
                className={cn(
                  'p-3 text-sm rounded-lg flex items-start gap-2',
                  'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                )}
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Current File Info */}
            <div
              className={cn(
                'p-3 rounded-lg',
                isDark ? 'bg-slate-800' : 'bg-slate-50'
              )}
            >
              <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Original file name
              </p>
              <p
                className={cn(
                  'text-sm font-medium truncate',
                  isDark ? 'text-slate-200' : 'text-slate-700'
                )}
                title={document.originalFileName}
              >
                {document.originalFileName}
              </p>
            </div>

            {/* Document Name */}
            <div>
              <label
                htmlFor="documentName"
                className={cn(
                  'block text-sm font-medium mb-1.5',
                  isDark ? 'text-slate-300' : 'text-slate-700'
                )}
              >
                Document Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="documentName"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className={cn(
                  'w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent',
                  isDark
                    ? 'border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:ring-cyan-500'
                    : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-teal-500'
                )}
                placeholder="Enter document name"
                autoFocus
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  isDark
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !documentName.trim()}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2',
                  isDark
                    ? 'bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-cyan-900 disabled:text-cyan-400'
                    : 'bg-teal-600 text-white hover:bg-teal-700 disabled:bg-teal-300'
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Pencil className="w-4 h-4" />
                    Rename
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
