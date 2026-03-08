// ═══════════════════════════════════════════════════════════════════════════════
// QUARTERLY HEDGING MODULE - TYPE DEFINITIONS
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────────
// HEDGE RECORD RESPONSE - Common response type for all hedge operations
// ─────────────────────────────────────────────────────────────────────────────────
export interface HedgeRecordResponse {
  id: string;
  type: 'FORWARD' | 'NATURAL';
  status: 'ACTIVE' | 'CLOSED' | 'MATURED' | 'SETTLED';
  
  // Common fields for all hedges
  currency: string;
  hedgeAmount: number;
  rate: number;                      // Forward rate or internal rate
  hedgeAmountInBaseCurrency: number;
  quarter: string;                   // e.g., "Q1-2026"
  createdAt: string;
  createdByUserId: string;
  createdByName?: string;
  
  // Forward contract specific
  exposureId?: string;
  contractNumber?: string;
  bankName?: string;
  contractDate?: string;
  maturityDate?: string;
  premium?: number;
  
  // Natural hedge specific
  receivableExposureId?: string;
  payableExposureId?: string;
  receivableInvoiceNumber?: string;
  payableInvoiceNumber?: string;
  linkedHedgeId?: string;             // Paired natural hedge record
  receivableExposure?: ExposureBriefInfo;  // Full exposure object for receivable
  payableExposure?: ExposureBriefInfo;     // Full exposure object for payable
  hedgeRate?: number;                      // Hedge rate
  
  // Closed hedge fields
  settlementRate?: number;
  gainLoss?: number;
  closedAt?: string;
  closedByUserId?: string;
  closedByName?: string;
  remarks?: string;
}

// Natural hedge with required exposure objects (used when iterating naturalHedges)
export interface NaturalHedgeRecordResponse extends HedgeRecordResponse {
  type: 'NATURAL';
  receivableExposure: ExposureBriefInfo;
  payableExposure: ExposureBriefInfo;
}

// ─────────────────────────────────────────────────────────────────────────────────
// ENHANCED DASHBOARD TYPES
// ─────────────────────────────────────────────────────────────────────────────────

// Enhanced currency summary with natural hedge potential
export interface CurrencyExposureSummary {
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
  
  // NEW: Quarterly hedging fields
  receivableUnhedged: number;        // Unhedged receivables in this currency
  payableUnhedged: number;           // Unhedged payables in this currency
  netExposureAtRisk: number;         // Math.Abs(receivableUnhedged - payableUnhedged)
  naturalHedgePotential: number;     // Min(receivableUnhedged, payableUnhedged)
  naturalHedgedAmount: number;       // Already naturally hedged
  forwardHedgedAmount: number;       // Hedged via forward contracts
  netExposureAtRiskInBaseCurrency: number;
}

// Quarterly breakdown
export interface QuarterlyExposureBreakdown {
  quarter: string;                   // e.g., "Q1-2026"
  currency: string;
  receivableAmount: number;
  payableAmount: number;
  naturalHedgePotential: number;
  netExposureAtRisk: number;
}

// Enhanced dashboard totals
export interface EnhancedDashboardTotals {
  totalCount: number;
  fullyHedgedCount: number;
  partiallyHedgedCount: number;
  unhedgedCount: number;
  settledCount: number;
  totalUnhedgedValueInBaseCurrency: number;
  overallHedgePercentage: number;
  
  // NEW: Quarterly hedging fields
  totalNetExposureAtRisk: number;        // TRUE forex risk
  totalNaturalHedgePotential: number;    // Can be naturally hedged
}

// Enhanced dashboard response
export interface EnhancedExposureDashboardData {
  companyId: string;
  baseCurrency: string;
  generatedAt: string;
  totals: EnhancedDashboardTotals;
  byCurrency: CurrencyExposureSummary[];
  byQuarter: QuarterlyExposureBreakdown[];
  byType: Array<{
    type: string;
    count: number;
    totalExposedAmount: number;
    totalHedgedAmount: number;
    totalSettledAmount: number;
    totalUnhedgedAmount: number;
    hedgePercentage: number;
  }>;
  byHedgeStatus: Array<{
    status: string;
    count: number;
    totalExposedAmount: number;
    totalUnhedgedAmount: number;
    percentage: number;
  }>;
  maturingSoon: Array<any>;
  overdue: Array<any>;
}

