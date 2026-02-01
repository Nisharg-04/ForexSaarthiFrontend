// Party Types
export const PartyType = {
  BUYER: 'BUYER',
  SUPPLIER: 'SUPPLIER',
} as const;

export type PartyType = typeof PartyType[keyof typeof PartyType];

// Party Status
export const PartyStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type PartyStatus = typeof PartyStatus[keyof typeof PartyStatus];

// Party Entity
export interface Party {
  id: string;
  companyId: string;
  name: string;
  type: PartyType;
  country: string;
  currency: string;
  paymentTermDays: number;
  address?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Request Types
export interface CreatePartyRequest {
  name: string;
  type: PartyType;
  country: string;
  currency: string;
  paymentTermDays: number;
  address?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface UpdatePartyRequest extends Partial<CreatePartyRequest> {
  id: string;
}

// API Response Types
export interface PartyResponse {
  success: boolean;
  data: Party;
  message?: string;
}

export interface PartiesResponse {
  success: boolean;
  data: Party[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

// Filter Types
export interface PartyFilters {
  type?: PartyType;
  country?: string;
  currency?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Form State
export interface PartyFormData {
  name: string;
  type: PartyType;
  country: string;
  currency: string;
  paymentTermDays: number;
  address: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
}

// Validation Errors
export interface PartyFormErrors {
  name?: string;
  type?: string;
  country?: string;
  currency?: string;
  paymentTermDays?: string;
  contactEmail?: string;
  contactPhone?: string;
}

// UI State
export interface PartyUIState {
  selectedPartyId: string | null;
  isFormOpen: boolean;
  isDetailsOpen: boolean;
  isDeleteConfirmOpen: boolean;
  formMode: 'create' | 'edit';
}
