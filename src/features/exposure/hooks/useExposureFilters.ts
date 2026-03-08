// ═══════════════════════════════════════════════════════════════════════════════
// EXPOSURE FILTERS HOOK
// URL-persisted filter state for exposure list
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ExposureStatus, ExposureType, ExposureFilters } from '../types';

interface UseExposureFiltersReturn {
  filters: ExposureFilters;
  setFilters: (filters: ExposureFilters) => void;
  updateFilter: <K extends keyof ExposureFilters>(key: K, value: ExposureFilters[K]) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

const DEFAULT_FILTERS: ExposureFilters = {
  status: undefined,
  exposureType: undefined,
  currency: undefined,
  partyId: undefined,
  search: '',
  maturityFrom: undefined,
  maturityTo: undefined,
  minAmount: undefined,
  maxAmount: undefined,
  hedgePercentageMin: undefined,
  hedgePercentageMax: undefined,
  sortBy: 'maturityDate',
  sortOrder: 'asc',
  page: 1,
  pageSize: 25,
};

/**
 * Parse array from URL param
 */
const parseArrayParam = (value: string | null): string[] => {
  if (!value) return [];
  return value.split(',').filter(Boolean);
};

/**
 * Parse number from URL param
 */
const parseNumberParam = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
};

/**
 * Convert array to single or array based on length
 */
const toArrayOrSingle = <T>(arr: T[]): T | T[] | undefined => {
  if (arr.length === 0) return undefined;
  if (arr.length === 1) return arr[0];
  return arr;
};

/**
 * Hook for URL-persisted exposure filters
 */
