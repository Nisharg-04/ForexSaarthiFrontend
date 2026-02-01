import { UserRole } from '../../types';
import type {
  Invoice,
  InvoiceStatus,
  InvoiceFormData,
  InvoiceFormErrors,
  LineItemFormData,
} from './types';
import { InvoiceStatus as InvoiceStatusEnum } from './types';
import {
  INVOICE_VALIDATION,
  LINE_ITEM_VALIDATION,
  CANCEL_REASON_VALIDATION,
} from './invoiceConstants';

// ============================================================================
// PERMISSION HELPERS (Role-Based Access Control)
// ============================================================================

/**
 * Check if user can view invoices (All roles)
 */
export const canViewInvoices = (role: UserRole | undefined | null): boolean => {
  return role === 'ADMIN' || role === 'FINANCE' || role === 'AUDITOR';
};

/**
 * Check if user can create invoice drafts (Admin or Finance)
 */
export const canCreateInvoice = (role: UserRole | undefined | null): boolean => {
  return role === 'ADMIN' || role === 'FINANCE';
};

/**
 * Check if user can edit an invoice draft
 * - Must have create permission
 * - Invoice must be in DRAFT status
 */
export const canEditInvoice = (role: UserRole | undefined | null, invoice?: Invoice | null): boolean => {
  if (!canCreateInvoice(role)) return false;
  if (!invoice) return false;
  return invoice.status === InvoiceStatusEnum.DRAFT;
};

/**
 * Check if user can issue an invoice (Admin only)
 * - Must be Admin
 * - Invoice must be in DRAFT status
 */
export const canIssueInvoice = (role: UserRole | undefined | null, invoice?: Invoice | null): boolean => {
  if (role !== 'ADMIN') return false;
  if (!invoice) return false;
  return invoice.status === InvoiceStatusEnum.DRAFT;
};

/**
 * Check if user can cancel an invoice draft (Admin only)
 * - Must be Admin
 * - Invoice must be in DRAFT status
 */
export const canCancelInvoice = (role: UserRole | undefined | null, invoice?: Invoice | null): boolean => {
  if (role !== 'ADMIN') return false;
  if (!invoice) return false;
  return invoice.status === InvoiceStatusEnum.DRAFT;
};

/**
 * Check if invoice is read-only (not editable)
 */
export const isInvoiceReadOnly = (invoice?: Invoice | null): boolean => {
  if (!invoice) return true;
  return invoice.status !== InvoiceStatusEnum.DRAFT;
};

/**
 * Check if invoice is in a terminal state
 */
export const isInvoiceTerminal = (invoice?: Invoice | null): boolean => {
  if (!invoice) return false;
  return (
    invoice.status === InvoiceStatusEnum.CANCELLED ||
    invoice.status === InvoiceStatusEnum.SETTLED
  );
};

/**
 * Check if invoice has exposure (issued)
 */
export const hasExposure = (invoice?: Invoice | null): boolean => {
  if (!invoice) return false;
  return invoice.status !== InvoiceStatusEnum.DRAFT && invoice.status !== InvoiceStatusEnum.CANCELLED;
};

// ============================================================================
// STATUS HELPERS
// ============================================================================

/**
 * Get human-readable status label
 */
export const getStatusLabel = (status: InvoiceStatus): string => {
  const labels: Record<InvoiceStatus, string> = {
    DRAFT: 'Draft',
    ISSUED: 'Issued',
    PARTIALLY_PAID: 'Partially Paid',
    SETTLED: 'Settled',
    CANCELLED: 'Cancelled',
  };
  return labels[status] || status;
};

/**
 * Check if status allows payments
 */
export const canReceivePayment = (status: InvoiceStatus): boolean => {
  return status === InvoiceStatusEnum.ISSUED || status === InvoiceStatusEnum.PARTIALLY_PAID;
};

// ============================================================================
// CALCULATION HELPERS (Decimal-Safe Arithmetic)
// ============================================================================

/**
 * Round to 2 decimal places safely
 */
export const roundToDecimal = (value: number, decimals: number = 2): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

/**
 * Calculate line item total (quantity × unit price)
 */
export const calculateLineTotal = (quantity: number, unitPrice: number): number => {
  return roundToDecimal(quantity * unitPrice);
};

/**
 * Calculate invoice subtotal from line items
 */
export const calculateSubtotal = (
  lineItems: Array<{ quantity: number; unitPrice: number } | { lineTotal: number }>
): number => {
  const total = lineItems.reduce((sum, item) => {
    if ('lineTotal' in item) {
      return sum + item.lineTotal;
    }
    return sum + calculateLineTotal(item.quantity, item.unitPrice);
  }, 0);
  return roundToDecimal(total);
};

/**
 * Parse numeric input safely
 */
export const parseNumericInput = (value: string): number => {
  const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format number for display in grid
 */
export const formatGridNumber = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals);
};

// ============================================================================
// FORM VALIDATION
// ============================================================================

/**
 * Validate a single line item
 */
export const validateLineItem = (
  item: LineItemFormData
): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Description
  if (!item.description.trim()) {
    errors.description = 'Description is required';
  } else if (item.description.length > LINE_ITEM_VALIDATION.description.maxLength) {
    errors.description = `Max ${LINE_ITEM_VALIDATION.description.maxLength} characters`;
  }

  // HS Code (optional but must match pattern if provided)
  if (item.hsCode && !LINE_ITEM_VALIDATION.hsCode.pattern.test(item.hsCode)) {
    errors.hsCode = 'Invalid HS Code (4-8 digits)';
  }

  // Quantity
  const quantity = parseNumericInput(item.quantity);
  if (!item.quantity.trim()) {
    errors.quantity = 'Required';
  } else if (quantity < LINE_ITEM_VALIDATION.quantity.min) {
    errors.quantity = 'Min 0.001';
  } else if (quantity > LINE_ITEM_VALIDATION.quantity.max) {
    errors.quantity = 'Too large';
  }

  // Unit
  if (!item.unit.trim()) {
    errors.unit = 'Required';
  }

  // Unit Price
  const unitPrice = parseNumericInput(item.unitPrice);
  if (!item.unitPrice.trim()) {
    errors.unitPrice = 'Required';
  } else if (unitPrice < LINE_ITEM_VALIDATION.unitPrice.min) {
    errors.unitPrice = 'Min 0.01';
  } else if (unitPrice > LINE_ITEM_VALIDATION.unitPrice.max) {
    errors.unitPrice = 'Too large';
  }

  return errors;
};

