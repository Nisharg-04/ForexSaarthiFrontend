// ═══════════════════════════════════════════════════════════════════════════════
// QUARTERLY NATURAL HEDGE MODAL
// Multi-step workflow for applying natural hedges across quarterly exposures
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  X,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  RefreshCcw,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Check,
  Flag,
} from 'lucide-react';
import { cn } from '../../../utils/helpers';
import {
  useGetExposuresForHedgingQuery,
  useApplyQuarterlyNaturalHedgeMutation,
  useLazyGetExposuresForHedgingQuery,
} from '../api/hedgingApi';
import {
  getUpcomingQuarters,
  getCurrentQuarter,
  getQuarterLabel,
  calculateNaturalHedgePotential,
  calculateNetExposureAtRisk,
  formatHedgeAmount,
  formatRate,
} from '../hedgingUtils';
import type {
  NaturalHedgeWorkflowStep,
  ExposureBriefInfo,
  QuarterlyNaturalHedgeFormData,
  QuarterlyNaturalHedgeFormErrors,
} from '../hedgingTypes';
import { QUARTERLY_NATURAL_HEDGE_VALIDATION, NATURAL_HEDGE_WORKFLOW_STEPS } from '../hedgingConstants';

// ─────────────────────────────────────────────────────────────────────────────────
// PROPS INTERFACE
// ─────────────────────────────────────────────────────────────────────────────────
interface QuarterlyNaturalHedgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  isDark?: boolean;
  preselectedQuarter?: string;
  preselectedCurrency?: string;
  availableCurrencies?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────────
// DEFAULT CURRENCIES
// ─────────────────────────────────────────────────────────────────────────────────
const DEFAULT_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'SGD'];

