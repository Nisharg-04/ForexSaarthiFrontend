// ═══════════════════════════════════════════════════════════════════════════════
// FORWARD CONTRACTS MODULE - RTK QUERY API
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import { apiSlice } from '../../../app/apiSlice';
import type {
  ForwardContract,
  ForwardContractResponse,
  ForwardContractsResponse,
  ForwardFilters,
  BookForwardRequest,
  CloseForwardRequest,
  CancelForwardRequest,
  QuarterAnalyticsResponse,
  AnnualAnalyticsResponse,
  ExpiringContractsResponse,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────────
// BUILD QUERY STRING FROM FILTERS
// ─────────────────────────────────────────────────────────────────────────────────
const buildQueryString = (filters?: ForwardFilters): string => {
  if (!filters) return '';

  const params = new URLSearchParams();

  const appendParam = (key: string, value: string | number | undefined) => {
    if (value === undefined || value === null || value === '') return;
    params.append(key, String(value));
  };

  appendParam('currency', filters.currency);
  appendParam('bank', filters.bank);
  appendParam('status', filters.status);
  appendParam('year', filters.year);
  appendParam('quarter', filters.quarter);
  appendParam('search', filters.search);
  appendParam('exposureId', filters.exposureId);
  appendParam('page', filters.page);
  appendParam('pageSize', filters.pageSize);
  appendParam('sortBy', filters.sortBy);
  appendParam('sortOrder', filters.sortOrder);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

// ─────────────────────────────────────────────────────────────────────────────────
// FORWARD CONTRACTS API ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────────
export const forwardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─────────────────────────────────────────────────────────────────────────────
    // GET ALL FORWARD CONTRACTS
    // ─────────────────────────────────────────────────────────────────────────────
    getForwardContracts: builder.query<ForwardContractsResponse, ForwardFilters | void>({
      query: (filters) => `/forwards${buildQueryString(filters || undefined)}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: 'Forward' as const, id })),
              { type: 'Forward', id: 'LIST' },
            ]
          : [{ type: 'Forward', id: 'LIST' }],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // GET FORWARD BY ID
    // ─────────────────────────────────────────────────────────────────────────────
    getForwardById: builder.query<ForwardContractResponse, string>({
      query: (id) => `/forwards/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Forward', id }],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // GET FORWARD CONTRACTS BY EXPOSURE
    // ─────────────────────────────────────────────────────────────────────────────
    getExposureForwards: builder.query<ForwardContractsResponse, string>({
      query: (exposureId) => `/forwards/exposure/${exposureId}`,
      providesTags: (result, _error, exposureId) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: 'Forward' as const, id })),
              { type: 'Forward', id: `EXPOSURE_${exposureId}` },
            ]
          : [{ type: 'Forward', id: `EXPOSURE_${exposureId}` }],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // BOOK FORWARD CONTRACT
    // ─────────────────────────────────────────────────────────────────────────────
    bookForward: builder.mutation<ForwardContractResponse, BookForwardRequest>({
      query: (body) => ({
        url: '/forwards/book',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Forward', id: 'LIST' },
        { type: 'Exposure', id: 'LIST' },
        { type: 'Exposure', id: 'DASHBOARD' },
      ],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // CLOSE FORWARD CONTRACT
    // ─────────────────────────────────────────────────────────────────────────────
    closeForward: builder.mutation<ForwardContractResponse, { id: string; data: CloseForwardRequest }>({
      query: ({ id, data }: { id: string; data: CloseForwardRequest }) => ({
        url: `/forwards/${id}/close`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }: { id: string; data: CloseForwardRequest }) => [
        { type: 'Forward', id },
        { type: 'Forward', id: 'LIST' },
        { type: 'Exposure', id: 'LIST' },
        { type: 'Exposure', id: 'DASHBOARD' },
      ],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // CANCEL FORWARD CONTRACT
    // ─────────────────────────────────────────────────────────────────────────────
    cancelForward: builder.mutation<ForwardContractResponse, { id: string; data: CancelForwardRequest }>({
      query: ({ id, data }: { id: string; data: CancelForwardRequest }) => ({
        url: `/forwards/${id}/cancel`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }: { id: string; data: CancelForwardRequest }) => [
        { type: 'Forward', id },
        { type: 'Forward', id: 'LIST' },
        { type: 'Exposure', id: 'LIST' },
        { type: 'Exposure', id: 'DASHBOARD' },
      ],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // GET QUARTER ANALYTICS
    // ─────────────────────────────────────────────────────────────────────────────
    getQuarterAnalytics: builder.query<QuarterAnalyticsResponse, { year: number; quarter: string } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.year) queryParams.append('year', String(params.year));
        if (params?.quarter) queryParams.append('quarter', params.quarter);
        const queryString = queryParams.toString();
        return `/forwards/quarter${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: [{ type: 'Forward', id: 'QUARTER_ANALYTICS' }],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // GET ANNUAL ANALYTICS
    // ─────────────────────────────────────────────────────────────────────────────
    getForwardAnalytics: builder.query<AnnualAnalyticsResponse, number | void>({
      query: (year) => {
        const queryParams = year ? `?year=${year}` : '';
        return `/forwards/analytics${queryParams}`;
      },
      providesTags: [{ type: 'Forward', id: 'ANNUAL_ANALYTICS' }],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // GET EXPIRING CONTRACTS
    // ─────────────────────────────────────────────────────────────────────────────
    getExpiringForwards: builder.query<ExpiringContractsResponse, number | void>({
      query: (days = 30) => `/forwards/expiring?days=${days}`,
      providesTags: [{ type: 'Forward', id: 'EXPIRING' }],
    }),
  }),
});

// ─────────────────────────────────────────────────────────────────────────────────
// EXPORT HOOKS
// ─────────────────────────────────────────────────────────────────────────────────
export const {
  useGetForwardContractsQuery,
  useGetForwardByIdQuery,
  useGetExposureForwardsQuery,
  useBookForwardMutation,
  useCloseForwardMutation,
  useCancelForwardMutation,
  useGetQuarterAnalyticsQuery,
  useGetForwardAnalyticsQuery,
  useGetExpiringForwardsQuery,
} = forwardApi;
