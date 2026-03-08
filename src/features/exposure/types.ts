// ═══════════════════════════════════════════════════════════════════════════════
// EXPOSURE MODULE - TYPE DEFINITIONS
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────────
// EXPOSURE STATUS ENUM
// ─────────────────────────────────────────────────────────────────────────────────
export const ExposureStatus = {
  UNHEDGED: 'UNHEDGED',
  PARTIALLY_HEDGED: 'PARTIALLY_HEDGED',
  FULLY_HEDGED: 'FULLY_HEDGED',
  SETTLED: 'SETTLED',
  OVERDUE: 'OVERDUE',
} as const;

export type ExposureStatus = (typeof ExposureStatus)[keyof typeof ExposureStatus];

// ─────────────────────────────────────────────────────────────────────────────────
// EXPOSURE TYPE ENUM (Derived from Invoice Type)
// ─────────────────────────────────────────────────────────────────────────────────
export const ExposureType = {
  RECEIVABLE: 'RECEIVABLE', // Export invoices - money coming in
  PAYABLE: 'PAYABLE',       // Import invoices - money going out
} as const;

export type ExposureType = (typeof ExposureType)[keyof typeof ExposureType];

// ─────────────────────────────────────────────────────────────────────────────────
// HEDGE TYPE ENUM
// ─────────────────────────────────────────────────────────────────────────────────
export const HedgeType = {
  FORWARD: 'FORWARD',       // Bank forward contract
  NATURAL: 'NATURAL',       // Natural hedge against opposite exposure
} as const;

export type HedgeType = (typeof HedgeType)[keyof typeof HedgeType];

// ─────────────────────────────────────────────────────────────────────────────────
// HEDGE STATUS ENUM
// ─────────────────────────────────────────────────────────────────────────────────
export const HedgeStatus = {
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
} as const;

export type HedgeStatus = (typeof HedgeStatus)[keyof typeof HedgeStatus];

// ─────────────────────────────────────────────────────────────────────────────────
// HEDGE RECORD - Individual hedge against an exposure
// ─────────────────────────────────────────────────────────────────────────────────
export interface Hedge {
  id: string;
  exposureId: string;
  hedgeType: HedgeType;
  type: HedgeType;              // Alias for hedgeType
  amount: number;
  currency: string;
  rate: number;                 // Hedge rate (forward rate or spot rate)
  forwardRate?: number;         // For forward hedges
  inrValue: number;             // Value in INR
  contractDate: string;
  appliedDate: string;          // When the hedge was applied
  settlementDate: string;
  bankName?: string;            // For forward hedges
  contractNumber?: string;      // Bank contract/reference number
  contractReference?: string;   // Alias for contractNumber
  linkedExposureId?: string;    // For natural hedges - the opposite exposure
  matchedExposureId?: string;   // Alias for linkedExposureId
  status: HedgeStatus;
  remarks?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  closedAt?: string;
  closedBy?: string;
  closedByName?: string;
}

// ─────────────────────────────────────────────────────────────────────────────────
// EXPOSURE ENTITY - Main exposure record
// ─────────────────────────────────────────────────────────────────────────────────
export interface Exposure {
  id: string;
  companyId: string;
  invoiceId: string;
  tradeId: string;
  partyId: string;

  // Identifiers
  invoiceNumber: string;
  tradeNumber: string;

  // Party details
  partyName: string;
  partyCountry?: string;

  // Exposure attributes
  exposureType: ExposureType;
  type: ExposureType;           // Alias for exposureType for convenience
  currency: string;
  exposureDate: string;         // When exposure was created (invoice issue date)
  invoiceDate: string;          // Invoice issue date
  maturityDate: string;         // Due date from invoice

  // Amounts in foreign currency
  exposedAmount: number;        // Original exposure amount
  originalAmount: number;       // Alias for exposedAmount
  hedgedAmount: number;         // Sum of active hedge amounts
  settledAmount: number;        // Amount settled via payments
  unhedgedAmount: number;       // exposedAmount - hedgedAmount - settledAmount

  // Amounts in INR (base currency)
  inrValue: number;             // Total exposure value in INR
  hedgedAmountINR: number;      // Hedged amount in INR
  unhedgedAmountINR: number;    // Unhedged amount in INR
  bookingRate: number;          // Exchange rate at booking time

  // Calculated percentages
  hedgePercentage: number;      // (hedgedAmount / exposedAmount) * 100
  settlementPercentage: number; // (settledAmount / exposedAmount) * 100

  // Days metrics
  daysToMaturity: number;       // Days until maturity (negative if overdue)
  daysOverdue?: number;         // Days past due (only if overdue)

  // Status
  status: ExposureStatus;

  // Hedge history
  hedges: Hedge[];

