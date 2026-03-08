import React, { useState, useCallback, useMemo } from 'react';
import { X, DollarSign, Calendar, CreditCard, FileText, Loader2 } from 'lucide-react';
import { cn, formatCurrency } from '../../../utils/helpers';
import { useCreatePaymentMutation } from '../api/paymentApi';
import type { Invoice, PaymentFormData, PaymentFormErrors } from '../types';
import { PAYMENT_METHOD_OPTIONS, PAYMENT_VALIDATION } from '../invoiceConstants';

interface RecordPaymentModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  isDark?: boolean;
}

const getInitialFormData = (): PaymentFormData => ({
  amountInForeignCurrency: '',
  exchangeRate: '1',
  paymentDate: new Date().toISOString().split('T')[0],
  paymentReference: '',
  paymentMethod: 'BANK_TRANSFER',
  remarks: '',
});

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onSuccess,
  isDark = false,
}) => {
  const [formData, setFormData] = useState<PaymentFormData>(getInitialFormData);
  const [errors, setErrors] = useState<PaymentFormErrors>({});
  
  const [createPayment, { isLoading }] = useCreatePaymentMutation();

  // Calculate amount in base currency
  const amountInBaseCurrency = useMemo(() => {
    const amount = parseFloat(formData.amountInForeignCurrency) || 0;
    const rate = parseFloat(formData.exchangeRate) || 1;
    return amount * rate;
  }, [formData.amountInForeignCurrency, formData.exchangeRate]);

  // Validate form
  const validateForm = useCallback((): PaymentFormErrors => {
    const newErrors: PaymentFormErrors = {};
    const amount = parseFloat(formData.amountInForeignCurrency);
    const rate = parseFloat(formData.exchangeRate);

    // Amount validation
    if (!formData.amountInForeignCurrency || isNaN(amount)) {
      newErrors.amountInForeignCurrency = 'Amount is required';
    } else if (amount < PAYMENT_VALIDATION.amountInForeignCurrency.min) {
      newErrors.amountInForeignCurrency = `Minimum amount is ${PAYMENT_VALIDATION.amountInForeignCurrency.min}`;
    } else if (amount > (invoice.outstandingAmount || 0)) {
      newErrors.amountInForeignCurrency = `Amount cannot exceed outstanding balance (${formatCurrency(invoice.outstandingAmount, invoice.currency, false)})`;
    }

    // Exchange rate validation
    if (!formData.exchangeRate || isNaN(rate)) {
      newErrors.exchangeRate = 'Exchange rate is required';
    } else if (rate < PAYMENT_VALIDATION.exchangeRate.min) {
      newErrors.exchangeRate = `Minimum rate is ${PAYMENT_VALIDATION.exchangeRate.min}`;
    } else if (rate > PAYMENT_VALIDATION.exchangeRate.max) {
      newErrors.exchangeRate = `Maximum rate is ${PAYMENT_VALIDATION.exchangeRate.max}`;
    }

    // Payment date validation
    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
    }

    // Payment reference validation
    if (!formData.paymentReference.trim()) {
      newErrors.paymentReference = 'Payment reference is required';
    } else if (formData.paymentReference.length > PAYMENT_VALIDATION.paymentReference.maxLength) {
      newErrors.paymentReference = `Maximum ${PAYMENT_VALIDATION.paymentReference.maxLength} characters`;
    }

    // Payment method validation
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    return newErrors;
  }, [formData, invoice.outstandingAmount, invoice.currency]);

  // Handle input changes
  const handleChange = useCallback((field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined, general: undefined }));
  }, []);

  // Handle submit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await createPayment({
        invoiceId: invoice.id,
        amountInForeignCurrency: parseFloat(formData.amountInForeignCurrency),
        exchangeRate: parseFloat(formData.exchangeRate),
        paymentDate: new Date(formData.paymentDate).toISOString(),
        paymentReference: formData.paymentReference.trim(),
        paymentMethod: formData.paymentMethod,
        remarks: formData.remarks.trim() || undefined,
      }).unwrap();

      // Reset form and close
      setFormData(getInitialFormData());
      setErrors({});
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      console.error('Failed to record payment:', error);
      const apiError = error as { data?: { detail?: string; message?: string } };
      setErrors({
        general: apiError?.data?.detail || apiError?.data?.message || 'Failed to record payment. Please try again.',
      });
    }
  }, [formData, invoice.id, validateForm, createPayment, onSuccess, onClose]);

  // Handle close
  const handleClose = useCallback(() => {
    if (!isLoading) {
      setFormData(getInitialFormData());
      setErrors({});
      onClose();
    }
  }, [isLoading, onClose]);

  // Fill full outstanding amount
  const handleFillOutstanding = useCallback(() => {
    handleChange('amountInForeignCurrency', String(invoice.outstandingAmount || 0));
  }, [invoice.outstandingAmount, handleChange]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-lg mx-4 rounded-xl shadow-2xl overflow-hidden',
          isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'flex items-center justify-between px-6 py-4 border-b',
            isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
          )}
        >
          <div>
            <h2 className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
              Record Payment
            </h2>
            <p className={cn('text-sm mt-0.5', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Invoice {invoice.invoiceNumber} • Outstanding: {invoice.currency} {formatCurrency(invoice.outstandingAmount, invoice.currency, false)}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Banner */}
          {errors.general && (
            <div
              className={cn(
                'px-4 py-3 rounded-lg text-sm',
                isDark
                  ? 'bg-red-900/30 text-red-400 border border-red-500/30'
                  : 'bg-red-50 text-red-700 border border-red-200'
              )}
            >
              {errors.general}
            </div>
          )}

          {/* Amount */}
          <div>
            <label className={cn('block text-sm font-medium mb-1.5', isDark ? 'text-slate-300' : 'text-slate-700')}>
              Payment Amount ({invoice.currency}) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className={cn('w-4 h-4', isDark ? 'text-slate-500' : 'text-slate-400')} />
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={invoice.outstandingAmount}
                value={formData.amountInForeignCurrency}
                onChange={(e) => handleChange('amountInForeignCurrency', e.target.value)}
                className={cn(
                  'w-full pl-10 pr-24 py-2.5 rounded-lg border text-sm font-mono transition-colors',
                  errors.amountInForeignCurrency
                    ? 'border-red-500 focus:ring-red-500'
                    : isDark
                    ? 'bg-slate-800 border-slate-600 text-white focus:border-cyan-500 focus:ring-cyan-500/20'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20',
                  'focus:outline-none focus:ring-2'
                )}
                placeholder="0.00"
              />
              <button
                type="button"
                onClick={handleFillOutstanding}
                className={cn(
                  'absolute inset-y-0 right-0 px-3 text-xs font-medium transition-colors',
                  isDark
                    ? 'text-cyan-400 hover:text-cyan-300'
                    : 'text-teal-600 hover:text-teal-700'
                )}
              >
                Full Amount
              </button>
            </div>
            {errors.amountInForeignCurrency && (
              <p className="mt-1 text-sm text-red-500">{errors.amountInForeignCurrency}</p>
            )}
          </div>

          {/* Exchange Rate & Base Currency Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={cn('block text-sm font-medium mb-1.5', isDark ? 'text-slate-300' : 'text-slate-700')}>
                Exchange Rate <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.0001"
                min="0.0001"
                value={formData.exchangeRate}
                onChange={(e) => handleChange('exchangeRate', e.target.value)}
                className={cn(
                  'w-full px-3 py-2.5 rounded-lg border text-sm font-mono transition-colors',
                  errors.exchangeRate
                    ? 'border-red-500 focus:ring-red-500'
                    : isDark
                    ? 'bg-slate-800 border-slate-600 text-white focus:border-cyan-500 focus:ring-cyan-500/20'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20',
                  'focus:outline-none focus:ring-2'
                )}
                placeholder="1.0000"
              />
              {errors.exchangeRate && (
                <p className="mt-1 text-sm text-red-500">{errors.exchangeRate}</p>
              )}
            </div>

            <div>
              <label className={cn('block text-sm font-medium mb-1.5', isDark ? 'text-slate-300' : 'text-slate-700')}>
                Amount in Base Currency
              </label>
              <div
                className={cn(
                  'px-3 py-2.5 rounded-lg border text-sm font-mono',
                  isDark
                    ? 'bg-slate-800/50 border-slate-700 text-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                )}
              >
                INR {formatCurrency(amountInBaseCurrency, 'INR', false)}
              </div>
            </div>
          </div>

          {/* Payment Date */}
          <div>
            <label className={cn('block text-sm font-medium mb-1.5', isDark ? 'text-slate-300' : 'text-slate-700')}>
              Payment Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className={cn('w-4 h-4', isDark ? 'text-slate-500' : 'text-slate-400')} />
              </div>
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => handleChange('paymentDate', e.target.value)}
                className={cn(
                  'w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm transition-colors',
                  errors.paymentDate
                    ? 'border-red-500 focus:ring-red-500'
                    : isDark
                    ? 'bg-slate-800 border-slate-600 text-white focus:border-cyan-500 focus:ring-cyan-500/20'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20',
                  'focus:outline-none focus:ring-2'
                )}
              />
            </div>
            {errors.paymentDate && (
              <p className="mt-1 text-sm text-red-500">{errors.paymentDate}</p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className={cn('block text-sm font-medium mb-1.5', isDark ? 'text-slate-300' : 'text-slate-700')}>
              Payment Method <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className={cn('w-4 h-4', isDark ? 'text-slate-500' : 'text-slate-400')} />
              </div>
              <select
                value={formData.paymentMethod}
                onChange={(e) => handleChange('paymentMethod', e.target.value)}
                className={cn(
                  'w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm transition-colors appearance-none',
                  errors.paymentMethod
                    ? 'border-red-500 focus:ring-red-500'
                    : isDark
                    ? 'bg-slate-800 border-slate-600 text-white focus:border-cyan-500 focus:ring-cyan-500/20'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20',
                  'focus:outline-none focus:ring-2'
                )}
              >
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.paymentMethod && (
              <p className="mt-1 text-sm text-red-500">{errors.paymentMethod}</p>
            )}
          </div>

          {/* Payment Reference */}
          <div>
            <label className={cn('block text-sm font-medium mb-1.5', isDark ? 'text-slate-300' : 'text-slate-700')}>
              Payment Reference <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className={cn('w-4 h-4', isDark ? 'text-slate-500' : 'text-slate-400')} />
              </div>
              <input
                type="text"
                value={formData.paymentReference}
                onChange={(e) => handleChange('paymentReference', e.target.value)}
                maxLength={PAYMENT_VALIDATION.paymentReference.maxLength}
                className={cn(
                  'w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm transition-colors',
                  errors.paymentReference
                    ? 'border-red-500 focus:ring-red-500'
                    : isDark
                    ? 'bg-slate-800 border-slate-600 text-white focus:border-cyan-500 focus:ring-cyan-500/20'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20',
                  'focus:outline-none focus:ring-2'
                )}
                placeholder="Transaction ID, UTR, Check No., etc."
              />
            </div>
            {errors.paymentReference && (
              <p className="mt-1 text-sm text-red-500">{errors.paymentReference}</p>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className={cn('block text-sm font-medium mb-1.5', isDark ? 'text-slate-300' : 'text-slate-700')}>
              Remarks (Optional)
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => handleChange('remarks', e.target.value)}
              maxLength={PAYMENT_VALIDATION.remarks.maxLength}
              rows={2}
              className={cn(
                'w-full px-3 py-2.5 rounded-lg border text-sm transition-colors resize-none',
                isDark
                  ? 'bg-slate-800 border-slate-600 text-white focus:border-cyan-500 focus:ring-cyan-500/20'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20',
                'focus:outline-none focus:ring-2'
              )}
              placeholder="Any additional notes about this payment..."
            />
          </div>
        </form>

        {/* Footer */}
        <div
          className={cn(
            'flex items-center justify-end gap-3 px-6 py-4 border-t',
            isDark ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-slate-50'
          )}
        >
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              isDark
                ? 'text-slate-300 hover:bg-slate-700'
                : 'text-slate-700 hover:bg-slate-100'
            )}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2',
              isDark
                ? 'bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-cyan-800'
                : 'bg-teal-600 hover:bg-teal-700 text-white disabled:bg-teal-400'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Recording...
              </>
            ) : (
              'Record Payment'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordPaymentModal;
