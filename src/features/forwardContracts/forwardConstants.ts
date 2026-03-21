// ═══════════════════════════════════════════════════════════════════════════════
// FORWARD CONTRACTS MODULE - CONSTANTS
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import { ForwardStatus } from './types';

// ─────────────────────────────────────────────────────────────────────────────────
// STATUS OPTIONS
// ─────────────────────────────────────────────────────────────────────────────────
export const FORWARD_STATUS_OPTIONS = [
  { value: ForwardStatus.ACTIVE, label: 'Active', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: ForwardStatus.CLOSED, label: 'Closed', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  { value: ForwardStatus.CANCELLED, label: 'Cancelled', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
] as const;

// ─────────────────────────────────────────────────────────────────────────────────
// COMMON BANKS
// ─────────────────────────────────────────────────────────────────────────────────
export const COMMON_BANKS = [
  'HDFC Bank',
  'ICICI Bank',
  'SBI',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Standard Chartered',
  'Citibank',
  'Deutsche Bank',
  'Barclays Bank',
  'HSBC Bank',
  'Bank of America',
  'JPMorgan Chase',
  'Goldman Sachs',
  'Morgan Stanley',
  'UBS',
] as const;

// ─────────────────────────────────────────────────────────────────────────────────
// QUARTERS
// ─────────────────────────────────────────────────────────────────────────────────
export const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

// ─────────────────────────────────────────────────────────────────────────────────
// CURRENCIES (Common forex currencies)
// ─────────────────────────────────────────────────────────────────────────────────
export const FORWARD_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CAD',
  'AUD',
  'SGD',
  'HKD',
  'CHF',
  'SEK',
  'NZD',
  'MXN',
  'ZAR',
  'INR',
] as const;

// ─────────────────────────────────────────────────────────────────────────────────
// VALIDATION RULES
// ─────────────────────────────────────────────────────────────────────────────────
export const FORWARD_VALIDATION = {
  minContractAmount: 10000,
  maxContractAmount: 10000000,
  minForwardRate: 0.01,
  maxForwardRate: 500,
  contractReferenceMinLength: 3,
  contractReferenceMaxLength: 50,
  remarksMaxLength: 500,
  minSettlementDaysFuture: 1,
  maxSettlementDaysFuture: 365,
} as const;

// ─────────────────────────────────────────────────────────────────────────────────
// COLOR MAPPING FOR P&L
// ─────────────────────────────────────────────────────────────────────────────────
export const FORWARD_COLORS = {
  gainLightGain: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
  gainLightLoss: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
  gainBgGain: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  gainBgLoss: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  statusActive: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  statusClosed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  statusCancelled: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  statusExpired: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
} as const;

// ─────────────────────────────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 25;
export const FORWARD_PAGINATION = {
  defaultPageSize: DEFAULT_PAGE_SIZE,
  defaultPage: 1,
  maxPageSize: 100,
} as const;

// ─────────────────────────────────────────────────────────────────────────────────
// SORTING OPTIONS
// ─────────────────────────────────────────────────────────────────────────────────
export const FORWARD_SORT_OPTIONS = [
  { value: 'contractDate', label: 'Contract Date' },
  { value: 'settlementDate', label: 'Settlement Date' },
  { value: 'contractAmount', label: 'Amount' },
  { value: 'gainLoss', label: 'Gain/Loss' },
] as const;

// ─────────────────────────────────────────────────────────────────────────────────
// DASHBOARD WIDGETS
// ─────────────────────────────────────────────────────────────────────────────────
export const EXPIRING_DAYS_THRESHOLD = 30;
export const ANALYTICS_YEARS_RANGE = 5;

// ─────────────────────────────────────────────────────────────────────────────────
// ERROR MESSAGES
// ─────────────────────────────────────────────────────────────────────────────────
export const FORWARD_ERROR_MESSAGES = {
  loadingFailed: 'Failed to load forward contracts',
  bookingFailed: 'Failed to book forward contract',
  closingFailed: 'Failed to close forward contract',
  cancellingFailed: 'Failed to cancel forward contract',
  analyticsLoadingFailed: 'Failed to load analytics',
  notFound: 'Forward contract not found',
  insufficientUnhedged: 'Contract amount exceeds unhedged exposure',
} as const;

// ─────────────────────────────────────────────────────────────────────────────────
// SUCCESS MESSAGES
// ─────────────────────────────────────────────────────────────────────────────────
export const FORWARD_SUCCESS_MESSAGES = {
  bookingSuccess: 'Forward contract booked successfully',
  closingSuccess: 'Forward contract closed with P&L recorded',
  cancellingSuccess: 'Forward contract cancelled',
} as const;

// ─────────────────────────────────────────────────────────────────────────────────
// DATE FORMATS
// ─────────────────────────────────────────────────────────────────────────────────
export const FORWARD_DATE_FORMAT = 'DD MMM YYYY';
export const FORWARD_DATE_FORMAT_DISPLAY = 'DD MMM YYYY';
