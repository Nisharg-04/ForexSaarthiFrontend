import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Loader2, CreditCard } from 'lucide-react';
import { useAuth, useAppSelector } from '../../../hooks/useRedux';
import { cn, formatDate, formatDateTime, formatCurrency } from '../../../utils/helpers';
import { useGetInvoiceQuery, useIssueInvoiceMutation, useCancelInvoiceMutation } from '../api/invoiceApi';
import { useGetCompanyQuery } from '../../../services/companyApi';
import { useGetPartyQuery } from '../../parties/api/partyApi';
import type { TradeForSelection, LineItemFormData } from '../types';
import { InvoiceHeader } from '../components/InvoiceHeader';
import { InvoiceLineItemsGrid } from '../components/InvoiceLineItemsGrid';
import { InvoiceActionsBar } from '../components/InvoiceActionsBar';
import { InvoiceStatusBadge } from '../components/InvoiceStatusBadge';
import { InvoiceExposurePanel } from '../components/InvoiceExposurePanel';
import { InvoicePrintButton } from '../components/InvoicePrintButton';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { PaymentHistoryPanel } from '../components/PaymentHistoryPanel';
import { canIssueInvoice, canCancelInvoice, hasExposure, convertLineItemsFromApi, canRecordPayment, hasOutstandingBalance, resolveInvoicePaymentAmounts } from '../invoiceUtils';
import { InvoiceStatus } from '../types';