// ─────────────────────────────────────────────────────────────────────────────────
// FORWARD CONTRACT BOOKING
// ─────────────────────────────────────────────────────────────────────────────────
export interface BookForwardContractRequest {
  exposureId: string;                  // Required: Which exposure to hedge
  hedgeAmount: number;                 // Required: Amount in foreign currency
  forwardRate: number;                 // Required: Contracted forward rate
  contractNumber: string;              // Required: Bank contract number
  bankName?: string;                   // Optional: Bank name
  contractDate?: string;               // Optional: Date of contract
  maturityDate?: string;               // Optional: Forward maturity date
  premium?: number;                    // Optional: Forward premium/discount
  remarks?: string;                    // Optional: Notes
}

export interface BookForwardContractResponse {
  success: boolean;
  data: HedgeRecordResponse;
  message?: string;
}

// ─────────────────────────────────────────────────────────────────────────────────
// QUARTERLY NATURAL HEDGE
// ─────────────────────────────────────────────────────────────────────────────────
export interface ApplyQuarterlyNaturalHedgeRequest {
  quarter: string;                     // Required: e.g., "Q1-2026"
  currency: string;                    // Required: Currency code
  receivableExposureIds: string[];     // Required: Receivable exposures to include
  payableExposureIds: string[];        // Required: Payable exposures to include
  totalHedgeAmount: number;            // Required: Total amount to naturally hedge
  internalRate?: number;               // Optional: Internal transfer rate
  remarks?: string;                    // Optional: Notes
}

export interface QuarterlyNaturalHedgeResponse {
  success: boolean;
  data: {
    quarter: string;
    currency: string;
    totalHedgeAmount: number;
    hedgePairsCreated: number;
    hedgeRecords: HedgeRecordResponse[];
    remainingReceivableUnhedged: number;
    remainingPayableUnhedged: number;
    remainingNetExposure: number;
  };
  message?: string;
}

// ─────────────────────────────────────────────────────────────────────────────────
// CLOSE HEDGE
// ─────────────────────────────────────────────────────────────────────────────────
export interface CloseHedgeApiRequest {
  settlementRate?: number;             // Optional: Rate at which it was settled
  gainLoss?: number;                   // Optional: P&L from hedge
  remarks?: string;                    // Optional: Closure notes
}

export interface CloseHedgeResponse {
  success: boolean;
  data: HedgeRecordResponse;
  message?: string;
}

