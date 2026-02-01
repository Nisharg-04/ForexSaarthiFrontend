import { apiSlice } from '../app/apiSlice';
import type { Company, UserRole } from '../types';

// Company API Response Types
export interface CompanyWithRole extends Company {
  myRole: UserRole;
  logoUrl?: string | null;
}

export interface MyCompaniesResponse {
  success: boolean;
  data: CompanyWithRole[];
  message?: string;
}

export interface CompanyResponse {
  success: boolean;
  data: Company;
  message?: string;
}

// Updated to match actual API schema
export interface CreateCompanyRequest {
  name: string;
  iecNumber?: string;
  gstNumber?: string;
  taxId?: string;
  registrationNumber?: string;
  address?: string;
  country?: string;
  baseCurrency: string;
}

export interface UpdateCompanyRequest extends Partial<CreateCompanyRequest> {
  id: string;
}

// Company User Types
export interface CompanyUser {
  id: string;
  userId: string;
  companyId: string;
  userName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  joinedAt: string;
}

export interface CompanyUsersResponse {
  success: boolean;
  data: CompanyUser[];
  message?: string;
}

export interface AddCompanyUserRequest {
  companyId: string;
  email: string;
  role: UserRole;
}

export interface UpdateCompanyUserRoleRequest {
  companyId: string;
  userId: string;
  role: UserRole;
}

export interface CompanyUserActionRequest {
  companyId: string;
  userId: string;
}

export const companyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get user's companies
    getMyCompanies: builder.query<MyCompaniesResponse, void>({
      query: () => '/companies/my',
      providesTags: ['Company'],
    }),

    // Get single company
    getCompany: builder.query<CompanyResponse, string>({
      query: (id) => `/companies/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Company', id }],
    }),

    // Create company
    createCompany: builder.mutation<CompanyResponse, CreateCompanyRequest>({
      query: (data) => ({
        url: '/companies',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Company'],
    }),

    // Update company
    updateCompany: builder.mutation<CompanyResponse, UpdateCompanyRequest>({
      query: ({ id, ...data }) => ({
        url: `/companies/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Company', id }, 'Company'],
    }),

    // Delete company
    deleteCompany: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/companies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Company'],
    }),

    // Get company users
    getCompanyUsers: builder.query<CompanyUsersResponse, string>({
      query: (companyId) => `/company-users/${companyId}`,
      providesTags: (_result, _error, companyId) => [{ type: 'Company', id: `users-${companyId}` }],
    }),

    // Add user to company
    addCompanyUser: builder.mutation<{ success: boolean }, AddCompanyUserRequest>({
      query: (data) => ({
        url: '/company-users',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { companyId }) => [{ type: 'Company', id: `users-${companyId}` }],
    }),

    // Update user role
    updateCompanyUserRole: builder.mutation<{ success: boolean }, UpdateCompanyUserRoleRequest>({
      query: ({ companyId, userId, role }) => ({
        url: '/company-users/role',
        method: 'PUT',
        body: { companyId, userId, role },
      }),
      invalidatesTags: (_result, _error, { companyId }) => [{ type: 'Company', id: `users-${companyId}` }],
    }),

    // Deactivate user
    deactivateCompanyUser: builder.mutation<{ success: boolean }, CompanyUserActionRequest>({
      query: ({ companyId, userId }) => ({
        url: `/company-users/${companyId}/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { companyId }) => [{ type: 'Company', id: `users-${companyId}` }],
    }),

    // Reactivate user
    reactivateCompanyUser: builder.mutation<{ success: boolean }, CompanyUserActionRequest>({
      query: ({ companyId, userId }) => ({
        url: `/company-users/${companyId}/${userId}/reactivate`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { companyId }) => [{ type: 'Company', id: `users-${companyId}` }],
    }),

    // Upload company logo
    uploadCompanyLogo: builder.mutation<CompanyResponse, { companyId: string; formData: FormData }>({
      query: ({ companyId, formData }) => ({
        url: `/companies/${companyId}/upload-logo`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (_result, _error, { companyId }) => [{ type: 'Company', id: companyId }, 'Company'],
    }),
  }),
});

export const {
  useGetMyCompaniesQuery,
  useGetCompanyQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
  useGetCompanyUsersQuery,
  useAddCompanyUserMutation,
  useUpdateCompanyUserRoleMutation,
  useDeactivateCompanyUserMutation,
  useReactivateCompanyUserMutation,
  useUploadCompanyLogoMutation,
} = companyApi;
