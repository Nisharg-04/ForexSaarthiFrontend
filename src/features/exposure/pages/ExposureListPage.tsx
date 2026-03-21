// ═══════════════════════════════════════════════════════════════════════════════
// EXPOSURE LIST PAGE
// Route: /dashboard/exposures/list - Full exposure list with filters and status tabs
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Download,
  RefreshCw,
  ChevronLeft,
  Filter,
  X,
  LayoutGrid,
  List,
  AlertCircle,
} from 'lucide-react';

import { useAppSelector } from '../../../hooks/useRedux';
import { useGetExposuresQuery } from '../api/exposureApi';
import { ExposureTable } from '../components/ExposureTable';
import { ExposureFilters } from '../components/ExposureFilters';
import { AmountSummaryCards } from '../components/ExposureSummaryCards';
import { ForwardHedgeModal } from '../modals/ForwardHedgeModal';
import { BookForwardContractModal } from '../modals/BookForwardContractModal';
import { NaturalHedgeModal } from '../modals/NaturalHedgeModal';
import { CloseHedgeModal } from '../modals/CloseHedgeModal';
import { useExposureFilters, useExposureStatusTab } from '../hooks/useExposureFilters';
import { useExposurePermissions } from '../hooks/useExposurePermissions';
import { ExposureStatus, type Exposure } from '../types';
import {
  EXPOSURE_STATUS_STYLES,
  EXPOSURE_STATUS_TABS,
} from '../exposureConstants';

interface ExposureListPageProps {
  isDark?: boolean;
}