export const InvoiceDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { role, companyId } = useAuth();
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';

  // API Hooks
  const { data, isLoading, error } = useGetInvoiceQuery(id || '', { skip: !id });
  const [issueInvoice, { isLoading: isIssuing }] = useIssueInvoiceMutation();
  const [cancelInvoice, { isLoading: isCancelling }] = useCancelInvoiceMutation();

  const invoice = data?.data;

  // Fetch company and party data for PDF generation
  const { data: companyData } = useGetCompanyQuery(companyId || '', { skip: !companyId });
  const { data: partyData } = useGetPartyQuery(invoice?.partyId || '', { skip: !invoice?.partyId });

  const company = companyData?.data;
  const party = partyData?.data;

  // Convert invoice line items to form format for display
  const lineItemsForDisplay: LineItemFormData[] = invoice
    ? convertLineItemsFromApi(invoice.lineItems)
    : [];

  // Build trade selection object for header
  const tradeForHeader: TradeForSelection | null = invoice
    ? {
        id: invoice.tradeId,
        tradeNumber: invoice.tradeNumber || '',
        tradeType: invoice.invoiceType,
        partyId: invoice.partyId,
        partyName: invoice.partyName || '',
        createdAt: invoice.createdAt,
      }
    : null;

  // Handlers
  const handleBack = useCallback(() => {
    navigate('/dashboard/invoices');
  }, [navigate]);

  const handleEdit = useCallback(() => {
    navigate(`/dashboard/invoices/${id}/edit`);
  }, [navigate, id]);

  const handleIssue = useCallback(async () => {
    if (!id) return;
    try {
      await issueInvoice(id).unwrap();
    } catch (error) {
      console.error('Failed to issue invoice:', error);
    }
  }, [id, issueInvoice]);

  const handleCancel = useCallback(
    async (reason: string) => {
      if (!id) return;
      try {
        await cancelInvoice({ id, Reason: reason }).unwrap();
      } catch (error) {
        console.error('Failed to cancel invoice:', error);
      }
    },
    [id, cancelInvoice]
  );

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleOpenPaymentModal = useCallback(() => {
    setIsPaymentModalOpen(true);
  }, []);

  const handleClosePaymentModal = useCallback(() => {
    setIsPaymentModalOpen(false);
  }, []);

  // Loading State
  if (isLoading) {
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
  if (error || !invoice) {
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
          The requested invoice could not be found.
        </p>
        <button
          onClick={handleBack}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            isDark ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'
          )}
        >
          Back to Invoices
        </button>
      </div>
    );
  }

  const isDraft = invoice.status === InvoiceStatus.DRAFT;
  const canIssue = canIssueInvoice(role, invoice);
  const canCancel = canCancelInvoice(role, invoice);
  const showExposure = hasExposure(invoice);
  const showPayments = !isDraft && invoice.status !== InvoiceStatus.CANCELLED;
  const canPayment = canRecordPayment(role, invoice) && hasOutstandingBalance(invoice);
  const { paidAmount: resolvedPaidAmount, outstandingAmount: resolvedOutstandingAmount } =
    resolveInvoicePaymentAmounts(invoice);

  return (
    <div className="space-y-4">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className={cn(
            'flex items-center gap-2 text-sm font-medium transition-colors',
            isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </button>

        <div className="flex items-center gap-3">
          <InvoiceStatusBadge status={invoice.status} isDark={isDark} />

          {/* Record Payment Button */}
          {canPayment && (
            <button
              onClick={handleOpenPaymentModal}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                isDark
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              )}
            >
              <CreditCard className="w-4 h-4" />
              Record Payment
            </button>
          )}

          {/* Print/Download Button */}
          <InvoicePrintButton
            invoice={invoice}
            company={company}
            party={party}
            isDark={isDark}
            variant="dropdown"
            size="md"
          />

          {isDraft && (
            <button
              onClick={handleEdit}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
                isDark
                  ? 'border-slate-600 text-white hover:bg-slate-700'
                  : 'border-slate-300 text-slate-900 hover:bg-slate-100'
              )}
            >
              Edit Invoice
            </button>
          )}
        </div>
      </div>

      {/* Invoice Header */}
      <InvoiceHeader
        trade={tradeForHeader}
        invoiceDate={invoice.invoiceDate}
        dueDate={invoice.dueDate}
        currency={invoice.currency}
        isDark={isDark}
        isReadOnly={true}
        invoiceNumber={invoice.invoiceNumber}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Line Items - 3 columns */}
        <div className="lg:col-span-3 space-y-4">
          <InvoiceLineItemsGrid
            lineItems={lineItemsForDisplay}
            onChange={() => {}}
            isDark={isDark}
            isReadOnly={true}
            currency={invoice.currency}
          />

          {/* Audit Information */}
          <div
            className={cn(
              'rounded-lg border overflow-hidden',
              isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
            )}
          >
            <div
              className={cn(
                'px-4 py-3 border-b',
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
              )}
            >
              <h3 className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                Invoice History
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {/* Created */}
              <div className="flex items-start gap-3">
                <div className={cn('p-1.5 rounded', isDark ? 'bg-slate-800' : 'bg-slate-100')}>
                  <User className={cn('w-3.5 h-3.5', isDark ? 'text-slate-400' : 'text-slate-500')} />
                </div>
                <div>
                  <p className={cn('text-sm', isDark ? 'text-white' : 'text-slate-900')}>
                    Created by{' '}
                    <span className="font-medium">{invoice.createdByName || 'System'}</span>
                  </p>
                  <p className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                    {formatDateTime(invoice.createdAt)}
                  </p>
                </div>
              </div>

              {/* Issued */}
              {invoice.issuedAt && (
                <div className="flex items-start gap-3">
                  <div className={cn('p-1.5 rounded', isDark ? 'bg-blue-500/10' : 'bg-blue-50')}>
                    <Clock className={cn('w-3.5 h-3.5', isDark ? 'text-blue-400' : 'text-blue-600')} />
                  </div>
                  <div>
                    <p className={cn('text-sm', isDark ? 'text-white' : 'text-slate-900')}>
                      Issued by{' '}
                      <span className="font-medium">{invoice.issuedByName || 'System'}</span>
                    </p>
                    <p className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                      {formatDateTime(invoice.issuedAt)}
                    </p>
                  </div>
                </div>
              )}

              {/* Cancelled */}
              {invoice.cancelledAt && (
                <div className="flex items-start gap-3">
                  <div className={cn('p-1.5 rounded', isDark ? 'bg-red-500/10' : 'bg-red-50')}>
                    <Clock className={cn('w-3.5 h-3.5', isDark ? 'text-red-400' : 'text-red-600')} />
                  </div>
                  <div>
                    <p className={cn('text-sm', isDark ? 'text-white' : 'text-slate-900')}>
                      Cancelled by{' '}
                      <span className="font-medium">{invoice.cancelledByName || 'System'}</span>
                    </p>
                    <p className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                      {formatDateTime(invoice.cancelledAt)}
                    </p>
                    {invoice.Reason && (
                      <p
                        className={cn(
                          'text-xs mt-1 italic',
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        )}
                      >
                        Reason: {invoice.Reason}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - 1 column */}
        <div className="lg:col-span-1 space-y-4">
          {/* Totals */}
          <div
            className={cn(
              'rounded-lg border overflow-hidden',
              isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
            )}
          >
            <div
              className={cn(
                'px-4 py-3 border-b',
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
              )}
            >
              <h3 className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                Invoice Summary
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {/* Subtotal */}
              <div className="flex justify-between">
                <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Subtotal
                </span>
                <span
                  className={cn(
                    'font-mono text-sm',
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  )}
                >
                  {formatCurrency(invoice.subtotal || invoice.lineItems.reduce((sum, item) => sum + item.lineTotal, 0), invoice.currency)}
                </span>
              </div>

              {/* Discount (if any) */}
              {((invoice.discountPercent ?? 0) > 0 || (invoice.discountAmount ?? 0) > 0) && (
                <div className="flex justify-between">
                  <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Discount {(invoice.discountPercent ?? 0) > 0 && `(${invoice.discountPercent}%)`}
                  </span>
                  <span
                    className={cn(
                      'font-mono text-sm',
                      isDark ? 'text-red-400' : 'text-red-600'
                    )}
                  >
                    -{formatCurrency(invoice.discountAmount ?? 0, invoice.currency, false)}
                  </span>
                </div>
              )}

              {/* Tax (if any) */}
              {((invoice.taxPercent ?? 0) > 0 || (invoice.taxAmount ?? 0) > 0) && (
                <div className="flex justify-between">
                  <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Tax {(invoice.taxPercent ?? 0) > 0 && `(${invoice.taxPercent}%)`}
                  </span>
                  <span
                    className={cn(
                      'font-mono text-sm',
                      isDark ? 'text-amber-400' : 'text-amber-600'
                    )}
                  >
                    +{formatCurrency(invoice.taxAmount ?? 0, invoice.currency, false)}
                  </span>
                </div>
              )}

              {/* Divider before Invoice Amount */}
              <div
                className={cn('pt-3 border-t', isDark ? 'border-slate-700' : 'border-slate-200')}
              >
                <div className="flex justify-between">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    Invoice Amount
                  </span>
                  <span
                    className={cn(
                      'font-mono text-sm font-semibold',
                      isDark ? 'text-emerald-400' : 'text-emerald-600'
                    )}
                  >
                    {invoice.currency} {formatCurrency(invoice.invoiceAmount, invoice.currency, false)}
                  </span>
                </div>
              </div>

              {/* Paid Amount */}
              <div className="flex justify-between">
                <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Paid Amount
                </span>
                <span
                  className={cn(
                    'font-mono text-sm',
                    isDark ? 'text-emerald-400' : 'text-emerald-600'
                  )}
                >
                  {formatCurrency(resolvedPaidAmount, invoice.currency, false)}
                </span>
              </div>

              {/* Outstanding */}
              <div
                className={cn('pt-3 border-t', isDark ? 'border-slate-700' : 'border-slate-200')}
              >
                <div className="flex justify-between">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    Outstanding
                  </span>
                  <span
                    className={cn(
                      'font-mono text-sm font-semibold',
                      resolvedOutstandingAmount > 0
                        ? isDark
                          ? 'text-amber-400'
                          : 'text-amber-600'
                        : isDark
                        ? 'text-emerald-400'
                        : 'text-emerald-600'
                    )}
                  >
                    {formatCurrency(resolvedOutstandingAmount, invoice.currency, false)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Exposure Panel (only shown for issued invoices) */}
          {showExposure && <InvoiceExposurePanel invoice={invoice} isDark={isDark} />}

          {/* Due Date Info */}
          <div
            className={cn(
              'rounded-lg border p-4',
              isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className={cn('w-4 h-4', isDark ? 'text-slate-400' : 'text-slate-500')} />
              <span className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                Payment Due
              </span>
            </div>
            <p
              className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}
            >
              {formatDate(invoice.dueDate)}
            </p>
            {new Date(invoice.dueDate) < new Date() && resolvedOutstandingAmount > 0 && (
              <p className={cn('text-xs mt-1', isDark ? 'text-red-400' : 'text-red-600')}>
                ⚠️ Overdue
              </p>
            )}
          </div>

          {/* Payment History Panel (only shown for issued invoices) */}
          {showPayments && (
            <PaymentHistoryPanel
              invoiceId={invoice.id}
              currency={invoice.currency}
              isDark={isDark}
            />
          )}
        </div>
      </div>

      {/* Actions Bar (only for drafts) */}
      {isDraft && (canIssue || canCancel) && (
        <InvoiceActionsBar
          invoice={invoice}
          userRole={role}
          isDark={isDark}
          isDirty={false}
          isValid={true}
          isSaving={false}
          isIssuing={isIssuing}
          isCancelling={isCancelling}
          onSave={handleEdit}
          onIssue={canIssue ? handleIssue : undefined}
          onCancel={canCancel ? handleCancel : undefined}
        />
      )}

      {/* Record Payment Modal */}
      <RecordPaymentModal
        invoice={invoice}
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        isDark={isDark}
      />
    </div>
  );
};

export default InvoiceDetailPage;