/**
 * Validate invoice form data
 */
export const validateInvoiceForm = (data: InvoiceFormData): InvoiceFormErrors => {
  const errors: InvoiceFormErrors = {};

  // Trade ID
  if (!data.tradeId) {
    errors.tradeId = 'Please select a trade';
  }

  // Invoice Date
  if (!data.invoiceDate) {
    errors.invoiceDate = 'Invoice date is required';
  }

  // Due Date
  if (!data.dueDate) {
    errors.dueDate = 'Due date is required';
  } else if (data.invoiceDate && new Date(data.dueDate) < new Date(data.invoiceDate)) {
    errors.dueDate = 'Due date must be after invoice date';
  }

  // Line Items
  if (data.lineItems.length < INVOICE_VALIDATION.lineItems.minItems) {
    errors.lineItems = 'At least one line item is required';
  } else if (data.lineItems.length > INVOICE_VALIDATION.lineItems.maxItems) {
    errors.lineItems = `Maximum ${INVOICE_VALIDATION.lineItems.maxItems} line items allowed`;
  } else {
    // Validate each line item
    const hasLineItemErrors = data.lineItems.some(
      (item) => Object.keys(validateLineItem(item)).length > 0
    );
    if (hasLineItemErrors) {
      errors.lineItems = 'Please fix errors in line items';
    }
  }

  return errors;
};

/**
 * Validate cancel reason
 */
export const validateCancelReason = (reason: string): string | null => {
  const trimmed = reason.trim();
  if (trimmed.length < CANCEL_REASON_VALIDATION.minLength) {
    return `Reason must be at least ${CANCEL_REASON_VALIDATION.minLength} characters`;
  }
  if (trimmed.length > CANCEL_REASON_VALIDATION.maxLength) {
    return `Reason must not exceed ${CANCEL_REASON_VALIDATION.maxLength} characters`;
  }
  return null;
};

// ============================================================================
// FORM DATA HELPERS
// ============================================================================

/**
 * Generate a unique temporary ID for line items
 */
export const generateTempId = (): string => {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create an empty line item for the form
 */
export const createEmptyLineItem = (): LineItemFormData => ({
  id: generateTempId(),
  description: '',
  hsCode: '',
  quantity: '',
  unit: 'PCS',
  unitPrice: '',
});

/**
 * Convert form line items to API format
 */
export const convertLineItemsForApi = (
  items: LineItemFormData[]
): Array<{ description: string; hsCode?: string; quantity: number; unit: string; unitPrice: number }> => {
  return items.map((item) => ({
    description: item.description.trim(),
    ...(item.hsCode.trim() && { hsCode: item.hsCode.trim() }),
    quantity: parseNumericInput(item.quantity),
    unit: item.unit,
    unitPrice: parseNumericInput(item.unitPrice),
  }));
};

/**
 * Convert API line items to form format
 */
export const convertLineItemsFromApi = (
  items: Array<{ id: string; description: string; hsCode?: string; quantity: number; unit: string; unitPrice: number }>
): LineItemFormData[] => {
  return items.map((item) => ({
    id: item.id,
    description: item.description,
    hsCode: item.hsCode || '',
    quantity: formatGridNumber(item.quantity),
    unit: item.unit,
    unitPrice: formatGridNumber(item.unitPrice),
  }));
};

// ============================================================================
// SEARCH & FILTER HELPERS
// ============================================================================

/**
 * Filter invoices by search term
 */
export const filterInvoicesBySearch = (invoices: Invoice[], searchTerm: string): Invoice[] => {
  if (!searchTerm.trim()) return invoices;

  const term = searchTerm.toLowerCase().trim();
  return invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(term) ||
      invoice.partyName?.toLowerCase().includes(term) ||
      invoice.tradeNumber?.toLowerCase().includes(term) ||
      invoice.currency.toLowerCase().includes(term)
  );
};

/**
 * Sort invoices by field
 */
export const sortInvoices = (
  invoices: Invoice[],
  sortBy: keyof Invoice,
  sortOrder: 'asc' | 'desc'
): Invoice[] => {
  return [...invoices].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (aVal === undefined || aVal === null) return sortOrder === 'asc' ? 1 : -1;
    if (bVal === undefined || bVal === null) return sortOrder === 'asc' ? -1 : 1;

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

// ============================================================================
// EXPOSURE HELPERS
// ============================================================================

/**
 * Calculate exposure percentage hedged
 */
export const calculateHedgePercentage = (invoice: Invoice): number => {
  if (!invoice.exposedAmount || invoice.exposedAmount === 0) return 0;
  const hedged = invoice.hedgedAmount || 0;
  return roundToDecimal((hedged / invoice.exposedAmount) * 100, 1);
};

/**
 * Get exposure status label
 */
export const getExposureStatusLabel = (invoice: Invoice): string => {
  const hedgePercentage = calculateHedgePercentage(invoice);
  if (hedgePercentage === 0) return 'Unhedged';
  if (hedgePercentage >= 100) return 'Fully Hedged';
  return 'Partially Hedged';
};
