// ═══════════════════════════════════════════════════════════════════════════════
// HEDGE MANAGEMENT PAGE
// Page for viewing and managing all hedge records
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback } from 'react';
import {
  RefreshCw,
  Plus,
  Filter,
  Download,
  FileSpreadsheet,
  RefreshCcw,
  FileText,
} from 'lucide-react';
import { cn } from '../../../utils/helpers';
import { useAppSelector } from '../../../hooks/useRedux';
import { useGetHedgesQuery, useGetHedgesByQuarterQuery } from '../api/hedgingApi';
import { HedgeManagementTable } from '../components/HedgeManagementTable';
import { QuarterlyNaturalHedgeModal } from '../modals/QuarterlyNaturalHedgeModal';
import { BookForwardContractModal } from '../modals/BookForwardContractModal';
import { CloseHedgeRecordModal } from '../modals/CloseHedgeRecordModal';
import { getUpcomingQuarters, getCurrentQuarter } from '../hedgingUtils';
import type { HedgeRecordResponse, HedgeFilters } from '../hedgingTypes';
import { HEDGE_TYPE_TABS, HEDGE_STATUS_TABS } from '../hedgingConstants';

// ─────────────────────────────────────────────────────────────────────────────────
// PROPS INTERFACE
// ─────────────────────────────────────────────────────────────────────────────────
interface HedgeManagementPageProps {
  isDark?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────────
export const HedgeManagementPage: React.FC<HedgeManagementPageProps> = ({ isDark: propIsDark }) => {
  const theme = useAppSelector((state) => state.ui?.theme);
  const isDark = propIsDark ?? theme === 'dark';

  // Filter state
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [selectedQuarter, setSelectedQuarter] = useState<string>(getCurrentQuarter());

  // Modal state
  const [naturalHedgeModalOpen, setNaturalHedgeModalOpen] = useState(false);
  const [bookForwardOpen, setBookForwardOpen] = useState(false);
  const [closeHedgeModal, setCloseHedgeModal] = useState<{
    open: boolean;
    hedge: HedgeRecordResponse | null;
  }>({ open: false, hedge: null });

  // Quarters for filter
  const quarters = useMemo(() => {
    const upcoming = getUpcomingQuarters(4);
    const previous = ['Q4-2025', 'Q3-2025', 'Q2-2025', 'Q1-2025']; // Add some historical quarters
    return [...upcoming, ...previous];
  }, []);

  // Build filters
  const filters: HedgeFilters = useMemo(() => {
    const f: HedgeFilters = {};
    if (selectedType) f.type = selectedType as any;
    if (selectedStatus) f.status = selectedStatus as any;
    if (selectedQuarter) f.quarter = selectedQuarter;
    return f;
  }, [selectedType, selectedStatus, selectedQuarter]);

  // Fetch hedges
  const {
    data: hedgesData,
    isLoading,
    isFetching,
    refetch,
  } = useGetHedgesQuery(filters);

  // Filter hedges locally based on type and status
  const filteredHedges = useMemo(() => {
    let result = hedgesData?.data || [];
    
    // Apply type filter
    if (selectedType) {
      result = result.filter(h => h.type === selectedType);
    }
    
    // Apply status filter
    if (selectedStatus) {
      result = result.filter(h => h.status === selectedStatus);
    }
    
    return result;
  }, [hedgesData, selectedType, selectedStatus]);

  // Stats
  const stats = useMemo(() => {
    const hedges = hedgesData?.data || [];
    return {
      total: hedges.length,
      natural: hedges.filter((h) => h.type === 'NATURAL').length,
      forward: hedges.filter((h) => h.type === 'FORWARD').length,
      active: hedges.filter((h) => h.status === 'ACTIVE').length,
      closed: hedges.filter((h) => h.status === 'CLOSED').length,
    };
  }, [hedgesData]);

  // Handlers
  const handleCloseHedge = useCallback((hedge: HedgeRecordResponse) => {
    setCloseHedgeModal({ open: true, hedge });
  }, []);

  const handleViewHedge = useCallback((hedge: HedgeRecordResponse) => {
    // Could open a detail modal or navigate to detail page
    console.log('View hedge:', hedge);
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleExport = useCallback(() => {
    if (!filteredHedges.length) return;

    const escapeCsvValue = (value: string | number | undefined | null) => {
      const stringValue = value == null ? '' : String(value);
      if (/[",\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const headers = [
      'Hedge ID',
      'Type',
      'Status',
      'Quarter',
      'Currency',
      'Hedge Amount',
      'Rate',
      'Contract Number',
      'Bank Name',
      'Receivable Invoice',
      'Payable Invoice',
      'Created At',
    ];

    const rows = filteredHedges.map((hedge) => [
      hedge.id,
      hedge.type,
      hedge.status,
      hedge.quarter,
      hedge.currency,
      hedge.hedgeAmount,
      hedge.hedgeRate ?? hedge.rate,
      hedge.contractNumber,
      hedge.bankName,
      hedge.receivableInvoiceNumber ?? hedge.receivableExposure?.invoiceNumber,
      hedge.payableInvoiceNumber ?? hedge.payableExposure?.invoiceNumber,
      hedge.createdAt,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => escapeCsvValue(value)).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    const quarterSegment = selectedQuarter || 'all-quarters';
    const typeSegment = selectedType || 'all-types';
    const statusSegment = selectedStatus || 'all-statuses';
    a.download = `hedges-${quarterSegment}-${typeSegment}-${statusSegment}.csv`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [filteredHedges, selectedQuarter, selectedType, selectedStatus]);

  // Theme classes
  const bgClass = isDark ? 'bg-slate-900' : 'bg-slate-50';
  const cardBgClass = isDark ? 'bg-slate-800' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-slate-900';
  const mutedTextClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const borderClass = isDark ? 'border-slate-700' : 'border-slate-200';

  return (
    <div className={cn('min-h-screen', bgClass)}>
      {/* Header */}
      <div className={cn('border-b', borderClass, cardBgClass)}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={cn('text-2xl font-bold', textClass)}>Hedge Management</h1>
              <p className={cn('text-sm mt-1', mutedTextClass)}>
                Manage natural hedges and forward contracts
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isFetching}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isDark
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
                Refresh
              </button>
              <button
                onClick={() => setNaturalHedgeModalOpen(true)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                  isDark
                    ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                    : 'bg-teal-500 text-white hover:bg-teal-600'
                )}
              >
                <RefreshCcw className="w-4 h-4" />
                Apply Natural Hedge
              </button>
              <button
                onClick={() => setBookForwardOpen(true)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                  isDark
                    ? 'bg-violet-500 text-white hover:bg-violet-600'
                    : 'bg-violet-600 text-white hover:bg-violet-700'
                )}
              >
                <FileText className="w-4 h-4" />
                Book Forward Contract
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Total Hedges', value: stats.total, color: 'slate' },
            { label: 'Natural Hedges', value: stats.natural, color: 'cyan' },
            { label: 'Forward Contracts', value: stats.forward, color: 'violet' },
            { label: 'Active', value: stats.active, color: 'green' },
            { label: 'Closed', value: stats.closed, color: 'gray' },
          ].map((stat) => (
            <div
              key={stat.label}
              className={cn(
                'p-4 rounded-lg border',
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              )}
            >
              <p className={cn('text-xs font-medium', mutedTextClass)}>{stat.label}</p>
              <p className={cn('text-2xl font-bold mt-1', textClass)}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div
          className={cn(
            'flex items-center gap-4 p-4 rounded-lg border',
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          )}
        >
          {/* Quarter Filter */}
          <div className="flex items-center gap-2">
            <span className={cn('text-sm font-medium', mutedTextClass)}>Quarter:</span>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-lg border',
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-white border-slate-200 text-slate-900'
              )}
            >
              <option value="">All Quarters</option>
              {quarters.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>

          {/* Type Tabs */}
          <div className="flex items-center gap-1 ml-4">
            <span className={cn('text-sm font-medium mr-2', mutedTextClass)}>Type:</span>
            {HEDGE_TYPE_TABS.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setSelectedType(tab.value)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  selectedType === tab.value
                    ? isDark
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'bg-teal-50 text-teal-700'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 ml-4">
            <span className={cn('text-sm font-medium mr-2', mutedTextClass)}>Status:</span>
            {HEDGE_STATUS_TABS.slice(0, 4).map((tab) => (
              <button
                key={tab.label}
                onClick={() => setSelectedStatus(tab.value)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  selectedStatus === tab.value
                    ? isDark
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'bg-teal-50 text-teal-700'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={!filteredHedges.length}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100',
              !filteredHedges.length && 'opacity-50 cursor-not-allowed hover:bg-transparent'
            )}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Table */}
        <HedgeManagementTable
          hedges={filteredHedges}
          isLoading={isLoading}
          onClose={handleCloseHedge}
          onView={handleViewHedge}
          isDark={isDark}
          emptyMessage={
            selectedQuarter
              ? `No hedge records found for ${selectedQuarter}`
              : 'No hedge records found'
          }
        />
      </div>

      {/* Modals */}
      <QuarterlyNaturalHedgeModal
        isOpen={naturalHedgeModalOpen}
        onClose={() => setNaturalHedgeModalOpen(false)}
        onSuccess={() => {
          handleRefresh();
        }}
        isDark={isDark}
        preselectedQuarter={selectedQuarter || undefined}
      />

      <BookForwardContractModal
        isOpen={bookForwardOpen}
        onClose={() => setBookForwardOpen(false)}
        isDark={isDark}
        exposure={null}
      />

      <CloseHedgeRecordModal
        hedge={closeHedgeModal.hedge}
        isOpen={closeHedgeModal.open}
        onClose={() => setCloseHedgeModal({ open: false, hedge: null })}
        onSuccess={() => {
          handleRefresh();
        }}
        isDark={isDark}
      />
    </div>
  );
};

export default HedgeManagementPage;
