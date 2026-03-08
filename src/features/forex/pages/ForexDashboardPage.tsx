// ============================================================================
// ForexDashboardPage - Dedicated Forex Module Dashboard
// ============================================================================
// Route: /dashboard/forex
//
// Layout:
// - Latest rates snapshot
// - Major currency pairs
// - Company base currency highlighted
// - Refresh button (ADMIN only)
// ============================================================================

import React, { useState } from 'react';
import {
  TrendingUp,
  RefreshCw,
  Clock,
  ArrowRight,
  Info,
  Globe,
  Activity,
  Search,
  Filter,
} from 'lucide-react';
import { cn } from '../../../utils/helpers';
import { useAppSelector } from '../../../hooks/useRedux';
import { useLatestRates } from '../hooks/useLatestRates';
import { useCurrencyList } from '../hooks/useCurrencyList';
import { ForexRateBadge } from '../components/ForexRateBadge';
import { RateTimestamp } from '../components/RateTimestamp';
import { ForexProviderBadge } from '../components/ForexProviderBadge';
import { ForexWarningBanner } from '../components/ForexWarningBanner';
import { CurrencySelect } from '../components/CurrencySelect';
import {
  MAJOR_CURRENCY_PAIRS,
  POPULAR_CURRENCIES,
  CURRENCY_FLAGS,
  COMPANY_REPORTING_CURRENCY,
} from '../forexConstants';
import { useRefreshRatesMutation } from '../api/forexApi';

