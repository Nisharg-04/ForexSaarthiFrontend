// ============================================================================
// useForexRate Hook - Lightweight Single Pair Rate
// ============================================================================
// Use cases:
// - Tooltips
// - Inline currency hints
// - Quick reference
//
// Example output: 1 USD ≈ 83.12 INR
// ============================================================================

import { useMemo } from 'react';
import { useGetForexRateQuery } from '../api/forexApi';
import { RATE_STALE_THRESHOLD_MINUTES, RATE_DECIMAL_PLACES } from '../forexConstants';
import type { ForexRateData, RateDisplayInfo } from '../types';

interface UseForexRateOptions {
  from: string;
  to: string;
  skip?: boolean;
}

interface UseForexRateReturn {
  // Rate data
  from: string;
  to: string;
  rate: number | undefined;
  inverseRate: number | undefined;
  
  // Metadata
  timestamp: string | undefined;
  provider: string | undefined;
  isCached: boolean;
  isStale: boolean;
  warning: string | undefined;
  
  // Status
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: unknown;
  
  // Formatted strings
  formattedRate: string;
  formattedInverse: string;
  displayText: string;           // "1 USD ≈ 83.12 INR"
  inverseDisplayText: string;    // "1 INR ≈ 0.0120 USD"
  
  // Actions
  refetch: () => void;
  
  // Display info object
  rateDisplayInfo: RateDisplayInfo | undefined;
  
  // Raw data
  data: ForexRateData | undefined;
}

export const useForexRate = (options: UseForexRateOptions): UseForexRateReturn => {
  const { from, to, skip = false } = options;

  // Skip if same currency
  const shouldSkip = skip || !from || !to || from === to;

  const {
    data: response,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
    refetch,
  } = useGetForexRateQuery(
    { from, to },
    {
      skip: shouldSkip,
      refetchOnMountOrArgChange: true,
    }
  );

  const data = response?.data;

  // Calculate if rate is stale
  const isStale = useMemo(() => {
    if (!data?.timestamp) return false;
    const rateTime = new Date(data.timestamp).getTime();
    const now = Date.now();
    const ageMinutes = (now - rateTime) / (1000 * 60);
    return ageMinutes > RATE_STALE_THRESHOLD_MINUTES;
  }, [data?.timestamp]);

  // Get decimal places for formatting
  const getDecimalPlaces = (currency: string): number => {
    return RATE_DECIMAL_PLACES[currency as keyof typeof RATE_DECIMAL_PLACES] || RATE_DECIMAL_PLACES.default;
  };

  // Formatted rate
  const formattedRate = useMemo(() => {
    if (!data?.rate) return '';
    const decimals = getDecimalPlaces(to);
    return data.rate.toFixed(decimals);
  }, [data?.rate, to]);

  // Formatted inverse rate
  const formattedInverse = useMemo(() => {
    if (!data?.inverseRate) return '';
    const decimals = getDecimalPlaces(from);
    return data.inverseRate.toFixed(decimals);
  }, [data?.inverseRate, from]);

  // Display text: "1 USD ≈ 83.12 INR"
  const displayText = useMemo(() => {
    if (!data?.rate) return '';
    return `1 ${from} ≈ ${formattedRate} ${to}`;
  }, [from, to, data?.rate, formattedRate]);

  // Inverse display text: "1 INR ≈ 0.0120 USD"
  const inverseDisplayText = useMemo(() => {
    if (!data?.inverseRate) return '';
    return `1 ${to} ≈ ${formattedInverse} ${from}`;
  }, [from, to, data?.inverseRate, formattedInverse]);

  // Rate display info object
  const rateDisplayInfo = useMemo((): RateDisplayInfo | undefined => {
    if (!data) return undefined;
    return {
      from,
      to,
      rate: data.rate,
      formattedRate,
      timestamp: data.timestamp,
      provider: data.provider,
      isCached: data.isCached,
      isStale,
      warning: data.warning,
    };
  }, [data, from, to, formattedRate, isStale]);

  return {
    // Rate data
    from,
    to,
    rate: data?.rate,
    inverseRate: data?.inverseRate,
    
    // Metadata
    timestamp: data?.timestamp,
    provider: data?.provider,
    isCached: data?.isCached ?? false,
    isStale,
    warning: data?.warning,
    
    // Status
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
    
    // Formatted strings
    formattedRate,
    formattedInverse,
    displayText,
    inverseDisplayText,
    
    // Actions
    refetch,
    
    // Display info object
    rateDisplayInfo,
    
    // Raw data
    data,
  };
};

export default useForexRate;
