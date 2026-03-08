// ============================================================================
// useHistoricalRates Hook - Analytics & Reports
// ============================================================================
// Use cases:
// - Reports
// - MTM comparison
// - Audit views
//
// ⚠️ Do NOT auto-load
// ⚠️ Load only on explicit user action
// ============================================================================

import { useMemo, useCallback, useState } from 'react';
import { useLazyGetHistoricalRatesQuery } from '../api/forexApi';
import { DEFAULT_BASE_CURRENCY } from '../forexConstants';
import type { HistoricalRatesData } from '../types';

interface UseHistoricalRatesOptions {
  baseCurrency?: string;
}

interface UseHistoricalRatesReturn {
  // Data
  rates: Record<string, number> | undefined;
  baseCurrency: string;
  date: string | undefined;
  timestamp: string | undefined;
  provider: string | undefined;
  
  // Status
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  isUninitialized: boolean;
  error: unknown;
  
  // Cache info
  isCached: boolean;
  
  // Helpers
  getRate: (currency: string) => number | undefined;
  
  // Actions (explicit trigger only)
  fetchRates: (date: string) => Promise<void>;
  clearData: () => void;
  
  // Raw data
  data: HistoricalRatesData | undefined;
}

export const useHistoricalRates = (
  options: UseHistoricalRatesOptions = {}
): UseHistoricalRatesReturn => {
  const { baseCurrency = DEFAULT_BASE_CURRENCY } = options;
  
  const [requestedDate, setRequestedDate] = useState<string | undefined>();

  const [
    trigger,
    {
      data: response,
      isLoading,
      isFetching,
      isSuccess,
      isError,
      isUninitialized,
      error,
    },
  ] = useLazyGetHistoricalRatesQuery();

  const data = response?.data;

  // Explicit fetch function - only way to load data
  const fetchRates = useCallback(async (date: string) => {
    setRequestedDate(date);
    await trigger({ date, baseCurrency });
  }, [trigger, baseCurrency]);

  // Clear data (reset state)
  const clearData = useCallback(() => {
    setRequestedDate(undefined);
  }, []);

  // Get rate for a specific currency
  const getRate = useMemo(() => {
    return (currency: string): number | undefined => {
      if (!data?.rates) return undefined;
      return data.rates[currency];
    };
  }, [data?.rates]);

  return {
    // Data
    rates: data?.rates,
    baseCurrency: data?.baseCurrency || baseCurrency,
    date: data?.date || requestedDate,
    timestamp: data?.timestamp,
    provider: data?.provider,
    
    // Status
    isLoading,
    isFetching,
    isSuccess,
    isError,
    isUninitialized,
    error,
    
    // Cache info
    isCached: data?.isCached ?? false,
    
    // Helpers
    getRate,
    
    // Actions
    fetchRates,
    clearData,
    
    // Raw data
    data,
  };
};

export default useHistoricalRates;
