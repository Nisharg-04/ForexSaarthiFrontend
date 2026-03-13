import React, { useState, useCallback, useMemo } from 'react';
import { Search, Plus, RefreshCw, FileText } from 'lucide-react';
import { useAuth, useAppSelector } from '../../../hooks/useRedux';
import { cn } from '../../../utils/helpers';
import { 
  useGetCompanyDocumentsQuery, 
  useDeleteDocumentMutation,
  useLazyDownloadDocumentQuery 
} from '../api/documentApi';
import type { Document } from '../types';
import { DocumentType } from '../types';
import { DocumentTable } from '../components/DocumentTable';
import { UploadDocumentModal } from '../components/UploadDocumentModal';
import { RenameDocumentModal } from '../components/RenameDocumentModal';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { 
  canUploadDocument, 
  canDeleteDocument, 
  canRenameDocument,
} from '../documentUtils';
import { DOCUMENT_TYPE_OPTIONS } from '../documentConstants';

export const CompanyDocumentsPage: React.FC = () => {
  const { role } = useAuth();
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<DocumentType | ''>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // API Hooks
  const { data, isLoading, isFetching, refetch } = useGetCompanyDocumentsQuery();
  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();
  const [triggerDownload] = useLazyDownloadDocumentQuery();

  // All documents
  const allDocuments = data?.data || [];

  // Apply filters
  const filteredDocuments = useMemo(() => {
    let result = [...allDocuments];

    // Apply document type filter
    if (selectedType) {
      result = result.filter(doc => doc.documentType === selectedType);
    }

    // Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        doc =>
          doc.documentName.toLowerCase().includes(lowerSearch) ||
          doc.originalFileName.toLowerCase().includes(lowerSearch) ||
          doc.uploadedByName?.toLowerCase().includes(lowerSearch)
      );
    }

    return result;
  }, [allDocuments, selectedType, searchTerm]);

  // Permission checks
  const canUpload = canUploadDocument(role);
  const canDelete = canDeleteDocument(role);
  const canRename = canRenameDocument(role);

  // Action Handlers
  const handlePreview = useCallback((document: Document) => {
    setSelectedDocument(document);
    setIsPreviewModalOpen(true);
  }, []);

  const handleDownload = useCallback(async (document: Document) => {
    try {
      const result = await triggerDownload(document.id).unwrap();
      if (result.data?.url) {
        window.open(result.data.url, '_blank');
      }
    } catch (error) {
      console.error('Failed to download document:', error);
    }
  }, [triggerDownload]);

  const handleRename = useCallback((document: Document) => {
    setSelectedDocument(document);
    setIsRenameModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((document: Document) => {
    setSelectedDocument(document);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedDocument) return;

    try {
      await deleteDocument(selectedDocument.id).unwrap();
      setIsDeleteDialogOpen(false);
      setSelectedDocument(null);
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  }, [selectedDocument, deleteDocument]);

  const handleUploadSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className={cn(
              'text-2xl font-bold',
              isDark ? 'text-white' : 'text-slate-900'
            )}
          >
            Company Documents
          </h1>
          <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Manage all company-level documents
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isDark
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              isFetching && 'opacity-50 cursor-not-allowed'
            )}
            title="Refresh"
          >
            <RefreshCw className={cn('w-5 h-5', isFetching && 'animate-spin')} />
          </button>

          {/* Upload Button */}
          {canUpload && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                isDark
                  ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                  : 'bg-teal-600 text-white hover:bg-teal-700'
              )}
            >
              <Plus className="w-4 h-4" />
              Upload Document
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div
        className={cn(
          'p-4 rounded-lg border',
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search
                className={cn(
                  'absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4',
                  isDark ? 'text-slate-400' : 'text-slate-400'
                )}
              />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  'w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent',
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:ring-cyan-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-teal-500'
                )}
              />
            </div>
          </div>

          {/* Document Type Filter */}
          <div className="sm:w-48">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as DocumentType | '')}
              className={cn(
                'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent',
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white focus:ring-cyan-500'
                  : 'bg-white border-slate-300 text-slate-900 focus:ring-teal-500'
              )}
            >
              <option value="">All Types</option>
              {DOCUMENT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <FileText className={cn('w-4 h-4', isDark ? 'text-slate-400' : 'text-slate-500')} />
            <span className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
              {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'}
              {searchTerm || selectedType ? ' found' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <DocumentTable
        documents={filteredDocuments}
        isDark={isDark}
        isLoading={isLoading}
        onPreview={handlePreview}
        onDownload={handleDownload}
        onRename={canRename ? handleRename : undefined}
        onDelete={canDelete ? handleDeleteClick : undefined}
        canRename={canRename}
        canDelete={canDelete}
        emptyMessage={
          searchTerm || selectedType
            ? 'No documents match your filters'
            : 'No documents uploaded yet'
        }
      />

      {/* Upload Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
        isDark={isDark}
      />

      {/* Rename Modal */}
      <RenameDocumentModal
        isOpen={isRenameModalOpen}
        document={selectedDocument}
        onClose={() => {
          setIsRenameModalOpen(false);
          setSelectedDocument(null);
        }}
        onSuccess={() => refetch()}
        isDark={isDark}
      />

      {/* Preview Modal */}
      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        document={selectedDocument}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setSelectedDocument(null);
        }}
        onDownload={handleDownload}
        isDark={isDark}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setSelectedDocument(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Document"
        message={`Are you sure you want to delete "${selectedDocument?.documentName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
