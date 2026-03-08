// ============================================================================
// ForexUsagePage - Admin Monitoring & Quota Tracking
// ============================================================================
// Route: /dashboard/forex/usage
//
// Data from: GET /api/forex/usage
//
// Shows:
// - Plan name
// - Monthly quota
// - Remaining requests
// - Daily average
//
// ⚠️ ADMIN ONLY
// ============================================================================

import React from 'react';
import {
  Activity,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  RefreshCw,
  Info,
  Gauge,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '../../../utils/helpers';
import { useAppSelector } from '../../../hooks/useRedux';
import { useGetForexUsageQuery, useRefreshRatesMutation } from '../api/forexApi';

export const ForexUsagePage: React.FC = () => {
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';

  // Fetch usage data
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetForexUsageQuery(undefined, {
    pollingInterval: 60000, // Refresh every minute
  });

  const usage = response?.data;

  // Admin refresh mutation
  const [refreshRates, { isLoading: isRefreshing }] = useRefreshRatesMutation();

  // Calculate usage percentage
  const usagePercent = usage
    ? Math.round((usage.usedRequests / usage.monthlyQuota) * 100)
    : 0;

  // Determine status color
  const getStatusColor = (percent: number) => {
    if (percent >= 90) return { bg: 'bg-red-500', text: 'text-red-500', label: 'Critical' };
    if (percent >= 75) return { bg: 'bg-amber-500', text: 'text-amber-500', label: 'Warning' };
    if (percent >= 50) return { bg: 'bg-blue-500', text: 'text-blue-500', label: 'Moderate' };
    return { bg: 'bg-emerald-500', text: 'text-emerald-500', label: 'Healthy' };
  };

  const status = getStatusColor(usagePercent);

  // Format date
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '—';
    try {
      return format(parseISO(dateStr), 'dd MMM yyyy, HH:mm');
    } catch {
      return dateStr;
    }
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      await refreshRates().unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to refresh rates:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw className={cn('w-8 h-8 animate-spin', isDark ? 'text-slate-500' : 'text-slate-400')} />
        <span className={cn('ml-3 text-lg', isDark ? 'text-slate-400' : 'text-slate-500')}>
          Loading usage data...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn(
        'p-6 rounded-lg border text-center',
        isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
      )}>
        <AlertTriangle className={cn('w-12 h-12 mx-auto mb-4', isDark ? 'text-red-400' : 'text-red-600')} />
        <h2 className={cn('text-lg font-semibold mb-2', isDark ? 'text-red-300' : 'text-red-800')}>
          Failed to Load Usage Data
        </h2>
        <p className={cn('text-sm mb-4', isDark ? 'text-red-400' : 'text-red-700')}>
          Unable to fetch forex API usage statistics. Please try again later.
        </p>
        <button
          onClick={() => refetch()}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-colors',
            isDark
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          )}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={cn('text-2xl font-bold', isDark ? 'text-slate-100' : 'text-slate-900')}>
            Forex API Usage
          </h1>
          <p className={cn('mt-1 text-sm', isDark ? 'text-slate-400' : 'text-slate-600')}>
            Monitor API quota and request statistics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border',
              isDark
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700'
            )}
          >
            <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
            Refresh
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
              'bg-blue-600 hover:bg-blue-700 text-white',
              isRefreshing && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Activity className={cn('w-4 h-4', isRefreshing && 'animate-pulse')} />
            Force Rate Refresh
          </button>
        </div>
      </div>

      {/* Warning Banner for Near Limit */}
      {usage?.isNearLimit && (
        <div
          className={cn(
            'flex items-center gap-3 p-4 rounded-lg border',
            isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'
          )}
        >
          <AlertTriangle className={cn('w-5 h-5', isDark ? 'text-amber-400' : 'text-amber-600')} />
          <div>
            <p className={cn('font-medium', isDark ? 'text-amber-300' : 'text-amber-800')}>
              Approaching API Quota Limit
            </p>
            <p className={cn('text-sm mt-0.5', isDark ? 'text-amber-400' : 'text-amber-700')}>
              You have used {usagePercent}% of your monthly quota. Consider upgrading your plan or reducing API calls.
            </p>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Plan Card */}
        <div
          className={cn(
            'rounded-lg border p-5',
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={cn('text-sm font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Current Plan
            </span>
            <CheckCircle className={cn('w-5 h-5', isDark ? 'text-emerald-400' : 'text-emerald-600')} />
          </div>
          <div className={cn('text-2xl font-bold', isDark ? 'text-slate-100' : 'text-slate-900')}>
            {usage?.planName || 'Free'}
          </div>
          <div className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-600')}>
            {usage?.currentMonth || 'Current Month'}
          </div>
        </div>

        {/* Quota Card */}
        <div
          className={cn(
            'rounded-lg border p-5',
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={cn('text-sm font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Monthly Quota
            </span>
            <BarChart3 className={cn('w-5 h-5', isDark ? 'text-blue-400' : 'text-blue-600')} />
          </div>
          <div className={cn('text-2xl font-bold', isDark ? 'text-slate-100' : 'text-slate-900')}>
            {usage?.monthlyQuota?.toLocaleString() || '—'}
          </div>
          <div className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-600')}>
            requests/month
          </div>
        </div>

        {/* Used Card */}
        <div
          className={cn(
            'rounded-lg border p-5',
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={cn('text-sm font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Used Requests
            </span>
            <TrendingUp className={cn('w-5 h-5', status.text)} />
          </div>
          <div className={cn('text-2xl font-bold', isDark ? 'text-slate-100' : 'text-slate-900')}>
            {usage?.usedRequests?.toLocaleString() || '—'}
          </div>
          <div className={cn('text-sm mt-1', status.text)}>
            {usagePercent}% used
          </div>
        </div>

        {/* Remaining Card */}
        <div
          className={cn(
            'rounded-lg border p-5',
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={cn('text-sm font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Remaining
            </span>
            <Gauge className={cn('w-5 h-5', isDark ? 'text-purple-400' : 'text-purple-600')} />
          </div>
          <div className={cn('text-2xl font-bold', isDark ? 'text-emerald-400' : 'text-emerald-600')}>
            {usage?.remainingRequests?.toLocaleString() || '—'}
          </div>
          <div className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-600')}>
            requests left
          </div>
        </div>
      </div>

      {/* Usage Progress Bar */}
      <div
        className={cn(
          'rounded-lg border p-5',
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className={cn('text-lg font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>
            Quota Usage
          </h2>
          <span
            className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              status.bg,
              'text-white'
            )}
          >
            {status.label}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div
            className={cn(
              'h-4 rounded-full overflow-hidden',
              isDark ? 'bg-slate-700' : 'bg-slate-200'
            )}
          >
            <div
              className={cn('h-full rounded-full transition-all duration-500', status.bg)}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
              {usage?.usedRequests?.toLocaleString() || 0} used
            </span>
            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
              {usage?.monthlyQuota?.toLocaleString() || 0} total
            </span>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div>
            <div className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Daily Average
            </div>
            <div className={cn('text-lg font-semibold mt-1', isDark ? 'text-slate-200' : 'text-slate-800')}>
              {usage?.dailyAverage?.toFixed(1) || '—'} requests/day
            </div>
          </div>
          <div>
            <div className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Last Request
            </div>
            <div className={cn('text-lg font-semibold mt-1', isDark ? 'text-slate-200' : 'text-slate-800')}>
              {formatDate(usage?.lastRequestAt)}
            </div>
          </div>
          <div>
            <div className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Quota Resets
            </div>
            <div className={cn('text-lg font-semibold mt-1', isDark ? 'text-slate-200' : 'text-slate-800')}>
              {formatDate(usage?.quotaResetAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className={cn(
            'rounded-lg border p-5',
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          )}
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock className={cn('w-5 h-5', isDark ? 'text-slate-400' : 'text-slate-500')} />
            <h3 className={cn('font-medium', isDark ? 'text-slate-200' : 'text-slate-800')}>
              Last API Request
            </h3>
          </div>
          <div className={cn('text-lg', isDark ? 'text-slate-300' : 'text-slate-700')}>
            {formatDate(usage?.lastRequestAt)}
          </div>
        </div>

        <div
          className={cn(
            'rounded-lg border p-5',
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          )}
        >
          <div className="flex items-center gap-2 mb-3">
            <Calendar className={cn('w-5 h-5', isDark ? 'text-slate-400' : 'text-slate-500')} />
            <h3 className={cn('font-medium', isDark ? 'text-slate-200' : 'text-slate-800')}>
              Quota Reset Date
            </h3>
          </div>
          <div className={cn('text-lg', isDark ? 'text-slate-300' : 'text-slate-700')}>
            {formatDate(usage?.quotaResetAt)}
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div
        className={cn(
          'flex items-start gap-3 p-4 rounded-lg border',
          isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'
        )}
      >
        <Info className={cn('w-5 h-5 flex-shrink-0 mt-0.5', isDark ? 'text-slate-400' : 'text-slate-500')} />
        <div>
          <p className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-700')}>
            API usage is tracked automatically. Quota resets at the beginning of each calendar month.
            Contact support if you need to increase your quota limit.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForexUsagePage;
