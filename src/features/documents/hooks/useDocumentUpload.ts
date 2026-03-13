import { useState, useCallback } from 'react';
import { useUploadDocumentMutation } from '../api/documentApi';
import { validateFile } from '../documentUtils';
import type { DocumentType, DocumentFormData, DocumentFormErrors } from '../types';

interface UseDocumentUploadOptions {
  tradeId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseDocumentUploadReturn {
  formData: DocumentFormData;
  errors: DocumentFormErrors;
  isUploading: boolean;
  progress: number;
  setFile: (file: File | null) => void;
  setDocumentName: (name: string) => void;
  setDocumentType: (type: DocumentType) => void;
  setDocumentCategory: (category: string) => void;
  setRemarks: (remarks: string) => void;
  upload: () => Promise<boolean>;
  reset: () => void;
  validateForm: () => boolean;
}

const initialFormData: DocumentFormData = {
  file: null,
  documentName: '',
  documentType: 'Other',
  documentCategory: '',
  remarks: '',
};

export const useDocumentUpload = (options: UseDocumentUploadOptions = {}): UseDocumentUploadReturn => {
  const { tradeId, onSuccess, onError } = options;
  const [uploadDocument, { isLoading }] = useUploadDocumentMutation();

  const [formData, setFormData] = useState<DocumentFormData>(initialFormData);
  const [errors, setErrors] = useState<DocumentFormErrors>({});
  const [progress, setProgress] = useState(0);

  // Set file and auto-fill name
  const setFile = useCallback((file: File | null) => {
    if (file) {
      const validation = validateFile(file);
      if (!validation.isValid) {
        setErrors((prev) => ({ ...prev, file: validation.error }));
        return;
      }

      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');

      setFormData((prev) => ({
        ...prev,
        file,
        documentName: prev.documentName || nameWithoutExt,
      }));
      setErrors((prev) => ({ ...prev, file: undefined }));
    } else {
      setFormData((prev) => ({ ...prev, file: null }));
    }
  }, []);

  // Set document name
  const setDocumentName = useCallback((documentName: string) => {
    setFormData((prev) => ({ ...prev, documentName }));
    if (documentName.trim()) {
      setErrors((prev) => ({ ...prev, documentName: undefined }));
    }
  }, []);

  // Set document type (business document type)
  const setDocumentType = useCallback((documentType: DocumentType) => {
    setFormData((prev) => ({ ...prev, documentType }));
  }, []);

  // Set document category (free-text)
  const setDocumentCategory = useCallback((documentCategory: string) => {
    setFormData((prev) => ({ ...prev, documentCategory }));
    if (documentCategory.trim()) {
      setErrors((prev) => ({ ...prev, documentCategory: undefined }));
    }
  }, []);

  // Set remarks
  const setRemarks = useCallback((remarks: string) => {
    setFormData((prev) => ({ ...prev, remarks }));
  }, []);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: DocumentFormErrors = {};

    if (!formData.file) {
      newErrors.file = 'Please select a file to upload';
    }

    if (!formData.documentName.trim()) {
      newErrors.documentName = 'Please enter a document name';
    }

    if (!formData.documentCategory.trim()) {
      newErrors.documentCategory = 'Please enter a document category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Upload document
  const upload = useCallback(async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    try {
      setProgress(0);
      
      const uploadFormData = new FormData();
      uploadFormData.append('file', formData.file!);
      uploadFormData.append('documentName', formData.documentName.trim());
      uploadFormData.append('documentType', formData.documentType);
      uploadFormData.append('documentCategory', formData.documentCategory.trim());
      
      if (formData.remarks.trim()) {
        uploadFormData.append('remarks', formData.remarks.trim());
      }
      
      if (tradeId) {
        uploadFormData.append('tradeId', tradeId);
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      await uploadDocument(uploadFormData).unwrap();

      clearInterval(progressInterval);
      setProgress(100);

      onSuccess?.();
      return true;
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      const errorMessage = apiError?.data?.message || 'Failed to upload document';
      setErrors((prev) => ({ ...prev, file: errorMessage }));
      onError?.(errorMessage);
      setProgress(0);
      return false;
    }
  }, [formData, tradeId, uploadDocument, validateForm, onSuccess, onError]);

  // Reset form
  const reset = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    setProgress(0);
  }, []);

  return {
    formData,
    errors,
    isUploading: isLoading,
    progress,
    setFile,
    setDocumentName,
    setDocumentType,
    setDocumentCategory,
    setRemarks,
    upload,
    reset,
    validateForm,
  };
};
