import { apiSlice } from '../../../app/apiSlice';

// Types
interface PartyFilters {
  type?: 'BUYER' | 'SUPPLIER';
  country?: string;
  currency?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

interface Party {
  id: string;
  companyId: string;
  name: string;
  type: 'BUYER' | 'SUPPLIER';
  country: string;
  currency: string;
  paymentTermDays: number;
  address?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreatePartyRequest {
  name: string;
  type: 'BUYER' | 'SUPPLIER';
  country: string;
  currency: string;
  paymentTermDays: number;
  address?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
}

interface UpdatePartyRequest extends Partial<CreatePartyRequest> {
  id: string;
}

interface PartyResponse {
  success: boolean;
  data: Party;
  message?: string;
}

interface PartiesResponse {
  success: boolean;
  data: Party[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

// Build query string from filters
const buildQueryString = (filters?: PartyFilters): string => {
  if (!filters) return '';
  
  const params = new URLSearchParams();
  
  if (filters.type) params.append('type', filters.type);
  if (filters.country) params.append('country', filters.country);
  if (filters.currency) params.append('currency', filters.currency);
  if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));
  
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

export const partyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all parties for the company
    getParties: builder.query<PartiesResponse, PartyFilters | void>({
      query: (filters) => `/parties${buildQueryString(filters || undefined)}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: 'Party' as const, id })),
              { type: 'Party', id: 'LIST' },
            ]
          : [{ type: 'Party', id: 'LIST' }],
    }),

    // Get single party by ID
    getParty: builder.query<PartyResponse, string>({
      query: (id) => `/parties/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Party', id }],
    }),

    // Create new party
    createParty: builder.mutation<PartyResponse, CreatePartyRequest>({
      query: (data) => ({
        url: '/parties',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Party', id: 'LIST' }],
    }),

    // Update existing party
    updateParty: builder.mutation<PartyResponse, UpdatePartyRequest>({
      query: ({ id, ...data }) => ({
        url: `/parties/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Party', id },
        { type: 'Party', id: 'LIST' },
      ],
    }),

    // Soft delete party
    deleteParty: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: `/parties/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Party', id },
        { type: 'Party', id: 'LIST' },
      ],
    }),

    // Upload party logo
    uploadPartyLogo: builder.mutation<PartyResponse, { id: string; file: File }>({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/parties/${id}/upload-logo`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Party', id }],
    }),

    // Update party logo URL
    updatePartyLogo: builder.mutation<PartyResponse, { id: string; logoUrl: string }>({
      query: ({ id, logoUrl }) => ({
        url: `/parties/${id}/logo`,
        method: 'PATCH',
        body: { logoUrl },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Party', id }],
    }),
  }),
});

export const {
  useGetPartiesQuery,
  useGetPartyQuery,
  useCreatePartyMutation,
  useUpdatePartyMutation,
  useDeletePartyMutation,
  useUploadPartyLogoMutation,
  useUpdatePartyLogoMutation,
} = partyApi;
