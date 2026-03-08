// ═══════════════════════════════════════════════════════════════════════════════
// EXPOSURE MODULE INDEX
// Re-exports all types, constants, utilities, API, components, and pages
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────────
export * from './types';
export {
  // Quarterly Hedging Types
  type HedgeRecordResponse,
  type BookForwardContractRequest,
  type BookForwardContractResponse,
  type ApplyQuarterlyNaturalHedgeRequest,
  type QuarterlyNaturalHedgeResponse,
  type GetExposuresForHedgingRequest,
  type ExposuresForHedgingResponse,
  type ExposureBriefInfo,
  type CloseHedgeApiRequest,
  type CloseHedgeResponse,
  type QuarterlyExposureReportResponse,
  type QuarterlyReportSummary,
  type QuarterlyExposureBreakdown,
  type CurrencyExposureSummary,
  type EnhancedDashboardTotals,
  type QuarterInfo,
  type BookForwardFormData,
  type BookForwardFormErrors,
  type QuarterlyNaturalHedgeFormData,
  type NaturalHedgeWorkflowState,
  type NaturalHedgeWorkflowStep,
  type HedgeFilters,
  type HedgesListResponse,
} from './hedgingTypes';

// ─────────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────────
export * from './exposureConstants';
export * from './hedgingConstants';

// ─────────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────────
export * from './exposureUtils';
export {
  // Quarter helpers
  getQuarterFromDate,
  getCurrentQuarter,
  parseQuarter,
  getQuarterDateRange,
  getQuarterLabel,
  getUpcomingQuarters,
  compareQuarters,
  // Natural hedge helpers
  calculateNaturalHedgePotential,
  calculateNetExposureAtRisk,
  calculateMaxHedgeAmount,
  // Hedge record helpers
  isNaturalHedge,
  isHedgeActive,
  filterHedgesByType,
  filterHedgesByStatus,
  filterHedgesByQuarter,
  groupHedgesByQuarter,
  // Risk level helpers
  getRiskLevelFromHedgeRatio,
  getRiskLevelClasses,
  // Formatting
  formatHedgeAmount,
  formatRate,
  formatPercentage,
  formatHedgeDate,
} from './hedgingUtils';

// ─────────────────────────────────────────────────────────────────────────────────
// API - Exposure
// ─────────────────────────────────────────────────────────────────────────────────
export {
  exposureApi,
  useGetExposuresQuery,
  useGetUnsettledExposuresQuery,
  useGetExposuresByCurrencyQuery,
  useGetExposureDashboardQuery,
  useGetExposureByIdQuery,
  useGetExposureByInvoiceQuery,
  useGetNaturalHedgeMatchesQuery,
  useApplyForwardHedgeMutation,
  useApplyNaturalHedgeMutation,
  useCloseHedgeMutation,
} from './api/exposureApi';

// ─────────────────────────────────────────────────────────────────────────────────
// API - Quarterly Hedging
// ─────────────────────────────────────────────────────────────────────────────────
export {
  hedgingApi,
  useBookForwardContractMutation,
  useApplyQuarterlyNaturalHedgeMutation,
  useCloseHedgeRecordMutation,
  useGetHedgesQuery,
  useGetHedgesByExposureQuery,
  useGetHedgesByQuarterQuery,
  useLazyGetHedgesByQuarterQuery,
  useGetExposuresForHedgingQuery,
  useGetQuarterlyReportQuery,
  useLazyGetQuarterlyReportQuery,
} from './api/hedgingApi';

// ─────────────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────────────
export {
  useExposurePermissions,
  useExposureActionPermissions,
} from './hooks/useExposurePermissions';

export {
  useExposureFilters,
  useExposureStatusTab,
} from './hooks/useExposureFilters';

// ─────────────────────────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────────
export { ExposureStatusBadge } from './components/ExposureStatusBadge';
export { HedgeProgressBar, ExposureBreakdownBar } from './components/HedgeProgressBar';
export { ExposureSummaryCards, AmountSummaryCards } from './components/ExposureSummaryCards';
export { ExposureFilters } from './components/ExposureFilters';
export { ExposureTable } from './components/ExposureTable';
export { ExposureActionsMenu } from './components/ExposureActionsMenu';
export { RiskKPICard } from './components/RiskKPICard';
export { CircularHedgeCoverage } from './components/CircularHedgeCoverage';
export { CurrencyBreakdownTable } from './components/CurrencyBreakdownTable';
export { HedgeManagementTable } from './components/HedgeManagementTable';
export { QuarterlyHedgingDashboardSection } from './components/QuarterlyHedgingDashboardSection';

// ─────────────────────────────────────────────────────────────────────────────────
// CHARTS
// ─────────────────────────────────────────────────────────────────────────────────
export { ExposureByCurrencyChart } from './charts/ExposureByCurrencyChart';
export { ExposureByTypeChart } from './charts/ExposureByTypeChart';
export { HedgeCoverageChart } from './charts/HedgeCoverageChart';
export { RiskByTypeChart } from './charts/RiskByTypeChart';

// ─────────────────────────────────────────────────────────────────────────────────
// MODALS
// ─────────────────────────────────────────────────────────────────────────────────
export { ForwardHedgeModal } from './modals/ForwardHedgeModal';
export { NaturalHedgeModal } from './modals/NaturalHedgeModal';
export { CloseHedgeModal } from './modals/CloseHedgeModal';
export { QuarterlyNaturalHedgeModal } from './modals/QuarterlyNaturalHedgeModal';
export { BookForwardContractModal } from './modals/BookForwardContractModal';
export { CloseHedgeRecordModal } from './modals/CloseHedgeRecordModal';

// ─────────────────────────────────────────────────────────────────────────────────
// PAGES
// ─────────────────────────────────────────────────────────────────────────────────
export { ExposureDashboard } from './pages/ExposureDashboard';
export { ExposureListPage } from './pages/ExposureListPage';
export { ExposureDetailPage } from './pages/ExposureDetailPage';
export { HedgeManagementPage } from './pages/HedgeManagementPage';
export { QuarterlyReportView } from './pages/QuarterlyReportView';
