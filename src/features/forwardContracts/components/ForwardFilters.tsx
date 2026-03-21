// ═══════════════════════════════════════════════════════════════════════════════
// FORWARD FILTERS COMPONENT
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { cn } from '../../../utils/helpers';
import type { ForwardFilters as ForwardFiltersType, ForwardStatus } from '../types';
import { FORWARD_STATUS_OPTIONS, COMMON_BANKS, QUARTERS } from '../forwardConstants';
import { getYearOptions } from '../forwardUtils';

// ─────────────────────────────────────────────────────────────────────────────────
// PROPS INTERFACE
// ─────────────────────────────────────────────────────────────────────────────────
interface ForwardFiltersProps {
  filters: ForwardFiltersType;
  onFilterChange: <K extends keyof ForwardFiltersType>(key: K, value: ForwardFiltersType[K]) => void;
  onClearFilters: () => void;
  isDark?: boolean;
  currencies?: string[];
  hasActiveFilters?: boolean;
  activeFilterCount?: number;
  showSearch?: boolean;
  compact?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────────
// SELECT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────────
interface SelectProps {
  value: string | number | undefined;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  isDark: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  isDark,
  className,
}) => (
  <div className={cn('relative', className)}>
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'w-full h-9 pl-3 pr-8 text-sm rounded-lg border appearance-none cursor-pointer transition-colors',
        isDark
          ? 'bg-slate-800 border-slate-700 text-white focus:border-cyan-500'
          : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500',
        'focus:outline-none focus:ring-1',
        isDark ? 'focus:ring-cyan-500' : 'focus:ring-teal-500'
      )}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <ChevronDown
      className={cn(
        'absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none',
        isDark ? 'text-slate-400' : 'text-slate-500'
      )}
    />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────────
export const ForwardFilters: React.FC<ForwardFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  isDark = false,
  currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AED', 'AUD', 'CAD', 'CHF', 'SGD'],
  hasActiveFilters = false,
  activeFilterCount = 0,
  showSearch = true,
  compact = false,
}) => {
  const yearOptions = getYearOptions();
  
  const currencyOptions = [
    { value: '', label: 'All Currencies' },
    ...currencies.map((c) => ({ value: c, label: c })),
  ];

  const bankOptions = [
    { value: '', label: 'All Banks' },
    ...COMMON_BANKS.map((b: string) => ({ value: b, label: b })),
  ];

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {/* Search */}
        {showSearch && (
          <div className="relative flex-1 min-w-[200px]">
            <Search
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            />
            <input
              type="text"
              placeholder="Search contracts..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className={cn(
                'w-full h-9 pl-9 pr-3 text-sm rounded-lg border transition-colors',
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-teal-500',
                'focus:outline-none focus:ring-1',
                isDark ? 'focus:ring-cyan-500' : 'focus:ring-teal-500'
              )}
            />
          </div>
        )}

        {/* Status */}
        <Select
          value={filters.status}
          onChange={(v) => onFilterChange('status', v as ForwardStatus | '')}
          options={FORWARD_STATUS_OPTIONS.map((o: typeof FORWARD_STATUS_OPTIONS[number]) => ({ value: o.value, label: o.label }))}
          isDark={isDark}
          className="w-36"
        />

        {/* Currency */}
        <Select
          value={filters.currency}
          onChange={(v) => onFilterChange('currency', v)}
          options={currencyOptions}
          isDark={isDark}
          className="w-36"
        />

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className={cn(
              'flex items-center gap-1.5 px-3 h-9 text-sm rounded-lg transition-colors',
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            )}
          >
            <X className="w-4 h-4" />
            Clear ({activeFilterCount})
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-4 rounded-lg border',
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <Filter className={cn('w-4 h-4', isDark ? 'text-slate-400' : 'text-slate-500')} />
        <h3 className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
          Filters
        </h3>
        {hasActiveFilters && (
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              isDark ? 'bg-cyan-900/30 text-cyan-400' : 'bg-teal-100 text-teal-700'
            )}
          >
            {activeFilterCount} active
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Search */}
        {showSearch && (
          <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
            <label
              className={cn('block text-xs font-medium mb-1.5', isDark ? 'text-slate-400' : 'text-slate-500')}
            >
              Search
            </label>
            <div className="relative">
              <Search
                className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
                  isDark ? 'text-slate-400' : 'text-slate-500'
                )}
              />
              <input
                type="text"
                placeholder="Contract ref, invoice..."
                value={filters.search || ''}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className={cn(
                  'w-full h-9 pl-9 pr-3 text-sm rounded-lg border transition-colors',
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-teal-500',
                  'focus:outline-none focus:ring-1',
                  isDark ? 'focus:ring-cyan-500' : 'focus:ring-teal-500'
                )}
              />
            </div>
          </div>
        )}

        {/* Currency */}
        <div>
          <label
            className={cn('block text-xs font-medium mb-1.5', isDark ? 'text-slate-400' : 'text-slate-500')}
          >
            Currency
          </label>
          <Select
            value={filters.currency}
            onChange={(v) => onFilterChange('currency', v)}
            options={currencyOptions}
            isDark={isDark}
          />
        </div>

        {/* Bank */}
        <div>
          <label
            className={cn('block text-xs font-medium mb-1.5', isDark ? 'text-slate-400' : 'text-slate-500')}
          >
            Bank
          </label>
          <Select
            value={filters.bank}
            onChange={(v) => onFilterChange('bank', v)}
            options={bankOptions}
            isDark={isDark}
          />
        </div>

        {/* Status */}
        <div>
          <label
            className={cn('block text-xs font-medium mb-1.5', isDark ? 'text-slate-400' : 'text-slate-500')}
          >
            Status
          </label>
          <Select
            value={filters.status as string}
            onChange={(v) => onFilterChange('status', v as ForwardStatus | '')}
            options={FORWARD_STATUS_OPTIONS.map((o: typeof FORWARD_STATUS_OPTIONS[number]) => ({ value: o.value, label: o.label }))}
            isDark={isDark}
          />
        </div>

        {/* Year */}
        <div>
          <label
            className={cn('block text-xs font-medium mb-1.5', isDark ? 'text-slate-400' : 'text-slate-500')}
          >
            Year
          </label>
          <Select
            value={filters.year ? String(filters.year) : ''}
            onChange={(v) => onFilterChange('year', v ? parseInt(v) : undefined)}
            options={[{ value: '', label: 'All Years' }, ...yearOptions.map(y => ({ value: String(y), label: String(y) }))]}
            isDark={isDark}
          />
        </div>

        {/* Quarter */}
        <div>
          <label
            className={cn('block text-xs font-medium mb-1.5', isDark ? 'text-slate-400' : 'text-slate-500')}
          >
            Quarter
          </label>
          <Select
            value={filters.quarter}
            onChange={(v) => onFilterChange('quarter', v)}
            options={[{ value: '', label: 'All Quarters' }, ...QUARTERS.map((q) => ({ value: q, label: q }))]}
            isDark={isDark}
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t flex justify-end">
          <button
            onClick={onClearFilters}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-300'
            )}
          >
            <X className="w-4 h-4" />
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