  // Lifecycle metadata
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────────
// EXPOSURE DASHBOARD AGGREGATES (Matches actual API response)
// ─────────────────────────────────────────────────────────────────────────────────

// API Exposure DTO (for list/dashboard endpoints - simpler than full Exposure)
export interface ExposureListItem {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  type: string;
  currency: string;
  exposedAmount: number;
  hedgedAmount: number;
  settledAmount: number;
  unhedgedAmount: number;
  hedgePercentage: number;
  maturityDate: string;
  daysToMaturity: number;
  isFullyHedged: boolean;
  isSettled: boolean;
  hedgeStatus: string;
  tradeId: string;
  tradeNumber: string;
  tradeType: string;
  partyName: string;
  createdAt: string;
}

// Dashboard totals from API
export interface DashboardTotals {
  totalCount: number;
  fullyHedgedCount: number;
  partiallyHedgedCount: number;
  unhedgedCount: number;
  settledCount: number;
  totalUnhedgedValueInBaseCurrency: number;
  overallHedgePercentage: number;
}

// Currency breakdown from API
export interface ExposureByCurrency {
  currency: string;
  count: number;
  totalExposedAmount: number;
  totalHedgedAmount: number;
  totalSettledAmount: number;
  totalUnhedgedAmount: number;
  hedgePercentage: number;
  netPosition: number;
  currentRate: number;
  valueInBaseCurrency: number;
  // Optional: For quarterly hedging feature (add to API when ready)
  receivableUnhedgedAmount?: number;  // Unhedged receivables in this currency
  payableUnhedgedAmount?: number;     // Unhedged payables in this currency
}

// Type breakdown from API (Receivable/Payable)
export interface ExposureByType {
  type: string;
  count: number;
  totalExposedAmount: number;
  totalHedgedAmount: number;
  totalSettledAmount: number;
  totalUnhedgedAmount: number;
  hedgePercentage: number;
}

// Hedge status breakdown from API
export interface ExposureByHedgeStatus {
  status: string;
  count: number;
  totalExposedAmount: number;
  totalUnhedgedAmount: number;
  percentage: number;
}

// Full dashboard data structure from API
export interface ExposureDashboardData {
  companyId: string;
  baseCurrency: string;
  generatedAt: string;
  totals: DashboardTotals;
  byCurrency: ExposureByCurrency[];
  byType: ExposureByType[];
  byHedgeStatus: ExposureByHedgeStatus[];
  maturingSoon: ExposureListItem[];
  overdue: ExposureListItem[];
}

// Legacy interface for backward compatibility with existing components
export interface ExposureSummary {
  totalExposures: number;
  totalExposedAmount: number;
  totalHedgedAmount: number;
  totalSettledAmount: number;
  totalUnhedgedAmount: number;
  overallHedgePercentage: number;
  unhedgedAmount: number;
  unhedgedCount: number;
  avgHedgePercentage: number;
  netExposure: number;
  totalReceivables: number;
  totalPayables: number;
  countByStatus: Record<ExposureStatus, number>;
  countByType: Record<ExposureType, number>;
  countByCurrency: Record<string, number>;
}

// Legacy HedgeCoverage for backward compatibility
export interface HedgeCoverage {
  currency: string;
  hedgePercentage: number;
  unhedgedAmount: number;
  targetPercentage?: number;
}

// ─────────────────────────────────────────────────────────────────────────────────
// NATURAL HEDGE MATCHING
// ─────────────────────────────────────────────────────────────────────────────────
export interface NaturalHedgeMatch {
  oppositeExposure: Exposure;
  matchableCurrency: string;
  maxMatchAmount: number;       // min(source.unhedged, target.unhedged)
  netImpact: number;            // source.unhedged - matchAmount
}

// ─────────────────────────────────────────────────────────────────────────────────
// API REQUEST TYPES
// ─────────────────────────────────────────────────────────────────────────────────
export interface ExposureFilters {
  currency?: string | string[];
  exposureType?: ExposureType | ExposureType[];
  status?: ExposureStatus | ExposureStatus[];
  hedgingStatus?: 'HEDGED' | 'UNHEDGED' | 'PARTIAL';
  settlementStatus?: 'SETTLED' | 'UNSETTLED' | 'PARTIAL';
  partyId?: string;
  tradeId?: string;
  invoiceId?: string;
  maturityFrom?: string;
  maturityTo?: string;
  minAmount?: number;
  maxAmount?: number;
  hedgePercentageMin?: number;
  hedgePercentageMax?: number;
  search?: string;
  page?: number;
  pageSize?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApplyForwardHedgeRequest {
  amount: number;
  forwardRate: number;
  contractDate: string;
  settlementDate: string;
  bankName: string;
  contractReference?: string;
  remarks?: string;
}

export interface ApplyNaturalHedgeRequest {
  oppositeExposureId: string;
  amount: number;
  remarks?: string;
}

export interface CloseHedgeRequest {
  hedgeId: string;
  settlementDate: string;
  remarks?: string;
}

// ─────────────────────────────────────────────────────────────────────────────────
// API RESPONSE TYPES
// ─────────────────────────────────────────────────────────────────────────────────
export interface ExposureResponse {
  success: boolean;
  data: Exposure;
  message?: string;
}

export interface ExposuresResponse {
  success: boolean;
  data: Exposure[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ExposureDashboardResponse {
  success: boolean;
  data: ExposureDashboardData;
}

export interface HedgeResponse {
  success: boolean;
  data: Hedge;
  message?: string;
}

export interface NaturalHedgeMatchesResponse {
  success: boolean;
  data: NaturalHedgeMatch[];
}

// ─────────────────────────────────────────────────────────────────────────────────
// FORM TYPES
// ─────────────────────────────────────────────────────────────────────────────────
export interface ForwardHedgeFormData {
  amount: string;
  forwardRate: string;
  contractDate: string;
  settlementDate: string;
  bankName: string;
  contractReference: string;
  remarks: string;
}

export interface ForwardHedgeFormErrors {
  amount?: string;
  forwardRate?: string;
  contractDate?: string;
  settlementDate?: string;
  bankName?: string;
  contractReference?: string;
  remarks?: string;
  general?: string;
}

export interface NaturalHedgeFormData {
  oppositeExposureId: string;
  amount: string;
  remarks: string;
}

export interface NaturalHedgeFormErrors {
  oppositeExposureId?: string;
  amount?: string;
  remarks?: string;
  general?: string;
}

export interface CloseHedgeFormData {
  hedgeId: string;
  settlementDate: string;
  remarks: string;
}

export interface CloseHedgeFormErrors {
  hedgeId?: string;
  settlementDate?: string;
  remarks?: string;
  general?: string;
}
