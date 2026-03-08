import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth, useAppSelector } from '../../../hooks/useRedux';
import { cn } from '../../../utils/helpers';
import { useGetInvoiceQuery, useUpdateInvoiceMutation } from '../api/invoiceApi';
import { useGetPartyQuery } from '../../parties/api/partyApi';
import type { TradeForSelection, LineItemFormData, InvoiceFormData, InvoiceFormErrors, InputMode } from '../types';
import { InvoiceHeader } from '../components/InvoiceHeader';
import { InvoiceLineItemsGrid } from '../components/InvoiceLineItemsGrid';
import { InvoiceTotalsPanel } from '../components/InvoiceTotalsPanel';
import { InvoiceActionsBar } from '../components/InvoiceActionsBar';
import {
  createEmptyLineItem,
  validateInvoiceForm,
  convertLineItemsForApi,
  convertLineItemsFromApi,
  canCreateInvoice,
  parseNumericInput,
  calculateInvoiceTotals,
} from '../invoiceUtils';

export const InvoiceEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { role } = useAuth();
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';

  // Check permission
  const canEdit = canCreateInvoice(role);

  // State
  const [selectedTrade, setSelectedTrade] = useState<TradeForSelection | null>(null);
  const [formData, setFormData] = useState<InvoiceFormData>({
    tradeId: '',
    invoiceDate: '',
    dueDate: '',
    taxMode: 'percent',
    taxPercent: '0',
    taxAmount: '0',
    discountMode: 'percent',
    discountPercent: '0',
    discountAmount: '0',
    lineItems: [createEmptyLineItem()],
  });
  const [errors, setErrors] = useState<InvoiceFormErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // API Hooks
  const { data: invoiceData, isLoading: isLoadingInvoice, error: invoiceError } = useGetInvoiceQuery(id || '', {
    skip: !id,
  });
  const [updateInvoice, { isLoading: isUpdating }] = useUpdateInvoiceMutation();

  const invoice = invoiceData?.data;

  // Fetch party details to get currency
  const { data: partyData } = useGetPartyQuery(invoice?.partyId || '', {
    skip: !invoice?.partyId,
  });

  // Get currency from party or invoice
  const currency = partyData?.data?.currency || invoice?.currency || 'USD';

  // Initialize form data from invoice
  useEffect(() => {
    if (invoice && !isInitialized) {
      setSelectedTrade({
        id: invoice.tradeId,
        tradeNumber: invoice.tradeNumber || '',
        tradeType: invoice.invoiceType,
        partyId: invoice.partyId,
        partyName: invoice.partyName || '',
        createdAt: invoice.createdAt,
      });

      setFormData({
        tradeId: invoice.tradeId,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        // Initialize tax fields from invoice (default to percent mode with stored values)
        taxMode: 'percent',
        taxPercent: String(invoice.taxPercent ?? 0),
        taxAmount: String(invoice.taxAmount ?? 0),
        // Initialize discount fields
        discountMode: 'percent',
        discountPercent: String(invoice.discountPercent ?? 0),
        discountAmount: String(invoice.discountAmount ?? 0),
        lineItems: invoice.lineItems.length > 0
          ? convertLineItemsFromApi(invoice.lineItems)
          : [createEmptyLineItem()],
      });

      setIsInitialized(true);
    }
  }, [invoice, isInitialized]);

  // Handlers
  const handleDateChange = useCallback((field: 'invoiceDate' | 'dueDate', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const handleLineItemsChange = useCallback((items: LineItemFormData[]) => {
    setFormData((prev) => ({ ...prev, lineItems: items }));
    setIsDirty(true);
    setErrors((prev) => ({ ...prev, lineItems: undefined }));
  }, []);

  // Tax handlers
  const handleTaxModeChange = useCallback((mode: InputMode) => {
    setFormData((prev) => ({ ...prev, taxMode: mode }));
    setIsDirty(true);
  }, []);

  const handleTaxPercentChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, taxPercent: value }));
    setIsDirty(true);
  }, []);

  const handleTaxAmountChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, taxAmount: value }));
    setIsDirty(true);
  }, []);

  // Discount handlers
  const handleDiscountModeChange = useCallback((mode: InputMode) => {
    setFormData((prev) => ({ ...prev, discountMode: mode }));
    setIsDirty(true);
  }, []);

  const handleDiscountPercentChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, discountPercent: value }));
    setIsDirty(true);
  }, []);

  const handleDiscountAmountChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, discountAmount: value }));
    setIsDirty(true);
  }, []);

  // Calculate totals for API submission
  const calculatedTotals = useMemo(() => {
    return calculateInvoiceTotals(formData.lineItems, {
      taxMode: formData.taxMode,
      taxPercent: parseNumericInput(formData.taxPercent),
      taxAmount: parseNumericInput(formData.taxAmount),
      discountMode: formData.discountMode,
      discountPercent: parseNumericInput(formData.discountPercent),
      discountAmount: parseNumericInput(formData.discountAmount),
    });
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (!id) return;

    // Validate form
    const validationErrors = validateInvoiceForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await updateInvoice({
        id,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        taxPercent: calculatedTotals.taxPercent,
        taxAmount: calculatedTotals.taxAmount,
        discountPercent: calculatedTotals.discountPercent,
        discountAmount: calculatedTotals.discountAmount,
        invoiceAmount: calculatedTotals.invoiceAmount,
        lineItems: convertLineItemsForApi(formData.lineItems),
      }).unwrap();

      // Navigate to the invoice detail page
      navigate(`/dashboard/invoices/${id}`);
    } catch (error) {
      console.error('Failed to update invoice:', error);
      setErrors({ general: 'Failed to update invoice. Please try again.' });
    }
  }, [id, formData, calculatedTotals, updateInvoice, navigate]);

  const handleDiscard = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm('Discard unsaved changes?');
      if (!confirmed) return;
    }
    navigate(`/dashboard/invoices/${id}`);
  }, [isDirty, navigate, id]);

  // Form validity check
  const isValid = useMemo(() => {
    return (
      formData.tradeId &&
      formData.invoiceDate &&
      formData.dueDate &&
      formData.lineItems.length > 0 &&
      formData.lineItems.some((item) => item.description.trim())
    );
  }, [formData]);

  // Loading State
  if (isLoadingInvoice) {
    return (
      <div
        className={cn(
          'flex items-center justify-center py-16',
          isDark ? 'text-slate-400' : 'text-slate-500'
        )}
      >
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading invoice...</span>
      </div>
    );
  }

  // Error State
  if (invoiceError || !invoice) {
    return (
      <div
        className={cn(
          'text-center py-16 rounded-lg border',
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        )}
      >
        <h3 className={cn('text-lg font-medium mb-2', isDark ? 'text-white' : 'text-slate-900')}>
          Invoice Not Found
        </h3>
        <p className={cn('text-sm mb-4', isDark ? 'text-slate-400' : 'text-slate-500')}>
          The invoice you're looking for doesn't exist or you don't have access.
        </p>
        <button
          onClick={() => navigate('/dashboard/invoices')}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
          )}
        >
          Back to Invoices
        </button>
      </div>
    );
  }

  // Only DRAFT invoices can be edited
  if (invoice.status !== 'DRAFT') {
    return (
      <div
        className={cn(
          'text-center py-16 rounded-lg border',
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        )}
      >
        <h3 className={cn('text-lg font-medium mb-2', isDark ? 'text-white' : 'text-slate-900')}>
          Cannot Edit Invoice
        </h3>
        <p className={cn('text-sm mb-4', isDark ? 'text-slate-400' : 'text-slate-500')}>
          Only draft invoices can be edited. This invoice has been {invoice.status.toLowerCase()}.
        </p>
        <button
          onClick={() => navigate(`/dashboard/invoices/${id}`)}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
          )}
        >
          View Invoice
        </button>
      </div>
    );
  }

  // Redirect if no permission
  if (!canEdit) {
    return (
      <div
        className={cn(
          'text-center py-16 rounded-lg border',
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        )}
      >
        <h3 className={cn('text-lg font-medium mb-2', isDark ? 'text-white' : 'text-slate-900')}>
          Access Denied
        </h3>
        <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
          You do not have permission to edit invoices.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn('text-xl font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
            Edit Invoice
          </h1>
          <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Editing invoice {invoice.invoiceNumber} for trade {selectedTrade?.tradeNumber || invoice.tradeNumber}
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {errors.general && (
        <div
          className={cn(
            'px-4 py-3 rounded-lg border text-sm',
            isDark
              ? 'bg-red-900/30 border-red-500/30 text-red-400'
              : 'bg-red-50 border-red-200 text-red-700'
          )}
        >
          {errors.general}
        </div>
      )}

      {/* Invoice Header */}
      <InvoiceHeader
        trade={selectedTrade}
        invoiceDate={formData.invoiceDate}
        dueDate={formData.dueDate}
        currency={currency}
        isDark={isDark}
        onBack={() => navigate(`/dashboard/invoices/${id}`)}
        onInvoiceDateChange={(date) => handleDateChange('invoiceDate', date)}
        onDueDateChange={(date) => handleDateChange('dueDate', date)}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Line Items Grid - 3 columns */}
        <div className="lg:col-span-3">
          <InvoiceLineItemsGrid
            lineItems={formData.lineItems}
            onChange={handleLineItemsChange}
            isDark={isDark}
            currency={currency}
          />
          {errors.lineItems && (
            <p className="mt-2 text-sm text-red-500">{errors.lineItems}</p>
          )}
        </div>

        {/* Totals Panel - 1 column */}
        <div className="lg:col-span-1">
          <InvoiceTotalsPanel
            lineItems={formData.lineItems}
            currency={currency}
            // Tax props
            taxMode={formData.taxMode}
            taxPercent={parseNumericInput(formData.taxPercent)}
            taxAmount={parseNumericInput(formData.taxAmount)}
            onTaxModeChange={handleTaxModeChange}
            onTaxPercentChange={handleTaxPercentChange}
            onTaxAmountChange={handleTaxAmountChange}
            // Discount props
            discountMode={formData.discountMode}
            discountPercent={parseNumericInput(formData.discountPercent)}
            discountAmount={parseNumericInput(formData.discountAmount)}
            onDiscountModeChange={handleDiscountModeChange}
            onDiscountPercentChange={handleDiscountPercentChange}
            onDiscountAmountChange={handleDiscountAmountChange}
            isDark={isDark}
            isEditable={true}
          />
        </div>
      </div>

      {/* Actions Bar */}
      <InvoiceActionsBar
        userRole={role}
        isDark={isDark}
        isNew={false}
        isDirty={isDirty}
        isValid={!!isValid}
        isSaving={isUpdating}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
    </div>
  );
};

export default InvoiceEditPage;
