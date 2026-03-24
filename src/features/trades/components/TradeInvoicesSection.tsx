import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Eye, Pencil, Printer, ArrowRight } from 'lucide-react';
import { cn, formatDate, formatCurrency } from '../../../utils/helpers';
import { useGetInvoicesByTradeQuery, useLazyGetInvoiceQuery } from '../../invoices/api/invoiceApi';
import { InvoiceStatusBadge } from '../../invoices/components/InvoiceStatusBadge';
import { canEditInvoice } from '../../invoices/invoiceUtils';
import { downloadInvoicePdf } from '../../invoices/utils/invoicePdfGenerator';
import type { Invoice } from '../../invoices/types';
import type { UserRole } from '../../../types';
import type { TradeStage } from '../types';

interface TradeInvoicesSectionProps {
  tradeId: string;
  tradeNumber: string;
  tradeStage: TradeStage;
  isDark?: boolean;
  userRole?: UserRole;
}

export const TradeInvoicesSection: React.FC<TradeInvoicesSectionProps> = ({
  tradeId,
  tradeNumber,
  tradeStage,
  isDark = false,
  userRole,
}) => {
  // Only allow creating invoices for APPROVED or ACTIVE trades
  const canCreateInvoice = tradeStage === 'APPROVED' || tradeStage === 'ACTIVE';
  const navigate = useNavigate();

  // Fetch invoices for this trade
  const { data, isLoading, error } = useGetInvoicesByTradeQuery(tradeId);
  const [fetchInvoiceById] = useLazyGetInvoiceQuery();

  const invoices = data?.data || [];

  const handleView = (invoice: Invoice) => {
    navigate(`/dashboard/invoices/${invoice.id}`);
  };

  const handleEdit = (invoice: Invoice) => {
    navigate(`/dashboard/invoices/${invoice.id}/edit`);
  };

  const handleCreateInvoice = () => {
    navigate(`/dashboard/invoices/new?tradeId=${tradeId}`);
  };

  const handlePrint = async (invoice: Invoice) => {
    try {
      const fullInvoiceResponse = await fetchInvoiceById(invoice.id).unwrap();
      const fullInvoice = fullInvoiceResponse?.data ?? invoice;
      downloadInvoicePdf({ invoice: fullInvoice });
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div
        className={cn(
          'rounded-lg border overflow-hidden',
          isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
        )}
      >
        <div
          className={cn(
            'px-4 py-3 border-b flex items-center justify-between',
            isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
          )}
        >
          <div className="flex items-center gap-2">
            <FileText className={cn('w-4 h-4', isDark ? 'text-cyan-400' : 'text-teal-600')} />
            <h3 className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
              Invoices
            </h3>
          </div>
        </div>
        <div className="p-4 animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                'h-12 rounded',
                isDark ? 'bg-slate-800' : 'bg-slate-100'
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div
        className={cn(
          'rounded-lg border overflow-hidden',
          isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
        )}
      >
        <div
          className={cn(
            'px-4 py-3 border-b flex items-center justify-between',
            isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
          )}
        >
          <div className="flex items-center gap-2">
            <FileText className={cn('w-4 h-4', isDark ? 'text-cyan-400' : 'text-teal-600')} />
            <h3 className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
              Invoices
            </h3>
          </div>
        </div>
        <div className="p-4 text-center">
          <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Failed to load invoices
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden',
        isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'px-4 py-3 border-b flex items-center justify-between',
          isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
        )}
      >
        <div className="flex items-center gap-2">
          <FileText className={cn('w-4 h-4', isDark ? 'text-cyan-400' : 'text-teal-600')} />
          <h3 className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
            Invoices
          </h3>
          <span
            className={cn(
              'px-1.5 py-0.5 text-xs font-medium rounded',
              isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
            )}
          >
            {invoices.length}
          </span>
        </div>
        {canCreateInvoice && (
          <button
            onClick={handleCreateInvoice}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
              isDark
                ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            )}
          >
            <Plus className="w-3.5 h-3.5" />
            New Invoice
          </button>
        )}
      </div>

      {/* Content */}
      {invoices.length === 0 ? (
        <div className="p-6 text-center">
          <div
            className={cn(
              'w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center',
              isDark ? 'bg-slate-800' : 'bg-slate-100'
            )}
          >
            <FileText className={cn('w-6 h-6', isDark ? 'text-slate-600' : 'text-slate-400')} />
          </div>
          <p className={cn('text-sm mb-3', isDark ? 'text-slate-400' : 'text-slate-500')}>
            No invoices for this trade yet
          </p>
          {canCreateInvoice && (
            <button
              onClick={handleCreateInvoice}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                isDark
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              Create First Invoice
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className={cn(
                'px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer',
                isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
              )}
              onClick={() => handleView(invoice)}
            >
              {/* Invoice Info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Invoice Number */}
                <div className="min-w-0">
                  <p
                    className={cn(
                      'text-sm font-medium truncate',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    {invoice.invoiceNumber}
                  </p>
                  <p
                    className={cn(
                      'text-xs truncate',
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    )}
                  >
                    {formatDate(invoice.invoiceDate)}
                  </p>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <p
                    className={cn(
                      'text-sm font-mono font-medium',
                      isDark ? 'text-emerald-400' : 'text-emerald-600'
                    )}
                  >
                    {formatCurrency(invoice.invoiceAmount, invoice.currency)}
                  </p>
                  {invoice.outstandingAmount > 0 && invoice.outstandingAmount < invoice.invoiceAmount && (
                    <p
                      className={cn(
                        'text-xs font-mono',
                        isDark ? 'text-amber-400' : 'text-amber-600'
                      )}
                    >
                      Due: {formatCurrency(invoice.outstandingAmount, invoice.currency)}
                    </p>
                  )}
                </div>

                {/* Status */}
                <InvoiceStatusBadge status={invoice.status} size="sm" />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 ml-4" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleView(invoice)}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    isDark
                      ? 'hover:bg-slate-700 text-slate-400 hover:text-white'
                      : 'hover:bg-slate-200 text-slate-500 hover:text-slate-700'
                  )}
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {canEditInvoice(userRole, invoice) && (
                  <button
                    onClick={() => handleEdit(invoice)}
                    className={cn(
                      'p-1.5 rounded-lg transition-colors',
                      isDark
                        ? 'hover:bg-slate-700 text-slate-400 hover:text-white'
                        : 'hover:bg-slate-200 text-slate-500 hover:text-slate-700'
                    )}
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handlePrint(invoice)}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    isDark
                      ? 'hover:bg-slate-700 text-slate-400 hover:text-white'
                      : 'hover:bg-slate-200 text-slate-500 hover:text-slate-700'
                  )}
                  title="Print"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* View All Link */}
          {invoices.length > 3 && (
            <div
              className={cn(
                'px-4 py-2 text-center border-t',
                isDark ? 'border-slate-700' : 'border-slate-200'
              )}
            >
              <button
                onClick={() => navigate(`/dashboard/invoices?tradeId=${tradeId}`)}
                className={cn(
                  'inline-flex items-center gap-1 text-xs font-medium transition-colors',
                  isDark
                    ? 'text-cyan-400 hover:text-cyan-300'
                    : 'text-teal-600 hover:text-teal-700'
                )}
              >
                View all invoices
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TradeInvoicesSection;
