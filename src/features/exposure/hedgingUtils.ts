// ═══════════════════════════════════════════════════════════════════════════════
// QUARTERLY HEDGING MODULE - UTILITY FUNCTIONS
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import type { QuarterInfo, ExposureBriefInfo, HedgeRecordResponse } from './hedgingTypes';

// ─────────────────────────────────────────────────────────────────────────────────
// QUARTER CALCULATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────────

/**
 * Get quarter string from a date (e.g., "Q1-2026")
 */
export const getQuarterFromDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const month = d.getMonth() + 1; // 1-12
  const year = d.getFullYear();
  const quarter = Math.ceil(month / 3);
  return `Q${quarter}-${year}`;
};

/**
 * Get current quarter string
 */
export const getCurrentQuarter = (): string => {
  return getQuarterFromDate(new Date());
};

/**
 * Parse quarter string to get quarter number and year
 */
export const parseQuarter = (quarter: string): { q: number; year: number } | null => {
  const match = quarter.match(/^Q([1-4])-(\d{4})$/);
  if (!match) return null;
  return { q: parseInt(match[1], 10), year: parseInt(match[2], 10) };
};

/**
 * Get start and end dates for a quarter
 */
export const getQuarterDateRange = (quarter: string): { startDate: Date; endDate: Date } | null => {
  const parsed = parseQuarter(quarter);
  if (!parsed) return null;

  const { q, year } = parsed;
  const startMonth = (q - 1) * 3; // 0-indexed (0, 3, 6, 9)
  const endMonth = startMonth + 2;
  
  const startDate = new Date(year, startMonth, 1);
  const endDate = new Date(year, endMonth + 1, 0); // Last day of end month

  return { startDate, endDate };
};

/**
 * Get quarter label for display (e.g., "Q1 2026 (Jan-Mar)")
 */
export const getQuarterLabel = (quarter: string): string => {
  const parsed = parseQuarter(quarter);
  if (!parsed) return quarter;

  const { q, year } = parsed;
  const monthRanges: Record<number, string> = {
    1: 'Jan-Mar',
    2: 'Apr-Jun',
    3: 'Jul-Sep',
    4: 'Oct-Dec',
  };

  return `Q${q} ${year} (${monthRanges[q]})`;
};

/**
 * Get quarter info object
 */
export const getQuarterInfo = (quarter: string): QuarterInfo | null => {
  const parsed = parseQuarter(quarter);
  if (!parsed) return null;

  const range = getQuarterDateRange(quarter);
  if (!range) return null;

  const currentQuarter = getCurrentQuarter();

  return {
    quarter,
    label: getQuarterLabel(quarter),
    startDate: range.startDate,
    endDate: range.endDate,
    isCurrent: quarter === currentQuarter,
  };
};

/**
 * Generate list of quarters from a start quarter to end quarter
 */
export const generateQuarterRange = (startQuarter: string, endQuarter: string): string[] => {
  const start = parseQuarter(startQuarter);
  const end = parseQuarter(endQuarter);
  if (!start || !end) return [];

  const quarters: string[] = [];
  let currentYear = start.year;
  let currentQ = start.q;

  while (
    currentYear < end.year ||
    (currentYear === end.year && currentQ <= end.q)
  ) {
    quarters.push(`Q${currentQ}-${currentYear}`);
    currentQ++;
    if (currentQ > 4) {
      currentQ = 1;
      currentYear++;
    }
  }

  return quarters;
};

/**
 * Get next N quarters from a starting point (default: current)
 */
export const getUpcomingQuarters = (count: number = 4, startFrom?: string): string[] => {
  const start = startFrom ? parseQuarter(startFrom) : (() => {
    const now = new Date();
    return { q: Math.ceil((now.getMonth() + 1) / 3), year: now.getFullYear() };
  })();
  
  if (!start) return [];

  const quarters: string[] = [];
  let { q, year } = start;

  for (let i = 0; i < count; i++) {
    quarters.push(`Q${q}-${year}`);
    q++;
    if (q > 4) {
      q = 1;
      year++;
    }
  }

  return quarters;
};

/**
 * Get previous N quarters from a starting point (default: current)
 */
