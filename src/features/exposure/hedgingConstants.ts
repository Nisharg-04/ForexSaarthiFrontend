// ═══════════════════════════════════════════════════════════════════════════════
// QUARTERLY HEDGING MODULE - CONSTANTS
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────────
// HEDGE RECORD STATUS STYLES
// ─────────────────────────────────────────────────────────────────────────────────
export const HEDGE_RECORD_STATUS_STYLES = {
  ACTIVE: {
    light: 'bg-green-50 text-green-700 border-green-200',
    dark: 'bg-green-500/10 text-green-400 border-green-500/20',
    icon: '🟢',
    color: 'green',
    label: 'Active',
    description: 'Hedge is currently active',
  },
  CLOSED: {
    light: 'bg-slate-50 text-slate-700 border-slate-200',
    dark: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
    icon: '⚫',
    color: 'slate',
    label: 'Closed',
    description: 'Hedge has been closed',
  },
  MATURED: {
    light: 'bg-blue-50 text-blue-700 border-blue-200',
    dark: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: '🔵',
    color: 'blue',
    label: 'Matured',
    description: 'Hedge has matured',
  },
  SETTLED: {
    light: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dark: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: '✅',
    color: 'emerald',
    label: 'Settled',
    description: 'Hedge has been settled',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────────
// HEDGE RECORD TYPE STYLES
// ─────────────────────────────────────────────────────────────────────────────────
export const HEDGE_RECORD_TYPE_STYLES = {
  FORWARD: {
    light: 'bg-violet-50 text-violet-700 border-violet-200',
    dark: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    icon: '📋',
    color: 'violet',
    label: 'Forward',
    fullLabel: 'Forward Contract',
    description: 'Bank forward contract',
  },
  NATURAL: {
    light: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    dark: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    icon: '🔄',
    color: 'cyan',
    label: 'Natural',
    fullLabel: 'Natural Hedge',
    description: 'Natural hedge against opposite exposure',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────────
// RISK LEVEL STYLES
// ─────────────────────────────────────────────────────────────────────────────────
export const RISK_LEVEL_STYLES = {
  low: {
    light: 'bg-green-50 text-green-700 border-green-200',
    dark: 'bg-green-500/10 text-green-400 border-green-500/20',
    icon: '✅',
    color: 'green',
    label: 'Low Risk',
    description: 'Hedge ratio > 80%',
  },
  medium: {
    light: 'bg-amber-50 text-amber-700 border-amber-200',
    dark: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: '⚠️',
    color: 'amber',
    label: 'Medium Risk',
    description: 'Hedge ratio 50-80%',
  },
  high: {
    light: 'bg-red-50 text-red-700 border-red-200',
    dark: 'bg-red-500/10 text-red-400 border-red-500/20',
    icon: '🔴',
    color: 'red',
    label: 'High Risk',
    description: 'Hedge ratio < 50%',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────────
// HEDGE STATUS FILTER OPTIONS
// ─────────────────────────────────────────────────────────────────────────────────
export const HEDGE_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'MATURED', label: 'Matured' },
  { value: 'SETTLED', label: 'Settled' },
] as const;

export const HEDGE_TYPE_FILTER_OPTIONS = [
  { value: 'FORWARD', label: 'Forward Contract' },
  { value: 'NATURAL', label: 'Natural Hedge' },
] as const;

export const HEDGE_STATUS_TABS = [
  { value: undefined, label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'MATURED', label: 'Matured' },
  { value: 'SETTLED', label: 'Settled' },
] as const;

export const HEDGE_TYPE_TABS = [
  { value: undefined, label: 'All' },
  { value: 'NATURAL', label: 'Natural' },
  { value: 'FORWARD', label: 'Forward' },
] as const;

// ─────────────────────────────────────────────────────────────────────────────────
// HEDGE TABLE COLUMNS
// ─────────────────────────────────────────────────────────────────────────────────
export const HEDGE_MANAGEMENT_TABLE_COLUMNS = [
  { key: 'id', label: 'ID', sortable: true, width: '100px' },
  { key: 'type', label: 'Type', sortable: true, width: '100px' },
  { key: 'currency', label: 'Currency', sortable: true, width: '80px' },
  { key: 'hedgeAmount', label: 'Amount', sortable: true, width: '120px', align: 'right' },
  { key: 'rate', label: 'Rate', sortable: true, width: '100px', align: 'right' },
  { key: 'quarter', label: 'Quarter', sortable: true, width: '100px' },
  { key: 'status', label: 'Status', sortable: true, width: '100px' },
  { key: 'createdAt', label: 'Created', sortable: true, width: '120px' },
  { key: 'actions', label: '', sortable: false, width: '80px' },
] as const;

export const FORWARD_CONTRACT_TABLE_COLUMNS = [
  { key: 'contractNumber', label: 'Contract #', sortable: true, width: '120px' },
  { key: 'bankName', label: 'Bank', sortable: true, width: '120px' },
  { key: 'hedgeAmount', label: 'Amount', sortable: true, width: '120px', align: 'right' },
  { key: 'rate', label: 'Rate', sortable: true, width: '100px', align: 'right' },
  { key: 'maturityDate', label: 'Maturity', sortable: true, width: '110px' },
  { key: 'status', label: 'Status', sortable: true, width: '100px' },
  { key: 'actions', label: '', sortable: false, width: '80px' },
] as const;

export const NATURAL_HEDGE_TABLE_COLUMNS = [
  { key: 'receivableInvoiceNumber', label: 'Receivable', sortable: true, width: '120px' },
  { key: 'payableInvoiceNumber', label: 'Payable', sortable: true, width: '120px' },
  { key: 'hedgeAmount', label: 'Amount', sortable: true, width: '120px', align: 'right' },
  { key: 'rate', label: 'Rate', sortable: true, width: '100px', align: 'right' },
  { key: 'quarter', label: 'Quarter', sortable: true, width: '100px' },
  { key: 'status', label: 'Status', sortable: true, width: '100px' },
  { key: 'actions', label: '', sortable: false, width: '80px' },
] as const;

// ─────────────────────────────────────────────────────────────────────────────────
// FORM VALIDATION RULES
// ─────────────────────────────────────────────────────────────────────────────────
export const FORWARD_CONTRACT_VALIDATION = {
  hedgeAmount: {
    min: 0.01,
    required: true,
  },
  forwardRate: {
    min: 0.0001,
    max: 999999,
    required: true,
  },
  contractNumber: {
    maxLength: 50,
    required: true,
  },
  bankName: {
    maxLength: 100,
    required: false,
  },
  premium: {
    min: -100,
    max: 100,
    required: false,
  },
  remarks: {
    maxLength: 500,
    required: false,
  },
} as const;

export const QUARTERLY_NATURAL_HEDGE_VALIDATION = {
  totalHedgeAmount: {
    min: 0.01,
    required: true,
  },
  internalRate: {
    min: 0.0001,
    max: 999999,
    required: false,
  },
  remarks: {
    maxLength: 500,
    required: false,
  },
} as const;

export const CLOSE_HEDGE_VALIDATION = {
  settlementRate: {
    min: 0.0001,
    max: 999999,
    required: false,
  },
  gainLoss: {
    required: false,
  },
  remarks: {
    maxLength: 500,
    required: false,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────────
// HEDGE THRESHOLDS
// ─────────────────────────────────────────────────────────────────────────────────
export const HEDGE_THRESHOLDS = {
  lowRiskMinPercentage: 80,       // Green: >= 80%
  mediumRiskMinPercentage: 50,    // Yellow: >= 50% and < 80%
  // High risk: < 50%
  targetHedgePercentage: 80,
  criticalUnhedgedAmount: 100000, // Alert if unhedged > this amount
} as const;

// ─────────────────────────────────────────────────────────────────────────────────
// QUARTER MONTHS MAPPING
// ─────────────────────────────────────────────────────────────────────────────────
export const QUARTER_MONTHS = {
  Q1: { start: 'January', end: 'March', months: ['Jan', 'Feb', 'Mar'] },
  Q2: { start: 'April', end: 'June', months: ['Apr', 'May', 'Jun'] },
  Q3: { start: 'July', end: 'September', months: ['Jul', 'Aug', 'Sep'] },
  Q4: { start: 'October', end: 'December', months: ['Oct', 'Nov', 'Dec'] },
} as const;

// ─────────────────────────────────────────────────────────────────────────────────
// COMMON BANKS LIST (for autocomplete)
// ─────────────────────────────────────────────────────────────────────────────────
export const COMMON_BANKS = [
  'HDFC Bank',
  'ICICI Bank',
  'State Bank of India',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'IndusInd Bank',
  'Yes Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank',
  'IDBI Bank',
  'Union Bank of India',
  'Bank of India',
  'Central Bank of India',
  'Indian Bank',
  'Federal Bank',
  'Standard Chartered',
  'Citibank',
  'HSBC',
  'Deutsche Bank',
  'Barclays',
  'JP Morgan Chase',
] as const;

// ─────────────────────────────────────────────────────────────────────────────────
// CHART COLORS FOR HEDGING
// ─────────────────────────────────────────────────────────────────────────────────
export const HEDGING_CHART_COLORS = {
  naturalHedge: '#06b6d4',       // cyan
  forwardContract: '#8b5cf6',   // violet
  unhedged: '#ef4444',          // red
  receivable: '#14b8a6',        // teal
  payable: '#6366f1',           // indigo
  netExposure: '#f59e0b',       // amber
  hedged: '#10b981',            // emerald
} as const;

// ─────────────────────────────────────────────────────────────────────────────────
// PERMISSIONS
// ─────────────────────────────────────────────────────────────────────────────────
export const HEDGING_PERMISSIONS = {
  view: 'exposure.view',
  bookForward: 'hedges.create',
  applyNaturalHedge: 'hedges.create',
  closeHedge: 'hedges.edit',
  viewReports: 'exposure.view',
} as const;

// ─────────────────────────────────────────────────────────────────────────────────
// WORKFLOW STEPS
// ─────────────────────────────────────────────────────────────────────────────────
export const NATURAL_HEDGE_WORKFLOW_STEPS = [
  { step: 'select-quarter', label: 'Select Quarter & Currency', icon: 'calendar' },
  { step: 'select-exposures', label: 'Select Exposures', icon: 'list' },
  { step: 'confirm', label: 'Review & Confirm', icon: 'check' },
  { step: 'result', label: 'Result', icon: 'flag' },
] as const;
