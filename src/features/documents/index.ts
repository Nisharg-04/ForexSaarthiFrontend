// Components
export { DocumentTable } from './components/DocumentTable';
export { DocumentActionsMenu } from './components/DocumentActionsMenu';
export { UploadDocumentModal } from './components/UploadDocumentModal';
export { RenameDocumentModal } from './components/RenameDocumentModal';
export { DocumentPreviewModal } from './components/DocumentPreviewModal';

// Pages
export { CompanyDocumentsPage } from './pages/CompanyDocumentsPage';
export { TradeDocumentsPage } from './pages/TradeDocumentsPage';

// API Hooks
export {
  useGetCompanyDocumentsQuery,
  useGetTradeDocumentsQuery,
  useGetDocumentQuery,
  useUploadDocumentMutation,
  useRenameDocumentMutation,
  useDeleteDocumentMutation,
  useLazyDownloadDocumentQuery,
} from './api/documentApi';

// Custom Hooks
export { useDocumentUpload } from './hooks/useDocumentUpload';

// Types
export type {
  Document,
  DocumentFilters,
  DocumentFormData,
  DocumentFormErrors,
  DocumentResponse,
  DocumentsResponse,
  DownloadDocumentResponse,
  RenameDocumentRequest,
  UploadDocumentRequest,
} from './types';

export { DocumentType } from './types';

// Constants
export {
  DOCUMENT_TYPE_OPTIONS,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_CATEGORY_SUGGESTIONS,
  ALLOWED_FILE_TYPES,
  ALLOWED_FILE_EXTENSIONS,
  MAX_FILE_SIZE,
  REQUIRED_TRADE_DOCUMENTS,
} from './documentConstants';

// Utils
export {
  validateFile,
  getFileExtension,
  canPreviewInBrowser,
  canUploadDocument,
  canDeleteDocument,
  canRenameDocument,
  canViewDocument,
  getDocumentTypeLabel,
  sortDocumentsByDate,
} from './documentUtils';
