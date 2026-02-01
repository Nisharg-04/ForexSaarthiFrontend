import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User, CompanyAccess } from '../types';
import {
  getStoredUser,
  setStoredUser,
  removeStoredUser,
  getActiveCompanyId,
  setActiveCompanyId,
  removeActiveCompanyId,
  setAccessToken,
  setRefreshToken,
  removeTokens,
} from '../utils/storage';

interface AuthState {
  user: User | null;
  activeCompany: CompanyAccess | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const storedUser = getStoredUser();
const activeCompanyId = getActiveCompanyId();

const initialState: AuthState = {
  user: storedUser,
  activeCompany: storedUser && activeCompanyId && storedUser.companies
    ? storedUser.companies.find(c => c.companyId === activeCompanyId) || null
    : null,
  isAuthenticated: !!storedUser,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      const { user, accessToken, refreshToken } = action.payload;
      
      state.user = user;
      state.isAuthenticated = true;
      
      
      
      setStoredUser(user);
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
    },
    
    setActiveCompany: (state, action: PayloadAction<string | { companyId: string; companyName: string; role: import('../types').UserRole }>) => {
      const payload = action.payload;
      
      if (typeof payload === 'string') {
        // Legacy: just companyId string
        const companyId = payload;
        if (state.user) {
          const company = state.user.companies.find(c => c.companyId === companyId);
          if (company) {
            state.activeCompany = company;
            setActiveCompanyId(companyId);
          }
        }
      } else {
        // New: full company access object (from API)
        const companyAccess: CompanyAccess = {
          companyId: payload.companyId,
          companyName: payload.companyName,
          role: payload.role,
        };
        
        state.activeCompany = companyAccess;
        setActiveCompanyId(payload.companyId);
        
        // Add/update company in user's companies array for persistence
        if (state.user) {
          const existingIndex = state.user.companies.findIndex(c => c.companyId === payload.companyId);
          if (existingIndex >= 0) {
            // Update existing companys
            state.user.companies[existingIndex] = companyAccess;
          } else {
            // Add new company
            state.user.companies.push(companyAccess);
          }
          // Persist updated user to localStorage
          setStoredUser(state.user);
        }
      }
    },
    
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      setStoredUser(action.payload);
    },
    
    logout: (state) => {
      state.user = null;
      state.activeCompany = null;
      state.isAuthenticated = false;
      
      removeStoredUser();
      removeActiveCompanyId();
      removeTokens();
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setCredentials,
  setActiveCompany,
  updateUser,
  logout,
  setLoading,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectActiveCompany = (state: { auth: AuthState }) => state.auth.activeCompany;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
