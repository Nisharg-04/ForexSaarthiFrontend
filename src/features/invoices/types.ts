// Invoice Status - Lifecycle states
export const InvoiceStatus = {
  DRAFT: 'DRAFT',
  ISSUED: 'ISSUED',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  SETTLED: 'SETTLED',
  CANCELLED: 'CANCELLED',
} as const;

export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

// Invoice Type - Derived from Trade
export const InvoiceType = {
  EXPORT: 'EXPORT',
  IMPORT: 'IMPORT',
} as const;

export type InvoiceType = (typeof InvoiceType)[keyof typeof InvoiceType];

// Invoice Line Item
export interface InvoiceLineItem {
  id: string;
  description: string;
  hsCode?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
}

// Invoice Entity
export interface Invoice {
  id: string;
  companyId: string;
  tradeId: string;
  partyId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  invoiceType: InvoiceType;
  currency: string;
  
  // Line items
  lineItems: InvoiceLineItem[];
  
  // Totals
  subtotal: number;
  invoiceAmount: number;
  outstandingAmount: number;
  paidAmount: number;
  
  // Status
  status: InvoiceStatus;
  
  // Trade details (populated from join)
  tradeNumber?: string;
  
  // Party details (populated from join)
  partyName?: string;
  
  // Exposure details (populated after issue)
  exposureId?: string;
  exposedAmount?: number;
  hedgedAmount?: number;
  unhedgedAmount?: number;
  
  // Lifecycle metadata
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  
  // Issue metadata
  issuedBy?: string;
  issuedByName?: string;
  issuedAt?: string;
  
  // Cancel metadata
  cancelledBy?: string;
  cancelledByName?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

// API Request Types
export interface CreateInvoiceRequest {
  tradeId: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: Omit<InvoiceLineItem, 'id' | 'lineTotal'>[];
}

export interface UpdateInvoiceRequest {
  id: string;
  invoiceDate?: string;
  dueDate?: string;
  lineItems?: Omit<InvoiceLineItem, 'id' | 'lineTotal'>[];
}

export interface IssueInvoiceRequest {
  id: string;
}

export interface CancelInvoiceRequest {
  id: string;
  cancelReason: string;
}

// API Response Types
export interface InvoiceResponse {
  success: boolean;
  data: Invoice;
  message?: string;
  correlationId?: string;
}

export interface InvoicesResponse {
  success: boolean;
  data: Invoice[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
  correlationId?: string;
}

// Filter Types
export interface InvoiceFilters {
  status?: InvoiceStatus;
  tradeId?: string;
  partyId?: string;
  currency?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Form Types
export interface InvoiceFormData {
  tradeId: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: LineItemFormData[];
}

export interface LineItemFormData {
  id: string; // temporary ID for React key
  description: string;
  hsCode: string;
  quantity: string; // string for form input
  unit: string;
  unitPrice: string; // string for form input
}

export interface InvoiceFormErrors {
  tradeId?: string;
  invoiceDate?: string;
  dueDate?: string;
  lineItems?: string;
  general?: string;
}

// Trade Selection (for drawer)
export interface TradeForSelection {
  id: string;
  tradeNumber: string;
  tradeType: 'EXPORT' | 'IMPORT';
  partyId: string;
  partyName: string;
  currency?: string;
  createdAt: string;
}
