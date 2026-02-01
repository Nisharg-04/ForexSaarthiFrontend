import { UserRole } from '../../types';
import type {
  Trade,
  TradeStage,
  TradeFormData,
  TradeFormErrors,
  TradeTimelineEvent,
} from './types';
import { TradeStage as TradeStageEnum } from './types';
import { EMPTY_TRADE_FORM, TRADE_VALIDATION, CANCEL_REASON_VALIDATION } from './tradeConstants';

// ============================================================================
// PERMISSION HELPERS
// ============================================================================

/**
 * Check if user can create trades (Admin or Finance)
 */
export const canCreateTrade = (role: UserRole | undefined | null): boolean => {
  return role === 'ADMIN' || role === 'FINANCE';
};

/**
 * Check if user can edit a trade
 * - Must have create permission
 * - Trade must be in DRAFT stage
 */
export const canEditTrade = (role: UserRole | undefined | null, trade?: Trade | null): boolean => {
  if (!canCreateTrade(role)) return false;
  if (!trade) return false;
  return trade.tradeStage === TradeStageEnum.DRAFT;
};

/**
 * Check if user can submit a trade for approval
 * - Must have create permission
 * - Trade must be in DRAFT stage
 */
export const canSubmitTrade = (role: UserRole | undefined | null, trade?: Trade | null): boolean => {
  if (!canCreateTrade(role)) return false;
  if (!trade) return false;
  return trade.tradeStage === TradeStageEnum.DRAFT;
};

/**
 * Check if user can approve a trade
 * - Must be Admin
 * - Trade must be in SUBMITTED stage
 */
export const canApproveTrade = (role: UserRole | undefined | null, trade?: Trade | null): boolean => {
  if (role !== 'ADMIN') return false;
  if (!trade) return false;
  return trade.tradeStage === TradeStageEnum.SUBMITTED;
};

/**
 * Check if user can cancel a trade
 * - Must have create permission
 * - Trade must be in DRAFT or SUBMITTED stage
 */
export const canCancelTrade = (role: UserRole | undefined | null, trade?: Trade | null): boolean => {
  if (!canCreateTrade(role)) return false;
  if (!trade) return false;
  return trade.tradeStage === TradeStageEnum.DRAFT || trade.tradeStage === TradeStageEnum.SUBMITTED;
};

/**
 * Check if user can close a trade
 * - Must have create permission
 * - Trade must be in APPROVED stage
 */
export const canCloseTrade = (role: UserRole | undefined | null, trade?: Trade | null): boolean => {
  if (!canCreateTrade(role)) return false;
  if (!trade) return false;
  return trade.tradeStage === TradeStageEnum.APPROVED;
};

/**
 * Check if trade is read-only (not editable)
 */
export const isTradeReadOnly = (trade?: Trade | null): boolean => {
  if (!trade) return true;
  return trade.tradeStage !== TradeStageEnum.DRAFT;
};

/**
 * Check if trade is in a terminal state
 */
export const isTradeTerminal = (trade?: Trade | null): boolean => {
  if (!trade) return false;
  return trade.tradeStage === TradeStageEnum.CANCELLED || trade.tradeStage === TradeStageEnum.CLOSED;
};

// ============================================================================
// STAGE HELPERS
// ============================================================================

/**
 * Get the next possible stages for a trade
 */
export const getNextStages = (currentStage: TradeStage): TradeStage[] => {
  switch (currentStage) {
    case TradeStageEnum.DRAFT:
      return [TradeStageEnum.SUBMITTED, TradeStageEnum.CANCELLED];
    case TradeStageEnum.SUBMITTED:
      return [TradeStageEnum.APPROVED, TradeStageEnum.CANCELLED];
    case TradeStageEnum.APPROVED:
      return [TradeStageEnum.CLOSED];
    case TradeStageEnum.CANCELLED:
    case TradeStageEnum.CLOSED:
      return []; // Terminal states
    default:
      return [];
  }
};

/**
 * Get stage display order for timeline
 */
export const getStageOrder = (stage: TradeStage | 'CREATED'): number => {
  const order: Record<TradeStage | 'CREATED', number> = {
    CREATED: 0,
    DRAFT: 1,
    SUBMITTED: 2,
    APPROVED: 3,
    CANCELLED: 3, // Same level as APPROVED (alternative path)
    CLOSED: 4,
  };
  return order[stage] ?? 0;
};

// ============================================================================
// FORM HELPERS
// ============================================================================

/**
 * Get empty form data for creating a new trade
 */
export const getEmptyTradeFormData = (): TradeFormData => {
  return { ...EMPTY_TRADE_FORM };
};

/**
 * Convert Trade entity to form data
 */
export const tradeToFormData = (trade: Trade): TradeFormData => {
  return {
    partyId: trade.partyId,
    tradeType: trade.tradeType,
    tradeReference: trade.tradeReference || '',
    remarks: trade.remarks || '',
  };
};

/**
 * Validate trade form data
 */