export const getPreviousQuarters = (count: number = 4, startFrom?: string): string[] => {
  const start = startFrom ? parseQuarter(startFrom) : (() => {
    const now = new Date();
    return { q: Math.ceil((now.getMonth() + 1) / 3), year: now.getFullYear() };
  })();
  
  if (!start) return [];

  const quarters: string[] = [];
  let { q, year } = start;

  for (let i = 0; i < count; i++) {
    quarters.push(`Q${q}-${year}`);
    q--;
    if (q < 1) {
      q = 4;
      year--;
    }
  }

  return quarters;
};

/**
 * Compare two quarters (returns -1, 0, or 1)
 */
export const compareQuarters = (q1: string, q2: string): number => {
  const p1 = parseQuarter(q1);
  const p2 = parseQuarter(q2);
  
  if (!p1 || !p2) return 0;
  
  if (p1.year !== p2.year) {
    return p1.year < p2.year ? -1 : 1;
  }
  if (p1.q !== p2.q) {
    return p1.q < p2.q ? -1 : 1;
  }
  return 0;
};

/**
 * Check if a date falls within a quarter
 */
export const isDateInQuarter = (date: Date | string, quarter: string): boolean => {
  const range = getQuarterDateRange(quarter);
  if (!range) return false;

  const d = typeof date === 'string' ? new Date(date) : date;
  return d >= range.startDate && d <= range.endDate;
};

/**
 * Validate quarter format
 */
export const isValidQuarter = (quarter: string): boolean => {
  return parseQuarter(quarter) !== null;
};

// ─────────────────────────────────────────────────────────────────────────────────
// NATURAL HEDGE CALCULATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────────

/**
 * Calculate natural hedge potential from receivables and payables
 */
export const calculateNaturalHedgePotential = (
  receivableUnhedged: number,
  payableUnhedged: number
): number => {
  return Math.min(receivableUnhedged, payableUnhedged);
};

/**
 * Calculate net exposure at risk
 */
export const calculateNetExposureAtRisk = (
  receivableUnhedged: number,
  payableUnhedged: number
): number => {
  return Math.abs(receivableUnhedged - payableUnhedged);
};

/**
 * Calculate hedge ratio as percentage
 */
export const calculateHedgeRatio = (
  hedgedAmount: number,
  totalExposure: number
): number => {
  if (totalExposure <= 0) return 0;
  return Math.min(100, (hedgedAmount / totalExposure) * 100);
};

/**
 * Calculate maximum hedge amount from selected exposures
 */
export const calculateMaxHedgeAmount = (
  selectedReceivables: ExposureBriefInfo[],
  selectedPayables: ExposureBriefInfo[]
): number => {
  const totalReceivable = selectedReceivables.reduce(
    (sum, exp) => sum + exp.unhedgedAmount, 
    0
  );
  const totalPayable = selectedPayables.reduce(
    (sum, exp) => sum + exp.unhedgedAmount, 
    0
  );
  return Math.min(totalReceivable, totalPayable);
};

/**
 * Get total unhedged amount from exposures
 */
export const getTotalUnhedgedAmount = (exposures: ExposureBriefInfo[]): number => {
  return exposures.reduce((sum, exp) => sum + exp.unhedgedAmount, 0);
};

// ─────────────────────────────────────────────────────────────────────────────────
// HEDGE RECORD HELPERS
// ─────────────────────────────────────────────────────────────────────────────────

/**
 * Check if hedge is a natural hedge
 */
export const isNaturalHedge = (hedge: HedgeRecordResponse): boolean => {
  return hedge.type === 'NATURAL';
};

/**
 * Check if hedge is a forward contract
 */
export const isForwardContract = (hedge: HedgeRecordResponse): boolean => {
  return hedge.type === 'FORWARD';
};

/**
 * Check if hedge is active
 */
export const isHedgeActive = (hedge: HedgeRecordResponse): boolean => {
  return hedge.status === 'ACTIVE';
};

/**
 * Check if hedge is closable
 */
export const canCloseHedge = (hedge: HedgeRecordResponse): boolean => {
  return hedge.status === 'ACTIVE';
};

/**
 * Get hedge status color for UI
 */
