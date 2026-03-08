// ============================================================================
// Forex API Slice - RTK Query Endpoints
// ============================================================================
// Read-only forex data API. All rates are informational only.
// Backend is the single source of truth.
//
// ⚠️ IMPORTANT:
// - No frontend exchange rate calculations
// - No storing rates in Redux manually
// - No API key usage in frontend
// ============================================================================

import { apiSlice } from '../../../app/apiSlice';
import {
  FOREX_API_ENDPOINTS,
  FOREX_CACHE_TAGS,
  FOREX_REFETCH_INTERVALS,
} from '../forexConstants';
import type {
  LatestRatesResponse,
  LatestRatesParams,
  HistoricalRatesResponse,
  HistoricalRatesParams,
  CurrencyListResponse,
  ForexRateResponse,
  ForexRateParams,
  ExposureValuationResponse,
  ExposureValuationRequest,
  ForexUsageResponse,
  RefreshRatesResponse,
} from '../types';

export const forexApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ========================================================================
    // GET /api/forex/latest - Global latest rates
    // ========================================================================
    // Use: Dashboard widgets, valuation helpers, rate badges
    getLatestRates: builder.query<LatestRatesResponse, LatestRatesParams | void>({
      query: (params) => ({
        url: FOREX_API_ENDPOINTS.LATEST,
        params: params ? { baseCurrency: params.baseCurrency } : undefined,
      }),
      providesTags: [FOREX_CACHE_TAGS.LATEST_RATES],
      // Keep rates in cache but allow background refetch
      keepUnusedDataFor: FOREX_REFETCH_INTERVALS.LATEST_RATES,
    }),

    // ========================================================================
    // GET /api/forex/historical/{date} - Historical rates for a date
    // ========================================================================
    // Use: Reports, MTM comparison, audit views
    // NOTE: Load only on explicit user action, not auto-load
    getHistoricalRates: builder.query<HistoricalRatesResponse, HistoricalRatesParams>({
      query: ({ date, baseCurrency }) => ({
        url: `${FOREX_API_ENDPOINTS.HISTORICAL}/${date}`,
        params: baseCurrency ? { baseCurrency } : undefined,
      }),
      providesTags: (_result, _error, { date, baseCurrency }) => [
        { type: FOREX_CACHE_TAGS.HISTORICAL_RATES, id: `${date}_${baseCurrency || 'USD'}` },
      ],
      // Historical data doesn't change, cache longer
      keepUnusedDataFor: 3600,
    }),

    // ========================================================================
    // GET /api/forex/currencies - Currency master list
    // ========================================================================
    // Use: Invoice currency selection, party currency, trade reference currency
    getCurrencies: builder.query<CurrencyListResponse, void>({
      query: () => FOREX_API_ENDPOINTS.CURRENCIES,
      providesTags: [FOREX_CACHE_TAGS.CURRENCIES],
      // Currency list rarely changes, cache aggressively
      keepUnusedDataFor: FOREX_REFETCH_INTERVALS.CURRENCIES,
    }),

    // ========================================================================
    // GET /api/forex/rate - Single pair rate
    // ========================================================================
    // Use: Tooltips, inline currency hints, quick reference
    getForexRate: builder.query<ForexRateResponse, ForexRateParams>({
      query: ({ from, to }) => ({
        url: FOREX_API_ENDPOINTS.RATE,
        params: { from, to },
      }),
      providesTags: (_result, _error, { from, to }) => [
        { type: FOREX_CACHE_TAGS.LATEST_RATES, id: `${from}_${to}` },
      ],
      keepUnusedDataFor: FOREX_REFETCH_INTERVALS.LATEST_RATES,
    }),

    // ========================================================================
    // GET /api/forex/exposure-valuation - Exposure valuation
    // ========================================================================
    // Use: Invoice detail page, exposure dashboard, trade summary
    // Returns valued amount in company base currency
    getExposureValuation: builder.query<ExposureValuationResponse, ExposureValuationRequest>({
      query: (params) => ({
        url: FOREX_API_ENDPOINTS.EXPOSURE_VALUATION,
        params,
      }),
      providesTags: [FOREX_CACHE_TAGS.LATEST_RATES],
      keepUnusedDataFor: FOREX_REFETCH_INTERVALS.LATEST_RATES,
    }),

    // ========================================================================
    // GET /api/forex/usage - API usage statistics (Admin only)
    // ========================================================================
    // Use: Admin monitoring, quota tracking
    getForexUsage: builder.query<ForexUsageResponse, void>({
      query: () => FOREX_API_ENDPOINTS.USAGE,
      providesTags: [FOREX_CACHE_TAGS.USAGE],
      keepUnusedDataFor: FOREX_REFETCH_INTERVALS.USAGE,
    }),

    // ========================================================================
    // POST /api/forex/refresh - Manual refresh (Admin only)
    // ========================================================================
    // Use: Force refresh of cached rates
    refreshRates: builder.mutation<RefreshRatesResponse, void>({
      query: () => ({
        url: FOREX_API_ENDPOINTS.REFRESH,
        method: 'POST',
      }),
      // Invalidate cached rates to force refetch
      invalidatesTags: [
        FOREX_CACHE_TAGS.LATEST_RATES,
        FOREX_CACHE_TAGS.USAGE,
      ],
    }),
  }),
  overrideExisting: false,
});

// Export hooks for usage in functional components
export const {
  // Queries
  useGetLatestRatesQuery,
  useGetHistoricalRatesQuery,
  useGetCurrenciesQuery,
  useGetForexRateQuery,
  useGetExposureValuationQuery,
  useGetForexUsageQuery,
  // Lazy queries (for manual triggering)
  useLazyGetLatestRatesQuery,
  useLazyGetHistoricalRatesQuery,
  useLazyGetForexRateQuery,
  useLazyGetExposureValuationQuery,
  // Mutations
  useRefreshRatesMutation,
} = forexApi;

// Export endpoints for use in SSR or outside of React
export const { endpoints: forexEndpoints } = forexApi;
