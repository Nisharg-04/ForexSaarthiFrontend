import { apiSlice } from '../../../app/apiSlice';
import type {
  Trade,
  TradeFilters,
  TradeResponse,
  TradesResponse,
  CreateTradeRequest,
  UpdateTradeRequest,
  CancelTradeRequest,
} from '../types';

// Build query string from filters
const buildQueryString = (filters?: TradeFilters): string => {
  if (!filters) return '';
  
  const params = new URLSearchParams();
  
  if (filters.stage) params.append('stage', filters.stage);
  if (filters.tradeType) params.append('tradeType', filters.tradeType);
  if (filters.partyId) params.append('partyId', filters.partyId);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));
  
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

export const tradeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all trades for the company
    getTrades: builder.query<TradesResponse, TradeFilters | void>({
      query: (filters) => `/trades${buildQueryString(filters || undefined)}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: 'Trade' as const, id })),
              { type: 'Trade', id: 'LIST' },
            ]
          : [{ type: 'Trade', id: 'LIST' }],
    }),

    // Get single trade by ID
    getTrade: builder.query<TradeResponse, string>({
      query: (id) => `/trades/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Trade', id }],
    }),

    // Create new trade (starts in DRAFT)
    createTrade: builder.mutation<TradeResponse, CreateTradeRequest>({
      query: (body) => ({
        url: '/trades',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Trade', id: 'LIST' }],
    }),

    // Update trade (only DRAFT stage)
    updateTrade: builder.mutation<TradeResponse, UpdateTradeRequest>({
      query: ({ id, ...body }) => ({
        url: `/trades/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Trade', id },
        { type: 'Trade', id: 'LIST' },
      ],
    }),

    // Submit trade for approval (DRAFT → SUBMITTED)
    submitTrade: builder.mutation<TradeResponse, string>({
      query: (id) => ({
        url: `/trades/${id}/submit`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Trade', id },
        { type: 'Trade', id: 'LIST' },
      ],
    }),

    // Approve trade (SUBMITTED → APPROVED) - Admin only
    approveTrade: builder.mutation<TradeResponse, string>({
      query: (id) => ({
        url: `/trades/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Trade', id },
        { type: 'Trade', id: 'LIST' },
      ],
    }),

    // Cancel trade (DRAFT/SUBMITTED → CANCELLED)
    cancelTrade: builder.mutation<TradeResponse, CancelTradeRequest>({
      query: ({ id, cancelReason }) => ({
        url: `/trades/${id}/cancel`,
        method: 'POST',
        body: { cancelReason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Trade', id },
        { type: 'Trade', id: 'LIST' },
      ],
    }),

    // Close trade (APPROVED → CLOSED)
    closeTrade: builder.mutation<TradeResponse, string>({
      query: (id) => ({
        url: `/trades/${id}/close`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Trade', id },
        { type: 'Trade', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetTradesQuery,
  useGetTradeQuery,
  useCreateTradeMutation,
  useUpdateTradeMutation,
  useSubmitTradeMutation,
  useApproveTradeMutation,
  useCancelTradeMutation,
  useCloseTradeMutation,
} = tradeApi;
