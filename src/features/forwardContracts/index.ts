// ═══════════════════════════════════════════════════════════════════════════════
// FORWARD CONTRACTS MODULE - BARREL EXPORT
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

// Types
export type {
  ForwardContract,
  ForwardFilters,
  BookForwardRequest,
  CloseForwardRequest,
  CancelForwardRequest,
  QuarterAnalytics,
  AnnualAnalytics,
  ExpiringContract,
  BookForwardFormData,
  CloseForwardFormData,
  CancelForwardFormData,
 ExposureBriefForBooking,
} from './types';

export { ForwardStatus } from './types';

// Constants
export {
  FORWARD_STATUS_OPTIONS,
  COMMON_BANKS,
  QUARTERS,
  FORWARD_CURRENCIES,
  FORWARD_VALIDATION,
  FORWARD_COLORS,
  DEFAULT_PAGE_SIZE,
  FORWARD_PAGINATION,
  FORWARD_SORT_OPTIONS,
  EXPIRING_DAYS_THRESHOLD,
  ANALYTICS_YEARS_RANGE,
  FORWARD_ERROR_MESSAGES,
  FORWARD_SUCCESS_MESSAGES,
  FORWARD_DATE_FORMAT,
  FORWARD_DATE_FORMAT_DISPLAY,
} from './forwardConstants';

// Utilities
export {
  formatForwardAmount,
  formatINRAmount,
  formatForwardRate,
  parseCurrencyAmount,
  calculateGainLoss,
  calculateGainLossPercentage,
  calculateBaseAmount,
  getQuarterFromDate,
  getQuarterDisplay,
  getCurrentQuarter,
  getYearFromDate,
  getDaysRemaining,
  isExpiringsoon,
  isExpired,
  formatDate,
  formatDateTime,
  getYearOptions,
  validateContractAmount,
  validateForwardRate,
  validateSettlementDate,
  validateClosingRate,
  getStatusDisplay,
  getExposureTypeDisplay,
  isGain,
  formatPL,
  calculateTotalHedgedAmount,
  calculateAverageRate,
  calculateTotalGainLoss,
  groupByQuarter,
  groupByCurrency,
  groupByStatus,
} from './forwardUtils';

// API
export {
  useGetForwardContractsQuery,
  useGetForwardByIdQuery,
  useGetExposureForwardsQuery,
  useBookForwardMutation,
  useCloseForwardMutation,
  useCancelForwardMutation,
  useGetQuarterAnalyticsQuery,
  useGetForwardAnalyticsQuery,
  useGetExpiringForwardsQuery,
} from './api/forwardApi';

// Components
export {
  BookForwardModal,
  CloseForwardModal,
  CancelForwardModal,
  ForwardFilters as ForwardFiltersComponent,
  ForwardContractsTable,
} from './components';

// Pages
export { ForwardContractsPage } from './pages';

// Hooks
export { useForwardFilters } from './hooks/useForwardFilters';
