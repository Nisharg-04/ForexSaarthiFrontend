import { apiSlice } from '../../../app/apiSlice';
import type {
  Invoice,
  InvoiceFilters,
  InvoiceResponse,
  InvoicesResponse,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  CancelInvoiceRequest,
} from '../types';

// Build query string from filters
const buildQueryString = (filters?: InvoiceFilters): string => {
  if (!filters) return '';

  const params = new URLSearchParams();

  if (filters.status) params.append('status', filters.status);
  if (filters.tradeId) params.append('tradeId', filters.tradeId);
  if (filters.partyId) params.append('partyId', filters.partyId);
  if (filters.currency) params.append('currency', filters.currency);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

export const invoiceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all invoices for the company
    getInvoices: builder.query<InvoicesResponse, InvoiceFilters | void>({
      query: (filters) => `/invoices${buildQueryString(filters || undefined)}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: 'Invoice' as const, id })),
              { type: 'Invoice', id: 'LIST' },
            ]
          : [{ type: 'Invoice', id: 'LIST' }],
    }),

    // Get invoices by trade ID
    getInvoicesByTrade: builder.query<InvoicesResponse, string>({
      query: (tradeId) => `/invoices/trade/${tradeId}`,
      providesTags: (result, _error, tradeId) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: 'Invoice' as const, id })),
              { type: 'Invoice', id: `TRADE_${tradeId}` },
            ]
          : [{ type: 'Invoice', id: `TRADE_${tradeId}` }],
    }),

    // Get single invoice by ID
    getInvoice: builder.query<InvoiceResponse, string>({
      query: (id) => `/invoices/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Invoice', id }],
    }),

    // Create new invoice (starts in DRAFT)
    createInvoice: builder.mutation<InvoiceResponse, CreateInvoiceRequest>({
      query: (body) => ({
        url: '/invoices',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Invoice', id: 'LIST' },
        { type: 'Trade', id: 'LIST' }, // Trades may show invoice count
      ],
    }),

    // Update invoice (only DRAFT status)
    updateInvoice: builder.mutation<InvoiceResponse, UpdateInvoiceRequest>({
      query: ({ id, ...body }) => ({
        url: `/invoices/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Invoice', id },
        { type: 'Invoice', id: 'LIST' },
      ],
    }),

    // Issue invoice (DRAFT → ISSUED) - Admin only
    // This creates forex exposure
    issueInvoice: builder.mutation<InvoiceResponse, string>({
      query: (id) => ({
        url: `/invoices/${id}/issue`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Invoice', id },
        { type: 'Invoice', id: 'LIST' },
        { type: 'Exposure', id: 'LIST' }, // Exposure is created on issue
      ],
    }),

    // Cancel invoice (DRAFT → CANCELLED) - Admin only
    cancelInvoice: builder.mutation<InvoiceResponse, CancelInvoiceRequest>({
      query: ({ id, cancelReason }) => ({
        url: `/invoices/${id}/cancel`,
        method: 'POST',
        body: { cancelReason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Invoice', id },
        { type: 'Invoice', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetInvoicesByTradeQuery,
  useGetInvoiceQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useIssueInvoiceMutation,
  useCancelInvoiceMutation,
} = invoiceApi;
