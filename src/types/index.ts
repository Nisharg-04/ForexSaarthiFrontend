// Core User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  role: UserRole;
  companies: CompanyAccess[];
  activeCompanyId?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export const UserRole = {
  ADMIN: 'ADMIN',
  FINANCE: 'FINANCE',
  AUDITOR: 'AUDITOR',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface CompanyAccess {
  companyId: string;
  companyName: string;
  role: UserRole;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface GoogleAuthResponse {
  credential: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Company Types
export interface Company {
  id: string;
  name: string;
  type: 'EXPORTER' | 'IMPORTER' | 'BOTH';
  iecNumber?: string;
  gstNumber?: string;
  taxId?: string;
  registrationNumber?: string;
  address?: string;
  country?: string;
  baseCurrency: string;
  logoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Party Types
export interface Party {
  id: string;
  companyId: string;
  name: string;
  type: 'BUYER' | 'SUPPLIER';
  country: string;
  currency: string;
  paymentTerms: number; // in days
  address?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

// Trade Types
export interface Trade {
  id: string;
  companyId: string;
  partyId: string;
  party?: Party;
  tradeNumber: string;
  tradeDate: string;
  type: 'EXPORT' | 'IMPORT';
  currency: string;
  totalAmount: number;
  stage: TradeStage;
  description?: string;
  documents: TradeDocument[];
  invoices?: Invoice[];
  createdAt: string;
  updatedAt: string;
}

export const TradeStage = {
  ORDER_RECEIVED: 'ORDER_RECEIVED',
  PRODUCTION: 'PRODUCTION',
  SHIPMENT: 'SHIPMENT',
  INVOICED: 'INVOICED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  COMPLETED: 'COMPLETED',
} as const;

export type TradeStage = typeof TradeStage[keyof typeof TradeStage];

export interface TradeDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

// Invoice Types
export interface Invoice {
  id: string;
  companyId: string;
  tradeId: string;
  trade?: Trade;
  partyId: string;
  party?: Party;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  amount: number;
  paidAmount: number;
  status: InvoiceStatus;
  exchangeRateAtInvoice?: number;
  items: InvoiceItem[];
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
}

export const InvoiceStatus = {
  OPEN: 'OPEN',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
} as const;

export type InvoiceStatus = typeof InvoiceStatus[keyof typeof InvoiceStatus];

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Payment Types
export interface Payment {
  id: string;
  companyId: string;
  invoiceId: string;
  invoice?: Invoice;
  paymentDate: string;
  foreignAmount: number;
  exchangeRate: number;
  inrAmount: number;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Exposure Types
export interface Exposure {
  id: string;
  companyId: string;
  currency: string;
  totalExposure: number;
  hedgedAmount: number;
  unhedgedAmount: number;
  invoices: Invoice[];
  hedges: Hedge[];
  calculatedAt: string;
}

export interface ExposureSummary {
  totalOpenExposure: number;
  currencyWise: CurrencyExposure[];
  hedgedPercentage: number;
  unhedgedPercentage: number;
}

export interface CurrencyExposure {
  currency: string;
  totalAmount: number;
  hedgedAmount: number;
  unhedgedAmount: number;
  invoiceCount: number;
}

// Hedge Types
export interface Hedge {
  id: string;
  companyId: string;
  currency: string;
  amount: number;
  hedgeType: 'FORWARD' | 'OPTION' | 'SWAP';
  contractDate: string;
  maturityDate: string;
  hedgeRate: number;
  provider?: string;
  contractNumber?: string;
  status: 'ACTIVE' | 'SETTLED' | 'CANCELLED';
  linkedInvoices?: string[]; // invoice IDs
  createdAt: string;
  updatedAt: string;
}

// Audit Types
export interface AuditLog {
  id: string;
  companyId: string;
  userId: string;
  user?: Pick<User, 'id' | 'name' | 'email'>;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  entityName?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export const AuditAction = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  VIEW: 'VIEW',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
} as const;

export type AuditAction = typeof AuditAction[keyof typeof AuditAction];

export const EntityType = {
  USER: 'USER',
  COMPANY: 'COMPANY',
  PARTY: 'PARTY',
  TRADE: 'TRADE',
  INVOICE: 'INVOICE',
  PAYMENT: 'PAYMENT',
  HEDGE: 'HEDGE',
} as const;

export type EntityType = typeof EntityType[keyof typeof EntityType];

// Dashboard Types
export interface DashboardStats {
  totalOpenExposure: number;
  totalInvoices: number;
  totalPaymentsThisMonth: number;
  hedgedPercentage: number;
  currencyBreakdown: CurrencyExposure[];
  upcomingDueDates: Invoice[];
  recentActivity: AuditLog[];
}

// Forex Rate Types
export interface ForexRate {
  currency: string;
  rate: number;
  date: string;
}

export interface ForexRateTrend {
  currency: string;
  rates: Array<{
    date: string;
    rate: number;
  }>;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

// Filter & Sort Types
export interface FilterParams {
  search?: string;
  status?: string;
  currency?: string;
  dateFrom?: string;
  dateTo?: string;
  partyId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
