// ============================================================================
// Forex Module - Public Exports
// ============================================================================
// Forex Rates & Currency Intelligence Module
// Read-only market data system for exposure valuation, invoice insights,
// hedging decisions, dashboards & reports, and currency selection UX.
//
// ⚠️ CORE PRINCIPLES:
// - Forex rates never modify accounting data
// - Forex rates are informational only
// - All forex data is time-stamped
// - UI must show source, freshness & warnings
// - Backend is the only source of truth
// ============================================================================

// Types
export type {
  Currency,
  ExchangeRate,
  LatestRatesData,
  LatestRatesResponse,
  LatestRatesParams,
  HistoricalRatesData,
  HistoricalRatesResponse,
  HistoricalRatesParams,
  CurrencyListResponse,
  ForexRateData,
  ForexRateResponse,
  ForexRateParams,
  ExposureValuationRequest,
  ExposureValuationData,
  ExposureValuationResponse,
  ForexUsageData,
  ForexUsageResponse,
  RefreshRatesResponse,
  RateDisplayInfo,
  CurrencyOption,
  MajorPairRate,
  ForexModuleState,
} from './types';

// Constants
export {
  DEFAULT_BASE_CURRENCY,
  COMPANY_REPORTING_CURRENCY,
  MAJOR_CURRENCY_PAIRS,
  POPULAR_CURRENCIES,
  RATE_STALE_THRESHOLD_MINUTES,
  RATE_WARNING_THRESHOLD_MINUTES,
  RATE_DECIMAL_PLACES,
  FOREX_PROVIDERS,
  RATE_FRESHNESS,
  FOREX_BADGE_STYLES,
  FOREX_WARNINGS,
  EXPOSURE_VALUATION_DISCLAIMER,
  FOREX_API_ENDPOINTS,
  FOREX_CACHE_TAGS,
  FOREX_REFETCH_INTERVALS,
  CURRENCY_FLAGS,
  DEFAULT_CURRENCY,
} from './forexConstants';

// API
export {
  forexApi,
  useGetLatestRatesQuery,
  useGetHistoricalRatesQuery,
  useGetCurrenciesQuery,
  useGetForexRateQuery,
  useGetExposureValuationQuery,
  useGetForexUsageQuery,
  useLazyGetLatestRatesQuery,
  useLazyGetHistoricalRatesQuery,
  useLazyGetForexRateQuery,
  useLazyGetExposureValuationQuery,
  useRefreshRatesMutation,
  forexEndpoints,
} from './api/forexApi';

// Hooks
export { useLatestRates } from './hooks/useLatestRates';
export { useCurrencyList } from './hooks/useCurrencyList';
export { useExposureValuation } from './hooks/useExposureValuation';
export { useHistoricalRates } from './hooks/useHistoricalRates';
export { useForexRate } from './hooks/useForexRate';

// Components
export { ForexRateBadge } from './components/ForexRateBadge';
export { RateTimestamp } from './components/RateTimestamp';
export { ForexProviderBadge } from './components/ForexProviderBadge';
export { ForexWarningBanner } from './components/ForexWarningBanner';
export { CurrencySelect } from './components/CurrencySelect';
export { ExposureValuationCard } from './components/ExposureValuationCard';

// Pages
export { ForexDashboardPage } from './pages/ForexDashboardPage';
export { ForexUsagePage } from './pages/ForexUsagePage';
