// ============================================================================
// Forex Module Types - Read-Only Market Data System
// ============================================================================
// This module provides informational forex data for:
// - Exposure valuation
// - Invoice insights
// - Hedging decisions
// - Dashboards & reports
// - Currency selection UX
//
// ⚠️ IMPORTANT: Forex rates are informational only.
// They never modify accounting data. Backend is the single source of truth.
// ============================================================================

// Currency Entity
export interface Currency {
  code: string;           // ISO 4217 code (e.g., "USD")
  name: string;           // Full name (e.g., "United States Dollar")
  symbol: string;         // Currency symbol (e.g., "$")
  decimalPlaces: number;  // Standard decimal places
  isActive: boolean;      // Whether available for selection
  country?: string;       // Country name
  flag?: string;          // Flag emoji or URL
}

// Exchange Rate Entity
export interface ExchangeRate {
  from: string;           // Source currency code
  to: string;             // Target currency code
  rate: number;           // Exchange rate (1 from = rate to)
  inverseRate: number;    // Inverse rate (1 to = inverseRate from)
}

// Latest Rates Response
export interface LatestRatesData {
  baseCurrency: string;
  rates: Record<string, number>;  // { "USD": 1, "EUR": 0.92, ... }
  timestamp: string;              // ISO timestamp of rate capture
  provider: string;               // Data provider name
  isCached: boolean;              // Whether from cache
  cacheAge?: number;              // Cache age in seconds
  warning?: string;               // Any warning message
}

export interface LatestRatesResponse {
  success: boolean;
  data: LatestRatesData;
  message?: string;
}

// Historical Rates Response
export interface HistoricalRatesData {
  baseCurrency: string;
  date: string;                   // YYYY-MM-DD
  rates: Record<string, number>;
  timestamp: string;
  provider: string;
  isCached: boolean;
}

export interface HistoricalRatesResponse {
  success: boolean;
  data: HistoricalRatesData;
  message?: string;
}

// Currency List Response
export interface CurrencyListResponse {
  success: boolean;
  data: {
    currencies: Currency[];
  };
  message?: string;
}

// Single Rate Response (for pair lookups)
export interface ForexRateData {
  from: string;
  to: string;
  rate: number;
  inverseRate: number;
  timestamp: string;
  provider: string;
  isCached: boolean;
  warning?: string;
}

export interface ForexRateResponse {
  success: boolean;
  data: ForexRateData;
  message?: string;
}

// Exposure Valuation Request
export interface ExposureValuationRequest {
  exposureAmount: number;
  exposureCurrency: string;
  reportingCurrency: string;
}

// Exposure Valuation Response
export interface ExposureValuationData {
  exposureAmount: number;         // Original amount
  exposureCurrency: string;       // Original currency
  valuedAmount: number;           // Amount in reporting currency
  reportingCurrency: string;      // Company base currency
  effectiveRate: number;          // Rate used for valuation
  timestamp: string;              // Rate timestamp
  provider: string;               // Rate provider
  isCached: boolean;              // Whether rate was cached
  warning?: string;               // Any warning message
  disclaimer: string;             // Legal disclaimer text
}

export interface ExposureValuationResponse {
  success: boolean;
  data: ExposureValuationData;
  message?: string;
}

// Forex Usage (Admin Monitoring)
export interface ForexUsageData {
  planName: string;
  monthlyQuota: number;
  usedRequests: number;
  remainingRequests: number;
  dailyAverage: number;
  currentMonth: string;           // YYYY-MM
  lastRequestAt?: string;         // ISO timestamp
  quotaResetAt: string;           // ISO timestamp
  isNearLimit: boolean;           // Warning if approaching limit
}

export interface ForexUsageResponse {
  success: boolean;
  data: ForexUsageData;
  message?: string;
}

// Refresh Response
export interface RefreshRatesResponse {
  success: boolean;
  data: {
    refreshedAt: string;
    provider: string;
    ratesCount: number;
  };
  message?: string;
}

// Query Parameters
export interface LatestRatesParams {
  baseCurrency?: string;          // Default: "USD"
}

export interface HistoricalRatesParams {
  date: string;                   // YYYY-MM-DD
  baseCurrency?: string;          // Default: "USD"
}

export interface ForexRateParams {
  from: string;
  to: string;
}

// Rate Display Info (for UI components)
export interface RateDisplayInfo {
  from: string;
  to: string;
  rate: number;
  formattedRate: string;
  timestamp: string;
  provider: string;
  isCached: boolean;
  isStale: boolean;
  warning?: string;
}

// Currency Option (for dropdowns)
export interface CurrencyOption {
  value: string;                  // Currency code
  label: string;                  // Display text (e.g., "USD – United States Dollar")
  currency: Currency;             // Full currency object
  disabled: boolean;              // Whether option is disabled
}

// Major Currency Pairs (for dashboard display)
export interface MajorPairRate {
  pair: string;                   // e.g., "USD/INR"
  from: string;
  to: string;
  rate: number;
  change24h?: number;             // 24h change percentage (if available)
  trend?: 'up' | 'down' | 'stable';
}

// Forex Module State (not stored in Redux - derived from RTK Query)
export interface ForexModuleState {
  isLoading: boolean;
  hasError: boolean;
  lastUpdated?: string;
  provider?: string;
  isCached: boolean;
}
