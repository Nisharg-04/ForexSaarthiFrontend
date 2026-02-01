// Components
export { TradeStageBadge } from './components/TradeStageBadge';
export { TradeTypeBadge } from './components/TradeTypeBadge';
export { TradeTable } from './components/TradeTable';
export { TradeForm } from './components/TradeForm';
export { TradeHeader } from './components/TradeHeader';
export { TradeInfoCard } from './components/TradeInfoCard';
export { TradeTimeline } from './components/TradeTimeline';
export { TradeActions } from './components/TradeActions';
export { CancelTradeModal } from './components/CancelTradeModal';

// Pages
export { TradeListPage } from './pages/TradeListPage';
export { CreateTradePage } from './pages/CreateTradePage';
export { TradeDetailsPage } from './pages/TradeDetailsPage';
export { EditTradePage } from './pages/EditTradePage';

// API
export {
  useGetTradesQuery,
  useGetTradeQuery,
  useCreateTradeMutation,
  useUpdateTradeMutation,
  useSubmitTradeMutation,
  useApproveTradeMutation,
  useCancelTradeMutation,
  useCloseTradeMutation,
} from './api/tradeApi';

// Types
export type {
  Trade,
  TradeFilters,
  TradeFormData,
  TradeFormErrors,
  CreateTradeRequest,
  UpdateTradeRequest,
  CancelTradeRequest,
  TradeResponse,
  TradesResponse,
  TradeTimelineEvent,
} from './types';

export { TradeStage, TradeType } from './types';
export type { TradeStage as TradeStageType, TradeType as TradeTypeType } from './types';

// Constants
export {
  TRADE_TYPE_OPTIONS,
  TRADE_STAGE_OPTIONS,
  TRADE_STAGE_TABS,
  TRADE_STAGE_STYLES,
  TRADE_TYPE_STYLES,
  TRADE_TABLE_COLUMNS,
  EMPTY_TRADE_FORM,
  TRADE_VALIDATION,
  CANCEL_REASON_VALIDATION,
} from './tradeConstants';

// Utils
export {
  canCreateTrade,
  canEditTrade,
  canSubmitTrade,
  canApproveTrade,
  canCancelTrade,
  canCloseTrade,
  isTradeReadOnly,
  isTradeTerminal,
  getNextStages,
  getStageOrder,
  getEmptyTradeFormData,
  tradeToFormData,
  validateTradeForm,
  hasTradeFormErrors,
  validateCancelReason,
  buildTradeTimeline,
  filterTradesBySearch,
  getStageLabel,
  getTradeTypeLabel,
  formatTradeNumber,
} from './tradeUtils';
