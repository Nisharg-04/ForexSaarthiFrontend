// ============================================================================
// Forex Module Constants
// ============================================================================

// Default Base Currencies
export const DEFAULT_BASE_CURRENCY = 'USD';
export const COMPANY_REPORTING_CURRENCY = 'INR';

// Major Currency Pairs for Dashboard
export const MAJOR_CURRENCY_PAIRS = [
  { from: 'USD', to: 'INR', label: 'USD/INR' },
  { from: 'EUR', to: 'INR', label: 'EUR/INR' },
  { from: 'GBP', to: 'INR', label: 'GBP/INR' },
  { from: 'JPY', to: 'INR', label: 'JPY/INR' },
  { from: 'EUR', to: 'USD', label: 'EUR/USD' },
  { from: 'GBP', to: 'USD', label: 'GBP/USD' },
] as const;

// Popular Currencies (for quick access)
export const POPULAR_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'AED',
] as const;

// Cache Settings
export const RATE_STALE_THRESHOLD_MINUTES = 60; // Consider rates stale after 1 hour
export const RATE_WARNING_THRESHOLD_MINUTES = 240; // Show warning after 4 hours

// Rate Display Formatting
export const RATE_DECIMAL_PLACES = {
  default: 4,
  JPY: 2,      // Yen pairs typically use 2 decimals
  INR: 4,
} as const;

// Provider Display Names
export const FOREX_PROVIDERS: Record<string, { name: string; description: string }> = {
  exchangerate: {
    name: 'ExchangeRate API',
    description: 'Real-time exchange rates',
  },
  openexchange: {
    name: 'Open Exchange Rates',
    description: 'Global currency data',
  },
  fixer: {
    name: 'Fixer.io',
    description: 'Foreign exchange rates',
  },
  rbi: {
    name: 'RBI Reference',
    description: 'Reserve Bank of India reference rates',
  },
  fallback: {
    name: 'Cached Data',
    description: 'Using cached rates (provider unavailable)',
  },
} as const;

// Status Indicators
export const RATE_FRESHNESS = {
  FRESH: {
    label: 'Live',
    color: 'emerald',
    icon: '●',
    description: 'Rates are current',
  },
  RECENT: {
    label: 'Recent',
    color: 'blue',
    icon: '●',
    description: 'Rates updated within the hour',
  },
  CACHED: {
    label: 'Cached',
    color: 'amber',
    icon: '○',
    description: 'Using cached rates',
  },
  STALE: {
    label: 'Stale',
    color: 'red',
    icon: '◌',
    description: 'Rates may be outdated',
  },
} as const;

// UI Styling Constants
export const FOREX_BADGE_STYLES = {
  light: {
    container: 'bg-slate-50 border-slate-200 text-slate-700',
    rate: 'text-slate-900 font-semibold',
    label: 'text-slate-500 text-xs',
    cached: 'text-amber-600',
    warning: 'text-red-600',
  },
  dark: {
    container: 'bg-slate-800 border-slate-700 text-slate-300',
    rate: 'text-slate-100 font-semibold',
    label: 'text-slate-400 text-xs',
    cached: 'text-amber-400',
    warning: 'text-red-400',
  },
} as const;

// Warning Messages
export const FOREX_WARNINGS = {
  STALE_RATES: 'Exchange rates may be outdated. Please refresh for latest data.',
  CACHED_RATES: 'Using cached rates. Live rates temporarily unavailable.',
  VALUATION_DISCLAIMER: 'Indicative valuation only. Not for accounting posting.',
  PROVIDER_ISSUE: 'Rate provider experiencing issues. Data may be delayed.',
  NETWORK_ERROR: 'Unable to fetch rates. Showing last known values.',
} as const;

// Valuation Disclaimer (must always be shown)
export const EXPOSURE_VALUATION_DISCLAIMER = 
  'Indicative valuation. Not for accounting posting. Actual rates at settlement may differ.';

// API Endpoints (relative to base URL)
export const FOREX_API_ENDPOINTS = {
  LATEST: '/forex/latest',
  HISTORICAL: '/forex/historical',
  CURRENCIES: '/forex/currencies',
  RATE: '/forex/rate',
  EXPOSURE_VALUATION: '/forex/exposure-valuation',
  USAGE: '/forex/usage',
  REFRESH: '/forex/refresh',
} as const;

// RTK Query Cache Tags
export const FOREX_CACHE_TAGS = {
  LATEST_RATES: 'ForexLatest',
  HISTORICAL_RATES: 'ForexHistorical',
  CURRENCIES: 'ForexCurrencies',
  USAGE: 'ForexUsage',
} as const;

// Polling/Refetch Intervals (in seconds)
export const FOREX_REFETCH_INTERVALS = {
  LATEST_RATES: 300,      // 5 minutes
  CURRENCIES: 3600,       // 1 hour (rarely changes)
  USAGE: 60,              // 1 minute (for admin monitoring)
} as const;

// Currency Flag Emojis (for visual display)
export const CURRENCY_FLAGS: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  JPY: '🇯🇵',
  AUD: '🇦🇺',
  CAD: '🇨🇦',
  CHF: '🇨🇭',
  CNY: '🇨🇳',
  INR: '🇮🇳',
  AED: '🇦🇪',
  SGD: '🇸🇬',
  HKD: '🇭🇰',
  KRW: '🇰🇷',
  THB: '🇹🇭',
  MYR: '🇲🇾',
  IDR: '🇮🇩',
  PHP: '🇵🇭',
  VND: '🇻🇳',
  BDT: '🇧🇩',
  PKR: '🇵🇰',
  LKR: '🇱🇰',
  NZD: '🇳🇿',
  ZAR: '🇿🇦',
  BRL: '🇧🇷',
  MXN: '🇲🇽',
  RUB: '🇷🇺',
  TRY: '🇹🇷',
  SAR: '🇸🇦',
  QAR: '🇶🇦',
  KWD: '🇰🇼',
  OMR: '🇴🇲',
  BHD: '🇧🇭',
};

// Default Currency (fallback)
export const DEFAULT_CURRENCY = {
  code: 'USD',
  name: 'United States Dollar',
  symbol: '$',
  decimalPlaces: 2,
  isActive: true,
  country: 'United States',
  flag: '🇺🇸',
};
