import { DocumentType, type Document } from './types';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, DOCUMENT_TYPE_LABELS } from './documentConstants';
import { UserRole } from '../../types';

/**
 * Validate file for upload
 */
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Allowed types: PDF, Images, Word, Excel, CSV, TXT',
    };
  }

  return { isValid: true };
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? `.${parts.pop()?.toLowerCase()}` : '';
};

/**
 * Check if file can be previewed in browser
 */
export const canPreviewInBrowser = (document: Document): boolean => {
  const { fileType } = document;
  
  // PDFs can be previewed
  if (fileType === 'application/pdf') {
    return true;
  }
  
  // Images can be previewed
  if (fileType.startsWith('image/')) {
    return true;
  }
  
  return false;
};

/**
 * Check if user can upload documents
 */
export const canUploadDocument = (role: UserRole | undefined | null): boolean => {
  return role === UserRole.ADMIN || role === UserRole.FINANCE;
};

/**
 * Check if user can delete documents
 */
export const canDeleteDocument = (role: UserRole | undefined | null): boolean => {
  return role === UserRole.ADMIN;
};

/**
 * Check if user can rename documents
 */
export const canRenameDocument = (role: UserRole | undefined | null): boolean => {
  return role === UserRole.ADMIN || role === UserRole.FINANCE;
};

/**
 * Check if user can view documents
 */
export const canViewDocument = (role: UserRole | undefined | null): boolean => {
  return !!role; // All authenticated users can view
};

/**
 * Get document type label (business document type)
 */
export const getDocumentTypeLabel = (type: DocumentType): string => {
  return DOCUMENT_TYPE_LABELS[type] || type;
};

/**
 * Sort documents by upload date (newest first)
 */
export const sortDocumentsByDate = (documents: Document[]): Document[] => {
  return [...documents].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
};
