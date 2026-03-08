// ============================================================================
// useLatestRates Hook - Global Latest Rates Context
// ============================================================================
// Use cases:
// - Dashboard widgets
// - Valuation helpers
// - Rate badges
//
// Shows: Base currency, timestamp, provider, cached indicator
// If warning exists → shows subtle banner
// ============================================================================

import { useMemo } from 'react';
import { useGetLatestRatesQuery } from '../api/forexApi';
import { DEFAULT_BASE_CURRENCY, RATE_STALE_THRESHOLD_MINUTES } from '../forexConstants';
import type { LatestRatesData, RateDisplayInfo } from '../types';

interface UseLatestRatesOptions {
  baseCurrency?: string;
  skip?: boolean;
  pollingInterval?: number;
}

interface UseLatestRatesReturn {
  // Data
  rates: Record<string, number> | undefined;
  baseCurrency: string;
  timestamp: string | undefined;
  provider: string | undefined;
  
  // Status flags
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  isCached: boolean;
  isStale: boolean;
  
  // Warning/Error
  warning: string | undefined;
  error: unknown;
  
  // Helpers
  getRate: (currency: string) => number | undefined;
  getRateDisplay: (currency: string) => RateDisplayInfo | undefined;
  refetch: () => void;
  
  // Raw data
  data: LatestRatesData | undefined;
}

export const useLatestRates = (options: UseLatestRatesOptions = {}): UseLatestRatesReturn => {
  const {
    baseCurrency = DEFAULT_BASE_CURRENCY,
    skip = false,
    pollingInterval,
  } = options;

  const {
    data: response,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
    refetch,
  } = useGetLatestRatesQuery(
    { baseCurrency },
    {
      skip,
      pollingInterval,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  const data = response?.data;

  // Calculate if rates are stale
  const isStale = useMemo(() => {
    if (!data?.timestamp) return false;
    const rateTime = new Date(data.timestamp).getTime();
    const now = Date.now();
    const ageMinutes = (now - rateTime) / (1000 * 60);
    return ageMinutes > RATE_STALE_THRESHOLD_MINUTES;
  }, [data?.timestamp]);

  // Get rate for a specific currency
  const getRate = useMemo(() => {
    return (currency: string): number | undefined => {
      if (!data?.rates) return undefined;
      return data.rates[currency];
    };
  }, [data?.rates]);

  // Get rate display info for a currency
  const getRateDisplay = useMemo(() => {
    return (currency: string): RateDisplayInfo | undefined => {
      if (!data?.rates) return undefined;
      const rate = data.rates[currency];
      if (rate === undefined) return undefined;

      return {
        from: baseCurrency,
        to: currency,
        rate,
        formattedRate: rate.toFixed(4),
        timestamp: data.timestamp,
        provider: data.provider,
        isCached: data.isCached,
        isStale,
        warning: data.warning,
      };
    };
  }, [data, baseCurrency, isStale]);

  return {
    // Data
    rates: data?.rates,
    baseCurrency: data?.baseCurrency || baseCurrency,
    timestamp: data?.timestamp,
    provider: data?.provider,
    
    // Status flags
    isLoading,
    isFetching,
    isSuccess,
    isError,
    isCached: data?.isCached ?? false,
    isStale,
    
    // Warning/Error
    warning: data?.warning,
    error,
    
    // Helpers
    getRate,
    getRateDisplay,
    refetch,
    
    // Raw data
    data,
  };
};

export default useLatestRates;
