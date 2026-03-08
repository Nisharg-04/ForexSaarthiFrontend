// ═══════════════════════════════════════════════════════════════════════════════
// EXPOSURE MODULE - CONSTANTS
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import { ExposureStatus, ExposureType, HedgeType, HedgeStatus } from './types';

// ─────────────────────────────────────────────────────────────────────────────────
// EXPOSURE STATUS STYLES
// ─────────────────────────────────────────────────────────────────────────────────
export const EXPOSURE_STATUS_STYLES = {
  [ExposureStatus.SETTLED]: {
    light: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dark: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: '✅',
    color: 'emerald',
    label: 'Settled',
    description: 'Exposure has been fully settled',
  },
  [ExposureStatus.FULLY_HEDGED]: {
    light: 'bg-blue-50 text-blue-700 border-blue-200',
    dark: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: '🛡️',
    color: 'blue',
    label: 'Fully Hedged',
    description: 'Exposure is fully covered with hedges',
  },
  [ExposureStatus.PARTIALLY_HEDGED]: {
    light: 'bg-amber-50 text-amber-700 border-amber-200',
    dark: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: '⚠️',
    color: 'amber',
    label: 'Partial',
    description: 'Exposure is partially hedged',
  },
  [ExposureStatus.UNHEDGED]: {
    light: 'bg-red-50 text-red-700 border-red-200',
    dark: 'bg-red-500/10 text-red-400 border-red-500/20',
    icon: '🔴',
    color: 'red',
    label: 'Unhedged',
    description: 'Exposure has no hedge coverage',
  },
  [ExposureStatus.OVERDUE]: {
    light: 'bg-rose-50 text-rose-700 border-rose-200',
    dark: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    icon: '⏰',
    color: 'rose',
    label: 'Overdue',
    description: 'Exposure is past its maturity date',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────────
// EXPOSURE TYPE STYLES
// ─────────────────────────────────────────────────────────────────────────────────
export const EXPOSURE_TYPE_STYLES = {
  [ExposureType.RECEIVABLE]: {
    light: 'bg-teal-50 text-teal-700 border-teal-200',
    dark: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    icon: '📈',
    color: 'teal',
    label: 'Receivable',
    shortLabel: 'RCV',
    description: 'Expected to receive foreign currency',
  },
  [ExposureType.PAYABLE]: {
    light: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dark: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    icon: '📉',
    color: 'indigo',
    label: 'Payable',
    shortLabel: 'PAY',
    description: 'Expected to pay foreign currency',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────────
// HEDGE TYPE STYLES
// ─────────────────────────────────────────────────────────────────────────────────
export const HEDGE_TYPE_STYLES = {
  [HedgeType.FORWARD]: {
    light: 'bg-violet-50 text-violet-700 border-violet-200',
    dark: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    icon: '📋',
    color: 'violet',
    label: 'Forward',
    description: 'Bank forward contract',
  },
  [HedgeType.NATURAL]: {
    light: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    dark: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    icon: '🔄',
    color: 'cyan',
    label: 'Natural',
    description: 'Natural hedge against opposite exposure',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────────
// HEDGE STATUS STYLES
// ─────────────────────────────────────────────────────────────────────────────────
export const HEDGE_STATUS_STYLES = {
  [HedgeStatus.ACTIVE]: {
    light: 'bg-green-50 text-green-700 border-green-200',
    dark: 'bg-green-500/10 text-green-400 border-green-500/20',
    icon: '✓',
    color: 'green',
    label: 'Active',
  },
  [HedgeStatus.CLOSED]: {
    light: 'bg-slate-50 text-slate-700 border-slate-200',
    dark: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
    icon: '✓',
    color: 'slate',
    label: 'Closed',
  },
  [HedgeStatus.CANCELLED]: {
    light: 'bg-red-50 text-red-700 border-red-200',
    dark: 'bg-red-500/10 text-red-400 border-red-500/20',
    icon: '✗',
    color: 'red',
    label: 'Cancelled',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────────
// STATUS FILTER OPTIONS
// ─────────────────────────────────────────────────────────────────────────────────
export const EXPOSURE_STATUS_OPTIONS = [
  { value: ExposureStatus.UNHEDGED, label: 'Unhedged' },
  { value: ExposureStatus.PARTIALLY_HEDGED, label: 'Partially Hedged' },
  { value: ExposureStatus.FULLY_HEDGED, label: 'Fully Hedged' },
  { value: ExposureStatus.SETTLED, label: 'Settled' },
  { value: ExposureStatus.OVERDUE, label: 'Overdue' },
] as const;

export const EXPOSURE_STATUS_TABS = [
  { value: undefined, label: 'All' },
  { value: ExposureStatus.UNHEDGED, label: 'Unhedged' },
  { value: ExposureStatus.PARTIALLY_HEDGED, label: 'Partial' },
  { value: ExposureStatus.FULLY_HEDGED, label: 'Hedged' },
  { value: ExposureStatus.OVERDUE, label: 'Overdue' },
  { value: ExposureStatus.SETTLED, label: 'Settled' },
] as const;

export const EXPOSURE_TYPE_OPTIONS = [
  { value: ExposureType.RECEIVABLE, label: 'Receivable' },
  { value: ExposureType.PAYABLE, label: 'Payable' },
] as const;

export const HEDGE_TYPE_OPTIONS = [
  { value: HedgeType.FORWARD, label: 'Forward Contract' },
  { value: HedgeType.NATURAL, label: 'Natural Hedge' },
] as const;

// ─────────────────────────────────────────────────────────────────────────────────
// TABLE COLUMN DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────────
export const EXPOSURE_TABLE_COLUMNS = [
  { key: 'invoiceNumber', label: 'Invoice', sortable: true, width: '100px' },
  { key: 'tradeNumber', label: 'Trade', sortable: true, width: '100px' },
  { key: 'partyName', label: 'Party', sortable: true, width: '150px' },
  { key: 'exposureType', label: 'Type', sortable: true, width: '80px' },
  { key: 'currency', label: 'Ccy', sortable: true, width: '50px' },
  { key: 'exposedAmount', label: 'Exposed', sortable: true, width: '110px', align: 'right' },
  { key: 'hedgedAmount', label: 'Hedged', sortable: true, width: '110px', align: 'right' },
  { key: 'settledAmount', label: 'Settled', sortable: true, width: '100px', align: 'right' },
  { key: 'unhedgedAmount', label: 'Unhedged', sortable: true, width: '110px', align: 'right' },
  { key: 'hedgePercentage', label: 'Hedge %', sortable: true, width: '80px', align: 'right' },
  { key: 'maturityDate', label: 'Maturity', sortable: true, width: '100px' },
  { key: 'daysToMaturity', label: 'Days', sortable: true, width: '60px', align: 'right' },
  { key: 'status', label: 'Status', sortable: true, width: '100px' },
  { key: 'actions', label: '', sortable: false, width: '60px' },
] as const;

export const HEDGE_TABLE_COLUMNS = [
  { key: 'hedgeType', label: 'Type', sortable: true, width: '80px' },
  { key: 'amount', label: 'Amount', sortable: true, width: '120px', align: 'right' },
  { key: 'forwardRate', label: 'Rate', sortable: true, width: '90px', align: 'right' },
  { key: 'bankName', label: 'Bank', sortable: true, width: '120px' },
  { key: 'contractDate', label: 'Contract', sortable: true, width: '100px' },
  { key: 'settlementDate', label: 'Settlement', sortable: true, width: '100px' },
  { key: 'status', label: 'Status', sortable: true, width: '80px' },
  { key: 'actions', label: '', sortable: false, width: '60px' },
] as const;

// ─────────────────────────────────────────────────────────────────────────────────
// FORM VALIDATION RULES
// ─────────────────────────────────────────────────────────────────────────────────
export const FORWARD_HEDGE_VALIDATION = {
  amount: {
    min: 0.01,
    required: true,
  },
  forwardRate: {
    min: 0.0001,
    max: 999999,
    required: true,
  },
  bankName: {
    maxLength: 100,
    required: true,
  },
  contractReference: {
    maxLength: 50,
    required: false,
  },
  remarks: {
    maxLength: 500,
    required: false,
  },
} as const;

export const NATURAL_HEDGE_VALIDATION = {
  amount: {
    min: 0.01,
    required: true,
  },
  remarks: {
    maxLength: 500,
    required: false,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────────
// CHART COLORS
// ─────────────────────────────────────────────────────────────────────────────────
export const EXPOSURE_CHART_COLORS = {
  exposed: '#6366f1',    // indigo
  hedged: '#10b981',     // emerald
  settled: '#06b6d4',    // cyan
  unhedged: '#ef4444',   // red
  receivable: '#14b8a6', // teal
  payable: '#8b5cf6',    // violet
} as const;

export const CURRENCY_CHART_COLORS = [
  '#6366f1', // indigo
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
] as const;

// ─────────────────────────────────────────────────────────────────────────────────
// DASHBOARD THRESHOLDS
// ─────────────────────────────────────────────────────────────────────────────────
export const EXPOSURE_THRESHOLDS = {
  maturingSoonDays: 7,          // Show in "Maturing Soon" if ≤ 7 days
  criticalMaturingDays: 3,      // Highlight if ≤ 3 days
  lowHedgePercentage: 25,       // Warning if hedge % < 25
  targetHedgePercentage: 80,    // Target hedge coverage
} as const;

// ─────────────────────────────────────────────────────────────────────────────────
// DEFAULT SORT CONFIG
// ─────────────────────────────────────────────────────────────────────────────────
export const DEFAULT_EXPOSURE_SORT = {
  sortBy: 'maturityDate',
  sortOrder: 'asc',
} as const;

// ─────────────────────────────────────────────────────────────────────────────────
// PERMISSIONS
// ─────────────────────────────────────────────────────────────────────────────────
export const EXPOSURE_PERMISSIONS = {
  view: 'exposure.view',
  hedge: 'hedges.create',
  closeHedge: 'hedges.edit',
} as const;
