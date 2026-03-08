// ============================================================================
// useExposureValuation Hook - Critical UX for Exposure Display
// ============================================================================
// UI placement:
// - Invoice detail page
// - Exposure dashboard
// - Trade summary
//
// Display fields:
// - Exposure amount (original currency)
// - Valued amount (company base currency)
// - Effective rate
// - Rate timestamp
// - Provider
// - Disclaimer text
//
// ⚠️ Must clearly state: "Indicative valuation. Not for accounting posting."
// ============================================================================

import { useMemo } from 'react';
import { useGetExposureValuationQuery } from '../api/forexApi';
import { EXPOSURE_VALUATION_DISCLAIMER, RATE_STALE_THRESHOLD_MINUTES } from '../forexConstants';
import type { ExposureValuationData } from '../types';

interface UseExposureValuationOptions {
  exposureAmount: number;
  exposureCurrency: string;
  reportingCurrency: string;
  skip?: boolean;
}

interface UseExposureValuationReturn {
  // Valuation data
  exposureAmount: number | undefined;
  exposureCurrency: string | undefined;
  valuedAmount: number | undefined;
  reportingCurrency: string | undefined;
  effectiveRate: number | undefined;
  
  // Rate metadata
  timestamp: string | undefined;
  provider: string | undefined;
  isCached: boolean;
  isStale: boolean;
  
  // Warning & Disclaimer
  warning: string | undefined;
  disclaimer: string;
  
  // Status
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: unknown;
  
  // Formatted values
  formattedExposure: string;
  formattedValued: string;
  formattedRate: string;
  
  // Actions
  refetch: () => void;
  
  // Raw data
  data: ExposureValuationData | undefined;
}

export const useExposureValuation = (
  options: UseExposureValuationOptions
): UseExposureValuationReturn => {
  const {
    exposureAmount,
    exposureCurrency,
    reportingCurrency,
    skip = false,
  } = options;

  // Skip if no valid inputs
  const shouldSkip = skip || 
    !exposureAmount || 
    exposureAmount <= 0 || 
    !exposureCurrency || 
    !reportingCurrency ||
    exposureCurrency === reportingCurrency;

  const {
    data: response,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
    refetch,
  } = useGetExposureValuationQuery(
    {
      exposureAmount,
      exposureCurrency,
      reportingCurrency,
    },
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

  // Format exposure amount
  const formattedExposure = useMemo(() => {
    if (!data) return '';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: data.exposureCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(data.exposureAmount);
  }, [data]);

  // Format valued amount
  const formattedValued = useMemo(() => {
    if (!data) return '';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: data.reportingCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(data.valuedAmount);
  }, [data]);

  // Format effective rate
  const formattedRate = useMemo(() => {
    if (!data) return '';
    return `1 ${data.exposureCurrency} = ${data.effectiveRate.toFixed(4)} ${data.reportingCurrency}`;
  }, [data]);

  return {
    // Valuation data
    exposureAmount: data?.exposureAmount,
    exposureCurrency: data?.exposureCurrency,
    valuedAmount: data?.valuedAmount,
    reportingCurrency: data?.reportingCurrency,
    effectiveRate: data?.effectiveRate,
    
    // Rate metadata
    timestamp: data?.timestamp,
    provider: data?.provider,
    isCached: data?.isCached ?? false,
    isStale,
    
    // Warning & Disclaimer
    warning: data?.warning,
    disclaimer: data?.disclaimer || EXPOSURE_VALUATION_DISCLAIMER,
    
    // Status
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
    
    // Formatted values
    formattedExposure,
    formattedValued,
    formattedRate,
    
    // Actions
    refetch,
    
    // Raw data
    data,
  };
};

export default useExposureValuation;
