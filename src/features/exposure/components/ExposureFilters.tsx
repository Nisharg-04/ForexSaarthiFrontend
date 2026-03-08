// ═══════════════════════════════════════════════════════════════════════════════
// EXPOSURE FILTERS COMPONENT
// Comprehensive filter panel for exposure list
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback, useMemo } from 'react';
import { Search, Filter, X, ChevronDown, Calendar } from 'lucide-react';
import { cn } from '../../../utils/helpers';
import { CURRENCIES } from '../../../constants';
import type { ExposureFilters as ExposureFiltersType, ExposureStatus, ExposureType } from '../types';
import {
  EXPOSURE_STATUS_OPTIONS,
  EXPOSURE_TYPE_OPTIONS,
  EXPOSURE_STATUS_STYLES,
  EXPOSURE_TYPE_STYLES,
} from '../exposureConstants';

interface ExposureFiltersProps {
  filters: ExposureFiltersType;
  onFiltersChange: (filters: ExposureFiltersType) => void;
  isDark?: boolean;
  showAdvanced?: boolean;
  className?: string;
}

export const ExposureFilters: React.FC<ExposureFiltersProps> = ({
  filters,
  onFiltersChange,
  isDark = false,
  showAdvanced = false,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(showAdvanced);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.currency) count++;
    if (filters.exposureType) count++;
    if (filters.status) count++;
    if (filters.hedgingStatus) count++;
    if (filters.maturityFrom || filters.maturityTo) count++;
    return count;
  }, [filters]);

  // Update single filter
  const updateFilter = useCallback(
    <K extends keyof ExposureFiltersType>(key: K, value: ExposureFiltersType[K]) => {
      onFiltersChange({ ...filters, [key]: value || undefined });
    },
    [filters, onFiltersChange]
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    onFiltersChange({});
  }, [onFiltersChange]);

  // Clear single filter
  const clearFilter = useCallback(
    (key: keyof ExposureFiltersType) => {
      const newFilters = { ...filters };
      delete newFilters[key];
      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange]
  );

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
              isDark ? 'text-slate-400' : 'text-slate-400'
            )}
          />
          <input
            type="text"
            placeholder="Search invoice, trade, party..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            className={cn(
              'w-full pl-9 pr-4 py-2 text-sm rounded-lg border transition-colors',
              isDark
                ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500'
                : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-teal-500'
            )}
          />
        </div>

        {/* Currency Filter */}
        <select
          value={filters.currency || ''}
          onChange={(e) => updateFilter('currency', e.target.value)}
          className={cn(
            'px-3 py-2 text-sm rounded-lg border transition-colors min-w-[120px]',
            isDark
              ? 'bg-slate-800 border-slate-700 text-white focus:border-cyan-500'
              : 'bg-white border-slate-200 text-slate-900 focus:border-teal-500'
          )}
        >
          <option value="">All Currencies</option>
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}
            </option>
          ))}
        </select>

        {/* Type Filter */}
        <select
          value={filters.exposureType || ''}
          onChange={(e) => updateFilter('exposureType', e.target.value as ExposureType)}
          className={cn(
            'px-3 py-2 text-sm rounded-lg border transition-colors min-w-[130px]',
            isDark
              ? 'bg-slate-800 border-slate-700 text-white focus:border-cyan-500'
              : 'bg-white border-slate-200 text-slate-900 focus:border-teal-500'
          )}
        >
          <option value="">All Types</option>
          {EXPOSURE_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filters.status || ''}
          onChange={(e) => updateFilter('status', e.target.value as ExposureStatus)}
          className={cn(
            'px-3 py-2 text-sm rounded-lg border transition-colors min-w-[140px]',
            isDark
              ? 'bg-slate-800 border-slate-700 text-white focus:border-cyan-500'
              : 'bg-white border-slate-200 text-slate-900 focus:border-teal-500'
          )}
        >
          <option value="">All Status</option>
          {EXPOSURE_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Advanced Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors',
            isDark
              ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50',
            activeFilterCount > 0 && (isDark ? 'border-cyan-500/50' : 'border-teal-500/50')
          )}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">More</span>
          {activeFilterCount > 0 && (
            <span
              className={cn(
                'w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium',
                isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-teal-500/20 text-teal-600'
              )}
            >
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-180')}
          />
        </button>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div
          className={cn(
            'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-lg border',
            isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
          )}
        >
          {/* Hedging Status */}
          <div>
            <label
              className={cn(
                'block text-xs font-medium mb-1',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              Hedging Status
            </label>
            <select
              value={filters.hedgingStatus || ''}
              onChange={(e) =>
                updateFilter('hedgingStatus', e.target.value as 'HEDGED' | 'UNHEDGED' | 'PARTIAL')
              }
              className={cn(
                'w-full px-3 py-2 text-sm rounded-lg border transition-colors',
                isDark
                  ? 'bg-slate-800 border-slate-600 text-white'
                  : 'bg-white border-slate-200 text-slate-900'
              )}
            >
              <option value="">All</option>
              <option value="HEDGED">Fully Hedged</option>
              <option value="PARTIAL">Partially Hedged</option>
              <option value="UNHEDGED">Unhedged</option>
            </select>
          </div>

          {/* Maturity From */}
          <div>
            <label
              className={cn(
                'block text-xs font-medium mb-1',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              Maturity From
            </label>
            <div className="relative">
              <Calendar
                className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
                  isDark ? 'text-slate-400' : 'text-slate-400'
                )}
              />
              <input
                type="date"
                value={filters.maturityFrom || ''}
                onChange={(e) => updateFilter('maturityFrom', e.target.value)}
                className={cn(
                  'w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition-colors',
                  isDark
                    ? 'bg-slate-800 border-slate-600 text-white'
                    : 'bg-white border-slate-200 text-slate-900'
                )}
              />
            </div>
          </div>

          {/* Maturity To */}
          <div>
            <label
              className={cn(
                'block text-xs font-medium mb-1',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              Maturity To
            </label>
            <div className="relative">
              <Calendar
                className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
                  isDark ? 'text-slate-400' : 'text-slate-400'
                )}
              />
              <input
                type="date"
                value={filters.maturityTo || ''}
                onChange={(e) => updateFilter('maturityTo', e.target.value)}
                className={cn(
                  'w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition-colors',
                  isDark
                    ? 'bg-slate-800 border-slate-600 text-white'
                    : 'bg-white border-slate-200 text-slate-900'
                )}
              />
            </div>
          </div>

          {/* Clear All */}
          <div className="flex items-end">
            <button
              onClick={clearAllFilters}
              disabled={activeFilterCount === 0 && !filters.search}
              className={cn(
                'w-full px-3 py-2 text-sm rounded-lg border transition-colors',
                isDark
                  ? 'border-slate-600 text-slate-400 hover:bg-slate-700 disabled:opacity-50'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-50'
              )}
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Active Filter Pills */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.currency && (
            <FilterPill
              label={`Currency: ${Array.isArray(filters.currency) ? filters.currency.join(', ') : filters.currency}`}
              onClear={() => clearFilter('currency')}
              isDark={isDark}
            />
          )}
          {filters.exposureType && (
            <FilterPill
              label={`Type: ${Array.isArray(filters.exposureType) 
                ? filters.exposureType.map(t => EXPOSURE_TYPE_STYLES[t].label).join(', ')
                : EXPOSURE_TYPE_STYLES[filters.exposureType].label}`}
              onClear={() => clearFilter('exposureType')}
              isDark={isDark}
            />
          )}
          {filters.status && (
            <FilterPill
              label={`Status: ${Array.isArray(filters.status)
                ? filters.status.map(s => EXPOSURE_STATUS_STYLES[s].label).join(', ')
                : EXPOSURE_STATUS_STYLES[filters.status].label}`}
              onClear={() => clearFilter('status')}
              isDark={isDark}
            />
          )}
          {filters.hedgingStatus && (
            <FilterPill
              label={`Hedging: ${filters.hedgingStatus}`}
              onClear={() => clearFilter('hedgingStatus')}
              isDark={isDark}
            />
          )}
          {(filters.maturityFrom || filters.maturityTo) && (
            <FilterPill
              label={`Maturity: ${filters.maturityFrom || '...'} - ${filters.maturityTo || '...'}`}
              onClear={() => {
                clearFilter('maturityFrom');
                clearFilter('maturityTo');
              }}
              isDark={isDark}
            />
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────────
// FILTER PILL COMPONENT
// ─────────────────────────────────────────────────────────────────────────────────

interface FilterPillProps {
  label: string;
  onClear: () => void;
  isDark: boolean;
}

const FilterPill: React.FC<FilterPillProps> = ({ label, onClear, isDark }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
      isDark
        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
        : 'bg-teal-50 text-teal-700 border border-teal-200'
    )}
  >
    {label}
    <button
      onClick={onClear}
      className={cn(
        'w-4 h-4 rounded-full flex items-center justify-center transition-colors',
        isDark ? 'hover:bg-cyan-500/20' : 'hover:bg-teal-100'
      )}
    >
      <X className="w-3 h-3" />
    </button>
  </span>
);

export default ExposureFilters;
