import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Upload, FileText, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/helpers';
import { useGetTradeDocumentsQuery } from '../../documents/api/documentApi';
import { canUploadDocument } from '../../documents/documentUtils';
import { UserRole } from '../../../types';

interface TradeDocumentsSectionProps {
  tradeId: string;
  tradeNumber: string;
  isDark?: boolean;
  userRole?: UserRole;
}

export const TradeDocumentsSection: React.FC<TradeDocumentsSectionProps> = ({
  tradeId,
  tradeNumber,
  isDark = false,
  userRole,
}) => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetTradeDocumentsQuery(tradeId);

  const documents = data?.data || [];
  const canUpload = canUploadDocument(userRole);

  const handleViewAll = () => {
    navigate(`/dashboard/trades/${tradeId}/documents`);
  };

  const handleUpload = () => {
    navigate(`/dashboard/trades/${tradeId}/documents`);
  };

  return (
    <div
      className={cn(
        'rounded-lg border',
        isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 border-b',
          isDark ? 'border-slate-800' : 'border-slate-200'
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'p-2 rounded-lg',
              isDark ? 'bg-slate-800' : 'bg-slate-100'
            )}
          >
            <FolderOpen className={cn('w-5 h-5', isDark ? 'text-slate-400' : 'text-slate-500')} />
          </div>
          <div>
            <h3 className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
              Trade Documents
            </h3>
            <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
              {documents.length} {documents.length === 1 ? 'document' : 'documents'} uploaded
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canUpload && (
            <button
              onClick={handleUpload}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              )}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload
            </button>
          )}
          <button
            onClick={handleViewAll}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
              isDark
                ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                : 'bg-teal-600 text-white hover:bg-teal-700'
            )}
          >
            View All
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div
              className={cn(
                'w-6 h-6 border-2 rounded-full animate-spin',
                isDark
                  ? 'border-slate-700 border-t-cyan-400'
                  : 'border-slate-200 border-t-teal-600'
              )}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Recent Documents Preview */}
            {documents.length > 0 && (
              <div>
                <span className={cn('text-xs font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Recent Uploads
                </span>
                <div className="mt-2 space-y-1">
                  {documents.slice(0, 3).map((doc) => (
                    <div
                      key={doc.id}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-lg',
                        isDark ? 'bg-slate-800' : 'bg-slate-50'
                      )}
                    >
                      <FileText
                        className={cn(
                          'w-4 h-4 flex-shrink-0',
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        )}
                      />
                      <span
                        className={cn(
                          'text-xs truncate flex-1',
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        )}
                        title={doc.documentName}
                      >
                        {doc.documentName}
                      </span>
                    </div>
                  ))}
                  {documents.length > 3 && (
                    <p
                      className={cn(
                        'text-xs text-center py-1',
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      )}
                    >
                      +{documents.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            )}

            {documents.length === 0 && (
              <div className="text-center py-4">
                <FileText
                  className={cn(
                    'w-8 h-8 mx-auto mb-2',
                    isDark ? 'text-slate-600' : 'text-slate-400'
                  )}
                />
                <p className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                  No documents uploaded yet
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