export const getHedgeStatusColor = (status: string): string => {
  switch (status) {
    case 'ACTIVE':
      return 'green';
    case 'CLOSED':
      return 'slate';
    case 'MATURED':
      return 'blue';
    case 'SETTLED':
      return 'emerald';
    default:
      return 'slate';
  }
};

/**
 * Get hedge type label for display
 */
export const getHedgeTypeLabel = (type: string): string => {
  switch (type) {
    case 'FORWARD':
      return 'Forward Contract';
    case 'NATURAL':
      return 'Natural Hedge';
    default:
      return type;
  }
};

/**
 * Filter hedges by type
 */
export const filterHedgesByType = (
  hedges: HedgeRecordResponse[],
  type: 'FORWARD' | 'NATURAL'
): HedgeRecordResponse[] => {
  return hedges.filter(h => h.type === type);
};

/**
 * Filter hedges by status
 */
export const filterHedgesByStatus = (
  hedges: HedgeRecordResponse[],
  status: 'ACTIVE' | 'CLOSED' | 'MATURED' | 'SETTLED'
): HedgeRecordResponse[] => {
  return hedges.filter(h => h.status === status);
};

/**
 * Filter hedges by quarter
 */
export const filterHedgesByQuarter = (
  hedges: HedgeRecordResponse[],
  quarter: string
): HedgeRecordResponse[] => {
  return hedges.filter(h => h.quarter === quarter);
};

/**
 * Group hedges by quarter
 */
export const groupHedgesByQuarter = (
  hedges: HedgeRecordResponse[]
): Record<string, HedgeRecordResponse[]> => {
  return hedges.reduce((acc, hedge) => {
    const quarter = hedge.quarter;
    if (!acc[quarter]) {
      acc[quarter] = [];
    }
    acc[quarter].push(hedge);
    return acc;
  }, {} as Record<string, HedgeRecordResponse[]>);
};

/**
 * Group hedges by type
 */
export const groupHedgesByType = (
  hedges: HedgeRecordResponse[]
): Record<string, HedgeRecordResponse[]> => {
  return hedges.reduce((acc, hedge) => {
    const type = hedge.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(hedge);
    return acc;
  }, {} as Record<string, HedgeRecordResponse[]>);
};

// ─────────────────────────────────────────────────────────────────────────────────
// RISK LEVEL HELPERS
// ─────────────────────────────────────────────────────────────────────────────────

export type RiskLevel = 'low' | 'medium' | 'high';

/**
 * Get risk level based on hedge ratio
 */
export const getRiskLevelFromHedgeRatio = (hedgeRatio: number): RiskLevel => {
  if (hedgeRatio >= 80) return 'low';
  if (hedgeRatio >= 50) return 'medium';
  return 'high';
};

/**
 * Get risk level color for UI
 */
export const getRiskLevelColor = (level: RiskLevel): string => {
  switch (level) {
    case 'low':
      return 'green';
    case 'medium':
      return 'amber';
    case 'high':
      return 'red';
    default:
      return 'slate';
  }
};

/**
 * Get risk level class names for UI
 */
export const getRiskLevelClasses = (level: RiskLevel, isDark: boolean = false): string => {
  const classes: Record<RiskLevel, { light: string; dark: string }> = {
    low: {
      light: 'bg-green-50 text-green-700 border-green-200',
      dark: 'bg-green-500/10 text-green-400 border-green-500/20',
    },
    medium: {
      light: 'bg-amber-50 text-amber-700 border-amber-200',
      dark: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    high: {
      light: 'bg-red-50 text-red-700 border-red-200',
      dark: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
  };
  return isDark ? classes[level].dark : classes[level].light;
};

// ─────────────────────────────────────────────────────────────────────────────────
// FORMATTING HELPERS
// ─────────────────────────────────────────────────────────────────────────────────

/**
 * Format hedge amount with currency
 */
export const formatHedgeAmount = (
  amount: number,
  currency: string = 'INR'
): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format rate for display
 */
export const formatRate = (rate: number, decimals: number = 4): string => {
  return rate.toFixed(decimals);
};

/**
 * Format percentage for display
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format date for display
 */
export const formatHedgeDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
