// ═══════════════════════════════════════════════════════════════════════════════
// EXPOSURE MODULE - RTK QUERY API
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import { apiSlice } from '../../../app/apiSlice';
import type {
  Exposure,
  ExposureFilters,
  ExposureResponse,
  ExposuresResponse,
  ExposureDashboardResponse,
  HedgeResponse,
  NaturalHedgeMatchesResponse,
  ApplyForwardHedgeRequest,
  ApplyNaturalHedgeRequest,
  CloseHedgeRequest,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────────
// BUILD QUERY STRING FROM FILTERS
// ─────────────────────────────────────────────────────────────────────────────────
const buildQueryString = (filters?: ExposureFilters): string => {
  if (!filters) return '';

  const params = new URLSearchParams();

  // Helper to handle single or array values
  const appendParam = (key: string, value: string | string[] | number | undefined) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      if (value.length > 0) params.append(key, value.join(','));
    } else {
      params.append(key, String(value));
    }
  };

  appendParam('currency', filters.currency);
  appendParam('exposureType', filters.exposureType);
  appendParam('status', filters.status);
  appendParam('hedgingStatus', filters.hedgingStatus);
  appendParam('settlementStatus', filters.settlementStatus);
  appendParam('partyId', filters.partyId);
  appendParam('tradeId', filters.tradeId);
  appendParam('invoiceId', filters.invoiceId);
  appendParam('maturityFrom', filters.maturityFrom);
  appendParam('maturityTo', filters.maturityTo);
  appendParam('minAmount', filters.minAmount);
  appendParam('maxAmount', filters.maxAmount);
  appendParam('hedgePercentageMin', filters.hedgePercentageMin);
  appendParam('hedgePercentageMax', filters.hedgePercentageMax);
  appendParam('search', filters.search);
  appendParam('page', filters.page);
  appendParam('pageSize', filters.pageSize);
  appendParam('limit', filters.limit);
  appendParam('sortBy', filters.sortBy);
  appendParam('sortOrder', filters.sortOrder);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

