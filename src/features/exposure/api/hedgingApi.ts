// ═══════════════════════════════════════════════════════════════════════════════
// QUARTERLY HEDGING MODULE - RTK QUERY API
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import { apiSlice } from '../../../app/apiSlice';
import type {
  HedgeRecordResponse,
  HedgesListResponse,
  HedgeFilters,
  BookForwardContractRequest,
  BookForwardContractResponse,
  ApplyQuarterlyNaturalHedgeRequest,
  QuarterlyNaturalHedgeResponse,
  CloseHedgeApiRequest,
  CloseHedgeResponse,
  GetExposuresForHedgingRequest,
  ExposuresForHedgingResponse,
  QuarterlyExposureReportResponse,
} from '../hedgingTypes';

// ─────────────────────────────────────────────────────────────────────────────────
// BUILD QUERY STRING FROM HEDGE FILTERS
// ─────────────────────────────────────────────────────────────────────────────────
const buildHedgeQueryString = (filters?: HedgeFilters): string => {
  if (!filters) return '';

  const params = new URLSearchParams();

  if (filters.type) params.append('type', filters.type);
  if (filters.status) params.append('status', filters.status);
  if (filters.quarter) params.append('quarter', filters.quarter);
  if (filters.currency) params.append('currency', filters.currency);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

// ─────────────────────────────────────────────────────────────────────────────────
// HEDGING API ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────────
export const hedgingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─────────────────────────────────────────────────────────────────────────────
    // BOOK FORWARD CONTRACT
    // POST /api/exposures/forward-contract
    // ─────────────────────────────────────────────────────────────────────────────
    bookForwardContract: builder.mutation<BookForwardContractResponse, BookForwardContractRequest>({
      query: (data) => ({
        url: '/exposures/forward-contract',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { exposureId }) => [
        { type: 'Exposure', id: exposureId },
        { type: 'Exposure', id: 'LIST' },
        { type: 'Exposure', id: 'DASHBOARD' },
        { type: 'Hedge', id: 'LIST' },
      ],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // APPLY QUARTERLY NATURAL HEDGE
    // POST /api/exposures/quarterly-natural-hedge
    // ─────────────────────────────────────────────────────────────────────────────
    applyQuarterlyNaturalHedge: builder.mutation<
      QuarterlyNaturalHedgeResponse,
      ApplyQuarterlyNaturalHedgeRequest
    >({
      query: (data) => ({
        url: '/exposures/quarterly-natural-hedge',
        method: 'POST',
        body: {
          quarter: data.quarter,
          currency: data.currency,
          receivableExposureIds: data.receivableExposureIds,
          payableExposureIds: data.payableExposureIds,
          hedgeAmount: data.totalHedgeAmount, // Backend expects 'hedgeAmount'
          internalRate: data.internalRate,
          remarks: data.remarks,
        },
      }),
      invalidatesTags: (_result, _error, { receivableExposureIds, payableExposureIds }) => [
        // Invalidate all affected exposures
        ...receivableExposureIds.map((id) => ({ type: 'Exposure' as const, id })),
        ...payableExposureIds.map((id) => ({ type: 'Exposure' as const, id })),
        { type: 'Exposure', id: 'LIST' },
        { type: 'Exposure', id: 'DASHBOARD' },
        { type: 'Hedge', id: 'LIST' },
      ],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // CLOSE A HEDGE
    // POST /api/exposures/hedges/{hedgeId}/close
    // ─────────────────────────────────────────────────────────────────────────────
    closeHedgeRecord: builder.mutation<
      CloseHedgeResponse,
      { hedgeId: string; data: CloseHedgeApiRequest }
    >({
      query: ({ hedgeId, data }) => ({
        url: `/exposures/hedges/${hedgeId}/close`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { hedgeId }) => [
        { type: 'Hedge', id: hedgeId },
        { type: 'Hedge', id: 'LIST' },
        { type: 'Exposure', id: 'LIST' },
        { type: 'Exposure', id: 'DASHBOARD' },
      ],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // GET ALL HEDGES
    // GET /api/exposures/hedges
    // ─────────────────────────────────────────────────────────────────────────────
    getHedges: builder.query<HedgesListResponse, HedgeFilters | void>({
      query: (filters) => `/exposures/hedges${buildHedgeQueryString(filters || undefined)}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Hedge' as const, id })),
              { type: 'Hedge', id: 'LIST' },
            ]
          : [{ type: 'Hedge', id: 'LIST' }],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // GET HEDGES BY EXPOSURE
    // GET /api/exposures/{exposureId}/hedges
    // ─────────────────────────────────────────────────────────────────────────────
    getHedgesByExposure: builder.query<HedgesListResponse, string>({
      query: (exposureId) => `/exposures/${exposureId}/hedges`,
      providesTags: (result, _error, exposureId) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Hedge' as const, id })),
              { type: 'Hedge', id: `EXPOSURE_${exposureId}` },
            ]
          : [{ type: 'Hedge', id: `EXPOSURE_${exposureId}` }],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // GET HEDGES BY QUARTER
    // GET /api/exposures/hedges/quarter/{quarter}
    // ─────────────────────────────────────────────────────────────────────────────
    getHedgesByQuarter: builder.query<HedgesListResponse, string>({
      query: (quarter) => `/exposures/hedges/quarter/${encodeURIComponent(quarter)}`,
      providesTags: (result, _error, quarter) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Hedge' as const, id })),
              { type: 'Hedge', id: `QUARTER_${quarter}` },
            ]
          : [{ type: 'Hedge', id: `QUARTER_${quarter}` }],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // GET EXPOSURES AVAILABLE FOR HEDGING
    // POST /api/exposures/for-hedging
    // ─────────────────────────────────────────────────────────────────────────────
    getExposuresForHedging: builder.query<ExposuresForHedgingResponse, GetExposuresForHedgingRequest>({
      query: (data) => ({
        url: '/exposures/for-hedging',
        method: 'POST',
        body: data,
      }),
      providesTags: (_result, _error, { quarter, currency }) => [
        { type: 'Exposure', id: `HEDGING_${quarter}_${currency}` },
        { type: 'Exposure', id: 'LIST' },
      ],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // GET QUARTERLY REPORT
    // GET /api/exposures/quarterly-report/{quarter}/{currency}
    // ─────────────────────────────────────────────────────────────────────────────
    getQuarterlyReport: builder.query<
      QuarterlyExposureReportResponse,
      { quarter: string; currency: string }
    >({
      query: ({ quarter, currency }) =>
        `/exposures/quarterly-report/${encodeURIComponent(quarter)}/${encodeURIComponent(currency)}`,
      providesTags: (_result, _error, { quarter, currency }) => [
        { type: 'Exposure', id: `REPORT_${quarter}_${currency}` },
        { type: 'Hedge', id: 'LIST' },
      ],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // GET HEDGE BY ID
    // GET /api/exposures/hedges/{hedgeId}
    // ─────────────────────────────────────────────────────────────────────────────
    getHedgeById: builder.query<{ success: boolean; data: HedgeRecordResponse }, string>({
      query: (hedgeId) => `/exposures/hedges/${hedgeId}`,
      providesTags: (_result, _error, hedgeId) => [{ type: 'Hedge', id: hedgeId }],
    }),
  }),
});

// ─────────────────────────────────────────────────────────────────────────────────
// EXPORTED HOOKS
// ─────────────────────────────────────────────────────────────────────────────────
export const {
  // Mutations
  useBookForwardContractMutation,
  useApplyQuarterlyNaturalHedgeMutation,
  useCloseHedgeRecordMutation,
  
  // Queries
  useGetHedgesQuery,
  useGetHedgesByExposureQuery,
  useGetHedgesByQuarterQuery,
  useGetExposuresForHedgingQuery,
  useGetQuarterlyReportQuery,
  useGetHedgeByIdQuery,
  
  // Lazy queries
  useLazyGetExposuresForHedgingQuery,
  useLazyGetQuarterlyReportQuery,
  useLazyGetHedgesByQuarterQuery,
} = hedgingApi;
