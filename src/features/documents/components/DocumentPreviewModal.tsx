import React from 'react';
import { X, Download, FileText, ExternalLink } from 'lucide-react';
import { cn, formatFileSize, formatDate } from '../../../utils/helpers';
import type { Document } from '../types';
import { canPreviewInBrowser, getDocumentTypeLabel } from '../documentUtils';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  document: Document | null;
  onClose: () => void;
  onDownload?: (document: Document) => void;
  isDark?: boolean;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  document,
  onClose,
  onDownload,
  isDark = false,
}) => {
  if (!isOpen || !document) return null;

  const canPreview = canPreviewInBrowser(document);
  const isPDF = document.fileType === 'application/pdf';
  const isImage = document.fileType.startsWith('image/');

  const handleDownload = () => {
    if (onDownload) {
      onDownload(document);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex h-full items-center justify-center p-4">
        <div
          className={cn(
            'relative w-full max-w-5xl h-[90vh] rounded-xl shadow-xl border overflow-hidden flex flex-col',
            isDark
              ? 'bg-slate-900 border-slate-700'
              : 'bg-white border-slate-200'
          )}
        >
          {/* Header */}
          <div
            className={cn(
              'flex items-center justify-between px-6 py-4 border-b flex-shrink-0',
              isDark ? 'border-slate-700' : 'border-slate-200'
            )}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  isDark ? 'bg-slate-800' : 'bg-slate-100'
                )}
              >
                <FileText className={cn('w-5 h-5', isDark ? 'text-slate-400' : 'text-slate-500')} />
              </div>
              <div className="min-w-0">
                <h2
                  className={cn(
                    'text-lg font-semibold truncate',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                  title={document.documentName}
                >
                  {document.documentName}
                </h2>
                <p
                  className={cn('text-sm truncate', isDark ? 'text-slate-400' : 'text-slate-500')}
                  title={document.originalFileName}
                >
                  {document.originalFileName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Download Button */}
              <button
                onClick={handleDownload}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2',
                  isDark
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                <Download className="w-4 h-4" />
                Download
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  isDark
                    ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                )}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {canPreview ? (
              <div className="w-full h-full">
                {isPDF && (
                  <iframe
                    src={`${document.fileUrl}#toolbar=1&navpanes=0`}
                    className="w-full h-full border-0"
                    title={document.documentName}
                  />
                )}
                {isImage && (
                  <div className="w-full h-full flex items-center justify-center p-4 overflow-auto bg-slate-950">
                    <img
                      src={document.fileUrl}
                      alt={document.documentName}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
              </div>
            ) : (
              // Cannot preview - show download prompt
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <div
                    className={cn(
                      'w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center',
                      isDark ? 'bg-slate-800' : 'bg-slate-100'
                    )}
                  >
                    <FileText className={cn('w-10 h-10', isDark ? 'text-slate-500' : 'text-slate-400')} />
                  </div>
                  <h3
                    className={cn(
                      'text-xl font-semibold mb-2',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    Preview not available
                  </h3>
                  <p
                    className={cn(
                      'text-sm mb-6 max-w-md mx-auto',
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    )}
                  >
                    This file type cannot be previewed in the browser. Please download the file to view it.
                  </p>
                  <button
                    onClick={handleDownload}
                    className={cn(
                      'px-6 py-3 text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2',
                      isDark
                        ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    )}
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer - Document Info */}
          <div
            className={cn(
              'flex items-center justify-between px-6 py-3 border-t flex-shrink-0',
              isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
            )}
          >
            <div className="flex items-center gap-6">
              <div>
                <span className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                  Type
                </span>
                <p className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>
                  {getDocumentTypeLabel(document.documentType)}
                </p>
              </div>
              <div>
                <span className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                  Category
                </span>
                <p className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>
                  {document.documentCategory}
                </p>
              </div>
              <div>
                <span className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                  Size
                </span>
                <p className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>
                  {formatFileSize(document.fileSize)}
                </p>
              </div>
              <div>
                <span className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                  Uploaded
                </span>
                <p className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>
                  {formatDate(document.uploadedAt)} by {document.uploadedByName}
                </p>
              </div>
            </div>

            {/* Open in new tab */}
            <a
              href={document.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'text-sm font-medium flex items-center gap-1.5 transition-colors',
                isDark
                  ? 'text-cyan-400 hover:text-cyan-300'
                  : 'text-teal-600 hover:text-teal-700'
              )}
            >
              Open in new tab
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