export const ExposureListPage: React.FC<ExposureListPageProps> = ({ isDark: propIsDark }) => {
  const theme = useAppSelector((state) => state.ui?.theme);
  const isDark = propIsDark ?? theme === 'dark';
  
  const permissions = useExposurePermissions();
  const { filters, updateFilter, clearFilters, hasActiveFilters, activeFilterCount } = useExposureFilters();
  const { activeTab, setActiveTab } = useExposureStatusTab();

  // View state
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modal state
  const [forwardHedgeModal, setForwardHedgeModal] = useState<{ open: boolean; exposure?: Exposure }>({
    open: false,
  });
  const [bookForwardModal, setBookForwardModal] = useState<{ open: boolean; exposure?: Exposure }>({
    open: false,
  });
  const [naturalHedgeModal, setNaturalHedgeModal] = useState<{ open: boolean; exposure?: Exposure }>({
    open: false,
  });
  const [closeHedgeModal, setCloseHedgeModal] = useState<{ open: boolean; exposure?: Exposure }>({
    open: false,
  });

  // Build query params
  const queryParams = useMemo(() => ({
    ...filters,
  }), [filters]);

  // Fetch exposures
  const {
    data: exposureData,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useGetExposuresQuery(queryParams);

  // Calculate status counts for tabs
  const statusCounts = useMemo(() => {
    const counts: Record<ExposureStatus | 'ALL', number> = {
      ALL: exposureData?.pagination?.total || 0,
      [ExposureStatus.UNHEDGED]: 0,
      [ExposureStatus.PARTIALLY_HEDGED]: 0,
      [ExposureStatus.FULLY_HEDGED]: 0,
      [ExposureStatus.SETTLED]: 0,
      [ExposureStatus.OVERDUE]: 0,
    };

    // These would ideally come from the API
    exposureData?.data?.forEach((exposure) => {
      if (exposure.status && counts[exposure.status] !== undefined) {
        counts[exposure.status]++;
      }
    });

    return counts;
  }, [exposureData]);

  // Summary calculations
  const summary = useMemo(() => {
    const data = exposureData?.data || [];
    return {
      totalRecords: data.length,
      totalReceivables: data.filter(e => e.type === 'RECEIVABLE').reduce((sum, e) => sum + e.inrValue, 0),
      totalPayables: data.filter(e => e.type === 'PAYABLE').reduce((sum, e) => sum + e.inrValue, 0),
      totalHedged: data.reduce((sum, e) => sum + e.hedgedAmountINR, 0),
      totalUnhedged: data.reduce((sum, e) => sum + e.unhedgedAmountINR, 0),
    };
  }, [exposureData]);

  // Action handlers
  const handleApplyForwardHedge = (exposure: Exposure) => {
    setForwardHedgeModal({ open: true, exposure });
  };

  const handleBookForward = (exposure: Exposure) => {
    setBookForwardModal({ open: true, exposure });
  };

  const handleApplyNaturalHedge = (exposure: Exposure) => {
    setNaturalHedgeModal({ open: true, exposure });
  };

  const handleCloseHedge = (exposure: Exposure) => {
    setCloseHedgeModal({ open: true, exposure });
  };

  const handlePageChange = (page: number) => {
    updateFilter('page', page);
  };

  const handlePageSizeChange = (pageSize: number) => {
    updateFilter('pageSize', pageSize);
  };

  const handleSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    updateFilter('sortBy', sortBy as any);
    updateFilter('sortOrder', sortOrder);
  };

  // Theme classes
  const bgClass = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBgClass = isDark ? 'bg-gray-800' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgClass}`}>
      {/* Header */}
      <div className={`${cardBgClass} border-b ${borderClass} sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard/exposures"
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <ChevronLeft className={`h-5 w-5 ${textMutedClass}`} />
              </Link>
              <div>
                <h1 className={`text-xl font-bold ${textClass}`}>Forex Exposures</h1>
                <p className={`text-sm ${textMutedClass}`}>
                  {exposureData?.pagination?.total || 0} total exposures
                  {isFetching && !isLoading && ' • Updating...'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className={`flex rounded-lg border ${borderClass} overflow-hidden`}>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 transition-colors ${
                    viewMode === 'table'
                      ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      : isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 transition-colors ${
                    viewMode === 'cards'
                      ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      : isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`
                  inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                  transition-colors border ${borderClass}
                  ${showFilters
                    ? 'bg-blue-600 text-white border-blue-600'
                    : isDark ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className={`
                    px-1.5 py-0.5 rounded-full text-xs
                    ${showFilters ? 'bg-blue-500' : isDark ? 'bg-blue-600' : 'bg-blue-100 text-blue-700'}
                  `}>
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className={`
                  inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                  transition-colors border ${borderClass}
                  ${isDark ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'}
                  disabled:opacity-50
                `}
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              </button>

              <button
                className={`
                  inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                  transition-colors border ${borderClass}
                  ${isDark ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'}
                `}
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                ${activeTab === 'ALL'
                  ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                  : isDark ? 'text-gray-400 hover:bg-gray-700/50' : 'text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              All
              <span className={`ml-1.5 ${textMutedClass}`}>({statusCounts.ALL})</span>
            </button>
            {EXPOSURE_STATUS_TABS.filter(tab => tab.value !== undefined).map((tab) => {
              const status = tab.value as ExposureStatus;
              const styles = EXPOSURE_STATUS_STYLES[status];
              const isActive = activeTab === status;
              return (
                <button
                  key={status}
                  onClick={() => setActiveTab(status)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                    ${isActive
                      ? isDark ? styles.dark : styles.light
                      : isDark ? 'text-gray-400 hover:bg-gray-700/50' : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  {tab.label}
                  <span className={`ml-1.5 ${isActive ? 'opacity-70' : textMutedClass}`}>
                    ({statusCounts[status]})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className={`${cardBgClass} border-b ${borderClass}`}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <ExposureFilters
              filters={filters}
              onFiltersChange={(newFilters) => {
                Object.keys(newFilters).forEach(key => {
                  updateFilter(key as any, newFilters[key as keyof typeof newFilters]);
                });
              }}
              isDark={isDark}
            />
          </div>
        </div>
      )}

      {/* Active Filter Pills */}
      {hasActiveFilters && !showFilters && (
        <div className={`${cardBgClass} border-b ${borderClass}`}>
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto">
            <span className={`text-sm ${textMutedClass} whitespace-nowrap`}>Active filters:</span>
            {(Array.isArray(filters.status) ? filters.status : filters.status ? [filters.status] : [])
              .filter((status: ExposureStatus) => EXPOSURE_STATUS_STYLES[status])
              .map((status: ExposureStatus) => (
              <span
                key={status}
                className={`
                  inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                  ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}
                `}
              >
                {EXPOSURE_STATUS_STYLES[status]?.label || status}
                <button
                  onClick={() => {
                    const currentStatuses = Array.isArray(filters.status) ? filters.status : filters.status ? [filters.status] : [];
                    updateFilter('status', currentStatuses.filter((s: ExposureStatus) => s !== status));
                  }}
                  className="hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {filters.search && (
              <span
                className={`
                  inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                  ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}
                `}
              >
                Search: "{filters.search}"
                <button
                  onClick={() => updateFilter('search', '')}
                  className="hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'} hover:underline whitespace-nowrap`}
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Summary Cards */}
        <AmountSummaryCards
          totalReceivables={summary.totalReceivables}
          totalPayables={summary.totalPayables}
          totalHedged={summary.totalHedged}
          totalUnhedged={summary.totalUnhedged}
          isDark={isDark}
          className="mb-6"
        />

        {/* Error State */}
        {error && (
          <div className={`
            ${cardBgClass} rounded-lg border ${borderClass} p-6 text-center mb-6
            ${isDark ? 'border-red-800' : 'border-red-200'}
          `}>
            <AlertCircle className={`h-12 w-12 mx-auto mb-3 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
            <h3 className={`text-lg font-medium ${textClass} mb-1`}>Failed to load exposures</h3>
            <p className={`${textMutedClass} mb-4`}>
              There was an error fetching the exposure data. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className={`${cardBgClass} rounded-lg border ${borderClass}`}>
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className={`h-10 w-10 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                  <div className="flex-1 space-y-2">
                    <div className={`h-4 w-1/3 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                    <div className={`h-3 w-1/2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                  </div>
                  <div className={`h-8 w-24 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Table */}
        {!isLoading && !error && (
          <div className={`${cardBgClass} rounded-lg border ${borderClass} overflow-hidden`}>
            <ExposureTable
              exposures={exposureData?.data || []}
              isDark={isDark}
              onApplyForwardHedge={permissions.canHedge ? handleApplyForwardHedge : undefined}
              onBookForward={permissions.canHedge ? handleBookForward : undefined}
              onApplyNaturalHedge={permissions.canHedge ? handleApplyNaturalHedge : undefined}
              onCloseHedge={permissions.canCloseHedge ? handleCloseHedge : undefined}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              onSort={handleSort}
            />

            {/* Pagination */}
            {exposureData?.pagination && (
              <div className={`flex items-center justify-between px-4 py-3 border-t ${borderClass}`}>
                <div className={`text-sm ${textMutedClass}`}>
                  Showing {((exposureData.pagination.page - 1) * exposureData.pagination.limit) + 1} to{' '}
                  {Math.min(exposureData.pagination.page * exposureData.pagination.limit, exposureData.pagination.total)} of{' '}
                  {exposureData.pagination.total} results
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={filters.pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className={`
                      px-2 py-1 rounded border ${borderClass} text-sm
                      ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}
                    `}
                  >
                    <option value={10}>10 / page</option>
                    <option value={25}>25 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                  </select>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(filters.page! - 1)}
                      disabled={filters.page === 1}
                      className={`
                        px-3 py-1 rounded border ${borderClass} text-sm
                        ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50'}
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      Previous
                    </button>
                    <span className={`px-3 py-1 text-sm ${textMutedClass}`}>
                      Page {exposureData.pagination.page} of {exposureData.pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(filters.page! + 1)}
                      disabled={filters.page === exposureData.pagination.totalPages}
                      className={`
                        px-3 py-1 rounded border ${borderClass} text-sm
                        ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50'}
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {forwardHedgeModal.exposure && (
        <ForwardHedgeModal
          isOpen={forwardHedgeModal.open}
          onClose={() => setForwardHedgeModal({ open: false })}
          exposure={forwardHedgeModal.exposure}
          isDark={isDark}
        />
      )}

      {bookForwardModal.exposure && (
        <BookForwardContractModal
          isOpen={bookForwardModal.open}
          onClose={() => setBookForwardModal({ open: false })}
          exposure={{
            id: bookForwardModal.exposure.id,
            currency: bookForwardModal.exposure.currency,
            unhedgedAmount: bookForwardModal.exposure.unhedgedAmount,
            maturityDate: bookForwardModal.exposure.maturityDate,
            description: bookForwardModal.exposure.description,
          }}
          isDark={isDark}
        />
      )}

      {naturalHedgeModal.exposure && (
        <NaturalHedgeModal
          isOpen={naturalHedgeModal.open}
          onClose={() => setNaturalHedgeModal({ open: false })}
          exposure={naturalHedgeModal.exposure}
          isDark={isDark}
        />
      )}

      {closeHedgeModal.exposure && (
        <CloseHedgeModal
          isOpen={closeHedgeModal.open}
          onClose={() => setCloseHedgeModal({ open: false })}
          exposure={closeHedgeModal.exposure}
          isDark={isDark}
        />
      )}
    </div>
  );
};

export default ExposureListPage;
