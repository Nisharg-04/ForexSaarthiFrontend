// ═══════════════════════════════════════════════════════════════════════════════
// FORWARD CONTRACTS MODULE - TYPE DEFINITIONS
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────────
// FORWARD CONTRACT STATUS ENUM
// ─────────────────────────────────────────────────────────────────────────────────
export const ForwardStatus = {
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
} as const;

export type ForwardStatus = (typeof ForwardStatus)[keyof typeof ForwardStatus];

// ─────────────────────────────────────────────────────────────────────────────────
// FORWARD CONTRACT ENTITY
// ─────────────────────────────────────────────────────────────────────────────────
export interface ForwardContract {
  id: string;
  companyId: string;
  exposureId: string;
  invoiceId: string;
  tradeId: string;
  
  // Contract Details
  currency: string;
  contractAmount: number;
  forwardRate: number;
  baseAmount: number; // contractAmount * forwardRate (INR value)
  
  // Bank Details
  bankName: string;
  contractReference: string;
  
  // Dates
  contractDate: string;
  settlementDate: string;
  quarterDisplay: string; // e.g., "Q1 2026"
  
  // Status
  status: ForwardStatus;
  isActive: boolean;
  
  // P&L
  closingRate?: number;
  closedDate?: string;
  gainLoss: number;
  gainLossPercentage?: number;
  
  // Linked Info
  invoiceNumber?: string;
  tradeNumber?: string;
  partyName?: string;
  exposureType?: 'RECEIVABLE' | 'PAYABLE';
  
  // Audit
  remarks?: string;
  cancellationReason?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt?: string;
  closedBy?: string;
  closedByName?: string;
}

// ─────────────────────────────────────────────────────────────────────────────────
// FILTER TYPES
// ─────────────────────────────────────────────────────────────────────────────────
export interface ForwardFilters {
  currency?: string;
  bank?: string;
  status?: ForwardStatus | '';
  year?: number | string;
  quarter?: string; // Q1, Q2, Q3, Q4
  search?: string;
  exposureId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'contractDate' | 'settlementDate' | 'contractAmount' | 'gainLoss';
  sortOrder?: 'asc' | 'desc';
}

// ─────────────────────────────────────────────────────────────────────────────────
// REQUEST TYPES
// ─────────────────────────────────────────────────────────────────────────────────
export interface BookForwardRequest {
  exposureId: string;
  contractAmount: number;
  forwardRate: number;
  bankName: string;
  contractReference: string;
  contractDate: string;
  settlementDate: string;
  remarks?: string;
}

export interface CloseForwardRequest {
  closingRate: number;
  closedDate: string;
  remarks?: string;
}

export interface CancelForwardRequest {
  reason: string;
  closingRate?: number;
}

// ─────────────────────────────────────────────────────────────────────────────────
// RESPONSE TYPES
// ─────────────────────────────────────────────────────────────────────────────────
export interface ForwardContractResponse {
  success: boolean;
  data: ForwardContract;
  message?: string;
}

export interface ForwardContractsResponse {
  success: boolean;
  data: ForwardContract[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

// ─────────────────────────────────────────────────────────────────────────────────
// ANALYTICS TYPES
// ─────────────────────────────────────────────────────────────────────────────────
export interface QuarterAnalytics {
  quarter: string;
  year: number;
  totalContracts: number;
  activeContracts: number;
  closedContracts: number;
  cancelledContracts: number;
  totalHedgedAmount: number;
  totalHedgedAmountINR: number;
  averageForwardRate: number;
  totalGainLoss: number;
  currencyBreakdown: CurrencyBreakdown[];
  bankBreakdown: BankBreakdown[];
}

export interface CurrencyBreakdown {
  currency: string;
  count: number;
  totalAmount: number;
  totalAmountINR: number;
  averageRate: number;
  gainLoss: number;
}

export interface BankBreakdown {
  bankName: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface RateDistribution {
  currency: string;
  minRate: number;
  avgRate: number;
  maxRate: number;
  contractCount: number;
}

export interface AnnualAnalytics {
  year: number;
  totalContracts: number;
  activeContracts: number;
  closedContracts: number;
  cancelledContracts: number;
  totalHedgedAmount: number;
  totalHedgedAmountINR: number;
  averageForwardRate: number;
  totalGainLoss: number;
  quarterlyData: QuarterAnalytics[];
  currencyBreakdown: CurrencyBreakdown[];
  bankBreakdown: BankBreakdown[];
  rateDistribution: RateDistribution[];
}

export interface QuarterAnalyticsResponse {
  success: boolean;
  data: QuarterAnalytics;
  message?: string;
}

export interface AnnualAnalyticsResponse {
  success: boolean;
  data: AnnualAnalytics;
  message?: string;
}

// ─────────────────────────────────────────────────────────────────────────────────
// EXPIRING CONTRACTS
// ─────────────────────────────────────────────────────────────────────────────────
export interface ExpiringContract extends ForwardContract {
  daysRemaining: number;
}

export interface ExpiringContractsResponse {
  success: boolean;
  data: ExpiringContract[];
  message?: string;
}

// ─────────────────────────────────────────────────────────────────────────────────
// FORM TYPES
// ─────────────────────────────────────────────────────────────────────────────────
export interface BookForwardFormData {
  exposureId: string;
  contractAmount: string;
  forwardRate: string;
  bankName: string;
  contractReference: string;
  contractDate: string;
  settlementDate: string;
  remarks: string;
}

export interface BookForwardFormErrors {
  contractAmount?: string;
  forwardRate?: string;
  bankName?: string;
  contractReference?: string;
  contractDate?: string;
  settlementDate?: string;
  general?: string;
}

export interface CloseForwardFormData {
  closingRate: string;
  closedDate: string;
  remarks: string;
}

export interface CloseForwardFormErrors {
  closingRate?: string;
  closedDate?: string;
  general?: string;
}

export interface CancelForwardFormData {
  reason: string;
  closingRate: string;
  remarks?: string;
}

export interface CancelForwardFormErrors {
  reason?: string;
  closingRate?: string;
  remarks?: string;
  general?: string;
}

// ─────────────────────────────────────────────────────────────────────────────────
// EXPOSURE BRIEF FOR BOOKING
// ─────────────────────────────────────────────────────────────────────────────────
export interface ExposureBriefForBooking {
  id: string;
  invoiceNumber: string;
  tradeNumber: string;
  partyName: string;
  currency: string;
  totalAmount: number;
  hedgedAmount: number;
  unhedgedAmount: number;
  maturityDate: string;
  exposureType: 'RECEIVABLE' | 'PAYABLE';
}
