import { TradeStage, TradeType } from './types';

// Trade Type Options
export const TRADE_TYPE_OPTIONS = [
  { value: TradeType.EXPORT, label: 'Export' },
  { value: TradeType.IMPORT, label: 'Import' },
] as const;

// Trade Stage Options for filtering
export const TRADE_STAGE_OPTIONS = [
  { value: TradeStage.DRAFT, label: 'Draft' },
  { value: TradeStage.SUBMITTED, label: 'Submitted' },
  { value: TradeStage.APPROVED, label: 'Approved' },
  { value: TradeStage.CANCELLED, label: 'Cancelled' },
  { value: TradeStage.CLOSED, label: 'Closed' },
] as const;

// Stage Filter Tabs
export const TRADE_STAGE_TABS = [
  { value: undefined, label: 'All' },
  { value: TradeStage.DRAFT, label: 'Draft' },
  { value: TradeStage.SUBMITTED, label: 'Submitted' },
  { value: TradeStage.APPROVED, label: 'Approved' },
  { value: TradeStage.CLOSED, label: 'Closed' },
  { value: TradeStage.CANCELLED, label: 'Cancelled' },
] as const;

// Trade Stage Styles (for badges)
export const TRADE_STAGE_STYLES = {
  [TradeStage.DRAFT]: {
    light: 'bg-slate-50 text-slate-700 border-slate-200',
    dark: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
    icon: '📝',
    description: 'Trade is in draft state and can be edited',
  },
  [TradeStage.SUBMITTED]: {
    light: 'bg-amber-50 text-amber-700 border-amber-200',
    dark: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: '📤',
    description: 'Trade submitted for approval',
  },
  [TradeStage.APPROVED]: {
    light: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dark: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: '✅',
    description: 'Trade has been approved',
  },
  [TradeStage.CANCELLED]: {
    light: 'bg-red-50 text-red-700 border-red-200',
    dark: 'bg-red-500/10 text-red-400 border-red-500/20',
    icon: '❌',
    description: 'Trade has been cancelled',
  },
  [TradeStage.CLOSED]: {
    light: 'bg-blue-50 text-blue-700 border-blue-200',
    dark: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: '🔒',
    description: 'Trade has been closed',
  },
} as const;

// Trade Type Styles (for badges)
export const TRADE_TYPE_STYLES = {
  [TradeType.EXPORT]: {
    light: 'bg-teal-50 text-teal-700 border-teal-200',
    dark: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    icon: '📤',
  },
  [TradeType.IMPORT]: {
    light: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dark: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    icon: '📥',
  },
} as const;

// Table Column Definitions
export const TRADE_TABLE_COLUMNS = [
  { key: 'tradeNumber', label: 'Trade No.', sortable: true },
  { key: 'party', label: 'Party', sortable: true },
  { key: 'tradeType', label: 'Type', sortable: true },
  { key: 'tradeReference', label: 'Reference', sortable: false },
  { key: 'tradeStage', label: 'Stage', sortable: true },
  { key: 'createdAt', label: 'Created', sortable: true },
  { key: 'updatedAt', label: 'Updated', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false },
] as const;

// Empty Form Data
export const EMPTY_TRADE_FORM = {
  partyId: '',
  tradeType: TradeType.EXPORT,
  tradeReference: '',
  remarks: '',
} as const;

// Validation Rules
export const TRADE_VALIDATION = {
  partyId: {
    required: true,
  },
  tradeType: {
    required: true,
  },
  tradeReference: {
    maxLength: 100,
  },
  remarks: {
    maxLength: 500,
  },
} as const;

// Cancel Reason Validation
export const CANCEL_REASON_VALIDATION = {
  required: true,
  minLength: 10,
  maxLength: 500,
} as const;
