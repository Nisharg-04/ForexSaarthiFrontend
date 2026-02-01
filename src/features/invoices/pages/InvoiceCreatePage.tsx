import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, useAppSelector } from '../../../hooks/useRedux';
import { cn, formatApiDate } from '../../../utils/helpers';
import { useCreateInvoiceMutation } from '../api/invoiceApi';
import { useGetTradeQuery } from '../../trades/api/tradeApi';
import type { TradeForSelection, LineItemFormData, InvoiceFormData, InvoiceFormErrors } from '../types';
import { InvoiceHeader } from '../components/InvoiceHeader';
import { InvoiceLineItemsGrid } from '../components/InvoiceLineItemsGrid';
import { InvoiceTotalsPanel } from '../components/InvoiceTotalsPanel';
import { InvoiceActionsBar } from '../components/InvoiceActionsBar';
import { TradeSelectorDrawer } from '../components/TradeSelectorDrawer';
import {
  createEmptyLineItem,
  validateInvoiceForm,
  convertLineItemsForApi,
  canCreateInvoice,
} from '../invoiceUtils';

export const InvoiceCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tradeIdFromUrl = searchParams.get('tradeId');

  const { role } = useAuth();
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';

  // Check permission
  const canCreate = canCreateInvoice(role);

  // State
  const [isDrawerOpen, setIsDrawerOpen] = useState(!tradeIdFromUrl);
  const [selectedTrade, setSelectedTrade] = useState<TradeForSelection | null>(null);
  const [formData, setFormData] = useState<InvoiceFormData>({
    tradeId: tradeIdFromUrl || '',
    invoiceDate: formatApiDate(new Date()),
    dueDate: '',
    lineItems: [createEmptyLineItem()],
  });
  const [errors, setErrors] = useState<InvoiceFormErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  // API Hooks
  const [createInvoice, { isLoading: isCreating }] = useCreateInvoiceMutation();

  // If tradeId is in URL, fetch trade details
  const { data: tradeData } = useGetTradeQuery(tradeIdFromUrl || '', {
    skip: !tradeIdFromUrl,
  });

  // Set trade from URL on mount
  useEffect(() => {
    if (tradeData?.data && tradeIdFromUrl) {
      const trade = tradeData.data;
      setSelectedTrade({
        id: trade.id,
        tradeNumber: trade.tradeNumber,
        tradeType: trade.tradeType,
        partyId: trade.partyId,
        partyName: trade.partyName || 'Unknown Party',
        createdAt: trade.createdAt,
      });
      setFormData((prev) => ({ ...prev, tradeId: trade.id }));
    }
  }, [tradeData, tradeIdFromUrl]);

  // Calculate default due date (30 days from invoice date)
  useEffect(() => {
    if (formData.invoiceDate && !formData.dueDate) {
      const invoiceDate = new Date(formData.invoiceDate);
      invoiceDate.setDate(invoiceDate.getDate() + 30);
      setFormData((prev) => ({ ...prev, dueDate: formatApiDate(invoiceDate) }));
    }
  }, [formData.invoiceDate, formData.dueDate]);

  // Handlers
  const handleTradeSelect = useCallback((trade: TradeForSelection) => {
    setSelectedTrade(trade);
    setFormData((prev) => ({ ...prev, tradeId: trade.id }));
    setIsDrawerOpen(false);
    setIsDirty(true);
    // Update URL without navigation
    window.history.replaceState(null, '', `/dashboard/invoices/new?tradeId=${trade.id}`);
  }, []);

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

  const handleSave = useCallback(async () => {
    // Validate form
    const validationErrors = validateInvoiceForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const result = await createInvoice({
        tradeId: formData.tradeId,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        lineItems: convertLineItemsForApi(formData.lineItems),
      }).unwrap();

      // Navigate to the created invoice
      navigate(`/dashboard/invoices/${result.data.id}`);
    } catch (error) {
      console.error('Failed to create invoice:', error);
      setErrors({ general: 'Failed to create invoice. Please try again.' });
    }
  }, [formData, createInvoice, navigate]);

  const handleDiscard = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm('Discard unsaved changes?');
      if (!confirmed) return;
    }
    navigate('/dashboard/invoices');
  }, [isDirty, navigate]);

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

  // Currency from trade (would normally come from party/trade)
  const currency = 'USD'; // TODO: Get from trade/party

  // Redirect if no permission
  if (!canCreate) {
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
          You do not have permission to create invoices.
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
            Create Invoice
          </h1>
          <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
            {selectedTrade
              ? `Creating invoice for trade ${selectedTrade.tradeNumber}`
              : 'Select a trade to create an invoice'}
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
        onBack={() => navigate('/dashboard/invoices')}
        onInvoiceDateChange={(date) => handleDateChange('invoiceDate', date)}
        onDueDateChange={(date) => handleDateChange('dueDate', date)}
      />

      {/* No Trade Selected State */}
      {!selectedTrade && (
        <div
          className={cn(
            'text-center py-12 rounded-lg border-2 border-dashed',
            isDark ? 'border-slate-700 bg-slate-800/30' : 'border-slate-300 bg-slate-50'
          )}
        >
          <div
            className={cn(
              'w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center',
              isDark ? 'bg-slate-700' : 'bg-slate-200'
            )}
          >
            <span className="text-2xl">📋</span>
          </div>
          <h3 className={cn('text-lg font-medium mb-2', isDark ? 'text-white' : 'text-slate-900')}>
            Select a Trade
          </h3>
          <p className={cn('text-sm mb-4', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Choose an approved trade to create an invoice
          </p>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              isDark ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'
            )}
          >
            Select Trade
          </button>
        </div>
      )}

      {/* Main Content (when trade is selected) */}
      {selectedTrade && (
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
              isDark={isDark}
            />
          </div>
        </div>
      )}

      {/* Actions Bar */}
      {selectedTrade && (
        <InvoiceActionsBar
          userRole={role}
          isDark={isDark}
          isNew={true}
          isDirty={isDirty}
          isValid={isValid}
          isSaving={isCreating}
          onSave={handleSave}
          onDiscard={handleDiscard}
        />
      )}

      {/* Trade Selector Drawer */}
      <TradeSelectorDrawer
        isOpen={isDrawerOpen}
        isDark={isDark}
        onClose={() => {
          setIsDrawerOpen(false);
          if (!selectedTrade) {
            navigate('/dashboard/invoices');
          }
        }}
        onSelect={handleTradeSelect}
      />
    </div>
  );
};

export default InvoiceCreatePage;
