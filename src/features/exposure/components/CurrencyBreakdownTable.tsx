// ═══════════════════════════════════════════════════════════════════════════════
// CURRENCY BREAKDOWN TABLE - Risk Dashboard Component  
// Table showing currency-wise unhedged exposure with hedge percentage
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { cn, formatNumber } from '../../../utils/helpers';
import type { ExposureByCurrency } from '../types';

interface CurrencyBreakdownTableProps {
  data: ExposureByCurrency[];
  isDark?: boolean;
  showNetPosition?: boolean;
  className?: string;
}

/**
 * Get color for hedge percentage based on risk thresholds
 */
const getHedgeStatusColor = (percentage: number, isDark: boolean): string => {
  if (percentage >= 80) return isDark ? 'text-emerald-400' : 'text-emerald-600';
  if (percentage >= 50) return isDark ? 'text-amber-400' : 'text-amber-600';
  return isDark ? 'text-red-400' : 'text-red-600';
};

/**
 * Get background color for progress bar
 */
const getProgressBarColor = (percentage: number): string => {
  if (percentage >= 80) return 'bg-emerald-500';
  if (percentage >= 50) return 'bg-amber-500';
  return 'bg-red-500';
};

export const CurrencyBreakdownTable: React.FC<CurrencyBreakdownTableProps> = ({
  data,
  isDark = false,
  showNetPosition = true,
  className,
}) => {
  // Sort by unhedged amount descending (highest risk first)
  const sortedData = [...data].sort((a, b) => b.totalUnhedgedAmount - a.totalUnhedgedAmount);
  
  // Theme classes
  const headerBgClass = isDark ? 'bg-slate-800/50' : 'bg-slate-50';
  const rowHoverClass = isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/80';
  const borderClass = isDark ? 'border-slate-700' : 'border-slate-200';
  const textClass = isDark ? 'text-white' : 'text-slate-900';
  const textMutedClass = isDark ? 'text-slate-400' : 'text-slate-600';
  
  if (data.length === 0) {
    return (
      <div className={cn(
        'flex items-center justify-center p-8 rounded-lg border',
        isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
      )}>
        <p className={textMutedClass}>No currency data available</p>
      </div>
    );
  }
  
  return (
    <div className={cn('overflow-hidden rounded-lg border', borderClass, className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-inherit">
          <thead className={headerBgClass}>
            <tr>
              <th scope="col" className={cn(
                'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider',
                textMutedClass
              )}>
                Currency
              </th>
              <th scope="col" className={cn(
                'px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider',
                textMutedClass
              )}>
                Unhedged
              </th>
              <th scope="col" className={cn(
                'px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider',
                textMutedClass
              )}>
                Hedged
              </th>
              {showNetPosition && (
                <th scope="col" className={cn(
                  'px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider',
                  textMutedClass
                )}>
                  Net Position
                </th>
              )}
              <th scope="col" className={cn(
                'px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider',
                textMutedClass
              )}>
                Hedge %
              </th>
              <th scope="col" className={cn(
                'px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider',
                textMutedClass
              )}>
                Count
              </th>
            </tr>
          </thead>
          <tbody className={cn('divide-y', borderClass)}>
            {sortedData.map((item) => (
              <tr key={item.currency} className={cn('transition-colors', rowHoverClass)}>
                {/* Currency */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold',
                      isDark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700'
                    )}>
                      {item.currency}
                    </span>
                    <span className={cn('text-sm font-medium', textClass)}>
                      {getCurrencyName(item.currency)}
                    </span>
                  </div>
                </td>
                
                {/* Unhedged Amount (Primary risk indicator) */}
                <td className={cn('px-4 py-3 text-right whitespace-nowrap')}>
                  <span className={cn(
                    'text-sm font-semibold tabular-nums',
                    item.totalUnhedgedAmount > 0 
                      ? (isDark ? 'text-red-400' : 'text-red-600')
                      : (isDark ? 'text-emerald-400' : 'text-emerald-600')
                  )}>
                    {formatNumber(item.totalUnhedgedAmount, 0)}
                  </span>
                </td>
                
                {/* Hedged Amount */}
                <td className={cn('px-4 py-3 text-right whitespace-nowrap')}>
                  <span className={cn(
                    'text-sm tabular-nums',
                    isDark ? 'text-emerald-400' : 'text-emerald-600'
                  )}>
                    {formatNumber(item.totalHedgedAmount, 0)}
                  </span>
                </td>
                
                {/* Net Position */}
                {showNetPosition && (
                  <td className={cn(
                    'px-4 py-3 text-right whitespace-nowrap'
                  )}>
                    <span className={cn(
                      'text-sm font-medium tabular-nums',
                      item.netPosition >= 0
                        ? (isDark ? 'text-teal-400' : 'text-teal-600')
                        : (isDark ? 'text-indigo-400' : 'text-indigo-600')
                    )}>
                      {item.netPosition >= 0 ? '+' : ''}{formatNumber(item.netPosition, 0)}
                    </span>
                  </td>
                )}
                
                {/* Hedge Percentage with visual bar */}
                <td className={cn('px-4 py-3 text-right whitespace-nowrap')}>
                  <div className="flex items-center justify-end gap-2">
                    <div className={cn(
                      'w-16 h-1.5 rounded-full overflow-hidden',
                      isDark ? 'bg-slate-700' : 'bg-slate-200'
                    )}>
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          getProgressBarColor(item.hedgePercentage)
                        )}
                        style={{ width: `${Math.min(100, item.hedgePercentage)}%` }}
                      />
                    </div>
                    <span className={cn(
                      'text-sm font-semibold tabular-nums w-12',
                      getHedgeStatusColor(item.hedgePercentage, isDark)
                    )}>
                      {item.hedgePercentage.toFixed(0)}%
                    </span>
                  </div>
                </td>
                
                {/* Count */}
                <td className={cn('px-4 py-3 text-right whitespace-nowrap')}>
                  <span className={cn('text-sm tabular-nums', textMutedClass)}>
                    {item.count}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Table footer with totals */}
      <div className={cn(
        'px-4 py-3 border-t text-xs',
        headerBgClass,
        borderClass
      )}>
        <div className="flex justify-between items-center">
          <span className={textMutedClass}>
            {sortedData.length} currencies tracked
          </span>
          <div className="flex gap-4">
            <span className={textMutedClass}>
              Total Unhedged:{' '}
              <span className={isDark ? 'text-red-400' : 'text-red-600'}>
                {formatNumber(sortedData.reduce((sum, item) => sum + item.totalUnhedgedAmount, 0), 0)}
              </span>
            </span>
            <span className={textMutedClass}>
              Total Hedged:{' '}
              <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>
                {formatNumber(sortedData.reduce((sum, item) => sum + item.totalHedgedAmount, 0), 0)}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Get full currency name from code
 */
const getCurrencyName = (code: string): string => {
  const currencyNames: Record<string, string> = {
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    JPY: 'Japanese Yen',
    CHF: 'Swiss Franc',
    AUD: 'Australian Dollar',
    CAD: 'Canadian Dollar',
    SGD: 'Singapore Dollar',
    HKD: 'Hong Kong Dollar',
    INR: 'Indian Rupee',
    AED: 'UAE Dirham',
    CNY: 'Chinese Yuan',
    KRW: 'South Korean Won',
    NZD: 'New Zealand Dollar',
    ZAR: 'South African Rand',
    MYR: 'Malaysian Ringgit',
    THB: 'Thai Baht',
    SAR: 'Saudi Riyal',
  };
  return currencyNames[code] || code;
};

export default CurrencyBreakdownTable;
