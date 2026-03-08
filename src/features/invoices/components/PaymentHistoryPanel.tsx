import React from 'react';
import { CreditCard, Calendar, ArrowDownRight, User, Loader2 } from 'lucide-react';
import { cn, formatCurrency, formatDate, formatDateTime, formatPercentage } from '../../../utils/helpers';
import { useGetInvoicePaymentsQuery } from '../api/paymentApi';
import { PAYMENT_METHOD_OPTIONS } from '../invoiceConstants';
import type { InvoicePaymentHistoryItem } from '../types';

interface PaymentHistoryPanelProps {
  invoiceId: string;
  currency: string;
  isDark?: boolean;
}

// Helper to get payment method label
const getPaymentMethodLabel = (method: string): string => {
  const option = PAYMENT_METHOD_OPTIONS.find((opt) => opt.value === method);
  return option?.label || method;
};

export const PaymentHistoryPanel: React.FC<PaymentHistoryPanelProps> = ({
  invoiceId,
  currency,
  isDark = false,
}) => {
  const { data, isLoading, error } = useGetInvoicePaymentsQuery(invoiceId);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn(
          'rounded-lg border p-6',
          isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
        )}
      >
        <div className="flex items-center justify-center gap-2">
          <Loader2 className={cn('w-5 h-5 animate-spin', isDark ? 'text-slate-400' : 'text-slate-500')} />
          <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Loading payments...
          </span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          'rounded-lg border p-6',
          isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
        )}
      >
        <p className={cn('text-sm text-center', isDark ? 'text-red-400' : 'text-red-600')}>
          Failed to load payment history
        </p>
      </div>
    );
  }

  const summary = data;
  const payments = summary?.payments || [];

  // No payments yet
  if (payments.length === 0) {
    return (
      <div
        className={cn(
          'rounded-lg border p-6',
          isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
        )}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <CreditCard className={cn('w-8 h-8', isDark ? 'text-slate-600' : 'text-slate-300')} />
          <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
            No payments recorded yet
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
          'flex items-center justify-between px-4 py-3 border-b',
          isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
        )}
      >
        <div className="flex items-center gap-2">
          <CreditCard className={cn('w-4 h-4', isDark ? 'text-slate-400' : 'text-slate-500')} />
          <h3 className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
            Payment History
          </h3>
        </div>
        <span className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
          {payments.length} payment{payments.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div
          className={cn(
            'grid grid-cols-3 gap-4 p-4 border-b',
            isDark ? 'border-slate-700' : 'border-slate-200'
          )}
        >
          <div>
            <p className={cn('text-xs mb-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Total Paid
            </p>
            <p className={cn('text-sm font-semibold', isDark ? 'text-emerald-400' : 'text-emerald-600')}>
              {currency} {formatCurrency(summary.totalPaidAmount, currency, false)}
            </p>
          </div>
          <div>
            <p className={cn('text-xs mb-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Outstanding
            </p>
            <p
              className={cn(
                'text-sm font-semibold',
                summary.outstandingAmount > 0
                  ? isDark
                    ? 'text-amber-400'
                    : 'text-amber-600'
                  : isDark
                  ? 'text-emerald-400'
                  : 'text-emerald-600'
              )}
            >
              {currency} {formatCurrency(summary.outstandingAmount, currency, false)}
            </p>
          </div>
          <div>
            <p className={cn('text-xs mb-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Paid %
            </p>
            <p className={cn('text-sm font-semibold', isDark ? 'text-cyan-400' : 'text-teal-600')}>
              {formatPercentage(summary.paymentPercentage)}
            </p>
          </div>
        </div>
      )}

      {/* Payment Progress Bar */}
      {summary && (
        <div className="px-4 py-3">
          <div
            className={cn(
              'h-2 rounded-full overflow-hidden',
              isDark ? 'bg-slate-700' : 'bg-slate-200'
            )}
          >
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                summary.paymentPercentage >= 100
                  ? 'bg-emerald-500'
                  : summary.paymentPercentage >= 50
                  ? 'bg-amber-500'
                  : 'bg-cyan-500'
              )}
              style={{ width: `${Math.min(summary.paymentPercentage, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Payments List */}
      <div className="divide-y divide-slate-700/50">
        {payments.map((payment: InvoicePaymentHistoryItem, index: number) => (
          <PaymentHistoryItem
            key={payment.id}
            payment={payment}
            currency={currency}
            index={index + 1}
            isDark={isDark}
          />
        ))}
      </div>
    </div>
  );
};

// Individual payment history item
interface PaymentHistoryItemProps {
  payment: InvoicePaymentHistoryItem;
  currency: string;
  index: number;
  isDark: boolean;
}

const PaymentHistoryItem: React.FC<PaymentHistoryItemProps> = ({
  payment,
  currency,
  index,
  isDark,
}) => {
  return (
    <div
      className={cn(
        'p-4 transition-colors',
        isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
              isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
            )}
          >
            {index}
          </span>
          <div>
            <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
              {currency} {formatCurrency(payment.amountInForeignCurrency, currency, false)}
            </p>
            <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
              @ {payment.exchangeRate.toFixed(4)} = INR {formatCurrency(payment.amountInBaseCurrency, 'INR', false)}
            </p>
          </div>
        </div>
        <span
          className={cn(
            'px-2 py-0.5 text-xs font-medium rounded',
            isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
          )}
        >
          {getPaymentMethodLabel(payment.paymentMethod)}
        </span>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2 text-xs ml-8">
        <div className="flex items-center gap-1.5">
          <Calendar className={cn('w-3 h-3', isDark ? 'text-slate-500' : 'text-slate-400')} />
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            {formatDate(payment.paymentDate)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <User className={cn('w-3 h-3', isDark ? 'text-slate-500' : 'text-slate-400')} />
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            {payment.recordedBy}
          </span>
        </div>
      </div>

      {/* Reference */}
      {payment.paymentReference && (
        <div className="mt-2 ml-8">
          <p className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
            Ref: {payment.paymentReference}
          </p>
        </div>
      )}

      {/* Outstanding change */}
      <div
        className={cn(
          'mt-2 ml-8 flex items-center gap-2 text-xs',
          isDark ? 'text-slate-500' : 'text-slate-400'
        )}
      >
        <ArrowDownRight className="w-3 h-3" />
        <span>
          Outstanding: {currency} {formatCurrency(payment.outstandingBefore, currency, false)} → {currency} {formatCurrency(payment.outstandingAfter, currency, false)}
        </span>
      </div>

      {/* Remarks */}
      {payment.remarks && (
        <div
          className={cn(
            'mt-2 ml-8 p-2 rounded text-xs italic',
            isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
          )}
        >
          {payment.remarks}
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryPanel;
