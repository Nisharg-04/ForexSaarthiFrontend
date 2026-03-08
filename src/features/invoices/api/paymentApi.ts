import { apiSlice } from '../../../app/apiSlice';
import type {
  Payment,
  PaymentListItem,
  InvoicePaymentSummary,
  CreatePaymentRequest,
  PaymentResponse,
  PaymentDateRangeQuery,
} from '../types';

export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new payment
    createPayment: builder.mutation<PaymentResponse, CreatePaymentRequest>({
      query: (body) => ({
        url: '/Payment',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { invoiceId }) => [
        { type: 'Payment', id: 'LIST' },
        { type: 'Payment', id: `INVOICE_${invoiceId}` },
        { type: 'Invoice', id: invoiceId },
        { type: 'Invoice', id: 'LIST' },
      ],
    }),

    // Get all payments for the company
    getPayments: builder.query<PaymentListItem[], void>({
      query: () => '/Payment',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Payment' as const, id })),
              { type: 'Payment', id: 'LIST' },
            ]
          : [{ type: 'Payment', id: 'LIST' }],
    }),

    // Get single payment by ID
    getPayment: builder.query<Payment, string>({
      query: (paymentId) => `/Payment/${paymentId}`,
      providesTags: (_result, _error, id) => [{ type: 'Payment', id }],
    }),

    // Get payment summary and history for an invoice
    getInvoicePayments: builder.query<InvoicePaymentSummary, string>({
      query: (invoiceId) => `/Payment/invoice/${invoiceId}`,
      providesTags: (_result, _error, invoiceId) => [
        { type: 'Payment', id: `INVOICE_${invoiceId}` },
      ],
    }),

    // Get payments by date range
    getPaymentsByDateRange: builder.query<PaymentListItem[], PaymentDateRangeQuery>({
      query: ({ startDate, endDate }) => ({
        url: '/Payment/range',
        params: { startDate, endDate },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Payment' as const, id })),
              { type: 'Payment', id: 'RANGE' },
            ]
          : [{ type: 'Payment', id: 'RANGE' }],
    }),
  }),
});

export const {
  useCreatePaymentMutation,
  useGetPaymentsQuery,
  useGetPaymentQuery,
  useGetInvoicePaymentsQuery,
  useGetPaymentsByDateRangeQuery,
} = paymentApi;
