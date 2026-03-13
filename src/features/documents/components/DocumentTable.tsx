import React from 'react';
import { FileText, Image, FileSpreadsheet, File } from 'lucide-react';
import { cn, formatDate, formatFileSize } from '../../../utils/helpers';
import type { Document } from '../types';
import { DocumentActionsMenu } from './DocumentActionsMenu';
import { getDocumentTypeLabel } from '../documentUtils';

interface DocumentTableProps {
  documents: Document[];
  isDark?: boolean;
  isLoading?: boolean;
  onPreview?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  onRename?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  canRename?: boolean;
  canDelete?: boolean;
  emptyMessage?: string;
}

// Get icon component based on file MIME type
const getDocumentIcon = (fileType: string) => {
  if (fileType === 'application/pdf') {
    return FileText;
  }
  if (fileType.startsWith('image/')) {
    return Image;
  }
  if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType === 'text/csv') {
    return FileSpreadsheet;
  }
  return File;
};

// Get icon styling based on file MIME type
const getIconInfo = (fileType: string) => {
  if (fileType === 'application/pdf') {
    return { color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/30' };
  }
  if (fileType.startsWith('image/')) {
    return { color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30' };
  }
  if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType === 'text/csv') {
    return { color: 'text-emerald-500', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' };
  }
  if (fileType.includes('word') || fileType.includes('document') || fileType === 'text/plain') {
    return { color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30' };
  }
  return { color: 'text-slate-500', bgColor: 'bg-slate-100 dark:bg-slate-700' };
};

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  isDark = false,
  isLoading = false,
  onPreview,
  onDownload,
  onRename,
  onDelete,
  canRename = false,
  canDelete = false,
  emptyMessage = 'No documents found',
}) => {
  // Loading State
  if (isLoading) {
    return (
      <div
        className={cn(
          'rounded-lg border overflow-hidden',
          isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
        )}
      >
        <div className="animate-pulse p-8">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <div className={cn('h-4 rounded w-8', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
                <div className={cn('h-4 rounded w-48', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
                <div className={cn('h-4 rounded w-24', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
                <div className={cn('h-4 rounded w-32', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
                <div className={cn('h-4 rounded flex-1', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty State
  if (documents.length === 0) {
    return (
      <div
        className={cn(
          'text-center py-16 rounded-lg border',
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        )}
      >
        <div
          className={cn(
            'w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center',
            isDark ? 'bg-slate-800' : 'bg-slate-100'
          )}
        >
          <FileText className={cn('w-8 h-8', isDark ? 'text-slate-600' : 'text-slate-400')} />
        </div>
        <h3 className={cn('text-lg font-medium mb-1', isDark ? 'text-white' : 'text-slate-900')}>
          {emptyMessage}
        </h3>
        <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
          Upload documents to get started.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border',
        isDark ? 'border-slate-800' : 'border-slate-200'
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className={cn(
                'text-left text-xs font-medium uppercase tracking-wider',
                isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'
              )}
            >
              <th scope="col" className="px-4 py-3">Document</th>
              <th scope="col" className="px-4 py-3">Type</th>
              <th scope="col" className="px-4 py-3">Category</th>
              <th scope="col" className="px-4 py-3">Uploaded By</th>
              <th scope="col" className="px-4 py-3">Uploaded At</th>
              <th scope="col" className="px-4 py-3">Size</th>
              <th scope="col" className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody
            className={cn(
              'divide-y',
              isDark ? 'divide-slate-800 bg-slate-900' : 'divide-slate-100 bg-white'
            )}
          >
            {documents.map((doc) => {
              const IconComponent = getDocumentIcon(doc.fileType);
              const iconInfo = getIconInfo(doc.fileType);

              return (
                <tr
                  key={doc.id}
                  className={cn(
                    'transition-colors',
                    isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                  )}
                >
                  {/* Document Name with Icon */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                          iconInfo.bgColor
                        )}
                      >
                        <IconComponent className={cn('w-5 h-5', iconInfo.color)} />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={cn(
                            'text-sm font-medium truncate max-w-xs',
                            isDark ? 'text-white' : 'text-slate-900'
                          )}
                          title={doc.documentName}
                        >
                          {doc.documentName}
                        </p>
                        <p
                          className={cn(
                            'text-xs truncate max-w-xs',
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          )}
                          title={doc.originalFileName}
                        >
                          {doc.originalFileName}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        isDark
                          ? 'bg-slate-700 text-slate-300'
                          : 'bg-slate-100 text-slate-700'
                      )}
                    >
                      {getDocumentTypeLabel(doc.documentType)}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3">
                    <span className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
                      {doc.documentCategory}
                    </span>
                  </td>

                  {/* Uploaded By */}
                  <td className="px-4 py-3">
                    <span className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
                      {doc.uploadedByName}
                    </span>
                  </td>

                  {/* Uploaded At */}
                  <td className="px-4 py-3">
                    <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                      {formatDate(doc.uploadedAt)}
                    </span>
                  </td>

                  {/* File Size */}
                  <td className="px-4 py-3">
                    <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                      {formatFileSize(doc.fileSize)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <DocumentActionsMenu
                      document={doc}
                      isDark={isDark}
                      onPreview={onPreview}
                      onDownload={onDownload}
                      onRename={onRename}
                      onDelete={onDelete}
                      canRename={canRename}
                      canDelete={canDelete}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
