// Trade Stages - Lifecycle states
export const TradeStage = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  CANCELLED: 'CANCELLED',
  CLOSED: 'CLOSED',
} as const;

export type TradeStage = typeof TradeStage[keyof typeof TradeStage];

// Trade Types
export const TradeType = {
  IMPORT: 'IMPORT',
  EXPORT: 'EXPORT',
} as const;

export type TradeType = typeof TradeType[keyof typeof TradeType];

// Trade Entity
export interface Trade {
  id: string;
  companyId: string;
  partyId: string;
  tradeNumber: string;
  tradeType: TradeType;
  tradeReference?: string;
  remarks?: string;
  tradeStage: TradeStage;
  
  // Party details (populated from join)
  
partyName:string

  
  // Lifecycle metadata
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  
  // Stage transition metadata
  submittedBy?: string;
  submittedByName?: string;
  submittedAt?: string;
  
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  
  cancelledBy?: string;
  cancelledByName?: string;
  cancelledAt?: string;
  cancelReason?: string;
  
  closedBy?: string;
  closedByName?: string;
  closedAt?: string;
}

// API Request Types
export interface CreateTradeRequest {
  partyId: string;
  tradeType: TradeType;
  tradeReference?: string;
  remarks?: string;
}

export interface UpdateTradeRequest {
  id: string;
  partyId?: string;
  tradeType?: TradeType;
  tradeReference?: string;
  remarks?: string;
}

export interface CancelTradeRequest {
  id: string;
  cancelReason: string;
}

// API Response Types
export interface TradeResponse {
  success: boolean;
  data: Trade;
  message?: string;
  correlationId?: string;
}

export interface TradesResponse {
  success: boolean;
  data: Trade[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
  correlationId?: string;
}

// Filter Types
export interface TradeFilters {
  stage?: TradeStage;
  tradeType?: TradeType;
  partyId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Form Types
export interface TradeFormData {
  partyId: string;
  tradeType: TradeType;
  tradeReference: string;
  remarks: string;
}

export interface TradeFormErrors {
  partyId?: string;
  tradeType?: string;
  tradeReference?: string;
  remarks?: string;
}

// Timeline Event
export interface TradeTimelineEvent {
  stage: TradeStage | 'CREATED';
  label: string;
  timestamp: string;
  userName?: string;
  details?: string;
  isCurrent: boolean;
}
