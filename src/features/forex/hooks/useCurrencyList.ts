// ============================================================================
// useCurrencyList Hook - Currency Master Data
// ============================================================================
// Use cases:
// - Invoice currency selection
// - Party currency
// - Trade reference currency
//
// UX rules:
// - Show: USD – United States Dollar
// - Disable inactive currencies
// - Alphabetically sorted
// - Cached aggressively
// ============================================================================

import { useMemo } from 'react';
import { useGetCurrenciesQuery } from '../api/forexApi';
import { CURRENCY_FLAGS, POPULAR_CURRENCIES } from '../forexConstants';
import type { Currency, CurrencyOption } from '../types';

interface UseCurrencyListOptions {
  skip?: boolean;
  includeInactive?: boolean;
  popularFirst?: boolean;
}

interface UseCurrencyListReturn {
  // Data
  currencies: Currency[];
  currencyOptions: CurrencyOption[];
  
  // Status
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  
  // Helpers
  getCurrency: (code: string) => Currency | undefined;
  getCurrencyName: (code: string) => string;
  getCurrencySymbol: (code: string) => string;
  getCurrencyFlag: (code: string) => string;
  formatCurrencyLabel: (code: string) => string;
  
  // Refetch
  refetch: () => void;
}

export const useCurrencyList = (options: UseCurrencyListOptions = {}): UseCurrencyListReturn => {
  const {
    skip = false,
    includeInactive = false,
    popularFirst = true,
  } = options;

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCurrenciesQuery(undefined, {
    skip,
    refetchOnMountOrArgChange: false, // Cache aggressively
  });

  // Filter and sort currencies
  const currencies = useMemo(() => {
    if (!response?.data) return [];
    
    let list: Currency[] = response.data;
    
    // Filter inactive if needed
    if (!includeInactive) {
      list = list.filter((c: Currency) => c.isActive);
    }
    
    // Sort: popular currencies first, then alphabetically
    if (popularFirst) {
      list = [...list].sort((a: Currency, b: Currency) => {
        const aPopular = POPULAR_CURRENCIES.includes(a.code as typeof POPULAR_CURRENCIES[number]);
        const bPopular = POPULAR_CURRENCIES.includes(b.code as typeof POPULAR_CURRENCIES[number]);
        
        if (aPopular && !bPopular) return -1;
        if (!aPopular && bPopular) return 1;
        
        // Within same category, sort alphabetically by code
        return a.code.localeCompare(b.code);
      });
    } else {
      list = [...list].sort((a: Currency, b: Currency) => a.code.localeCompare(b.code));
    }
    
    return list;
  }, [response?.data, includeInactive, popularFirst]);

  // Convert to dropdown options
  const currencyOptions = useMemo(() => {
    return currencies.map((currency: Currency) => ({
      value: currency.code,
      label: `${currency.code} – ${currency.name}`,
      currency,
      disabled: !currency.isActive,
    }));
  }, [currencies]);

  // Helper: Get currency by code
  const getCurrency = useMemo(() => {
    const currencyMap = new Map<string, Currency>(currencies.map((c: Currency) => [c.code, c]));
    return (code: string): Currency | undefined => currencyMap.get(code);
  }, [currencies]);

  // Helper: Get currency name
  const getCurrencyName = useMemo(() => {
    const currencyMap = new Map<string, string>(currencies.map((c: Currency) => [c.code, c.name]));
    return (code: string): string => currencyMap.get(code) || code;
  }, [currencies]);

  // Helper: Get currency symbol
  const getCurrencySymbol = useMemo(() => {
    const currencyMap = new Map<string, string>(currencies.map((c: Currency) => [c.code, c.symbol]));
    return (code: string): string => currencyMap.get(code) || code;
  }, [currencies]);

  // Helper: Get currency flag
  const getCurrencyFlag = useMemo(() => {
    return (code: string): string => CURRENCY_FLAGS[code] || '🏳️';
  }, []);

  // Helper: Format currency label for display
  const formatCurrencyLabel = useMemo(() => {
    const currencyMap = new Map<string, Currency>(currencies.map((c: Currency) => [c.code, c]));
    return (code: string): string => {
      const currency = currencyMap.get(code);
      if (!currency) return code;
      return `${code} – ${currency.name}`;
    };
  }, [currencies]);

  return {
    // Data
    currencies,
    currencyOptions,
    
    // Status
    isLoading,
    isError,
    error,
    
    // Helpers
    getCurrency,
    getCurrencyName,
    getCurrencySymbol,
    getCurrencyFlag,
    formatCurrencyLabel,
    
    // Refetch
    refetch,
  };
};

export default useCurrencyList;
