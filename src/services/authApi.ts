import { apiSlice } from '../app/apiSlice';
import type {
  RegisterRequest,
  LoginRequest,
  GoogleSignInRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  AuthResponseApiResponse,
  UserProfileResponseApiResponse,
  ObjectApiResponse,
} from '../types/auth';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Register new user
    register: builder.mutation<AuthResponseApiResponse, RegisterRequest>({
      query: (credentials) => ({
        url: '/Auth/register',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    // Login with email/password
    login: builder.mutation<AuthResponseApiResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/Auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    // Google Sign-In
    googleSignIn: builder.mutation<AuthResponseApiResponse, GoogleSignInRequest>({
      query: (data) => ({
        url: '/Auth/google',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Refresh access token
    refreshToken: builder.mutation<AuthResponseApiResponse, RefreshTokenRequest>({
      query: (data) => ({
        url: '/Auth/refresh',
        method: 'POST',
        body: data,
      }),
    }),

    // Forgot password - request reset email
    forgotPassword: builder.mutation<ObjectApiResponse, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/Auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),

    // Reset password with token
    resetPassword: builder.mutation<ObjectApiResponse, ResetPasswordRequest>({
      query: (data) => ({
        url: '/Auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),

    // Get current user profile
    getProfile: builder.query<UserProfileResponseApiResponse, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),

    // Update user profile
    updateProfile: builder.mutation<UserProfileResponseApiResponse, UpdateProfileRequest>({
      query: (data) => ({
        url: '/users/me',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Upload avatar
    uploadAvatar: builder.mutation<UserProfileResponseApiResponse, FormData>({
      query: (formData) => ({
        url: '/users/upload-avatar',
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
        formData: true,
      }),
      invalidatesTags: ['User'],
    }),

    // Delete user account
    deleteAccount: builder.mutation<ObjectApiResponse, void>({
      query: () => ({
        url: '/users/me',
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // Change password
    changePassword: builder.mutation<ObjectApiResponse, ChangePasswordRequest>({
      query: (data) => ({
        url: '/users/change-password',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGoogleSignInMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useDeleteAccountMutation,
  useChangePasswordMutation,
} = authApi;
