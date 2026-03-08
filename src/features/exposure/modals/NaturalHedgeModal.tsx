// ═══════════════════════════════════════════════════════════════════════════════
// NATURAL HEDGE MODAL
// Modal for matching exposures against opposite positions
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { X, RefreshCcw, ArrowRightLeft, DollarSign, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn, formatCurrency, formatDate } from '../../../utils/helpers';
import { useGetNaturalHedgeMatchesQuery, useApplyNaturalHedgeMutation } from '../api/exposureApi';
import type { Exposure, NaturalHedgeMatch, NaturalHedgeFormData, NaturalHedgeFormErrors } from '../types';
import { EXPOSURE_TYPE_STYLES } from '../exposureConstants';

interface NaturalHedgeModalProps {
  exposure: Exposure;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  isDark?: boolean;
}

export const NaturalHedgeModal: React.FC<NaturalHedgeModalProps> = ({
  exposure,
  isOpen,
  onClose,
  onSuccess,
  isDark = false,
}) => {
  const [formData, setFormData] = useState<NaturalHedgeFormData>({
    oppositeExposureId: '',
    amount: '',
    remarks: '',
  });
  const [errors, setErrors] = useState<NaturalHedgeFormErrors>({});
  
  const { data: matchesData, isLoading: isLoadingMatches } = useGetNaturalHedgeMatchesQuery(
    exposure.id,
    { skip: !isOpen }
  );
  
  const [applyNaturalHedge, { isLoading: isApplying }] = useApplyNaturalHedgeMutation();

  const matches = matchesData?.data || [];

  // Get selected match
  const selectedMatch = useMemo(() => {
    if (!formData.oppositeExposureId) return null;
    return matches.find(m => m.oppositeExposure.id === formData.oppositeExposureId) || null;
  }, [formData.oppositeExposureId, matches]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ oppositeExposureId: '', amount: '', remarks: '' });
      setErrors({});
    }
  }, [isOpen]);

  // Auto-fill amount when match is selected
  useEffect(() => {
    if (selectedMatch && !formData.amount) {
      setFormData(prev => ({
        ...prev,
        amount: String(selectedMatch.maxMatchAmount),
      }));
    }
  }, [selectedMatch, formData.amount]);

  // Validate form
  const validateForm = useCallback((): NaturalHedgeFormErrors => {
    const newErrors: NaturalHedgeFormErrors = {};
    const amount = parseFloat(formData.amount);

    if (!formData.oppositeExposureId) {
      newErrors.oppositeExposureId = 'Select an opposite exposure';
    }

    if (!formData.amount || isNaN(amount)) {
      newErrors.amount = 'Match amount is required';
    } else if (amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (selectedMatch && amount > selectedMatch.maxMatchAmount) {
      newErrors.amount = `Cannot exceed maximum matchable amount (${formatCurrency(selectedMatch.maxMatchAmount, exposure.currency, false)})`;
    }

    return newErrors;
  }, [formData, selectedMatch, exposure.currency]);

  // Handle input changes
  const handleChange = useCallback((field: keyof NaturalHedgeFormData, value: string) => {
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
      await applyNaturalHedge({
        exposureAId: exposure.id,
        exposureBId: formData.oppositeExposureId,
        hedgeAmount: parseFloat(formData.amount),
        remarks: formData.remarks.trim() || undefined,
      }).unwrap();

      setFormData({ oppositeExposureId: '', amount: '', remarks: '' });
      setErrors({});
      onSuccess?.();
      onClose();
    } catch (error: any) {
      setErrors({
        general: error?.data?.message || 'Failed to apply natural hedge. Please try again.',
      });
    }
  }, [formData, validateForm, applyNaturalHedge, exposure.id, onSuccess, onClose]);

  if (!isOpen) return null;

  const oppositeType = exposure.exposureType === 'RECEIVABLE' ? 'PAYABLE' : 'RECEIVABLE';
  const oppositeTypeStyle = EXPOSURE_TYPE_STYLES[oppositeType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-2xl rounded-xl border shadow-xl max-h-[90vh] overflow-hidden flex flex-col',
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'flex items-center justify-between px-5 py-4 border-b shrink-0',
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
                Natural Hedge
              </h2>
              <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Match against opposite {oppositeTypeStyle.label.toLowerCase()} in {exposure.currency}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Source Exposure */}
          <div
            className={cn(
              'p-4 rounded-lg mb-4',
              isDark ? 'bg-slate-800/50' : 'bg-slate-50'
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className={cn(
                  'text-xs font-medium uppercase tracking-wide',
                  isDark ? 'text-slate-400' : 'text-slate-500'
                )}
              >
                Source Exposure
              </span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium border',
                  isDark
                    ? EXPOSURE_TYPE_STYLES[exposure.exposureType].dark
                    : EXPOSURE_TYPE_STYLES[exposure.exposureType].light
                )}
              >
                {EXPOSURE_TYPE_STYLES[exposure.exposureType].label}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                  {exposure.invoiceNumber}
                </p>
                <p className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                  Invoice
                </p>
              </div>
              <div>
                <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                  {exposure.partyName}
                </p>
                <p className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                  Party
                </p>
              </div>
              <div>
                <p className={cn('text-sm font-semibold tabular-nums text-red-500')}>
                  {formatCurrency(exposure.unhedgedAmount, exposure.currency, false)}
                </p>
                <p className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                  Unhedged
                </p>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center my-2">
            <ArrowRightLeft className={cn('w-5 h-5', isDark ? 'text-slate-600' : 'text-slate-400')} />
          </div>

          {/* Error Banner */}
          {errors.general && (
            <div
              className={cn(
                'flex items-start gap-2 p-3 rounded-lg text-sm mb-4',
                isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
              )}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Matches List */}
          <div className="space-y-2 mb-4">
            <label
              className={cn(
                'block text-xs font-medium',
                isDark ? 'text-slate-400' : 'text-slate-600'
              )}
            >
              Select Opposite Exposure to Match *
            </label>

            {isLoadingMatches ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className={cn('w-6 h-6 animate-spin', isDark ? 'text-slate-600' : 'text-slate-400')} />
              </div>
            ) : matches.length === 0 ? (
              <div
                className={cn(
                  'text-center py-8 rounded-lg border',
                  isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                )}
              >
                <RefreshCcw className={cn('w-8 h-8 mx-auto mb-2', isDark ? 'text-slate-600' : 'text-slate-400')} />
                <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  No matching {oppositeTypeStyle.label.toLowerCase()}s found in {exposure.currency}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {matches.map((match) => {
                  const opp = match.oppositeExposure;
                  const isSelected = formData.oppositeExposureId === opp.id;

                  return (
                    <div
                      key={opp.id}
                      onClick={() => {
                        handleChange('oppositeExposureId', opp.id);
                        handleChange('amount', String(match.maxMatchAmount));
                      }}
                      className={cn(
                        'p-3 rounded-lg border cursor-pointer transition-all',
                        isSelected
                          ? isDark
                            ? 'bg-cyan-500/10 border-cyan-500'
                            : 'bg-cyan-50 border-cyan-500'
                          : isDark
                          ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-cyan-500" />
                          )}
                          <div>
                            <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                              {opp.invoiceNumber}
                            </p>
                            <p className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                              {opp.partyName} • Due {formatDate(opp.maturityDate, 'dd MMM')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn('text-sm font-semibold tabular-nums', isDark ? 'text-emerald-400' : 'text-emerald-600')}>
                            {formatCurrency(match.maxMatchAmount, exposure.currency, false)}
                          </p>
                          <p className={cn('text-[10px]', isDark ? 'text-slate-500' : 'text-slate-400')}>
                            Matchable
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {errors.oppositeExposureId && (
              <p className="text-xs text-red-500">{errors.oppositeExposureId}</p>
            )}
          </div>

          {/* Match Amount */}
          {selectedMatch && (
            <div className="space-y-4">
              <div>
                <label
                  className={cn(
                    'block text-xs font-medium mb-1.5',
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  )}
                >
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Match Amount ({exposure.currency}) *
                  </span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={`Max: ${formatCurrency(selectedMatch.maxMatchAmount, exposure.currency, false)}`}
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  className={cn(
                    'w-full px-3 py-2 text-sm rounded-lg border transition-colors',
                    isDark
                      ? 'bg-slate-800 border-slate-600 text-white'
                      : 'bg-white border-slate-200 text-slate-900',
                    errors.amount && 'border-red-500'
                  )}
                />
                {errors.amount && (
                  <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
                )}
              </div>

              {/* Net Impact Preview */}
              <div
                className={cn(
                  'p-3 rounded-lg',
                  isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'
                )}
              >
                <p className={cn('text-xs text-center mb-1', isDark ? 'text-emerald-400/70' : 'text-emerald-600/70')}>
                  After Matching
                </p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className={cn('text-sm font-semibold tabular-nums text-emerald-500')}>
                      {formatCurrency(
                        Math.max(0, exposure.unhedgedAmount - parseFloat(formData.amount || '0')),
                        exposure.currency,
                        false
                      )}
                    </p>
                    <p className={cn('text-[10px]', isDark ? 'text-slate-500' : 'text-slate-400')}>
                      Your Remaining Unhedged
                    </p>
                  </div>
                  <div>
                    <p className={cn('text-sm font-semibold tabular-nums text-emerald-500')}>
                      {formatCurrency(
                        Math.max(0, selectedMatch.oppositeExposure.unhedgedAmount - parseFloat(formData.amount || '0')),
                        exposure.currency,
                        false
                      )}
                    </p>
                    <p className={cn('text-[10px]', isDark ? 'text-slate-500' : 'text-slate-400')}>
                      Opposite Remaining
                    </p>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label
                  className={cn(
                    'block text-xs font-medium mb-1.5',
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  )}
                >
                  Remarks
                </label>
                <textarea
                  placeholder="Additional notes (optional)"
                  value={formData.remarks}
                  onChange={(e) => handleChange('remarks', e.target.value)}
                  rows={2}
                  className={cn(
                    'w-full px-3 py-2 text-sm rounded-lg border transition-colors resize-none',
                    isDark
                      ? 'bg-slate-800 border-slate-600 text-white'
                      : 'bg-white border-slate-200 text-slate-900'
                  )}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={cn(
            'flex justify-end gap-3 px-5 py-4 border-t shrink-0',
            isDark ? 'border-slate-700' : 'border-slate-200'
          )}
        >
          <button
            onClick={onClose}
            disabled={isApplying}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
              isDark
                ? 'border-slate-600 text-slate-300 hover:bg-slate-800'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            )}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isApplying || !selectedMatch}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50',
              isDark
                ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                : 'bg-cyan-600 hover:bg-cyan-700 text-white'
            )}
          >
            {isApplying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Matching...
              </>
            ) : (
              <>
                <RefreshCcw className="w-4 h-4" />
                Apply Match
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NaturalHedgeModal;
