import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, Filter, Search } from 'lucide-react';
import { useAuth, useAppSelector } from '../../../hooks/useRedux';
import { useActionBar, type ActionItem } from '../../../components/ui/BottomActionBar';
import { cn } from '../../../utils/helpers';
import { useGetInvoicesQuery } from '../api/invoiceApi';
import type { Invoice, InvoiceFilters, InvoiceStatus } from '../types';
import { InvoiceTable } from '../components/InvoiceTable';
import { canCreateInvoice, filterInvoicesBySearch } from '../invoiceUtils';
import { INVOICE_STATUS_TABS, INVOICE_STATUS_STYLES } from '../invoiceConstants';

export const InvoiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';
  const { setActions, clearActions } = useActionBar();

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState<InvoiceStatus | undefined>(undefined);

  // Build filters - memoized to prevent unnecessary API calls
  const filters: InvoiceFilters | undefined = useMemo(() => {
    const filterObj: InvoiceFilters = {};
    if (activeStatus) filterObj.status = activeStatus;
    return Object.keys(filterObj).length > 0 ? filterObj : undefined;
  }, [activeStatus]);

  // API Hooks
  const { data, isLoading, isFetching, refetch } = useGetInvoicesQuery(filters);

  const invoices = data?.data || [];

  // Apply client-side search filter
  const filteredInvoices = useMemo(() => {
    return filterInvoicesBySearch(invoices, searchTerm);
  }, [invoices, searchTerm]);

  // Permission checks
  const canCreate = canCreateInvoice(role);

  // Action Handlers
  const handleViewInvoice = useCallback(
    (invoice: Invoice) => {
      navigate(`/dashboard/invoices/${invoice.id}`);
    },
    [navigate]
  );

  const handleEditInvoice = useCallback(
    (invoice: Invoice) => {
      navigate(`/dashboard/invoices/${invoice.id}/edit`);
    },
    [navigate]
  );

  // Setup Bottom Action Bar
  useEffect(() => {
    const actions: ActionItem[] = [];

    if (canCreate) {
      actions.push({
        id: 'create-invoice',
        label: 'Add Invoice',
        variant: 'primary',
        icon: <Plus className="w-4 h-4" />,
        onClick: () => navigate('/dashboard/invoices/new'),
      });
    }

    actions.push({
      id: 'refresh',
      label: 'Refresh',
      variant: 'default',
      icon: <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />,
      onClick: () => refetch(),
      disabled: isFetching,
    });

    setActions(actions);
    return () => clearActions();
  }, [canCreate, isFetching, setActions, clearActions, navigate, refetch]);

  // Get count for each status
  const getStatusCounts = useCallback(() => {
    const counts: Record<string, number> = { all: invoices.length };
    invoices.forEach((invoice) => {
      counts[invoice.status] = (counts[invoice.status] || 0) + 1;
    });
    return counts;
  }, [invoices]);

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={cn('text-xl font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
            Invoice Register
          </h1>
          <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Manage invoices and track receivables
          </p>
        </div>
      </div>

      {/* Status Tabs */}
      <div
        className={cn(
          'rounded-lg border overflow-hidden',
          isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
        )}
      >
        <div className="flex overflow-x-auto">
          {INVOICE_STATUS_TABS.map((tab, index) => {
            const isActive = activeStatus === tab.value;
            const count = tab.value ? statusCounts[tab.value] || 0 : statusCounts.all || 0;
            const statusStyle = tab.value ? INVOICE_STATUS_STYLES[tab.value] : null;

            return (
              <button
                key={tab.label}
                onClick={() => setActiveStatus(tab.value)}
                className={cn(
                  'flex-1 min-w-[100px] relative py-3 px-2 text-sm font-medium transition-all duration-200',
                  'border-b-2 focus:outline-none focus:z-10',
                  index !== INVOICE_STATUS_TABS.length - 1 &&
                    (isDark ? 'border-r border-slate-700' : 'border-r border-slate-200'),
                  isActive
                    ? cn(
                        'border-b-current',
                        tab.value
                          ? isDark
                            ? statusStyle?.dark.split(' ')[1]
                            : statusStyle?.light.split(' ')[1]
                          : isDark
                          ? 'text-cyan-400 border-cyan-400'
                          : 'text-teal-600 border-teal-600',
                        isDark ? 'bg-slate-800' : 'bg-white'
                      )
                    : cn(
                        'border-b-transparent',
                        isDark
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                      )
                )}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="flex items-center gap-1.5">
                    {tab.value && statusStyle && (
                      <span className="text-xs">{statusStyle.icon}</span>
                    )}
                    {tab.label}
                  </span>
                  <span
                    className={cn(
                      'text-xs font-normal',
                      isActive
                        ? isDark
                          ? 'text-slate-300'
                          : 'text-slate-600'
                        : isDark
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    )}
                  >
                    {count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div
        className={cn(
          'flex items-center gap-3 p-4 rounded-lg border',
          isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
        )}
      >
        <div className="relative flex-1 max-w-md">
          <Search
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
              isDark ? 'text-slate-500' : 'text-slate-400'
            )}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by invoice number, party, or trade..."
            className={cn(
              'w-full pl-10 pr-4 py-2 text-sm rounded-lg border transition-colors',
              'focus:outline-none focus:ring-2',
              isDark
                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-cyan-500/50'
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-teal-500/50'
            )}
          />
        </div>

        {/* Active Filters Display */}
        {(activeStatus || searchTerm) && (
          <div className="flex items-center gap-2">
            <Filter className={cn('w-4 h-4', isDark ? 'text-slate-500' : 'text-slate-400')} />
            {activeStatus && (
              <span
                className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1',
                  isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'
                )}
              >
                {INVOICE_STATUS_STYLES[activeStatus]?.icon} {activeStatus}
                <button
                  onClick={() => setActiveStatus(undefined)}
                  className="ml-1 hover:text-red-500"
                >
                  ×
                </button>
              </span>
            )}
            {searchTerm && (
              <span
                className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1',
                  isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'
                )}
              >
                "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-red-500">
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setActiveStatus(undefined);
                setSearchTerm('');
              }}
              className={cn(
                'text-xs font-medium',
                isDark
                  ? 'text-cyan-400 hover:text-cyan-300'
                  : 'text-teal-600 hover:text-teal-700'
              )}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Invoice Table */}
      <InvoiceTable
        invoices={filteredInvoices}
        isDark={isDark}
        userRole={role}
        onView={handleViewInvoice}
        onEdit={handleEditInvoice}
        isLoading={isLoading}
      />

      {/* Summary Footer */}
      {filteredInvoices.length > 0 && (
        <div
          className={cn(
            'flex items-center justify-between px-4 py-3 rounded-lg border text-sm',
            isDark ? 'border-slate-800 bg-slate-900/50 text-slate-400' : 'border-slate-200 bg-white text-slate-500'
          )}
        >
          <span>
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </span>
          <span className={cn('font-mono', isDark ? 'text-slate-300' : 'text-slate-700')}>
            Total Outstanding:{' '}
            <span className={isDark ? 'text-amber-400' : 'text-amber-600'}>
              ₹{' '}
              {filteredInvoices
                .reduce((sum, inv) => sum + (inv.outstandingAmount || 0), 0)
                .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </span>
        </div>
      )}
    </div>
  );
};

export default InvoiceListPage;
