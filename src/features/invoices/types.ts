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

// Invoice Line Item (simplified - no tax)
export interface InvoiceLineItem {
  id: string;
  description: string;
  hsCode?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;    // quantity × unitPrice
}

// Invoice Entity
export interface Invoice {
  paymentInfo: any;
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
  
  // Totals (with tax and discount)
  subtotal: number;         // Sum of line totals
  taxPercent: number;       // Tax percentage
  taxAmount: number;        // Calculated or direct tax amount
  discountPercent: number;  // Discount percentage
  discountAmount: number;   // Calculated or direct discount amount
  invoiceAmount: number;    // Final amount (subtotal + tax - discount)
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
  Reason?: string;
}

// API Request Types
export interface CreateInvoiceRequest {
  tradeId: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  taxPercent: number;
  taxAmount: number;
  discountPercent: number;
  discountAmount: number;
  invoiceAmount: number;    // Final calculated invoice amount
  lineItems: Omit<InvoiceLineItem, 'id' | 'lineTotal'>[];
}

export interface UpdateInvoiceRequest {
  id: string;
  invoiceDate?: string;
  dueDate?: string;
  taxPercent?: number;
  taxAmount?: number;
  discountPercent?: number;
  discountAmount?: number;
  invoiceAmount?: number;   // Final calculated invoice amount
  lineItems?: Omit<InvoiceLineItem, 'id' | 'lineTotal'>[];
}

export interface IssueInvoiceRequest {
  id: string;
}

export interface CancelInvoiceRequest {
  id: string;
  Reason: string;
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

// Input mode for tax/discount
export type InputMode = 'percent' | 'amount';

// Form Types
export interface InvoiceFormData {
  tradeId: string;
  invoiceDate: string;
  dueDate: string;
  // Tax fields
  taxMode: InputMode;       // 'percent' or 'amount'
  taxPercent: string;       // string for form input (used when taxMode is 'percent')
  taxAmount: string;        // string for form input (used when taxMode is 'amount')
  // Discount fields
  discountMode: InputMode;  // 'percent' or 'amount'
  discountPercent: string;  // string for form input (used when discountMode is 'percent')
  discountAmount: string;   // string for form input (used when discountMode is 'amount')
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

// ============================================================================
// PAYMENT TYPES
// ============================================================================

// Payment Entity (from GET /api/Payment/{paymentId})
export interface Payment {
  id: string;
  companyId: string;
  invoiceId: string;
  invoiceNumber: string;
  currency: string;
  amountInForeignCurrency: number;
  exchangeRate: number;
  amountInBaseCurrency: number;
  paymentDate: string;
  paymentReference: string;
  paymentMethod: string;
  remarks?: string;
  createdAt: string;
  createdBy: string;
  createdByName?: string;
  invoiceAmount: number;
  outstandingAmountAfterPayment: number;
  invoiceStatusAfterPayment: string;
  tradeId: string;
  tradeNumber: string;
  tradeType: string;
  partyId: string;
  partyName: string;
}

// Payment List Item (from GET /api/Payment)
export interface PaymentListItem {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  currency: string;
  amountInForeignCurrency: number;
  amountInBaseCurrency: number;
  exchangeRate: number;
  paymentDate: string;
  paymentReference: string;
  paymentMethod: string;
  partyName: string;
  tradeNumber: string;
  tradeType: string;
  createdAt: string;
}

// Payment in Invoice History (from GET /api/Payment/invoice/{invoiceId})
export interface InvoicePaymentHistoryItem {
  id: string;
  amountInForeignCurrency: number;
  exchangeRate: number;
  amountInBaseCurrency: number;
  outstandingBefore: number;
  outstandingAfter: number;
  paymentDate: string;
  paymentReference: string;
  paymentMethod: string;
  remarks?: string;
  recordedBy: string;
  recordedAt: string;
}

// Invoice Payment Summary (from GET /api/Payment/invoice/{invoiceId})
export interface InvoicePaymentSummary {
  invoiceId: string;
  invoiceNumber: string;
  currency: string;
  invoiceAmount: number;
  outstandingAmount: number;
  totalPaidAmount: number;
  invoiceStatus: string;
  paymentPercentage: number;
  paymentCount: number;
  payments: InvoicePaymentHistoryItem[];
  tradeNumber: string;
  tradeType: string;
  partyName: string;
}

// Invoice Payment Info (embedded in Invoice response)
export interface InvoicePaymentInfo {
  totalPaidAmount: number;
  paymentCount: number;
  paymentPercentage: number;
  lastPaymentDate?: string;
}

// Create Payment Request
export interface CreatePaymentRequest {
  invoiceId: string;
  amountInForeignCurrency: number;
  exchangeRate: number;
  paymentDate: string;
  paymentReference: string;
  paymentMethod: string;
  remarks?: string;
}

// Payment API Responses
export interface PaymentResponse {
  id: string;
  companyId: string;
  invoiceId: string;
  invoiceNumber: string;
  currency: string;
  amountInForeignCurrency: number;
  exchangeRate: number;
  amountInBaseCurrency: number;
  paymentDate: string;
  paymentReference: string;
  paymentMethod: string;
  remarks?: string;
  createdAt: string;
  createdBy: string;
  createdByName?: string;
  invoiceAmount: number;
  outstandingAmountAfterPayment: number;
  invoiceStatusAfterPayment: string;
  tradeId: string;
  tradeNumber: string;
  tradeType: string;
  partyId: string;
  partyName: string;
}

export interface PaymentsListResponse {
  data: PaymentListItem[];
}

export interface InvoicePaymentSummaryResponse {
  data: InvoicePaymentSummary;
}

// Payment Form Data (for modal)
export interface PaymentFormData {
  amountInForeignCurrency: string;
  exchangeRate: string;
  paymentDate: string;
  paymentReference: string;
  paymentMethod: string;
  remarks: string;
}

export interface PaymentFormErrors {
  amountInForeignCurrency?: string;
  exchangeRate?: string;
  paymentDate?: string;
  paymentReference?: string;
  paymentMethod?: string;
  general?: string;
}

// Payment Date Range Query
export interface PaymentDateRangeQuery {
  startDate: string;
  endDate: string;
}
