// ═══════════════════════════════════════════════════════════════════════════════
// FORWARD CONTRACTS MODULE - UTILITIES
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import { FORWARD_VALIDATION } from './forwardConstants';

// ─────────────────────────────────────────────────────────────────────────────────
// CURRENCY & AMOUNT FORMATTING
// ─────────────────────────────────────────────────────────────────────────────────

/**
 * Format forward amount with currency code (e.g., USD 100,000.50)
 */
export const formatForwardAmount = (amount: number, currency: string): string => {
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency} ${formatted}`;
};

/**
 * Format INR amount with Indian numbering system (e.g., ₹1,00,000.00)
 */
export const formatINRAmount = (amount: number): string => {
  const formatted = amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatted;
};

/**
 * Format forward rate with 4 decimal places (e.g., 83.5000)
 */
export const formatForwardRate = (rate: number): string => {
  return rate.toFixed(4);
};

/**
 * Parse currency string to number
 */
export const parseCurrencyAmount = (value: string): number => {
  return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
};

// ─────────────────────────────────────────────────────────────────────────────────
// RATE CALCULATIONS
// ─────────────────────────────────────────────────────────────────────────────────

/**
 * Calculate P&L for a closed forward contract
 * gainLoss = (closingRate - forwardRate) * contractAmount
 */
export const calculateGainLoss = (
  forwardRate: number,
  closingRate: number,
  contractAmount: number,
  exposureType?: 'RECEIVABLE' | 'PAYABLE'
): number => {
  // For receivables: lower closing rate = gain (we receive more INR)
  // For payables: higher closing rate = gain (we pay less INR)
  const rate_diff = closingRate - forwardRate;
  let gainLoss = rate_diff * contractAmount;

  if (exposureType === 'PAYABLE') {
    gainLoss = -gainLoss; // Reverse for payables
  }

  return Math.round(gainLoss * 100) / 100;
};

/**
 * Calculate gain/loss percentage
 */
export const calculateGainLossPercentage = (
  gainLoss: number,
  baseAmount: number
): number => {
  if (baseAmount === 0) return 0;
  return Math.round((gainLoss / baseAmount) * 10000) / 100;
};

/**
 * Calculate base amount in INR (contractAmount * forwardRate)
 */
export const calculateBaseAmount = (
  contractAmount: number,
  forwardRate: number
): number => {
  return Math.round(contractAmount * forwardRate * 100) / 100;
};

// ─────────────────────────────────────────────────────────────────────────────────
// DATE UTILITIES
// ─────────────────────────────────────────────────────────────────────────────────

/**
 * Get quarter from date (Q1, Q2, Q3, Q4)
 */
export const getQuarterFromDate = (dateString: string): number => {
  const date = new Date(dateString);
  const month = date.getMonth(); // 0-11
  return Math.floor(month / 3) + 1; // 1-4
};

/**
 * Get quarter display string (e.g., "Q1 2026")
 */
export const getQuarterDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  const quarter = getQuarterFromDate(dateString);
  const year = date.getFullYear();
  return `Q${quarter} ${year}`;
};

/**
 * Get current quarter (e.g., "Q1") with year
 */
export const getCurrentQuarter = (): { quarter: string; year: number } => {
  const now = new Date();
  const quarter = getQuarterFromDate(now.toISOString());
  const year = now.getFullYear();
  return { quarter: `Q${quarter}`, year };
};

/**
 * Get year from date string
 */
export const getYearFromDate = (dateString: string): number => {
  return new Date(dateString).getFullYear();
};

/**
 * Calculate days remaining until settlement date
 */
export const getDaysRemaining = (settlementDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const settlement = new Date(settlementDate);
  settlement.setHours(0, 0, 0, 0);

  const diff = settlement.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Check if contract is expiring soon (within N days)
 */
export const isExpiringsoon = (settlementDate: string, days: number = 30): boolean => {
  const daysRemaining = getDaysRemaining(settlementDate);
  return daysRemaining <= days && daysRemaining >= 0;
};

/**
 * Check if contract is expired
 */
export const isExpired = (settlementDate: string): boolean => {
  return getDaysRemaining(settlementDate) < 0;
};

/**
 * Format date for display (e.g., "15 Mar 2026")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format date and time
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get year options for filters (current year and N previous years)
 */
export const getYearOptions = (yearsBack: number = 5): number[] => {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let i = yearsBack; i >= 0; i--) {
    years.push(currentYear - i);
  }
  return years;
};

// ─────────────────────────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────────────────────────

interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate contract amount
 */
export const validateContractAmount = (
  amount: number,
  maxAmount: number = Infinity
): ValidationResult => {
  if (!amount || amount <= 0) {
    return { valid: false, error: 'Contract amount must be greater than 0' };
  }

  if (amount < FORWARD_VALIDATION.minContractAmount) {
    return {
      valid: false,
      error: `Minimum contract amount is ${FORWARD_VALIDATION.minContractAmount.toLocaleString()}`,
    };
  }

  if (amount > FORWARD_VALIDATION.maxContractAmount) {
    return {
      valid: false,
      error: `Maximum contract amount is ${FORWARD_VALIDATION.maxContractAmount.toLocaleString()}`,
    };
  }

  if (amount > maxAmount) {
    return {
      valid: false,
      error: `Contract amount cannot exceed unhedged exposure (${maxAmount.toLocaleString()})`,
    };
  }

  return { valid: true };
};

/**
 * Validate forward rate
 */
export const validateForwardRate = (rate: number): ValidationResult => {
  if (!rate || rate <= 0) {
    return { valid: false, error: 'Forward rate must be greater than 0' };
  }

  if (rate < FORWARD_VALIDATION.minForwardRate) {
    return {
      valid: false,
      error: `Forward rate must be at least ${FORWARD_VALIDATION.minForwardRate}`,
    };
  }

  if (rate > FORWARD_VALIDATION.maxForwardRate) {
    return {
      valid: false,
      error: `Forward rate cannot exceed ${FORWARD_VALIDATION.maxForwardRate}`,
    };
  }

  return { valid: true };
};

/**
 * Validate settlement date is in future
 */
export const validateSettlementDate = (
  settlementDate: string,
  contractDate?: string
): ValidationResult => {
  const settlement = new Date(settlementDate);
  const contract = contractDate ? new Date(contractDate) : new Date();

  if (settlement <= contract) {
    return {
      valid: false,
      error: 'Settlement date must be after contract date',
    };
  }

  const daysInFuture = getDaysRemaining(settlementDate);
  if (daysInFuture > FORWARD_VALIDATION.maxSettlementDaysFuture) {
    return {
      valid: false,
      error: `Settlement date cannot be more than ${FORWARD_VALIDATION.maxSettlementDaysFuture} days in future`,
    };
  }

  return { valid: true };
};

/**
 * Validate closing rate
 */
export const validateClosingRate = (rate: number): ValidationResult => {
  return validateForwardRate(rate);
};

// ─────────────────────────────────────────────────────────────────────────────────
// STATUS & DISPLAY HELPERS
// ─────────────────────────────────────────────────────────────────────────────────

/**
 * Get status display string
 */
export const getStatusDisplay = (status: string): string => {
  const statusMap: Record<string, string> = {
    ACTIVE: 'Active',
    CLOSED: 'Closed',
    CANCELLED: 'Cancelled',
    EXPIRED: 'Expired',
  };
  return statusMap[status] || status;
};

/**
 * Get exposure type display string
 */
export const getExposureTypeDisplay = (type?: string): string => {
  if (!type) return '-';
  const typeMap: Record<string, string> = {
    RECEIVABLE: 'Receivable',
    PAYABLE: 'Payable',
  };
  return typeMap[type] || type;
};

/**
 * Determine if P&L is gain or loss
 */
export const isGain = (gainLoss: number): boolean => {
  return gainLoss > 0;
};

/**
 * Format P&L for display with color indicator
 */
export const formatPL = (gainLoss: number): { formatted: string; isGain: boolean } => {
  const formatted = (gainLoss >= 0 ? '+' : '') + formatINRAmount(gainLoss);
  return { formatted, isGain: isGain(gainLoss) };
};

// ─────────────────────────────────────────────────────────────────────────────────
// BATCH OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────────

/**
 * Calculate total hedged amount from contracts
 */
export const calculateTotalHedgedAmount = (contracts: Array<{ baseAmount: number }>): number => {
  return contracts.reduce((sum, contract) => sum + contract.baseAmount, 0);
};

/**
 * Calculate average forward rate
 */
export const calculateAverageRate = (contracts: Array<{ forwardRate: number }>): number => {
  if (contracts.length === 0) return 0;
  const sum = contracts.reduce((acc, contract) => acc + contract.forwardRate, 0);
  return sum / contracts.length;
};

/**
 * Calculate total gain/loss
 */
export const calculateTotalGainLoss = (contracts: Array<{ gainLoss: number }>): number => {
  return contracts.reduce((sum, contract) => sum + contract.gainLoss, 0);
};

/**
 * Group contracts by quarter
 */
export const groupByQuarter = (
  contracts: Array<{ quarterDisplay: string; [key: string]: any }>
): Record<string, typeof contracts> => {
  return contracts.reduce(
    (groups, contract) => {
      const quarter = contract.quarterDisplay;
      if (!groups[quarter]) groups[quarter] = [];
      groups[quarter].push(contract);
      return groups;
    },
    {} as Record<string, typeof contracts>
  );
};

/**
 * Group contracts by currency
 */
export const groupByCurrency = (
  contracts: Array<{ currency: string; [key: string]: any }>
): Record<string, typeof contracts> => {
  return contracts.reduce(
    (groups, contract) => {
      const currency = contract.currency;
      if (!groups[currency]) groups[currency] = [];
      groups[currency].push(contract);
      return groups;
    },
    {} as Record<string, typeof contracts>
  );
};

/**
 * Group contracts by status
 */
export const groupByStatus = (
  contracts: Array<{ status: string; [key: string]: any }>
): Record<string, typeof contracts> => {
  return contracts.reduce(
    (groups, contract) => {
      const status = contract.status;
      if (!groups[status]) groups[status] = [];
      groups[status].push(contract);
      return groups;
    },
    {} as Record<string, typeof contracts>
  );
};
