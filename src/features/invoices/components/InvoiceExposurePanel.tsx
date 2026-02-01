import React from 'react';
import { TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import { cn, formatCurrency, formatPercentage } from '../../../utils/helpers';
import type { Invoice } from '../types';
import { calculateHedgePercentage, getExposureStatusLabel, hasExposure } from '../invoiceUtils';

interface InvoiceExposurePanelProps {
  invoice: Invoice;
  isDark?: boolean;
}

export const InvoiceExposurePanel: React.FC<InvoiceExposurePanelProps> = ({
  invoice,
  isDark = false,
}) => {
  if (!hasExposure(invoice)) {
    return (
      <div
        className={cn(
          'rounded-lg border p-4',
          isDark ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-slate-50'
        )}
      >
        <div className="flex items-center gap-2">
          <TrendingUp className={cn('w-4 h-4', isDark ? 'text-slate-500' : 'text-slate-400')} />
          <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Exposure will be created when invoice is issued
          </span>
        </div>
      </div>
    );
  }

  const hedgePercentage = calculateHedgePercentage(invoice);
  const exposureStatus = getExposureStatusLabel(invoice);
  const exposedAmount = invoice.exposedAmount || invoice.invoiceAmount;
  const hedgedAmount = invoice.hedgedAmount || 0;
  const unhedgedAmount = invoice.unhedgedAmount || exposedAmount - hedgedAmount;

  // Determine status color
  const getStatusColor = () => {
    if (hedgePercentage >= 100) return isDark ? 'text-emerald-400' : 'text-emerald-600';
    if (hedgePercentage >= 50) return isDark ? 'text-amber-400' : 'text-amber-600';
    return isDark ? 'text-red-400' : 'text-red-600';
  };

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
          isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
        )}
      >
        <div className="flex items-center gap-2">
          <TrendingUp className={cn('w-4 h-4', isDark ? 'text-slate-400' : 'text-slate-500')} />
          <h3 className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
            Forex Exposure
          </h3>
        </div>
        <span
          className={cn(
            'px-2 py-0.5 text-xs font-medium rounded',
            hedgePercentage >= 100
              ? isDark
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-emerald-50 text-emerald-700'
              : hedgePercentage >= 50
              ? isDark
                ? 'bg-amber-500/10 text-amber-400'
                : 'bg-amber-50 text-amber-700'
              : isDark
              ? 'bg-red-500/10 text-red-400'
              : 'bg-red-50 text-red-700'
          )}
        >
          {exposureStatus}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Hedge Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Hedge Coverage
            </span>
            <span className={cn('text-sm font-semibold', getStatusColor())}>
              {formatPercentage(hedgePercentage)}
            </span>
          </div>
          <div
            className={cn(
              'h-2 rounded-full overflow-hidden',
              isDark ? 'bg-slate-700' : 'bg-slate-200'
            )}
          >
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                hedgePercentage >= 100
                  ? 'bg-emerald-500'
                  : hedgePercentage >= 50
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              )}
              style={{ width: `${Math.min(hedgePercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Amounts Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Exposed */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className={cn('w-3 h-3', isDark ? 'text-slate-500' : 'text-slate-400')} />
              <span className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Exposed
              </span>
            </div>
            <p
              className={cn(
                'font-mono text-sm tabular-nums',
                isDark ? 'text-white' : 'text-slate-900'
              )}
            >
              {formatCurrency(exposedAmount, invoice.currency, false)}
            </p>
          </div>

          {/* Hedged */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Shield className={cn('w-3 h-3', isDark ? 'text-emerald-500' : 'text-emerald-600')} />
              <span className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Hedged
              </span>
            </div>
            <p
              className={cn(
                'font-mono text-sm tabular-nums',
                isDark ? 'text-emerald-400' : 'text-emerald-600'
              )}
            >
              {formatCurrency(hedgedAmount, invoice.currency, false)}
            </p>
          </div>

          {/* Unhedged */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle
                className={cn(
                  'w-3 h-3',
                  unhedgedAmount > 0
                    ? isDark
                      ? 'text-amber-500'
                      : 'text-amber-600'
                    : isDark
                    ? 'text-slate-500'
                    : 'text-slate-400'
                )}
              />
              <span className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Unhedged
              </span>
            </div>
            <p
              className={cn(
                'font-mono text-sm tabular-nums',
                unhedgedAmount > 0
                  ? isDark
                    ? 'text-amber-400'
                    : 'text-amber-600'
                  : isDark
                  ? 'text-slate-400'
                  : 'text-slate-500'
              )}
            >
              {formatCurrency(unhedgedAmount, invoice.currency, false)}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      {unhedgedAmount > 0 && (
        <div
          className={cn(
            'px-4 py-2 border-t text-xs flex items-center gap-2',
            isDark ? 'border-slate-700 bg-amber-500/5 text-amber-400' : 'border-slate-200 bg-amber-50 text-amber-700'
          )}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Unhedged exposure is subject to forex risk
        </div>
      )}
    </div>
  );
};

export default InvoiceExposurePanel;
