import {
  TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  ACTIVE_COMPANY_KEY,
} from '../constants';
import type { User } from '../types';

// Token Management
export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const setAccessToken = (token: string): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
};

export const setRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
};

export const removeTokens = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
};

// User Management
export const getStoredUser = (): User | null => {
  try {
    const userStr = localStorage.getItem(USER_STORAGE_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: User): void => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const removeStoredUser = (): void => {
  localStorage.removeItem(USER_STORAGE_KEY);
};

// Active Company Management
export const getActiveCompanyId = (): string | null => {
  return localStorage.getItem(ACTIVE_COMPANY_KEY);
};

export const setActiveCompanyId = (companyId: string): void => {
  localStorage.setItem(ACTIVE_COMPANY_KEY, companyId);
};

export const removeActiveCompanyId = (): void => {
  localStorage.removeItem(ACTIVE_COMPANY_KEY);
};

// Clear All Storage
export const clearAllStorage = (): void => {
  removeTokens();
  removeStoredUser();
  removeActiveCompanyId();
};

// Theme Management
const THEME_KEY = 'forexsaarthi_theme';

export const getStoredTheme = (): 'light' | 'dark' | null => {
  return localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null;
};

export const setStoredTheme = (theme: 'light' | 'dark'): void => {
  localStorage.setItem(THEME_KEY, theme);
};

// Generic Storage Utilities
export const getItem = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

export const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const removeItem = (key: string): void => {
  localStorage.removeItem(key);
};
