import { apiSlice } from '../../../app/apiSlice';
import type {
  Document,
  DocumentFilters,
  DocumentResponse,
  DocumentsResponse,
  RenameDocumentRequest,
  DownloadDocumentResponse,
} from '../types';

// Build query string from filters
const buildQueryString = (filters?: DocumentFilters): string => {
  if (!filters) return '';

  const params = new URLSearchParams();

  if (filters.tradeId) params.append('tradeId', filters.tradeId);
  if (filters.documentType) params.append('documentType', filters.documentType);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

export const documentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all documents for the company
    getCompanyDocuments: builder.query<DocumentsResponse, DocumentFilters | void>({
      query: (filters) => `/documents/company${buildQueryString(filters || undefined)}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: 'Document' as const, id })),
              { type: 'Document', id: 'COMPANY_LIST' },
            ]
          : [{ type: 'Document', id: 'COMPANY_LIST' }],
    }),

    // Get documents by trade ID
    getTradeDocuments: builder.query<DocumentsResponse, string>({
      query: (tradeId) => `/documents/trade/${tradeId}`,
      providesTags: (result, _error, tradeId) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: 'Document' as const, id })),
              { type: 'Document', id: `TRADE_${tradeId}` },
            ]
          : [{ type: 'Document', id: `TRADE_${tradeId}` }],
    }),

    // Get single document by ID
    getDocument: builder.query<DocumentResponse, string>({
      query: (id) => `/documents/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Document', id }],
    }),

    // Upload document
    uploadDocument: builder.mutation<DocumentResponse, FormData>({
      query: (formData) => ({
        url: '/documents/upload',
        method: 'POST',
        body: formData,
        // Note: Don't set Content-Type header, let the browser set it with boundary
      }),
      invalidatesTags: (_result, _error, formData) => {
        const tradeId = formData.get('tradeId');
        const tags: Array<{ type: 'Document'; id: string }> = [
          { type: 'Document', id: 'COMPANY_LIST' },
        ];
        if (tradeId) {
          tags.push({ type: 'Document', id: `TRADE_${tradeId}` });
        }
        return tags;
      },
    }),

    // Rename document
    renameDocument: builder.mutation<DocumentResponse, RenameDocumentRequest>({
      query: ({ id, documentName }) => ({
        url: `/documents/${id}/rename`,
        method: 'PATCH',
        body: { documentName },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Document', id },
        { type: 'Document', id: 'COMPANY_LIST' },
      ],
    }),

    // Delete document
    deleteDocument: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: `/documents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Document', id },
        { type: 'Document', id: 'COMPANY_LIST' },
      ],
    }),

    // Download document (get presigned URL)
    downloadDocument: builder.query<DownloadDocumentResponse, string>({
      query: (id) => `/documents/${id}/download`,
    }),
  }),
});

// Export hooks
export const {
  useGetCompanyDocumentsQuery,
  useGetTradeDocumentsQuery,
  useGetDocumentQuery,
  useUploadDocumentMutation,
  useRenameDocumentMutation,
  useDeleteDocumentMutation,
  useLazyDownloadDocumentQuery,
} = documentApi;