export const useExposureFilters = (
  persistToUrl = true
): UseExposureFiltersReturn => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localFilters, setLocalFilters] = useState<ExposureFilters>(DEFAULT_FILTERS);

  // Parse filters from URL
  const filtersFromUrl = useMemo((): ExposureFilters => {
    if (!persistToUrl) return DEFAULT_FILTERS;

    const statusArr = parseArrayParam(searchParams.get('status')) as ExposureStatus[];
    const typeArr = parseArrayParam(searchParams.get('type')) as ExposureType[];
    const currencyArr = parseArrayParam(searchParams.get('currency'));

    return {
      status: toArrayOrSingle(statusArr),
      exposureType: toArrayOrSingle(typeArr),
      currency: toArrayOrSingle(currencyArr),
      partyId: searchParams.get('partyId') || undefined,
      search: searchParams.get('search') || '',
      maturityFrom: searchParams.get('maturityFrom') || undefined,
      maturityTo: searchParams.get('maturityTo') || undefined,
      minAmount: parseNumberParam(searchParams.get('minAmount')),
      maxAmount: parseNumberParam(searchParams.get('maxAmount')),
      hedgePercentageMin: parseNumberParam(searchParams.get('hedgeMin')),
      hedgePercentageMax: parseNumberParam(searchParams.get('hedgeMax')),
      sortBy: (searchParams.get('sortBy') as ExposureFilters['sortBy']) || 'maturityDate',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
      page: parseNumberParam(searchParams.get('page')) || 1,
      pageSize: parseNumberParam(searchParams.get('pageSize')) || 25,
    };
  }, [searchParams, persistToUrl]);

  // Use URL filters or local filters
  const filters = persistToUrl ? filtersFromUrl : localFilters;

  // Sync URL with filters
  const syncToUrl = useCallback((newFilters: ExposureFilters) => {
    if (!persistToUrl) return;

    const params = new URLSearchParams();

    // Helper to convert value to comma-separated string
    const toUrlParam = (value: string | string[] | undefined): string | undefined => {
      if (!value) return undefined;
      if (Array.isArray(value)) return value.length > 0 ? value.join(',') : undefined;
      return value;
    };

    const statusParam = toUrlParam(newFilters.status as string | string[] | undefined);
    if (statusParam) {
      params.set('status', statusParam);
    }
    const typeParam = toUrlParam(newFilters.exposureType as string | string[] | undefined);
    if (typeParam) {
      params.set('type', typeParam);
    }
    const currencyParam = toUrlParam(newFilters.currency);
    if (currencyParam) {
      params.set('currency', currencyParam);
    }
    if (newFilters.partyId) {
      params.set('partyId', newFilters.partyId);
    }
    if (newFilters.search) {
      params.set('search', newFilters.search);
    }
    if (newFilters.maturityFrom) {
      params.set('maturityFrom', newFilters.maturityFrom);
    }
    if (newFilters.maturityTo) {
      params.set('maturityTo', newFilters.maturityTo);
    }
    if (newFilters.minAmount !== undefined) {
      params.set('minAmount', String(newFilters.minAmount));
    }
    if (newFilters.maxAmount !== undefined) {
      params.set('maxAmount', String(newFilters.maxAmount));
    }
    if (newFilters.hedgePercentageMin !== undefined) {
      params.set('hedgeMin', String(newFilters.hedgePercentageMin));
    }
    if (newFilters.hedgePercentageMax !== undefined) {
      params.set('hedgeMax', String(newFilters.hedgePercentageMax));
    }
    if (newFilters.sortBy && newFilters.sortBy !== 'maturityDate') {
      params.set('sortBy', newFilters.sortBy);
    }
    if (newFilters.sortOrder && newFilters.sortOrder !== 'asc') {
      params.set('sortOrder', newFilters.sortOrder);
    }
    if (newFilters.page && newFilters.page !== 1) {
      params.set('page', String(newFilters.page));
    }
    if (newFilters.pageSize && newFilters.pageSize !== 25) {
      params.set('pageSize', String(newFilters.pageSize));
    }

    setSearchParams(params, { replace: true });
  }, [persistToUrl, setSearchParams]);

  // Set all filters
  const setFilters = useCallback((newFilters: ExposureFilters) => {
    if (persistToUrl) {
      syncToUrl(newFilters);
    } else {
      setLocalFilters(newFilters);
    }
  }, [persistToUrl, syncToUrl]);

  // Update single filter
  const updateFilter = useCallback(<K extends keyof ExposureFilters>(
    key: K,
    value: ExposureFilters[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    
    // Reset page to 1 when filters change (except for page itself)
    if (key !== 'page' && key !== 'pageSize' && key !== 'sortBy' && key !== 'sortOrder') {
      newFilters.page = 1;
    }
    
    setFilters(newFilters);
  }, [filters, setFilters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, [setFilters]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    // Helper to check if value is present (handles single values and arrays)
    const hasValue = (val: unknown): boolean => {
      if (val === undefined || val === null || val === '') return false;
      if (Array.isArray(val)) return val.length > 0;
      return true;
    };
    
    if (hasValue(filters.status)) count++;
    if (hasValue(filters.exposureType)) count++;
    if (hasValue(filters.currency)) count++;
    if (filters.partyId) count++;
    if (filters.search) count++;
    if (filters.maturityFrom || filters.maturityTo) count++;
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) count++;
    if (filters.hedgePercentageMin !== undefined || filters.hedgePercentageMax !== undefined) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
  };
};

/**
 * Get status value as array for consistent handling
 */
const statusAsArray = (status: ExposureStatus | ExposureStatus[] | undefined): ExposureStatus[] => {
  if (!status) return [];
  if (Array.isArray(status)) return status;
  return [status];
};

/**
 * Hook for status tab navigation
 */
export const useExposureStatusTab = () => {
  const [activeTab, setActiveTab] = useState<ExposureStatus | 'ALL'>('ALL');
  const { filters, updateFilter } = useExposureFilters();

  // Sync tab with filters
  useEffect(() => {
    const statusArr = statusAsArray(filters.status);
    if (statusArr.length === 1) {
      setActiveTab(statusArr[0]);
    } else if (statusArr.length === 0) {
      setActiveTab('ALL');
    }
  }, [filters.status]);

  const handleTabChange = useCallback((tab: ExposureStatus | 'ALL') => {
    setActiveTab(tab);
    if (tab === 'ALL') {
      updateFilter('status', undefined);
    } else {
      updateFilter('status', tab);
    }
  }, [updateFilter]);

  return {
    activeTab,
    setActiveTab: handleTabChange,
  };
};

export default useExposureFilters;