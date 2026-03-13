// Document Types

// Document Types (business document classification)
export const DocumentType = {
  CommercialInvoice: 'CommercialInvoice',
  PackingList: 'PackingList',
  BillOfLading: 'BillOfLading',
  CertificateOfOrigin: 'CertificateOfOrigin',
  InsuranceCertificate: 'InsuranceCertificate',
  InspectionCertificate: 'InspectionCertificate',
  ShippingBill: 'ShippingBill',
  ExportDeclaration: 'ExportDeclaration',
  PurchaseOrder: 'PurchaseOrder',
  IECCertificate: 'IECCertificate',
  GSTCertificate: 'GSTCertificate',
  CompanyRegistration: 'CompanyRegistration',
  BankDocument: 'BankDocument',
  Contract: 'Contract',
  ProformaInvoice: 'ProformaInvoice',
  Other: 'Other',
} as const;

export type DocumentType = typeof DocumentType[keyof typeof DocumentType];

// Document Entity
export interface Document {
  id: string;
  companyId: string;
  tradeId?: string;
  documentName: string;
  originalFileName: string;
  documentType: DocumentType;
  documentCategory: string; // Free-text category (e.g., "Shipping", "Customs", "Commercial")
  fileUrl: string;
  fileType: string; // MIME type (auto-detected from file)
  fileSize: number; // in bytes
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  remarks?: string;
}

// API Request Types
export interface UploadDocumentRequest {
  file: File;
  tradeId?: string;
  documentName: string;
  documentType: DocumentType;
  documentCategory: string;
  remarks?: string;
}

export interface RenameDocumentRequest {
  id: string;
  documentName: string;
}

// API Response Types
export interface DocumentResponse {
  success: boolean;
  data: Document;
  message?: string;
  correlationId?: string;
}

export interface DocumentsResponse {
  success: boolean;
  data: Document[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
  correlationId?: string;
}

export interface DownloadDocumentResponse {
  success: boolean;
  data: {
    url: string;
  };
  message?: string;
}

// Document Filters
export interface DocumentFilters {
  tradeId?: string;
  documentType?: DocumentType;
  search?: string;
  page?: number;
  limit?: number;
}

// Document Form Data
export interface DocumentFormData {
  file: File | null;
  documentName: string;
  documentType: DocumentType;
  documentCategory: string;
  remarks: string;
}

// Document Form Errors
export interface DocumentFormErrors {
  file?: string;
  documentName?: string;
  documentType?: string;
  documentCategory?: string;
  remarks?: string;
}
