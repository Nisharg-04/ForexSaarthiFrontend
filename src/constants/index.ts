import { UserRole, TradeStage, InvoiceStatus } from '../types';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
export const API_TIMEOUT = 30000;

// Google OAuth
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Token Keys
export const TOKEN_STORAGE_KEY = 'forexsaarthi_access_token';
export const REFRESH_TOKEN_STORAGE_KEY = 'forexsaarthi_refresh_token';
export const USER_STORAGE_KEY = 'forexsaarthi_user';
export const ACTIVE_COMPANY_KEY = 'forexsaarthi_active_company';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Date Formats
export const DATE_FORMAT = 'dd MMM yyyy';
export const DATE_TIME_FORMAT = 'dd MMM yyyy, HH:mm';
export const API_DATE_FORMAT = 'yyyy-MM-dd';

// Currency List
export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
];

export const BASE_CURRENCY = 'INR';

// Role Permissions
export const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: [
    'dashboard.view',
    'parties.view',
    'parties.create',
    'parties.edit',
    'parties.delete',
    'trades.view',
    'trades.create',
    'trades.edit',
    'trades.delete',
    'invoices.view',
    'invoices.create',
    'invoices.edit',
    'invoices.delete',
    'payments.view',
    'payments.create',
    'payments.edit',
    'payments.delete',
    'exposure.view',
    'hedges.view',
    'hedges.create',
    'hedges.edit',
    'hedges.delete',
    'audit.view',
    'users.manage',
    'settings.manage',
  ],
  [UserRole.FINANCE]: [
    'dashboard.view',
    'parties.view',
    'parties.create',
    'parties.edit',
    'trades.view',
    'invoices.view',
    'invoices.create',
    'invoices.edit',
    'payments.view',
    'payments.create',
    'payments.edit',
    'exposure.view',
    'hedges.view',
    'hedges.create',
    'hedges.edit',
    'audit.view',
  ],
  [UserRole.AUDITOR]: [
    'dashboard.view',
    'parties.view',
    'trades.view',
    'invoices.view',
    'payments.view',
    'exposure.view',
    'hedges.view',
  ],
};

// Trade Stages
export const TRADE_STAGES = [
  { value: TradeStage.ORDER_RECEIVED, label: 'Order Received', color: 'blue' },
  { value: TradeStage.PRODUCTION, label: 'Production', color: 'yellow' },
  { value: TradeStage.SHIPMENT, label: 'Shipment', color: 'purple' },
  { value: TradeStage.INVOICED, label: 'Invoiced', color: 'indigo' },
  { value: TradeStage.PAYMENT_PENDING, label: 'Payment Pending', color: 'orange' },
  { value: TradeStage.COMPLETED, label: 'Completed', color: 'green' },
];

// Invoice Status
export const INVOICE_STATUSES = [
  { value: InvoiceStatus.OPEN, label: 'Open', color: 'blue' },
  { value: InvoiceStatus.PARTIALLY_PAID, label: 'Partially Paid', color: 'yellow' },
  { value: InvoiceStatus.PAID, label: 'Paid', color: 'green' },
  { value: InvoiceStatus.OVERDUE, label: 'Overdue', color: 'red' },
  { value: InvoiceStatus.CANCELLED, label: 'Cancelled', color: 'gray' },
];

// Hedge Types
export const HEDGE_TYPES = [
  { value: 'FORWARD', label: 'Forward Contract' },
  { value: 'OPTION', label: 'Currency Option' },
  { value: 'SWAP', label: 'Currency Swap' },
];

// Payment Methods
export const PAYMENT_METHODS = [
  'Wire Transfer',
  'Letter of Credit',
  'Documentary Collection',
  'Cash in Advance',
  'Open Account',
  'Cheque',
];

// Countries (Major Trading Partners)
export const COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'Germany',
  'France',
  'China',
  'Japan',
  'Australia',
  'Canada',
  'Singapore',
  'UAE',
  'Hong Kong',
  'Italy',
  'Netherlands',
  'Spain',
  'South Korea',
  'Thailand',
  'Vietnam',
  'Bangladesh',
  'Sri Lanka',
  'Nepal',
];

// Chart Colors
export const CHART_COLORS = {
  primary: '#1e40af',
  secondary: '#059669',
  accent: '#f59e0b',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  muted: '#6b7280',
};

// Navigation Items
export const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    permission: 'dashboard.view',
  },
  {
    label: 'Parties',
    path: '/parties',
    icon: 'Users',
    permission: 'parties.view',
  },
  {
    label: 'Trades',
    path: '/trades',
    icon: 'TrendingUp',
    permission: 'trades.view',
  },
  {
    label: 'Invoices',
    path: '/invoices',
    icon: 'FileText',
    permission: 'invoices.view',
  },
  {
    label: 'Payments',
    path: '/payments',
    icon: 'CreditCard',
    permission: 'payments.view',
  },
  {
    label: 'Exposure',
    path: '/exposure',
    icon: 'Activity',
    permission: 'exposure.view',
  },
  {
    label: 'Audit Logs',
    path: '/audit',
    icon: 'Shield',
    permission: 'audit.view',
  },
];

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in',
  LOGOUT_SUCCESS: 'Successfully logged out',
  CREATE_SUCCESS: 'Created successfully',
  UPDATE_SUCCESS: 'Updated successfully',
  DELETE_SUCCESS: 'Deleted successfully',
  SAVE_SUCCESS: 'Saved successfully',
};
