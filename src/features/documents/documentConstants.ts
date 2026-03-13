import { DocumentType } from './types';

// Document Type Options for dropdown (business document types)
export const DOCUMENT_TYPE_OPTIONS = [
  { value: DocumentType.CommercialInvoice, label: 'Commercial Invoice' },
  { value: DocumentType.PackingList, label: 'Packing List' },
  { value: DocumentType.BillOfLading, label: 'Bill of Lading' },
  { value: DocumentType.CertificateOfOrigin, label: 'Certificate of Origin' },
  { value: DocumentType.InsuranceCertificate, label: 'Insurance Certificate' },
  { value: DocumentType.InspectionCertificate, label: 'Inspection Certificate' },
  { value: DocumentType.ShippingBill, label: 'Shipping Bill' },
  { value: DocumentType.ExportDeclaration, label: 'Export Declaration' },
  { value: DocumentType.PurchaseOrder, label: 'Purchase Order' },
  { value: DocumentType.IECCertificate, label: 'IEC Certificate' },
  { value: DocumentType.GSTCertificate, label: 'GST Certificate' },
  { value: DocumentType.CompanyRegistration, label: 'Company Registration' },
  { value: DocumentType.BankDocument, label: 'Bank Document' },
  { value: DocumentType.Contract, label: 'Contract Agreement' },
  { value: DocumentType.ProformaInvoice, label: 'Proforma Invoice' },
  { value: DocumentType.Other, label: 'Other' },
] as const;

// Document Type Display Names
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  [DocumentType.CommercialInvoice]: 'Commercial Invoice',
  [DocumentType.PackingList]: 'Packing List',
  [DocumentType.BillOfLading]: 'Bill of Lading',
  [DocumentType.CertificateOfOrigin]: 'Certificate of Origin',
  [DocumentType.InsuranceCertificate]: 'Insurance Certificate',
  [DocumentType.InspectionCertificate]: 'Inspection Certificate',
  [DocumentType.ShippingBill]: 'Shipping Bill',
  [DocumentType.ExportDeclaration]: 'Export Declaration',
  [DocumentType.PurchaseOrder]: 'Purchase Order',
  [DocumentType.IECCertificate]: 'IEC Certificate',
  [DocumentType.GSTCertificate]: 'GST Certificate',
  [DocumentType.CompanyRegistration]: 'Company Registration',
  [DocumentType.BankDocument]: 'Bank Document',
  [DocumentType.Contract]: 'Contract Agreement',
  [DocumentType.ProformaInvoice]: 'Proforma Invoice',
  [DocumentType.Other]: 'Other',
};

// Allowed file types (MIME types for upload validation)
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
];

// Allowed file extensions
export const ALLOWED_FILE_EXTENSIONS = [
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.txt',
  '.csv',
];

// Max file size in bytes (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Suggested document categories (free-text suggestions)
export const DOCUMENT_CATEGORY_SUGGESTIONS = [
  'Commercial',
  'Shipping',
  'Customs',
  'Insurance',
  'Banking',
  'Regulatory',
  'Legal',
  'Other',
] as const;

// Required document types for trade checklist
export const REQUIRED_TRADE_DOCUMENTS = [
  DocumentType.CommercialInvoice,
  DocumentType.PackingList,
  DocumentType.BillOfLading,
  DocumentType.CertificateOfOrigin,
] as const;
