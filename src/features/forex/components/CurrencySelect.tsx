// ============================================================================
// CurrencySelect Component - Currency Dropdown
// ============================================================================
// Use cases:
// - Invoice currency selection
// - Party currency
// - Trade reference currency
//
// UX rules:
// - Show: USD – United States Dollar
// - Disable inactive currencies
// - Popular currencies first
// - Flag emoji for visual identification
// ============================================================================

import React, { useMemo, forwardRef } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { cn } from '../../../utils/helpers';
import { useCurrencyList } from '../hooks/useCurrencyList';
import { CURRENCY_FLAGS, POPULAR_CURRENCIES } from '../forexConstants';
import type { Currency } from '../types';

interface CurrencySelectProps {
  value?: string;
  onChange?: (value: string, currency?: Currency) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  required?: boolean;
  showFlag?: boolean;
  showSearch?: boolean;
  popularOnly?: boolean;
  excludeCurrencies?: string[];
  isDark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
  name?: string;
}

export const CurrencySelect = forwardRef<HTMLSelectElement, CurrencySelectProps>(
  (
    {
      value,
      onChange,
      onBlur,
      placeholder = 'Select currency',
      disabled = false,
      error = false,
      helperText,
      label,
      required = false,
      showFlag = true,
      popularOnly = false,
      excludeCurrencies = [],
      isDark = false,
      size = 'md',
      className,
      id,
      name,
    },
    ref
  ) => {
    const { currencies, isLoading, getCurrency } = useCurrencyList({
      popularFirst: true,
    });

    // Filter currencies
    const filteredCurrencies = useMemo(() => {
      let list = currencies;

      // Filter out excluded currencies
      if (excludeCurrencies.length > 0) {
        list = list.filter((c) => !excludeCurrencies.includes(c.code));
      }

      // Filter to popular only if requested
      if (popularOnly) {
        list = list.filter((c) =>
          POPULAR_CURRENCIES.includes(c.code as (typeof POPULAR_CURRENCIES)[number])
        );
      }

      return list;
    }, [currencies, excludeCurrencies, popularOnly]);

    // Get selected currency for display
    const selectedCurrency = value ? getCurrency(value) : undefined;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = e.target.value;
      const currency = getCurrency(newValue);
      onChange?.(newValue, currency);
    };

    const sizeClasses = {
      sm: 'h-8 text-sm pl-3 pr-8',
      md: 'h-10 text-sm pl-3 pr-10',
      lg: 'h-12 text-base pl-4 pr-12',
    };

    const labelSizeClasses = {
      sm: 'text-xs mb-1',
      md: 'text-sm mb-1.5',
      lg: 'text-base mb-2',
    };

    return (
      <div className={cn('relative', className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'block font-medium',
              labelSizeClasses[size],
              isDark ? 'text-slate-300' : 'text-slate-700',
              error && (isDark ? 'text-red-400' : 'text-red-600')
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Select wrapper */}
        <div className="relative">
          {/* Flag indicator */}
          {showFlag && value && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base z-10 pointer-events-none">
              {CURRENCY_FLAGS[value] || '🏳️'}
            </span>
          )}

          <select
            ref={ref}
            id={id}
            name={name}
            value={value || ''}
            onChange={handleChange}
            onBlur={onBlur}
            disabled={disabled || isLoading}
            className={cn(
              'w-full appearance-none rounded-md border transition-colors cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              sizeClasses[size],
              showFlag && value && 'pl-10', // Extra padding for flag
              // Base styles
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-100'
                : 'bg-white border-slate-300 text-slate-900',
              // Hover
              !disabled &&
                (isDark
                  ? 'hover:border-slate-600'
                  : 'hover:border-slate-400'),
              // Focus
              isDark
                ? 'focus:ring-blue-500 focus:border-blue-500'
                : 'focus:ring-blue-500 focus:border-blue-500',
              // Error
              error &&
                (isDark
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-red-500 focus:ring-red-500'),
              // Disabled
              disabled &&
                (isDark
                  ? 'bg-slate-900 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed')
            )}
          >
            <option value="" disabled>
              {isLoading ? 'Loading currencies...' : placeholder}
            </option>

            {/* Popular currencies section */}
            {!popularOnly && (
              <optgroup label="Popular Currencies">
                {filteredCurrencies
                  .filter((c) =>
                    POPULAR_CURRENCIES.includes(
                      c.code as (typeof POPULAR_CURRENCIES)[number]
                    )
                  )
                  .map((currency) => (
                    <option
                      key={currency.code}
                      value={currency.code}
                      disabled={!currency.isActive}
                    >
                      {showFlag ? `${CURRENCY_FLAGS[currency.code] || ''} ` : ''}
                      {currency.code} – {currency.name}
                    </option>
                  ))}
              </optgroup>
            )}

            {/* All currencies or filtered list */}
            {!popularOnly ? (
              <optgroup label="All Currencies">
                {filteredCurrencies
                  .filter(
                    (c) =>
                      !POPULAR_CURRENCIES.includes(
                        c.code as (typeof POPULAR_CURRENCIES)[number]
                      )
                  )
                  .map((currency) => (
                    <option
                      key={currency.code}
                      value={currency.code}
                      disabled={!currency.isActive}
                    >
                      {showFlag ? `${CURRENCY_FLAGS[currency.code] || ''} ` : ''}
                      {currency.code} – {currency.name}
                    </option>
                  ))}
              </optgroup>
            ) : (
              filteredCurrencies.map((currency) => (
                <option
                  key={currency.code}
                  value={currency.code}
                  disabled={!currency.isActive}
                >
                  {showFlag ? `${CURRENCY_FLAGS[currency.code] || ''} ` : ''}
                  {currency.code} – {currency.name}
                </option>
              ))
            )}
          </select>

          {/* Dropdown arrow */}
          <ChevronDown
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none',
              size === 'sm' ? 'w-4 h-4' : 'w-5 h-5',
              isDark ? 'text-slate-400' : 'text-slate-500'
            )}
          />
        </div>

        {/* Helper text */}
        {helperText && (
          <p
            className={cn(
              'mt-1 text-xs',
              error
                ? isDark
                  ? 'text-red-400'
                  : 'text-red-600'
                : isDark
                ? 'text-slate-400'
                : 'text-slate-500'
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

CurrencySelect.displayName = 'CurrencySelect';

export default CurrencySelect;
