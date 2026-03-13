import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, File, AlertCircle, Loader2 } from 'lucide-react';
import { cn, formatFileSize } from '../../../utils/helpers';
import { DocumentType } from '../types';
import { DOCUMENT_TYPE_OPTIONS, DOCUMENT_CATEGORY_SUGGESTIONS, MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '../documentConstants';
import { validateFile } from '../documentUtils';
import { useUploadDocumentMutation } from '../api/documentApi';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  tradeId?: string;
  isDark?: boolean;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tradeId,
  isDark = false,
}) => {
  const [uploadDocument, { isLoading }] = useUploadDocumentMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>(DocumentType.Other);
  const [documentCategory, setDocumentCategory] = useState('');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const resetForm = () => {
    setFile(null);
    setDocumentName('');
    setDocumentType(DocumentType.Other);
    setDocumentCategory('');
    setRemarks('');
    setError(null);
    setIsDragging(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileSelect = (selectedFile: File) => {
    const validation = validateFile(selectedFile);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Auto-fill document name from file name (without extension)
    if (!documentName) {
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
      setDocumentName(nameWithoutExt);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  // Drag and Drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [documentName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!documentName.trim()) {
      setError('Please enter a document name');
      return;
    }

    if (!documentCategory.trim()) {
      setError('Please enter a document category');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentName', documentName.trim());
      formData.append('documentType', documentType);
      formData.append('documentCategory', documentCategory.trim());
      
      if (remarks.trim()) {
        formData.append('remarks', remarks.trim());
      }
      
      if (tradeId) {
        formData.append('tradeId', tradeId);
      }

      await uploadDocument(formData).unwrap();
      
      resetForm();
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      setError(apiError?.data?.message || 'Failed to upload document');
    }
  };

  if (!isOpen) return null;

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
            'relative w-full max-w-lg rounded-xl shadow-xl border',
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
              Upload Document
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

            {/* Drag & Drop Zone */}
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                isDragging
                  ? isDark
                    ? 'border-cyan-500 bg-cyan-900/20'
                    : 'border-teal-500 bg-teal-50'
                  : file
                    ? isDark
                      ? 'border-slate-600 bg-slate-800'
                      : 'border-slate-300 bg-slate-50'
                    : isDark
                      ? 'border-slate-700 hover:border-slate-600 bg-slate-800/50 hover:bg-slate-800'
                      : 'border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100'
              )}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept={ALLOWED_FILE_TYPES.join(',')}
                className="hidden"
              />

              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center',
                      isDark ? 'bg-slate-700' : 'bg-slate-200'
                    )}
                  >
                    <File className={cn('w-6 h-6', isDark ? 'text-slate-400' : 'text-slate-500')} />
                  </div>
                  <div>
                    <p
                      className={cn(
                        'text-sm font-medium truncate max-w-xs',
                        isDark ? 'text-white' : 'text-slate-900'
                      )}
                    >
                      {file.name}
                    </p>
                    <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className={cn(
                      'text-xs font-medium',
                      isDark
                        ? 'text-cyan-400 hover:text-cyan-300'
                        : 'text-teal-600 hover:text-teal-700'
                    )}
                  >
                    Change file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center',
                      isDark ? 'bg-slate-700' : 'bg-slate-200'
                    )}
                  >
                    <Upload className={cn('w-6 h-6', isDark ? 'text-slate-400' : 'text-slate-500')} />
                  </div>
                  <div>
                    <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                      Drop a file here or click to browse
                    </p>
                    <p className={cn('text-xs mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                      Max {MAX_FILE_SIZE / (1024 * 1024)}MB. PDF, Images, Word, Excel allowed.
                    </p>
                  </div>
                </div>
              )}
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
              />
            </div>

            {/* Document Type */}
            <div>
              <label
                htmlFor="documentType"
                className={cn(
                  'block text-sm font-medium mb-1.5',
                  isDark ? 'text-slate-300' : 'text-slate-700'
                )}
              >
                Document Type <span className="text-red-500">*</span>
              </label>
              <select
                id="documentType"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                className={cn(
                  'w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent',
                  isDark
                    ? 'border-slate-600 bg-slate-800 text-white focus:ring-cyan-500'
                    : 'border-slate-300 bg-white text-slate-900 focus:ring-teal-500'
                )}
              >
                {DOCUMENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Document Category */}
            <div>
              <label
                htmlFor="documentCategory"
                className={cn(
                  'block text-sm font-medium mb-1.5',
                  isDark ? 'text-slate-300' : 'text-slate-700'
                )}
              >
                Category <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="documentCategory"
                list="categoryOptions"
                value={documentCategory}
                onChange={(e) => setDocumentCategory(e.target.value)}
                className={cn(
                  'w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent',
                  isDark
                    ? 'border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:ring-cyan-500'
                    : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-teal-500'
                )}
                placeholder="e.g., Shipping, Commercial, Customs"
              />
              <datalist id="categoryOptions">
                {DOCUMENT_CATEGORY_SUGGESTIONS.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            {/* Remarks */}
            <div>
              <label
                htmlFor="remarks"
                className={cn(
                  'block text-sm font-medium mb-1.5',
                  isDark ? 'text-slate-300' : 'text-slate-700'
                )}
              >
                Remarks
              </label>
              <textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                className={cn(
                  'w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none',
                  isDark
                    ? 'border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:ring-cyan-500'
                    : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-teal-500'
                )}
                placeholder="Optional remarks or notes..."
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
                disabled={isLoading || !file}
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
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Document
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
