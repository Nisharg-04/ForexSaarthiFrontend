// ═══════════════════════════════════════════════════════════════════════════════
// EXPOSURE MODULE - UTILITY FUNCTIONS
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import { UserRole } from '../../types';
import { hasPermission } from '../../utils/roleHelpers';
import type { Exposure, ExposureStatus, ExposureType, ExposureFilters, Hedge, HedgeStatus } from './types';
import { EXPOSURE_PERMISSIONS, EXPOSURE_THRESHOLDS } from './exposureConstants';

// ─────────────────────────────────────────────────────────────────────────────────
// FORMATTING HELPERS
// ─────────────────────────────────────────────────────────────────────────────────

/**
 * Format currency amount with proper symbol and locale
 */
export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
};

/**
 * Format date to locale string
 */
export const formatDate = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get days until maturity
 */
export const getDaysUntilMaturity = (maturityDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maturity = new Date(maturityDate);
  maturity.setHours(0, 0, 0, 0);
  const diffTime = maturity.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// ─────────────────────────────────────────────────────────────────────────────────
// PERMISSION HELPERS
// ─────────────────────────────────────────────────────────────────────────────────

/**
 * Check if user can view exposures
 */
export const canViewExposures = (role: UserRole | undefined | null): boolean => {
  return hasPermission(role as UserRole, EXPOSURE_PERMISSIONS.view);
};

/**
 * Check if user can create hedges (Finance/Admin only)
 */
export const canCreateHedge = (role: UserRole | undefined | null): boolean => {
  return hasPermission(role as UserRole, EXPOSURE_PERMISSIONS.hedge);
};

/**
 * Check if user can close hedges
 */
export const canCloseHedge = (role: UserRole | undefined | null): boolean => {
  return hasPermission(role as UserRole, EXPOSURE_PERMISSIONS.closeHedge);
};

// ─────────────────────────────────────────────────────────────────────────────────
// EXPOSURE CALCULATIONS
// ─────────────────────────────────────────────────────────────────────────────────

/**
 * Calculate hedge percentage
 */
export const calculateHedgePercentage = (hedgedAmount: number, exposedAmount: number): number => {
  if (exposedAmount <= 0) return 0;
  return Math.min(100, (hedgedAmount / exposedAmount) * 100);
};

/**
 * Calculate settlement percentage
 */
export const calculateSettlementPercentage = (settledAmount: number, exposedAmount: number): number => {
  if (exposedAmount <= 0) return 0;
  return Math.min(100, (settledAmount / exposedAmount) * 100);
};

/**
 * Calculate unhedged amount
 */
export const calculateUnhedgedAmount = (
  exposedAmount: number,
  hedgedAmount: number,
  settledAmount: number
): number => {
  return Math.max(0, exposedAmount - hedgedAmount - settledAmount);
};

/**
 * Calculate days to maturity
 */
export const calculateDaysToMaturity = (maturityDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maturity = new Date(maturityDate);
  maturity.setHours(0, 0, 0, 0);
  const diffTime = maturity.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// ─────────────────────────────────────────────────────────────────────────────────
// STATUS DETERMINATION
// ─────────────────────────────────────────────────────────────────────────────────

/**
 * Determine exposure status based on amounts and maturity
 */
export const determineExposureStatus = (exposure: Partial<Exposure>): ExposureStatus => {
  const { exposedAmount = 0, settledAmount = 0, hedgedAmount = 0, maturityDate } = exposure;

  // Check if fully settled
  if (settledAmount >= exposedAmount) {
    return 'SETTLED';
  }

  // Check if overdue
  if (maturityDate) {
    const daysToMaturity = calculateDaysToMaturity(maturityDate);
    if (daysToMaturity < 0) {
      return 'OVERDUE';
    }
  }

  // Calculate remaining to hedge
  const remainingToHedge = exposedAmount - settledAmount;
  const hedgeRatio = remainingToHedge > 0 ? hedgedAmount / remainingToHedge : 0;

  if (hedgeRatio >= 0.999) {
    return 'FULLY_HEDGED';
  } else if (hedgeRatio > 0) {
    return 'PARTIALLY_HEDGED';
  }

  return 'UNHEDGED';
};

// ─────────────────────────────────────────────────────────────────────────────────
// FILTERING HELPERS
// ─────────────────────────────────────────────────────────────────────────────────

/**
 * Filter exposures by search term
 */
export const filterExposuresBySearch = (exposures: Exposure[], searchTerm: string): Exposure[] => {
  if (!searchTerm.trim()) return exposures;

  const term = searchTerm.toLowerCase();
  return exposures.filter(
    (exp) =>
      exp.invoiceNumber.toLowerCase().includes(term) ||
      exp.tradeNumber.toLowerCase().includes(term) ||
      exp.partyName.toLowerCase().includes(term) ||
      exp.currency.toLowerCase().includes(term)
  );
};

/**
 * Filter exposures by status (supports single value or array)
 */
export const filterExposuresByStatus = (
  exposures: Exposure[],
  status?: ExposureStatus | ExposureStatus[]
): Exposure[] => {
  if (!status) return exposures;
  if (Array.isArray(status)) {
    if (status.length === 0) return exposures;
    return exposures.filter((exp) => status.includes(exp.status));
  }
  return exposures.filter((exp) => exp.status === status);
};

/**
 * Filter exposures by type (supports single value or array)
 */
export const filterExposuresByType = (
  exposures: Exposure[],
  type?: ExposureType | ExposureType[]
): Exposure[] => {
  if (!type) return exposures;
  if (Array.isArray(type)) {
    if (type.length === 0) return exposures;
    return exposures.filter((exp) => type.includes(exp.exposureType));
  }
  return exposures.filter((exp) => exp.exposureType === type);
};

/**
 * Filter exposures by currency (supports single value or array)
 */
export const filterExposuresByCurrency = (
  exposures: Exposure[],
  currency?: string | string[]
): Exposure[] => {
  if (!currency) return exposures;
  if (Array.isArray(currency)) {
    if (currency.length === 0) return exposures;
    return exposures.filter((exp) => currency.includes(exp.currency));
  }
  return exposures.filter((exp) => exp.currency === currency);
};

/**
 * Apply all filters to exposures
 */
export const applyExposureFilters = (
  exposures: Exposure[],
  filters: ExposureFilters
): Exposure[] => {
  let result = exposures;

  if (filters.search) {
    result = filterExposuresBySearch(result, filters.search);
  }
  if (filters.status) {
    result = filterExposuresByStatus(result, filters.status);
  }
  if (filters.exposureType) {
    result = filterExposuresByType(result, filters.exposureType);
  }
  if (filters.currency) {
    result = filterExposuresByCurrency(result, filters.currency);
  }
  if (filters.partyId) {
    result = result.filter((exp) => exp.partyId === filters.partyId);
  }
  if (filters.tradeId) {
    result = result.filter((exp) => exp.tradeId === filters.tradeId);
  }

  return result;
};

// ─────────────────────────────────────────────────────────────────────────────────
// SORTING HELPERS
// ─────────────────────────────────────────────────────────────────────────────────

/**
 * Sort exposures by column
 */
export const sortExposures = (
  exposures: Exposure[],
  sortBy: string,
  sortOrder: 'asc' | 'desc' = 'asc'
): Exposure[] => {
  return [...exposures].sort((a, b) => {
    let aValue: string | number = '';
    let bValue: string | number = '';

    switch (sortBy) {
      case 'invoiceNumber':
        aValue = a.invoiceNumber;
        bValue = b.invoiceNumber;
        break;
      case 'tradeNumber':
        aValue = a.tradeNumber;
        bValue = b.tradeNumber;
        break;
      case 'partyName':
        aValue = a.partyName;
        bValue = b.partyName;
        break;
      case 'currency':
        aValue = a.currency;
        bValue = b.currency;
        break;
      case 'exposedAmount':
        aValue = a.exposedAmount;
        bValue = b.exposedAmount;
        break;
      case 'hedgedAmount':
        aValue = a.hedgedAmount;
        bValue = b.hedgedAmount;
        break;
      case 'unhedgedAmount':
        aValue = a.unhedgedAmount;
        bValue = b.unhedgedAmount;
        break;
      case 'hedgePercentage':
        aValue = a.hedgePercentage;
        bValue = b.hedgePercentage;
        break;
      case 'maturityDate':
        aValue = new Date(a.maturityDate).getTime();
        bValue = new Date(b.maturityDate).getTime();
        break;
      case 'daysToMaturity':
        aValue = a.daysToMaturity;
        bValue = b.daysToMaturity;
        break;
      default:
        return 0;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortOrder === 'asc'
      ? Number(aValue) - Number(bValue)
      : Number(bValue) - Number(aValue);
  });
};

// ─────────────────────────────────────────────────────────────────────────────────
// RISK ANALYSIS HELPERS
// ─────────────────────────────────────────────────────────────────────────────────

/**
 * Check if exposure is maturing soon
 */
export const isMaturingSoon = (exposure: Exposure): boolean => {
  return (
    exposure.daysToMaturity >= 0 &&
    exposure.daysToMaturity <= EXPOSURE_THRESHOLDS.maturingSoonDays &&
    exposure.status !== 'SETTLED'
  );
};

/**
 * Check if exposure is critical (≤3 days)
 */
export const isCriticalMaturity = (exposure: Exposure): boolean => {
  return (
    exposure.daysToMaturity >= 0 &&
    exposure.daysToMaturity <= EXPOSURE_THRESHOLDS.criticalMaturingDays &&
    exposure.status !== 'SETTLED'
  );
};

/**
 * Check if exposure has low hedge coverage
 */
export const hasLowHedgeCoverage = (exposure: Exposure): boolean => {
  return (
    exposure.hedgePercentage < EXPOSURE_THRESHOLDS.lowHedgePercentage &&
    exposure.status !== 'SETTLED'
  );
};

/**
 * Get risk level for an exposure
 */
export const getExposureRiskLevel = (
  exposure: Exposure
): 'critical' | 'high' | 'medium' | 'low' => {
  if (exposure.status === 'SETTLED') return 'low';
  if (exposure.status === 'OVERDUE') return 'critical';
  if (isCriticalMaturity(exposure) && hasLowHedgeCoverage(exposure)) return 'critical';
  if (isMaturingSoon(exposure) || hasLowHedgeCoverage(exposure)) return 'high';
  if (exposure.hedgePercentage < EXPOSURE_THRESHOLDS.targetHedgePercentage) return 'medium';
  return 'low';
};

// ─────────────────────────────────────────────────────────────────────────────────
// HEDGE HELPERS
// ─────────────────────────────────────────────────────────────────────────────────

/**
 * Get active hedges from an exposure
 */
export const getActiveHedges = (exposure: Exposure): Hedge[] => {
  return (exposure.hedges || []).filter((h) => h.status === 'ACTIVE');
};

/**
 * Check if exposure has any active hedges
 */
export const hasActiveHedges = (exposure: Exposure): boolean => {
  return getActiveHedges(exposure).length > 0;
};

/**
 * Check if exposure can receive forward hedge
 */
export const canApplyForwardHedge = (exposure: Exposure, userRole?: UserRole): boolean => {
  if (!canCreateHedge(userRole)) return false;
  return exposure.unhedgedAmount > 0 && exposure.status !== 'SETTLED';
};

/**
 * Check if exposure can receive natural hedge
 */
export const canApplyNaturalHedge = (exposure: Exposure, userRole?: UserRole): boolean => {
  if (!canCreateHedge(userRole)) return false;
  return exposure.unhedgedAmount > 0 && exposure.status !== 'SETTLED';
};

/**
 * Check if exposure hedge can be closed
 */
export const canCloseExposureHedge = (exposure: Exposure, userRole?: UserRole): boolean => {
  if (!canCloseHedge(userRole)) return false;
  return hasActiveHedges(exposure);
};

// ─────────────────────────────────────────────────────────────────────────────────
// FORMATTING HELPERS
// ─────────────────────────────────────────────────────────────────────────────────

/**
 * Format days to maturity display
 */
export const formatDaysToMaturity = (days: number): string => {
  if (days < 0) {
    return `${Math.abs(days)}d overdue`;
  }
  if (days === 0) {
    return 'Today';
  }
  if (days === 1) {
    return '1 day';
  }
  return `${days} days`;
};

/**
 * Get maturity display color class
 */
export const getMaturityColorClass = (days: number, isDark: boolean): string => {
  if (days < 0) {
    return isDark ? 'text-red-400' : 'text-red-600';
  }
  if (days <= 3) {
    return isDark ? 'text-orange-400' : 'text-orange-600';
  }
  if (days <= 7) {
    return isDark ? 'text-amber-400' : 'text-amber-600';
  }
  return isDark ? 'text-slate-400' : 'text-slate-600';
};

/**
 * Get hedge percentage color class
 */
export const getHedgePercentageColorClass = (percentage: number, isDark: boolean): string => {
  if (percentage >= 80) {
    return isDark ? 'text-emerald-400' : 'text-emerald-600';
  }
  if (percentage >= 50) {
    return isDark ? 'text-amber-400' : 'text-amber-600';
  }
  if (percentage > 0) {
    return isDark ? 'text-orange-400' : 'text-orange-600';
  }
  return isDark ? 'text-red-400' : 'text-red-600';
};

// ─────────────────────────────────────────────────────────────────────────────────
// AGGREGATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────────

/**
 * Aggregate exposures by currency
 */
export const aggregateExposuresByCurrency = (
  exposures: Exposure[]
): Record<string, { exposed: number; hedged: number; unhedged: number; count: number }> => {
  return exposures.reduce((acc, exp) => {
    if (!acc[exp.currency]) {
      acc[exp.currency] = { exposed: 0, hedged: 0, unhedged: 0, count: 0 };
    }
    acc[exp.currency].exposed += exp.exposedAmount;
    acc[exp.currency].hedged += exp.hedgedAmount;
    acc[exp.currency].unhedged += exp.unhedgedAmount;
    acc[exp.currency].count += 1;
    return acc;
  }, {} as Record<string, { exposed: number; hedged: number; unhedged: number; count: number }>);
};

/**
 * Aggregate exposures by type
 */
export const aggregateExposuresByType = (
  exposures: Exposure[]
): Record<ExposureType, { exposed: number; hedged: number; unhedged: number; count: number }> => {
  return exposures.reduce(
    (acc, exp) => {
      acc[exp.exposureType].exposed += exp.exposedAmount;
      acc[exp.exposureType].hedged += exp.hedgedAmount;
      acc[exp.exposureType].unhedged += exp.unhedgedAmount;
      acc[exp.exposureType].count += 1;
      return acc;
    },
    {
      RECEIVABLE: { exposed: 0, hedged: 0, unhedged: 0, count: 0 },
      PAYABLE: { exposed: 0, hedged: 0, unhedged: 0, count: 0 },
    } as Record<ExposureType, { exposed: number; hedged: number; unhedged: number; count: number }>
  );
};