// ─────────────────────────────────────────────────────────────────────────────────
// EXPOSURE API ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────────
export const exposureApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─────────────────────────────────────────────────────────────────────────────
    // GET EXPOSURES - List all exposures with filters
    // ─────────────────────────────────────────────────────────────────────────────
    getExposures: builder.query<ExposuresResponse, ExposureFilters | void>({
      query: (filters) => `/exposures${buildQueryString(filters || undefined)}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: 'Exposure' as const, id })),
              { type: 'Exposure', id: 'LIST' },
            ]
          : [{ type: 'Exposure', id: 'LIST' }],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // GET UNSETTLED EXPOSURES - Exposures not fully settled
    // ─────────────────────────────────────────────────────────────────────────────
    getUnsettledExposures: builder.query<ExposuresResponse, ExposureFilters | void>({
      query: (filters) => `/exposures/unsettled${buildQueryString(filters || undefined)}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: 'Exposure' as const, id })),
              { type: 'Exposure', id: 'UNSETTLED' },
            ]
          : [{ type: 'Exposure', id: 'UNSETTLED' }],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // GET EXPOSURES BY CURRENCY - Group by currency
    // ─────────────────────────────────────────────────────────────────────────────
    getExposuresByCurrency: builder.query<ExposuresResponse, string>({
      query: (currency) => `/exposures/currency/${currency}`,
      providesTags: (result, _error, currency) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: 'Exposure' as const, id })),
              { type: 'Exposure', id: `CURRENCY_${currency}` },
            ]
          : [{ type: 'Exposure', id: `CURRENCY_${currency}` }],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // GET EXPOSURE DASHBOARD - Aggregated dashboard data
    // ─────────────────────────────────────────────────────────────────────────────
    getExposureDashboard: builder.query<ExposureDashboardResponse, void>({
      query: () => '/exposures/dashboard',
      providesTags: [
        { type: 'Exposure', id: 'DASHBOARD' },
        { type: 'Exposure', id: 'LIST' },
      ],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // GET EXPOSURES BY STATUS - Filter by hedge status
    // ─────────────────────────────────────────────────────────────────────────────
    getExposuresByStatus: builder.query<ExposuresResponse, string>({
      query: (status) => `/exposures/status/${status}`,
      providesTags: (result, _error, status) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: 'Exposure' as const, id })),
              { type: 'Exposure', id: `STATUS_${status}` },
            ]
          : [{ type: 'Exposure', id: `STATUS_${status}` }],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // GET EXPOSURE BY ID - Single exposure detail
    // ─────────────────────────────────────────────────────────────────────────────
    getExposureById: builder.query<ExposureResponse, string>({
      query: (id) => `/exposures/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Exposure', id }],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // GET EXPOSURE BY INVOICE - Exposure linked to an invoice
    // ─────────────────────────────────────────────────────────────────────────────
    getExposureByInvoice: builder.query<ExposureResponse, string>({
      query: (invoiceId) => `/exposures/invoice/${invoiceId}`,
      providesTags: (result, _error, invoiceId) =>
        result?.data
          ? [
              { type: 'Exposure', id: result.data.id },
              { type: 'Exposure', id: `INVOICE_${invoiceId}` },
            ]
          : [{ type: 'Exposure', id: `INVOICE_${invoiceId}` }],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // GET NATURAL HEDGE MATCHES - Opposite exposures for natural hedging
    // ─────────────────────────────────────────────────────────────────────────────
    getNaturalHedgeMatches: builder.query<NaturalHedgeMatchesResponse, string>({
      query: (exposureId) => `/exposures/${exposureId}/natural-matches`,
      providesTags: (_result, _error, exposureId) => [
        { type: 'Exposure', id: `MATCHES_${exposureId}` },
      ],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // APPLY FORWARD HEDGE - Create bank forward contract
    // POST /api/exposures/{id}/forward-hedge
    // ─────────────────────────────────────────────────────────────────────────────
    applyForwardHedge: builder.mutation<
      ExposureResponse,
      { exposureId: string; data: ApplyForwardHedgeRequest }
    >({
      query: ({ exposureId, data }) => ({
        url: `/exposures/${exposureId}/forward-hedge`,
        method: 'POST',
        body: {
          exposureId,
          hedgeAmount: data.amount,
          forwardRate: data.forwardRate,
          contractDate: data.contractDate,
          settlementDate: data.settlementDate,
          bankName: data.bankName,
          contractReference: data.contractReference,
          remarks: data.remarks,
        },
      }),
      invalidatesTags: (_result, _error, { exposureId }) => [
        { type: 'Exposure', id: exposureId },
        { type: 'Exposure', id: 'LIST' },
        { type: 'Exposure', id: 'DASHBOARD' },
        { type: 'Exposure', id: 'UNSETTLED' },
      ],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // APPLY NATURAL HEDGE - Match against opposite exposure
    // POST /api/exposures/natural-hedge
    // ─────────────────────────────────────────────────────────────────────────────
    applyNaturalHedge: builder.mutation<
      any,
      { exposureAId: string; exposureBId: string; hedgeAmount: number; internalRate?: number; remarks?: string }
    >({
      query: (data) => ({
        url: `/exposures/natural-hedge`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { exposureAId, exposureBId }) => [
        { type: 'Exposure', id: exposureAId },
        { type: 'Exposure', id: exposureBId },
        { type: 'Exposure', id: 'LIST' },
        { type: 'Exposure', id: 'DASHBOARD' },
        { type: 'Exposure', id: 'UNSETTLED' },
      ],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // CLOSE HEDGE - Settle and close an active hedge
    // ─────────────────────────────────────────────────────────────────────────────
    closeHedge: builder.mutation<HedgeResponse, { exposureId: string; data: CloseHedgeRequest }>({
      query: ({ exposureId, data }) => ({
        url: `/exposures/${exposureId}/close-hedge`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { exposureId }) => [
        { type: 'Exposure', id: exposureId },
        { type: 'Exposure', id: 'LIST' },
        { type: 'Exposure', id: 'DASHBOARD' },
        { type: 'Exposure', id: 'UNSETTLED' },
      ],
    }),
  }),
});

// ─────────────────────────────────────────────────────────────────────────────────
// EXPORTED HOOKS
// ─────────────────────────────────────────────────────────────────────────────────
export const {
  useGetExposuresQuery,
  useGetUnsettledExposuresQuery,
  useGetExposuresByCurrencyQuery,
  useGetExposuresByStatusQuery,
  useGetExposureDashboardQuery,
  useGetExposureByIdQuery,
  useGetExposureByInvoiceQuery,
  useGetNaturalHedgeMatchesQuery,
  useApplyForwardHedgeMutation,
  useApplyNaturalHedgeMutation,
  useCloseHedgeMutation,
} = exposureApi;