// ─────────────────────────────────────────────────────────────────────────────────
// GET HEDGES
// ─────────────────────────────────────────────────────────────────────────────────
export interface HedgesListResponse {
  success: boolean;
  data: HedgeRecordResponse[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HedgeFilters {
  type?: 'FORWARD' | 'NATURAL';
  status?: 'ACTIVE' | 'CLOSED' | 'MATURED' | 'SETTLED';
  quarter?: string;
  currency?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─────────────────────────────────────────────────────────────────────────────────
// EXPOSURES FOR HEDGING
// ─────────────────────────────────────────────────────────────────────────────────
export interface GetExposuresForHedgingRequest {
  quarter: string;                     // Required: e.g., "Q1-2026"
  currency: string;                    // Required: Currency code
}

export interface ExposureBriefInfo {
  id: string;
  invoiceNumber: string;
  partyName: string;
  type: 'RECEIVABLE' | 'PAYABLE';
  currency: string;
  exposedAmount: number;
  unhedgedAmount: number;
  maturityDate: string;
  quarter: string;
}

export interface ExposuresForHedgingResponse {
  success: boolean;
  data: {
    quarter: string;
    currency: string;
    receivables: ExposureBriefInfo[];
    payables: ExposureBriefInfo[];
    totalReceivableUnhedged: number;
    totalPayableUnhedged: number;
    naturalHedgePotential: number;
    netExposureAtRisk: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────────
// QUARTERLY REPORT
// ─────────────────────────────────────────────────────────────────────────────────
export interface QuarterlyReportSummary {
  totalReceivables: number;
  totalPayables: number;
  netPosition: number;                 // Receivables - Payables
  naturallyHedged: number;
  forwardHedged: number;
  totalHedged: number;
  netExposureAtRisk: number;
  hedgePercentage: number;             // Percentage hedged
  hedgeRatio: number;                  // Alias for hedgePercentage
}

export interface ExposureSummaryItem {
  id: string;
  invoiceNumber: string;
  partyName: string;
  type: 'RECEIVABLE' | 'PAYABLE';
  currency: string;
  exposedAmount: number;
  unhedgedAmount: number;
  maturityDate: string;
}

export interface QuarterlyExposureReportResponse {
  success: boolean;
  data: {
    quarter: string;
    currency: string;
    generatedAt: string;
    summary: QuarterlyReportSummary;
    receivables: ExposureBriefInfo[];
    payables: ExposureBriefInfo[];
    naturalHedges: NaturalHedgeRecordResponse[];
    forwardContracts: HedgeRecordResponse[];
    unhedgedExposures: ExposureSummaryItem[];
  };
}

// ─────────────────────────────────────────────────────────────────────────────────
// FORM TYPES
// ─────────────────────────────────────────────────────────────────────────────────
export interface BookForwardFormData {
  exposureId: string;
  hedgeAmount: string;
  forwardRate: string;
  contractNumber: string;
  bankName: string;
  contractDate: string;
  maturityDate: string;
  premium: string;
  remarks: string;
}

export interface BookForwardFormErrors {
  exposureId?: string;
  hedgeAmount?: string;
  forwardRate?: string;
  contractNumber?: string;
  bankName?: string;
  contractDate?: string;
  maturityDate?: string;
  premium?: string;
  remarks?: string;
  general?: string;
}

export interface QuarterlyNaturalHedgeFormData {
  quarter: string;
  currency: string;
  receivableExposureIds: string[];
  payableExposureIds: string[];
  totalHedgeAmount: string;
  internalRate: string;
  remarks: string;
}

export interface QuarterlyNaturalHedgeFormErrors {
  quarter?: string;
  currency?: string;
  receivableExposureIds?: string;
  payableExposureIds?: string;
  totalHedgeAmount?: string;
  internalRate?: string;
  remarks?: string;
  general?: string;
}

export interface CloseHedgeFormData {
  hedgeId: string;
  settlementRate: string;
  gainLoss: string;
  remarks: string;
}

export interface CloseHedgeFormErrors {
  hedgeId?: string;
  settlementRate?: string;
  gainLoss?: string;
  remarks?: string;
  general?: string;
}

// ─────────────────────────────────────────────────────────────────────────────────
// WORKFLOW STATE TYPES
// ─────────────────────────────────────────────────────────────────────────────────
export type NaturalHedgeWorkflowStep = 
  | 'select-quarter' 
  | 'select-exposures' 
  | 'confirm' 
  | 'result';

export interface NaturalHedgeWorkflowState {
  step: NaturalHedgeWorkflowStep;
  selectedQuarter: string;
  selectedCurrency: string;
  selectedReceivables: string[];
  selectedPayables: string[];
  hedgeAmount: number;
  internalRate?: number;
  remarks?: string;
}

// ─────────────────────────────────────────────────────────────────────────────────
// QUARTER HELPERS
// ─────────────────────────────────────────────────────────────────────────────────
export interface QuarterInfo {
  quarter: string;                     // e.g., "Q1-2026"
  label: string;                       // e.g., "Q1 2026 (Jan-Mar)"
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────────
// HEDGE MANAGEMENT STATE
// ─────────────────────────────────────────────────────────────────────────────────
export interface HedgeManagementState {
  hedges: HedgeRecordResponse[];
  isLoading: boolean;
  error: string | null;
  filters: HedgeFilters;
  selectedHedge: HedgeRecordResponse | null;
  closeModalOpen: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────────
// DASHBOARD ENHANCED STATE
// ─────────────────────────────────────────────────────────────────────────────────
export interface QuarterlyHedgingDashboardState {
  selectedQuarter: string;
  selectedCurrency: string | null;
  naturalHedgeModalOpen: boolean;
  forwardBookingModalOpen: boolean;
  quarterlyReportModalOpen: boolean;
  selectedExposureForForward: ExposureBriefInfo | null;
}
