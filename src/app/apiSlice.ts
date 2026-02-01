import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { API_BASE_URL } from '../constants';
import { getAccessToken, setAccessToken, getRefreshToken, setRefreshToken, setStoredUser, removeTokens, getActiveCompanyId } from '../utils/storage';
import { logout } from './authSlice';
import type { User } from '../types';

// Base query with authentication and company context
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Attach company context header for all API calls
    const activeCompanyId = getActiveCompanyId();
    if (activeCompanyId) {
      headers.set('X-Company-Id', activeCompanyId);
    }
    
    return headers;
  },
});

// Base query with token refresh logic
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If access token expired, try to refresh
  if (result.error && result.error.status === 401) {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      // Try to get a new access token
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // Store the new tokens and user data
        const response = refreshResult.data as { 
          success: boolean; 
          data: { 
            accessToken: string; 
            refreshToken: string; 
            user: User;
          } 
        };
        
        if (response.success && response.data) {
          const { accessToken, refreshToken: newRefreshToken, user } = response.data;
          
          if (accessToken) {
            setAccessToken(accessToken);
          }
          if (newRefreshToken) {
            setRefreshToken(newRefreshToken);
          }
          if (user) {
            setStoredUser(user);
          }

          // Retry the original query with new token
          result = await baseQuery(args, api, extraOptions);
        } else {
          // Response wasn't successful - logout user
          removeTokens();
          api.dispatch(logout());
        }
      } else {
        // Refresh failed - logout user
        removeTokens();
        api.dispatch(logout());
      }
    } else {
      // No refresh token - logout user
      api.dispatch(logout());
    }
  }

  return result;
};

// Create the base API service
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Company',
    'Party',
    'Trade',
    'Invoice',
    'Payment',
    'Exposure',
    'Hedge',
    'Audit',
    'Dashboard',
  ],
  endpoints: () => ({}),
});