export const validateTradeForm = (formData: TradeFormData): TradeFormErrors => {
  const errors: TradeFormErrors = {};

  // Party ID validation
  if (TRADE_VALIDATION.partyId.required && !formData.partyId) {
    errors.partyId = 'Party is required';
  }

  // Trade Type validation
  if (TRADE_VALIDATION.tradeType.required && !formData.tradeType) {
    errors.tradeType = 'Trade type is required';
  }

  // Trade Reference validation
  if (formData.tradeReference && formData.tradeReference.length > TRADE_VALIDATION.tradeReference.maxLength) {
    errors.tradeReference = `Reference must be ${TRADE_VALIDATION.tradeReference.maxLength} characters or less`;
  }

  // Remarks validation
  if (formData.remarks && formData.remarks.length > TRADE_VALIDATION.remarks.maxLength) {
    errors.remarks = `Remarks must be ${TRADE_VALIDATION.remarks.maxLength} characters or less`;
  }

  return errors;
};

/**
 * Check if form has any errors
 */
export const hasTradeFormErrors = (errors: TradeFormErrors): boolean => {
  return Object.values(errors).some(Boolean);
};

/**
 * Validate cancel reason
 */
export const validateCancelReason = (reason: string): string | undefined => {
  if (!reason || reason.trim().length === 0) {
    return 'Cancel reason is required';
  }
  if (reason.length < CANCEL_REASON_VALIDATION.minLength) {
    return `Reason must be at least ${CANCEL_REASON_VALIDATION.minLength} characters`;
  }
  if (reason.length > CANCEL_REASON_VALIDATION.maxLength) {
    return `Reason must be ${CANCEL_REASON_VALIDATION.maxLength} characters or less`;
  }
  return undefined;
};

// ============================================================================
// TIMELINE HELPERS
// ============================================================================

/**
 * Build timeline events from trade data
 */
export const buildTradeTimeline = (trade: Trade): TradeTimelineEvent[] => {
  const events: TradeTimelineEvent[] = [];

  // Created event
  events.push({
    stage: 'CREATED',
    label: 'Trade Created',
    timestamp: trade.createdAt,
    userName: trade.createdByName,
    isCurrent: trade.tradeStage === TradeStageEnum.DRAFT,
  });

  // Submitted event
  if (trade.submittedAt) {
    events.push({
      stage: TradeStageEnum.SUBMITTED,
      label: 'Submitted for Approval',
      timestamp: trade.submittedAt,
      userName: trade.submittedByName,
      isCurrent: trade.tradeStage === TradeStageEnum.SUBMITTED,
    });
  }

  // Approved event
  if (trade.approvedAt) {
    events.push({
      stage: TradeStageEnum.APPROVED,
      label: 'Approved',
      timestamp: trade.approvedAt,
      userName: trade.approvedByName,
      isCurrent: trade.tradeStage === TradeStageEnum.APPROVED,
    });
  }

  // Cancelled event
  if (trade.cancelledAt) {
    events.push({
      stage: TradeStageEnum.CANCELLED,
      label: 'Cancelled',
      timestamp: trade.cancelledAt,
      userName: trade.cancelledByName,
      details: trade.cancelReason,
      isCurrent: trade.tradeStage === TradeStageEnum.CANCELLED,
    });
  }

  // Closed event
  if (trade.closedAt) {
    events.push({
      stage: TradeStageEnum.CLOSED,
      label: 'Closed',
      timestamp: trade.closedAt,
      userName: trade.closedByName,
      isCurrent: trade.tradeStage === TradeStageEnum.CLOSED,
    });
  }

  return events;
};

// ============================================================================
// FILTER HELPERS
// ============================================================================

/**
 * Filter trades by search term (client-side)
 */
export const filterTradesBySearch = (trades: Trade[], searchTerm: string): Trade[] => {
  if (!searchTerm || searchTerm.trim() === '') {
    return trades;
  }

  
  const term = searchTerm.toLowerCase().trim();
  
  return trades.filter((trade) => {
    return (
      trade.tradeNumber.toLowerCase().includes(term) ||
      trade.partyName.toLowerCase().includes(term) ||
      trade.tradeReference?.toLowerCase().includes(term) ||
      trade.remarks?.toLowerCase().includes(term)
    );
  });
};

export const filterTradeByTradeType = (trades: Trade[], tradeType: Trade['tradeType'] | undefined): Trade[] => {
  if (!tradeType) return trades;
  return trades.filter((trade) => trade.tradeType === tradeType);
}

// ============================================================================
// DISPLAY HELPERS
// ============================================================================

/**
 * Get stage badge label
 */
export const getStageLabel = (stage: TradeStage): string => {
  const labels: Record<TradeStage, string> = {
    DRAFT: 'Draft',
    SUBMITTED: 'Submitted',
    APPROVED: 'Approved',
    CANCELLED: 'Cancelled',
    CLOSED: 'Closed',
  };
  return labels[stage] || stage;
};

/**
 * Get trade type label
 */
export const getTradeTypeLabel = (type: Trade['tradeType']): string => {
  return type === 'EXPORT' ? 'Export' : 'Import';
};

/**
 * Format trade number for display
 */
export const formatTradeNumber = (tradeNumber: string): string => {
  return tradeNumber;
};