export const ForexDashboardPage: React.FC = () => {
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';

  // State for base currency selection
  const [baseCurrency, setBaseCurrency] = useState<string>("USD");
  console.log('Base Currency:', baseCurrency);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyPopular, setShowOnlyPopular] = useState(true);

  // Hooks
  const {
    rates,
    timestamp,
    provider,
    isLoading,
    isFetching,
    isCached,
    isStale,
    warning,
    refetch,
    data: latestData,
  } = useLatestRates({ baseCurrency });

  const { currencies, getCurrencyName, getCurrencyFlag } = useCurrencyList();

  // Admin refresh mutation
  const [refreshRates, { isLoading: isRefreshing }] = useRefreshRatesMutation();

  // Check if user is admin (simplified - should come from auth context)
  const isAdmin = true; // TODO: Replace with actual admin check

  // Handle manual refresh (admin only)
  const handleRefresh = async () => {
    try {
      await refreshRates().unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to refresh rates:', error);
    }
  };

  // Filter rates based on search and popular filter
  const filteredRates = React.useMemo(() => {
    if (!rates) return [];

    let entries = Object.entries(rates);

    // Filter out base currency
    entries = entries.filter(([code]) => code !== baseCurrency);

    // Filter to popular only
    if (showOnlyPopular) {
      entries = entries.filter(([code]) =>
        POPULAR_CURRENCIES.includes(code as (typeof POPULAR_CURRENCIES)[number])
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      entries = entries.filter(([code]) => {
        const name = getCurrencyName(code)?.toLowerCase() || '';
        return code.toLowerCase().includes(query) || name.includes(query);
      });
    }

    return entries;
  }, [rates, baseCurrency, showOnlyPopular, searchQuery, getCurrencyName]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={cn('text-2xl font-bold', isDark ? 'text-slate-100' : 'text-slate-900')}>
            Forex Rates
          </h1>
          <p className={cn('mt-1 text-sm', isDark ? 'text-slate-400' : 'text-slate-600')}>
            Live exchange rates for reference and exposure valuation
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timestamp */}
          {timestamp && (
            <RateTimestamp
              timestamp={timestamp}
              isCached={isCached}
              provider={provider}
              isDark={isDark}
              size="sm"
            />
          )}

          {/* Admin Refresh Button */}
          {isAdmin && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isFetching}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                  : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
                (isRefreshing || isFetching) && 'opacity-50 cursor-not-allowed'
              )}
            >
              <RefreshCw className={cn('w-4 h-4', (isRefreshing || isFetching) && 'animate-spin')} />
              Refresh Rates
            </button>
          )}
        </div>
      </div>

      {/* Warning Banner */}
      {(warning || isStale) && (
        <ForexWarningBanner
          type={isStale ? 'stale' : 'cached'}
          message={warning}
          isDark={isDark}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Base Currency Card */}
        <div
          className={cn(
            'rounded-lg border p-4',
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          )}
        >
          <div className="flex items-center justify-between">
            <div className={cn('text-sm font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Base Currency
            </div>
            <Globe className={cn('w-5 h-5', isDark ? 'text-blue-400' : 'text-blue-600')} />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-2xl">{CURRENCY_FLAGS[baseCurrency] || '🏳️'}</span>
            <span className={cn('text-xl font-bold', isDark ? 'text-slate-100' : 'text-slate-900')}>
              {baseCurrency}
            </span>
          </div>
        </div>

        {/* Provider Card */}
        <div
          className={cn(
            'rounded-lg border p-4',
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          )}
        >
          <div className="flex items-center justify-between">
            <div className={cn('text-sm font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Data Provider
            </div>
            <Activity className={cn('w-5 h-5', isDark ? 'text-emerald-400' : 'text-emerald-600')} />
          </div>
          <div className="mt-2">
            {provider ? (
              <ForexProviderBadge provider={provider} isDark={isDark} size="md" />
            ) : (
              <span className={cn('text-lg', isDark ? 'text-slate-400' : 'text-slate-500')}>—</span>
            )}
          </div>
        </div>

        {/* Rates Count Card */}
        <div
          className={cn(
            'rounded-lg border p-4',
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          )}
        >
          <div className="flex items-center justify-between">
            <div className={cn('text-sm font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Available Rates
            </div>
            <TrendingUp className={cn('w-5 h-5', isDark ? 'text-purple-400' : 'text-purple-600')} />
          </div>
          <div className="mt-2">
            <span className={cn('text-2xl font-bold', isDark ? 'text-slate-100' : 'text-slate-900')}>
              {rates ? Object.keys(rates).length : 0}
            </span>
            <span className={cn('text-sm ml-2', isDark ? 'text-slate-400' : 'text-slate-500')}>
              currencies
            </span>
          </div>
        </div>

        {/* Last Update Card */}
        <div
          className={cn(
            'rounded-lg border p-4',
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          )}
        >
          <div className="flex items-center justify-between">
            <div className={cn('text-sm font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Status
            </div>
            <Clock className={cn('w-5 h-5', isDark ? 'text-amber-400' : 'text-amber-600')} />
          </div>
          <div className="mt-2">
            <span
              className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-sm font-medium',
                isCached
                  ? isDark
                    ? 'bg-amber-900/30 text-amber-400'
                    : 'bg-amber-100 text-amber-700'
                  : isDark
                  ? 'bg-emerald-900/30 text-emerald-400'
                  : 'bg-emerald-100 text-emerald-700'
              )}
            >
              {isCached ? '○ Cached' : '● Live'}
            </span>
          </div>
        </div>
      </div>

      {/* Major Currency Pairs */}
      <div
        className={cn(
          'rounded-lg border',
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        )}
      >
        <div className={cn('px-4 py-3 border-b', isDark ? 'border-slate-700' : 'border-slate-200')}>
          <h2 className={cn('text-lg font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>
            Major Currency Pairs
          </h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {MAJOR_CURRENCY_PAIRS.map(({ from, to, label }) => {
              const rate = rates && rates[to] && rates[from] ? rates[to] / rates[from] : null;
              return (
                <div
                  key={label}
                  className={cn(
                    'p-3 rounded-lg border text-center',
                    isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'
                  )}
                >
                  <div className={cn('text-xs font-medium mb-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    {label}
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span>{CURRENCY_FLAGS[from]}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span>{CURRENCY_FLAGS[to]}</span>
                  </div>
                  <div className={cn('text-lg font-bold mt-1', isDark ? 'text-slate-100' : 'text-slate-900')}>
                    {rate ? rate.toFixed(4) : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* All Rates Table */}
      <div
        className={cn(
          'rounded-lg border',
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        )}
      >
        {/* Table Header with Filters */}
        <div
          className={cn(
            'px-4 py-3 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3',
            isDark ? 'border-slate-700' : 'border-slate-200'
          )}
        >
          <h2 className={cn('text-lg font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>
            All Exchange Rates
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            {/* Base Currency Selector */}
            <div className="w-40">
              <CurrencySelect
                value={baseCurrency}
                onChange={(value) => setBaseCurrency(value)}
                popularOnly
                isDark={isDark}
                size="sm"
                showFlag
              />
            </div>

            {/* Search */}
            <div className="relative">
              <Search
                className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
                  isDark ? 'text-slate-400' : 'text-slate-500'
                )}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search currency..."
                className={cn(
                  'pl-9 pr-3 py-2 text-sm rounded-md border w-40',
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                )}
              />
            </div>

            {/* Popular Only Toggle */}
            <button
              onClick={() => setShowOnlyPopular(!showOnlyPopular)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm rounded-md border transition-colors',
                showOnlyPopular
                  ? isDark
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-blue-600 border-blue-500 text-white'
                  : isDark
                  ? 'bg-slate-700 border-slate-600 text-slate-300'
                  : 'bg-white border-slate-300 text-slate-700'
              )}
            >
              <Filter className="w-4 h-4" />
              {showOnlyPopular ? 'Popular' : 'All'}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className={cn('w-6 h-6 animate-spin', isDark ? 'text-slate-500' : 'text-slate-400')} />
              <span className={cn('ml-2', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Loading rates...
              </span>
            </div>
          ) : filteredRates.length === 0 ? (
            <div className={cn('py-12 text-center', isDark ? 'text-slate-400' : 'text-slate-500')}>
              No currencies found matching your criteria
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className={cn('border-b', isDark ? 'border-slate-700' : 'border-slate-200')}>
                  <th
                    className={cn(
                      'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider',
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    )}
                  >
                    Currency
                  </th>
                  <th
                    className={cn(
                      'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider',
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    )}
                  >
                    Name
                  </th>
                  <th
                    className={cn(
                      'px-4 py-3 text-right text-xs font-medium uppercase tracking-wider',
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    )}
                  >
                    Rate (1 {baseCurrency} =)
                  </th>
                  <th
                    className={cn(
                      'px-4 py-3 text-right text-xs font-medium uppercase tracking-wider',
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    )}
                  >
                    Inverse
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredRates.map(([code, rate]) => {
                  const inverse = rate > 0 ? 1 / rate : 0;
                  return (
                    <tr
                      key={code}
                      className={cn(
                        'transition-colors',
                        isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{CURRENCY_FLAGS[code] || '🏳️'}</span>
                          <span className={cn('font-medium', isDark ? 'text-slate-200' : 'text-slate-900')}>
                            {code}
                          </span>
                        </div>
                      </td>
                      <td className={cn('px-4 py-3 text-sm', isDark ? 'text-slate-400' : 'text-slate-600')}>
                        {getCurrencyName(code)}
                      </td>
                      <td className={cn('px-4 py-3 text-right font-mono', isDark ? 'text-slate-200' : 'text-slate-900')}>
                        {rate.toFixed(rate >= 100 ? 2 : 4)}
                      </td>
                      <td className={cn('px-4 py-3 text-right font-mono text-sm', isDark ? 'text-slate-400' : 'text-slate-600')}>
                        {inverse.toFixed(inverse >= 100 ? 2 : 6)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div
        className={cn(
          'flex items-start gap-3 p-4 rounded-lg border',
          isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
        )}
      >
        <Info className={cn('w-5 h-5 flex-shrink-0 mt-0.5', isDark ? 'text-blue-400' : 'text-blue-600')} />
        <div>
          <p className={cn('text-sm font-medium', isDark ? 'text-blue-300' : 'text-blue-800')}>
            Informational Rates Only
          </p>
          <p className={cn('text-sm mt-1', isDark ? 'text-blue-400' : 'text-blue-700')}>
            These exchange rates are for reference purposes only. They do not modify accounting data
            and should not be used for actual currency conversions. Actual rates at settlement may differ.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForexDashboardPage;
