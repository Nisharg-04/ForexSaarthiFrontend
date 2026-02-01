import { PartyType } from './types';
import { CURRENCIES, COUNTRIES } from '../../constants';

// Party Type Options
export const PARTY_TYPE_OPTIONS = [
  { value: PartyType.BUYER, label: 'Buyer' },
  { value: PartyType.SUPPLIER, label: 'Supplier' },
] as const;

// Default Payment Term Days
export const DEFAULT_PAYMENT_TERM_DAYS = 30;

// Payment Term Options (common values)
export const PAYMENT_TERM_OPTIONS = [
  { value: 0, label: 'Immediate' },
  { value: 7, label: '7 Days' },
  { value: 15, label: '15 Days' },
  { value: 30, label: '30 Days' },
  { value: 45, label: '45 Days' },
  { value: 60, label: '60 Days' },
  { value: 90, label: '90 Days' },
  { value: 120, label: '120 Days' },
] as const;

// Re-export for convenience
export { CURRENCIES, COUNTRIES };

// Table Column Definitions
export const PARTY_TABLE_COLUMNS = [
  { key: 'name', label: 'Party Name', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'country', label: 'Country', sortable: true },
  { key: 'currency', label: 'Currency', sortable: true },
  { key: 'paymentTermDays', label: 'Payment Terms', sortable: true },
  { key: 'isActive', label: 'Status', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false },
] as const;

// Empty Form Data
export const EMPTY_PARTY_FORM = {
  name: '',
  type: PartyType.BUYER,
  country: '',
  currency: 'USD',
  paymentTermDays: DEFAULT_PAYMENT_TERM_DAYS,
  address: '',
  contactPerson: '',
  contactEmail: '',
  contactPhone: '',
} as const;

// Validation Rules
export const PARTY_VALIDATION = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 200,
  },
  contactEmail: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  contactPhone: {
    pattern: /^[\d\s\-+()]+$/,
    minLength: 7,
    maxLength: 20,
  },
  paymentTermDays: {
    min: 0,
    max: 365,
  },
} as const;

// Status Badge Styles
export const PARTY_STATUS_STYLES = {
  ACTIVE: {
    light: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dark: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  INACTIVE: {
    light: 'bg-slate-50 text-slate-500 border-slate-200',
    dark: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  },
} as const;

// Type Badge Styles
export const PARTY_TYPE_STYLES = {
  BUYER: {
    light: 'bg-blue-50 text-blue-700 border-blue-200',
    dark: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  SUPPLIER: {
    light: 'bg-amber-50 text-amber-700 border-amber-200',
    dark: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
} as const;
