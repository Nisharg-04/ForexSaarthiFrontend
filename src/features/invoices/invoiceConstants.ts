import { InvoiceStatus, InvoiceType } from './types';

// Invoice Status Options
export const INVOICE_STATUS_OPTIONS = [
  { value: InvoiceStatus.DRAFT, label: 'Draft' },
  { value: InvoiceStatus.ISSUED, label: 'Issued' },
  { value: InvoiceStatus.PARTIALLY_PAID, label: 'Partially Paid' },
  { value: InvoiceStatus.SETTLED, label: 'Settled' },
  { value: InvoiceStatus.CANCELLED, label: 'Cancelled' },
] as const;

// Invoice Status Filter Tabs
export const INVOICE_STATUS_TABS = [
  { value: undefined, label: 'All' },
  { value: InvoiceStatus.DRAFT, label: 'Draft' },
  { value: InvoiceStatus.ISSUED, label: 'Issued' },
  { value: InvoiceStatus.PARTIALLY_PAID, label: 'Part Paid' },
  { value: InvoiceStatus.SETTLED, label: 'Settled' },
  { value: InvoiceStatus.CANCELLED, label: 'Cancelled' },
] as const;

// Invoice Status Styles (for badges)
export const INVOICE_STATUS_STYLES = {
  [InvoiceStatus.DRAFT]: {
    light: 'bg-slate-50 text-slate-700 border-slate-200',
    dark: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
    icon: '📝',
    description: 'Invoice is in draft state and can be edited',
  },
  [InvoiceStatus.ISSUED]: {
    light: 'bg-blue-50 text-blue-700 border-blue-200',
    dark: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: '📄',
    description: 'Invoice has been issued and created exposure',
  },
  [InvoiceStatus.PARTIALLY_PAID]: {
    light: 'bg-amber-50 text-amber-700 border-amber-200',
    dark: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: '💳',
    description: 'Invoice is partially paid',
  },
  [InvoiceStatus.SETTLED]: {
    light: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dark: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: '✅',
    description: 'Invoice has been fully settled',
  },
  [InvoiceStatus.CANCELLED]: {
    light: 'bg-red-50 text-red-700 border-red-200',
    dark: 'bg-red-500/10 text-red-400 border-red-500/20',
    icon: '❌',
    description: 'Invoice has been cancelled',
  },
} as const;

// Invoice Type Styles (for badges)
export const INVOICE_TYPE_STYLES = {
  [InvoiceType.EXPORT]: {
    light: 'bg-teal-50 text-teal-700 border-teal-200',
    dark: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    icon: '📤',
    label: 'Export',
  },
  [InvoiceType.IMPORT]: {
    light: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dark: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    icon: '📥',
    label: 'Import',
  },
} as const;

// Table Column Definitions
export const INVOICE_TABLE_COLUMNS = [
  { key: 'invoiceNumber', label: 'Invoice No.', sortable: true, width: '120px' },
  { key: 'invoiceDate', label: 'Date', sortable: true, width: '100px' },
  { key: 'partyName', label: 'Party', sortable: true, width: '180px' },
  { key: 'tradeNumber', label: 'Trade', sortable: true, width: '120px' },
  { key: 'currency', label: 'Ccy', sortable: true, width: '60px' },
  { key: 'invoiceAmount', label: 'Amount', sortable: true, width: '120px', align: 'right' },
  { key: 'outstandingAmount', label: 'Outstanding', sortable: true, width: '120px', align: 'right' },
  { key: 'status', label: 'Status', sortable: true, width: '100px' },
  { key: 'actions', label: '', sortable: false, width: '80px' },
] as const;

// Line Item Default Units
export const LINE_ITEM_UNITS = [
  { value: 'PCS', label: 'Pieces' },
  { value: 'KG', label: 'Kilograms' },
  { value: 'MTR', label: 'Meters' },
  { value: 'LTR', label: 'Liters' },
  { value: 'SET', label: 'Sets' },
  { value: 'BOX', label: 'Boxes' },
  { value: 'CTN', label: 'Cartons' },
  { value: 'PKT', label: 'Packets' },
  { value: 'DOZ', label: 'Dozens' },
  { value: 'NOS', label: 'Numbers' },
] as const;

// Empty Form Data
export const EMPTY_LINE_ITEM = {
  id: '',
  description: '',
  hsCode: '',
  quantity: '',
  unit: 'PCS',
  unitPrice: '',
} as const;

export const EMPTY_INVOICE_FORM = {
  tradeId: '',
  invoiceDate: '',
  dueDate: '',
  lineItems: [],
} as const;

// Validation Rules
export const INVOICE_VALIDATION = {
  tradeId: {
    required: true,
  },
  invoiceDate: {
    required: true,
  },
  dueDate: {
    required: true,
  },
  lineItems: {
    minItems: 1,
    maxItems: 100,
  },
} as const;

export const LINE_ITEM_VALIDATION = {
  description: {
    required: true,
    maxLength: 500,
  },
  hsCode: {
    required: false,
    pattern: /^[0-9]{4,8}$/,
  },
  quantity: {
    required: true,
    min: 0.001,
    max: 999999999,
  },
  unit: {
    required: true,
  },
  unitPrice: {
    required: true,
    min: 0.01,
    max: 999999999,
  },
} as const;

export const CANCEL_REASON_VALIDATION = {
  minLength: 10,
  maxLength: 500,
} as const;

// Keyboard Shortcuts
export const INVOICE_GRID_SHORTCUTS = {
  addRow: 'Alt+A',
  deleteRow: 'Alt+D',
  save: 'Ctrl+S',
  cancel: 'Escape',
} as const;