// ─────────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────────
export const QuarterlyNaturalHedgeModal: React.FC<QuarterlyNaturalHedgeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isDark = false,
  preselectedQuarter,
  preselectedCurrency,
  availableCurrencies = DEFAULT_CURRENCIES,
}) => {
  // ─────────────────────────────────────────────────────────────────────────────
  // WORKFLOW STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [step, setStep] = useState<NaturalHedgeWorkflowStep>('select-quarter');
  const [selectedQuarter, setSelectedQuarter] = useState(preselectedQuarter || getCurrentQuarter());
  const [selectedCurrency, setSelectedCurrency] = useState(preselectedCurrency || 'USD');
  const [selectedReceivables, setSelectedReceivables] = useState<string[]>([]);
  const [selectedPayables, setSelectedPayables] = useState<string[]>([]);
  const [internalRate, setInternalRate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [errors, setErrors] = useState<QuarterlyNaturalHedgeFormErrors>({});

  // Result state
  const [hedgeResult, setHedgeResult] = useState<any>(null);

  // Quarters for selection
  const quarters = useMemo(() => getUpcomingQuarters(8), []);

  // ─────────────────────────────────────────────────────────────────────────────
  // API HOOKS
  // ─────────────────────────────────────────────────────────────────────────────
  const [fetchExposures, { data: exposuresData, isLoading: isLoadingExposures, isFetching }] =
    useLazyGetExposuresForHedgingQuery();

  const [applyNaturalHedge, { isLoading: isApplying }] = useApplyQuarterlyNaturalHedgeMutation();

  // ─────────────────────────────────────────────────────────────────────────────
  // RESET STATE ON MODAL OPEN
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setStep('select-quarter');
      setSelectedQuarter(preselectedQuarter || getCurrentQuarter());
      setSelectedCurrency(preselectedCurrency || 'USD');
      setSelectedReceivables([]);
      setSelectedPayables([]);
      setInternalRate('');
      setRemarks('');
      setErrors({});
      setHedgeResult(null);
    }
  }, [isOpen, preselectedQuarter, preselectedCurrency]);

  // ─────────────────────────────────────────────────────────────────────────────
  // CALCULATED VALUES
  // ─────────────────────────────────────────────────────────────────────────────
  const exposureInfo = useMemo(() => {
    const data = exposuresData?.data;
    if (!data) {
      return {
        receivables: [],
        payables: [],
        totalReceivableUnhedged: 0,
        totalPayableUnhedged: 0,
        naturalHedgePotential: 0,
        netExposureAtRisk: 0,
      };
    }
    return {
      receivables: data.receivables || [],
      payables: data.payables || [],
      totalReceivableUnhedged: data.totalReceivableUnhedged || 0,
      totalPayableUnhedged: data.totalPayableUnhedged || 0,
      naturalHedgePotential: data.naturalHedgePotential || 0,
      netExposureAtRisk: data.netExposureAtRisk || 0,
    };
  }, [exposuresData]);

  // Calculate selected amounts
  const selectedAmounts = useMemo(() => {
    const selectedRecvAmount = exposureInfo.receivables
      .filter((exp) => selectedReceivables.includes(exp.id))
      .reduce((sum, exp) => sum + exp.unhedgedAmount, 0);

    const selectedPayAmount = exposureInfo.payables
      .filter((exp) => selectedPayables.includes(exp.id))
      .reduce((sum, exp) => sum + exp.unhedgedAmount, 0);

    const maxHedgeAmount = Math.min(selectedRecvAmount, selectedPayAmount);

    return {
      receivable: selectedRecvAmount,
      payable: selectedPayAmount,
      maxHedgeAmount,
    };
  }, [exposureInfo, selectedReceivables, selectedPayables]);

  // ─────────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────
  const handleQuarterChange = useCallback((quarter: string) => {
    setSelectedQuarter(quarter);
    setSelectedReceivables([]);
    setSelectedPayables([]);
  }, []);

  const handleCurrencyChange = useCallback((currency: string) => {
    setSelectedCurrency(currency);
    setSelectedReceivables([]);
    setSelectedPayables([]);
  }, []);

  const handleReceivableToggle = useCallback((id: string) => {
    setSelectedReceivables((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handlePayableToggle = useCallback((id: string) => {
    setSelectedPayables((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAllReceivables = useCallback(() => {
    if (selectedReceivables.length === exposureInfo.receivables.length) {
      setSelectedReceivables([]);
    } else {
      setSelectedReceivables(exposureInfo.receivables.map((exp) => exp.id));
    }
  }, [exposureInfo.receivables, selectedReceivables]);

  const handleSelectAllPayables = useCallback(() => {
    if (selectedPayables.length === exposureInfo.payables.length) {
      setSelectedPayables([]);
    } else {
      setSelectedPayables(exposureInfo.payables.map((exp) => exp.id));
    }
  }, [exposureInfo.payables, selectedPayables]);

  // ─────────────────────────────────────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────────────────────────────────────
  const handleNextStep = useCallback(async () => {
    setErrors({});

    if (step === 'select-quarter') {
      // Fetch exposures for the selected quarter and currency
      try {
        await fetchExposures({ quarter: selectedQuarter, currency: selectedCurrency }).unwrap();
        setStep('select-exposures');
      } catch (error: any) {
        setErrors({
          general: error?.data?.message || 'Failed to fetch exposures',
        });
      }
    } else if (step === 'select-exposures') {
      // Validate selections
      if (selectedReceivables.length === 0) {
        setErrors({ receivableExposureIds: 'Please select at least one receivable' });
        return;
      }
      if (selectedPayables.length === 0) {
        setErrors({ payableExposureIds: 'Please select at least one payable' });
        return;
      }
      if (selectedAmounts.maxHedgeAmount <= 0) {
        setErrors({ totalHedgeAmount: 'No hedgeable amount available' });
        return;
      }
      setStep('confirm');
    } else if (step === 'confirm') {
      // Apply the hedge
      try {
        const result = await applyNaturalHedge({
          quarter: selectedQuarter,
          currency: selectedCurrency,
          receivableExposureIds: selectedReceivables,
          payableExposureIds: selectedPayables,
          totalHedgeAmount: selectedAmounts.maxHedgeAmount,
          internalRate: internalRate ? parseFloat(internalRate) : undefined,
          remarks: remarks.trim() || undefined,
        }).unwrap();

        setHedgeResult(result.data);
        setStep('result');
      } catch (error: any) {
        setErrors({
          general: error?.data?.message || 'Failed to apply natural hedge',
        });
      }
    }
  }, [
    step,
    selectedQuarter,
    selectedCurrency,
    selectedReceivables,
    selectedPayables,
    selectedAmounts,
    internalRate,
    remarks,
    fetchExposures,
    applyNaturalHedge,
  ]);

  const handlePrevStep = useCallback(() => {
    setErrors({});
    if (step === 'select-exposures') {
      setStep('select-quarter');
    } else if (step === 'confirm') {
      setStep('select-exposures');
    }
  }, [step]);

  const handleClose = useCallback(() => {
    if (step === 'result' && hedgeResult) {
      onSuccess?.();
    }
    onClose();
  }, [step, hedgeResult, onSuccess, onClose]);

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER HELPERS
  // ─────────────────────────────────────────────────────────────────────────────
  if (!isOpen) return null;

  const inputClasses = cn(
    'w-full px-3 py-2 text-sm rounded-lg border transition-colors',
    isDark
      ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-cyan-500'
      : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-teal-500'
  );

  const labelClasses = cn(
    'block text-xs font-medium mb-1.5',
    isDark ? 'text-slate-400' : 'text-slate-600'
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 1: SELECT QUARTER & CURRENCY
  // ─────────────────────────────────────────────────────────────────────────────
  const renderSelectQuarterStep = () => (
    <div className="space-y-6">
      {/* Quarter Selection */}
      <div>
        <label className={labelClasses}>Select Quarter</label>
        <div className="grid grid-cols-4 gap-2">
          {quarters.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleQuarterChange(q)}
              className={cn(
                'px-3 py-2 text-sm rounded-lg border transition-all font-medium',
                selectedQuarter === q
                  ? isDark
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                    : 'bg-teal-50 border-teal-500 text-teal-700'
                  : isDark
                  ? 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              )}
            >
              {q}
            </button>
          ))}
        </div>
        <p className={cn('mt-2 text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
          {getQuarterLabel(selectedQuarter)}
        </p>
      </div>

      {/* Currency Selection */}
      <div>
        <label className={labelClasses}>Select Currency</label>
        <div className="grid grid-cols-4 gap-2">
          {availableCurrencies.map((curr) => (
            <button
              key={curr}
              type="button"
              onClick={() => handleCurrencyChange(curr)}
              className={cn(
                'px-3 py-2 text-sm rounded-lg border transition-all font-medium',
                selectedCurrency === curr
                  ? isDark
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                    : 'bg-teal-50 border-teal-500 text-teal-700'
                  : isDark
                  ? 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              )}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 2: SELECT EXPOSURES
  // ─────────────────────────────────────────────────────────────────────────────
  const renderSelectExposuresStep = () => (
    <div className="space-y-4">
      {/* Summary Banner */}
      <div
        className={cn(
          'p-4 rounded-lg border',
          isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
        )}
      >
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Total Receivables:</span>
            <span className={cn('ml-2 font-semibold', isDark ? 'text-teal-400' : 'text-teal-600')}>
              {formatHedgeAmount(exposureInfo.totalReceivableUnhedged, selectedCurrency)}
            </span>
          </div>
          <div>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Total Payables:</span>
            <span className={cn('ml-2 font-semibold', isDark ? 'text-indigo-400' : 'text-indigo-600')}>
              {formatHedgeAmount(exposureInfo.totalPayableUnhedged, selectedCurrency)}
            </span>
          </div>
          <div>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Natural Hedge Potential:</span>
            <span className={cn('ml-2 font-semibold', isDark ? 'text-cyan-400' : 'text-cyan-600')}>
              {formatHedgeAmount(exposureInfo.naturalHedgePotential, selectedCurrency)}
            </span>
          </div>
          <div>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Net at Risk:</span>
            <span className={cn('ml-2 font-semibold', isDark ? 'text-amber-400' : 'text-amber-600')}>
              {formatHedgeAmount(exposureInfo.netExposureAtRisk, selectedCurrency)}
            </span>
          </div>
        </div>
      </div>

      {/* Two-column exposure selection */}
      <div className="grid grid-cols-2 gap-4">
        {/* Receivables Column */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-500" />
              <span className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                Receivables ({exposureInfo.receivables.length})
              </span>
            </div>
            <button
              type="button"
              onClick={handleSelectAllReceivables}
              className={cn(
                'text-xs px-2 py-1 rounded',
                isDark ? 'text-cyan-400 hover:bg-slate-700' : 'text-teal-600 hover:bg-slate-100'
              )}
            >
              {selectedReceivables.length === exposureInfo.receivables.length
                ? 'Deselect All'
                : 'Select All'}
            </button>
          </div>
          <div
            className={cn(
              'max-h-60 overflow-y-auto rounded-lg border',
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            )}
          >
            {exposureInfo.receivables.length === 0 ? (
              <div className={cn('p-4 text-center text-sm', isDark ? 'text-slate-500' : 'text-slate-400')}>
                No receivables available
              </div>
            ) : (
              exposureInfo.receivables.map((exp) => (
                <div
                  key={exp.id}
                  onClick={() => handleReceivableToggle(exp.id)}
                  className={cn(
                    'p-3 border-b last:border-b-0 cursor-pointer transition-colors',
                    selectedReceivables.includes(exp.id)
                      ? isDark
                        ? 'bg-teal-500/10 border-teal-500/20'
                        : 'bg-teal-50 border-teal-100'
                      : isDark
                      ? 'hover:bg-slate-700/50 border-slate-700'
                      : 'hover:bg-slate-50 border-slate-100'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={cn(
                        'w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center',
                        selectedReceivables.includes(exp.id)
                          ? 'bg-teal-500 border-teal-500'
                          : isDark
                          ? 'border-slate-600'
                          : 'border-slate-300'
                      )}
                    >
                      {selectedReceivables.includes(exp.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn('text-sm font-medium truncate', isDark ? 'text-white' : 'text-slate-900')}>
                        {exp.invoiceNumber}
                      </div>
                      <div className={cn('text-xs truncate', isDark ? 'text-slate-400' : 'text-slate-500')}>
                        {exp.partyName}
                      </div>
                      <div className={cn('text-xs font-medium', isDark ? 'text-teal-400' : 'text-teal-600')}>
                        {formatHedgeAmount(exp.unhedgedAmount, selectedCurrency)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className={cn('mt-2 text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
            Selected: {formatHedgeAmount(selectedAmounts.receivable, selectedCurrency)}
          </div>
        </div>

        {/* Payables Column */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-indigo-500" />
              <span className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                Payables ({exposureInfo.payables.length})
              </span>
            </div>
            <button
              type="button"
              onClick={handleSelectAllPayables}
              className={cn(
                'text-xs px-2 py-1 rounded',
                isDark ? 'text-cyan-400 hover:bg-slate-700' : 'text-teal-600 hover:bg-slate-100'
              )}
            >
              {selectedPayables.length === exposureInfo.payables.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div
            className={cn(
              'max-h-60 overflow-y-auto rounded-lg border',
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            )}
          >
            {exposureInfo.payables.length === 0 ? (
              <div className={cn('p-4 text-center text-sm', isDark ? 'text-slate-500' : 'text-slate-400')}>
                No payables available
              </div>
            ) : (
              exposureInfo.payables.map((exp) => (
                <div
                  key={exp.id}
                  onClick={() => handlePayableToggle(exp.id)}
                  className={cn(
                    'p-3 border-b last:border-b-0 cursor-pointer transition-colors',
                    selectedPayables.includes(exp.id)
                      ? isDark
                        ? 'bg-indigo-500/10 border-indigo-500/20'
                        : 'bg-indigo-50 border-indigo-100'
                      : isDark
                      ? 'hover:bg-slate-700/50 border-slate-700'
                      : 'hover:bg-slate-50 border-slate-100'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={cn(
                        'w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center',
                        selectedPayables.includes(exp.id)
                          ? 'bg-indigo-500 border-indigo-500'
                          : isDark
                          ? 'border-slate-600'
                          : 'border-slate-300'
                      )}
                    >
                      {selectedPayables.includes(exp.id) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn('text-sm font-medium truncate', isDark ? 'text-white' : 'text-slate-900')}>
                        {exp.invoiceNumber}
                      </div>
                      <div className={cn('text-xs truncate', isDark ? 'text-slate-400' : 'text-slate-500')}>
                        {exp.partyName}
                      </div>
                      <div className={cn('text-xs font-medium', isDark ? 'text-indigo-400' : 'text-indigo-600')}>
                        {formatHedgeAmount(exp.unhedgedAmount, selectedCurrency)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className={cn('mt-2 text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
            Selected: {formatHedgeAmount(selectedAmounts.payable, selectedCurrency)}
          </div>
        </div>
      </div>

      {/* Hedge Amount Display */}
      <div
        className={cn(
          'p-4 rounded-lg border-2',
          isDark ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'
        )}
      >
        <div className="text-center">
          <span className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
            Natural Hedge Amount:
          </span>
          <div className={cn('text-2xl font-bold', isDark ? 'text-cyan-400' : 'text-cyan-600')}>
            {formatHedgeAmount(selectedAmounts.maxHedgeAmount, selectedCurrency)}
          </div>
          <span className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
            (Limited by the lower of selected receivables/payables)
          </span>
        </div>
      </div>

      {/* Errors */}
      {(errors.receivableExposureIds || errors.payableExposureIds || errors.totalHedgeAmount) && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-500">
            {errors.receivableExposureIds || errors.payableExposureIds || errors.totalHedgeAmount}
          </span>
        </div>
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 3: CONFIRM
  // ─────────────────────────────────────────────────────────────────────────────
  const renderConfirmStep = () => (
    <div className="space-y-4">
      {/* Summary Card */}
      <div
        className={cn(
          'p-4 rounded-lg border',
          isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
        )}
      >
        <h4 className={cn('text-sm font-semibold mb-3', isDark ? 'text-white' : 'text-slate-900')}>
          Natural Hedge Summary
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Quarter:</span>
            <span className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>
              {getQuarterLabel(selectedQuarter)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Currency:</span>
            <span className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>
              {selectedCurrency}
            </span>
          </div>
          <div className="flex justify-between">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Receivables Selected:</span>
            <span className={cn('font-medium', isDark ? 'text-teal-400' : 'text-teal-600')}>
              {selectedReceivables.length} ({formatHedgeAmount(selectedAmounts.receivable, selectedCurrency)})
            </span>
          </div>
          <div className="flex justify-between">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Payables Selected:</span>
            <span className={cn('font-medium', isDark ? 'text-indigo-400' : 'text-indigo-600')}>
              {selectedPayables.length} ({formatHedgeAmount(selectedAmounts.payable, selectedCurrency)})
            </span>
          </div>
          <div className={cn('pt-2 mt-2 border-t flex justify-between', isDark ? 'border-slate-700' : 'border-slate-200')}>
            <span className={cn('font-semibold', isDark ? 'text-slate-300' : 'text-slate-700')}>
              Total Hedge Amount:
            </span>
            <span className={cn('font-bold text-lg', isDark ? 'text-cyan-400' : 'text-cyan-600')}>
              {formatHedgeAmount(selectedAmounts.maxHedgeAmount, selectedCurrency)}
            </span>
          </div>
        </div>
      </div>

      {/* Optional Fields */}
      <div className="space-y-4">
        <div>
          <label className={labelClasses}>Internal Transfer Rate (Optional)</label>
          <input
            type="number"
            step="0.0001"
            value={internalRate}
            onChange={(e) => setInternalRate(e.target.value)}
            placeholder="e.g., 83.5000"
            className={inputClasses}
          />
          <p className={cn('mt-1 text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
            Internal rate for recording purposes (INR per {selectedCurrency})
          </p>
        </div>

        <div>
          <label className={labelClasses}>Remarks (Optional)</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add notes about this natural hedge..."
            rows={2}
            className={inputClasses}
          />
        </div>
      </div>

      {/* Warning */}
      <div
        className={cn(
          'p-3 rounded-lg border flex items-start gap-2',
          isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'
        )}
      >
        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className={cn('text-xs', isDark ? 'text-amber-300' : 'text-amber-700')}>
          This will create natural hedge pairs between the selected receivables and payables.
          The hedge records will be linked and closing one will affect the other.
        </p>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 4: RESULT
  // ─────────────────────────────────────────────────────────────────────────────
  const renderResultStep = () => (
    <div className="space-y-4">
      {/* Success Banner */}
      <div
        className={cn(
          'p-4 rounded-lg border flex items-center gap-3',
          isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
        )}
      >
        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        <div>
          <h4 className={cn('font-semibold', isDark ? 'text-emerald-400' : 'text-emerald-700')}>
            Natural Hedge Applied Successfully!
          </h4>
          <p className={cn('text-sm', isDark ? 'text-emerald-300' : 'text-emerald-600')}>
            {hedgeResult?.hedgePairsCreated || 0} hedge pairs created
          </p>
        </div>
      </div>

      {/* Result Summary */}
      <div
        className={cn(
          'p-4 rounded-lg border',
          isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
        )}
      >
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Quarter:</span>
            <span className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>
              {hedgeResult?.quarter}
            </span>
          </div>
          <div className="flex justify-between">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Currency:</span>
            <span className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>
              {hedgeResult?.currency}
            </span>
          </div>
          <div className="flex justify-between">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Total Hedged:</span>
            <span className={cn('font-bold', isDark ? 'text-cyan-400' : 'text-cyan-600')}>
              {formatHedgeAmount(hedgeResult?.totalHedgeAmount || 0, hedgeResult?.currency || 'USD')}
            </span>
          </div>
          <div className={cn('pt-2 mt-2 border-t', isDark ? 'border-slate-700' : 'border-slate-200')}>
            <div className="flex justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Remaining Receivables:</span>
              <span className={cn('font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>
                {formatHedgeAmount(hedgeResult?.remainingReceivableUnhedged || 0, hedgeResult?.currency || 'USD')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Remaining Payables:</span>
              <span className={cn('font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>
                {formatHedgeAmount(hedgeResult?.remainingPayableUnhedged || 0, hedgeResult?.currency || 'USD')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Net Exposure (needs forward):</span>
              <span className={cn('font-semibold', isDark ? 'text-amber-400' : 'text-amber-600')}>
                {formatHedgeAmount(hedgeResult?.remainingNetExposure || 0, hedgeResult?.currency || 'USD')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hedge Pairs List */}
      {hedgeResult?.hedgeRecords && hedgeResult.hedgeRecords.length > 0 && (
        <div>
          <h4 className={cn('text-sm font-semibold mb-2', isDark ? 'text-white' : 'text-slate-900')}>
            Hedge Pairs Created
          </h4>
          <div className={cn('rounded-lg border overflow-hidden', isDark ? 'border-slate-700' : 'border-slate-200')}>
            {hedgeResult.hedgeRecords
              .filter((h: any) => h.receivableInvoiceNumber)
              .map((hedge: any, idx: number) => (
                <div
                  key={hedge.id}
                  className={cn(
                    'p-3 border-b last:border-b-0',
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded', isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600')}>
                        #{idx + 1}
                      </span>
                      <div>
                        <span className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                          Receivable:
                        </span>
                        <span className={cn('ml-1 text-sm font-medium', isDark ? 'text-teal-400' : 'text-teal-600')}>
                          {hedge.receivableInvoiceNumber}
                        </span>
                      </div>
                      <div>
                        <span className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                          Payable:
                        </span>
                        <span className={cn('ml-1 text-sm font-medium', isDark ? 'text-indigo-400' : 'text-indigo-600')}>
                          {hedge.payableInvoiceNumber}
                        </span>
                      </div>
                    </div>
                    <span className={cn('font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                      {formatHedgeAmount(hedge.hedgeAmount, hedge.currency)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl border shadow-xl',
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'flex items-center justify-between px-5 py-4 border-b flex-shrink-0',
            isDark ? 'border-slate-700' : 'border-slate-200'
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                isDark ? 'bg-cyan-500/10' : 'bg-cyan-50'
              )}
            >
              <RefreshCcw className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <h2 className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                Apply Natural Hedge
              </h2>
              <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                {NATURAL_HEDGE_WORKFLOW_STEPS.find((s) => s.step === step)?.label}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className={cn('px-5 py-3 border-b flex-shrink-0', isDark ? 'border-slate-700' : 'border-slate-200')}>
          <div className="flex items-center gap-2">
            {NATURAL_HEDGE_WORKFLOW_STEPS.map((s, idx) => {
              const stepIndex = NATURAL_HEDGE_WORKFLOW_STEPS.findIndex((x) => x.step === step);
              const isComplete = idx < stepIndex;
              const isCurrent = s.step === step;

              return (
                <React.Fragment key={s.step}>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                        isComplete
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? isDark
                            ? 'bg-cyan-500 text-white'
                            : 'bg-teal-500 text-white'
                          : isDark
                          ? 'bg-slate-700 text-slate-400'
                          : 'bg-slate-200 text-slate-500'
                      )}
                    >
                      {isComplete ? <Check className="w-3 h-3" /> : idx + 1}
                    </div>
                    <span
                      className={cn(
                        'text-xs hidden sm:block',
                        isCurrent
                          ? isDark
                            ? 'text-white font-medium'
                            : 'text-slate-900 font-medium'
                          : isDark
                          ? 'text-slate-500'
                          : 'text-slate-400'
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < NATURAL_HEDGE_WORKFLOW_STEPS.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-0.5 max-w-[30px]',
                        idx < stepIndex
                          ? 'bg-emerald-500'
                          : isDark
                          ? 'bg-slate-700'
                          : 'bg-slate-200'
                      )}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === 'select-quarter' && renderSelectQuarterStep()}
          {step === 'select-exposures' && renderSelectExposuresStep()}
          {step === 'confirm' && renderConfirmStep()}
          {step === 'result' && renderResultStep()}

          {/* General Error */}
          {errors.general && (
            <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-500">{errors.general}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={cn(
            'flex items-center justify-between px-5 py-4 border-t flex-shrink-0',
            isDark ? 'border-slate-700' : 'border-slate-200'
          )}
        >
          {/* Back Button */}
          {step !== 'select-quarter' && step !== 'result' ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {/* Cancel Button (only show on non-result steps) */}
          {step !== 'result' && (
            <button
              type="button"
              onClick={handleClose}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              Cancel
            </button>
          )}

          {/* Next/Submit Button */}
          {step === 'result' ? (
            <button
              type="button"
              onClick={handleClose}
              className={cn(
                'flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-colors',
                'bg-emerald-500 text-white hover:bg-emerald-600'
              )}
            >
              Done
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={isLoadingExposures || isFetching || isApplying}
              className={cn(
                'flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-colors',
                isDark
                  ? 'bg-cyan-500 text-white hover:bg-cyan-600 disabled:bg-cyan-500/50'
                  : 'bg-teal-500 text-white hover:bg-teal-600 disabled:bg-teal-500/50'
              )}
            >
              {(isLoadingExposures || isFetching || isApplying) && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {step === 'confirm' ? 'Apply Natural Hedge' : 'Next'}
              {step !== 'confirm' && <ArrowRight className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuarterlyNaturalHedgeModal;
