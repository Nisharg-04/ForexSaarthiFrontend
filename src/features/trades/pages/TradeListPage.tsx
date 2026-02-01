import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, RefreshCw, Calendar, Filter } from 'lucide-react';
import { useAuth, useAppSelector } from '../../../hooks/useRedux';
import { useActionBar, type ActionItem } from '../../../components/ui/BottomActionBar';
import { cn } from '../../../utils/helpers';
import { useGetTradesQuery, useCancelTradeMutation } from '../api/tradeApi';
import type { Trade, TradeFilters, TradeStage, TradeType } from '../types';
import { TradeType as TradeTypeEnum } from '../types';
import { TradeTable } from '../components/TradeTable';
import { CancelTradeModal } from '../components/CancelTradeModal';
import { canCreateTrade, filterTradeByTradeType, filterTradesBySearch } from '../tradeUtils';
import { TRADE_STAGE_TABS, TRADE_STAGE_STYLES } from '../tradeConstants';

// Financial Year Helper
const getFinancialYears = (): { value: string; label: string }[] => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-indexed
  
  // Financial year starts in April (month 3)
  const currentFY = currentMonth >= 3 ? currentYear : currentYear - 1;
  
  const years = [];
  for (let i = 0; i < 5; i++) {
    const startYear = currentFY - i;
    const endYear = startYear + 1;
    years.push({
      value: `${startYear}-${endYear}`,
      label: `FY ${startYear}-${String(endYear).slice(-2)}`,
    });
  }
  return years;
};

// Trade Type Filter Tabs
const TRADE_TYPE_TABS = [
  { value: undefined, label: 'All Types' },
  { value: TradeTypeEnum.EXPORT, label: '📤 Export' },
  { value: TradeTypeEnum.IMPORT, label: '📥 Import' },
] as const;

export const TradeListPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';
  const { setActions, clearActions } = useActionBar();

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStage, setActiveStage] = useState<TradeStage | undefined>(undefined);
  const [activeTradeType, setActiveTradeType] = useState<TradeType | undefined>(undefined);
  const [selectedFY, setSelectedFY] = useState<string>('');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  const financialYears = useMemo(() => getFinancialYears(), []);

  // Build filters - memoized to prevent unnecessary API calls
  const filters: TradeFilters | undefined = useMemo(() => {
    const filterObj: TradeFilters = {};
    if (activeStage) filterObj.stage = activeStage;
    if (activeTradeType) filterObj.tradeType = activeTradeType;
    return Object.keys(filterObj).length > 0 ? filterObj : undefined;
  }, [activeStage, activeTradeType]);

  // API Hooks
  const { data, isLoading, isFetching, refetch } = useGetTradesQuery(filters);
  const [cancelTrade, { isLoading: isCancelling }] = useCancelTradeMutation();

  const trades = data?.data || [];
  console.log(trades)
  
  // Apply client-side filters (search + financial year)
  const filteredTrades = useMemo(() => {
    let result = filterTradesBySearch(trades, searchTerm);
    
    // Financial Year filter
    if (selectedFY) {
      const [startYear] = selectedFY.split('-').map(Number);
      const fyStart = new Date(startYear, 3, 1); // April 1
      const fyEnd = new Date(startYear + 1, 2, 31, 23, 59, 59); // March 31
      
      result = result.filter((trade) => {
        const tradeDate = new Date(trade.createdAt);
        return tradeDate >= fyStart && tradeDate <= fyEnd;
      });
    }
    result = filterTradeByTradeType(result, activeTradeType);
    
    
    return result;
  }, [trades, searchTerm, selectedFY, activeTradeType]);

  // Permission checks
  const canCreate = canCreateTrade(role);

  // Action Handlers
  const handleViewTrade = useCallback(
    (trade: Trade) => {
      navigate(`/dashboard/trades/${trade.id}`);
    },
    [navigate]
  );

  const handleEditTrade = useCallback(
    (trade: Trade) => {
      navigate(`/dashboard/trades/${trade.id}/edit`);
    },
    [navigate]
  );

  const handleOpenCancel = useCallback((trade: Trade) => {
    setSelectedTrade(trade);
    setIsCancelModalOpen(true);
  }, []);

  const handleCloseCancel = useCallback(() => {
    setIsCancelModalOpen(false);
    setSelectedTrade(null);
  }, []);

  const handleConfirmCancel = useCallback(
    async (cancelReason: string) => {
      if (!selectedTrade) return;

      try {
        await cancelTrade({
          id: selectedTrade.id,
          cancelReason,
        }).unwrap();
        handleCloseCancel();
      } catch (error) {
        console.error('Failed to cancel trade:', error);
        throw error;
      }
    },
    [selectedTrade, cancelTrade, handleCloseCancel]
  );

  // Setup Bottom Action Bar
  useEffect(() => {
    const actions: ActionItem[] = [];

    if (canCreate) {
      actions.push({
        id: 'create-trade',
        label: 'Create Trade',
        variant: 'primary',
        icon: <Plus className="w-4 h-4" />,
        onClick: () => navigate('/dashboard/trades/create'),
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

  // Get count for each stage
  const getStageCounts = useCallback(() => {
    const counts: Record<string, number> = { all: trades.length };
    trades.forEach((trade) => {
      counts[trade.tradeStage] = (counts[trade.tradeStage] || 0) + 1;
    });
    return counts;
  }, [trades]);

  const stageCounts = getStageCounts();

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={cn('text-xl font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
            Trade Management
          </h1>
          <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Track and manage your import & export trade lifecycle
          </p>
        </div>
      </div>

      {/* Stage Tabs - Full Width Connected Design */}
      <div
        className={cn(
          'rounded-lg border overflow-hidden',
          isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
        )}
      >
        <div className="flex">
          {TRADE_STAGE_TABS.map((tab, index) => {
            const isActive = activeStage === tab.value;
            const count = tab.value ? stageCounts[tab.value] || 0 : stageCounts.all || 0;
            const stageStyle = tab.value ? TRADE_STAGE_STYLES[tab.value] : null;
            
            return (
              <button
                key={tab.label}
                onClick={() => setActiveStage(tab.value)}
                className={cn(
                  'flex-1 relative py-3 px-2 text-sm font-medium transition-all duration-200',
                  'border-b-2 focus:outline-none focus:z-10',
                  // Border between tabs
                  index !== TRADE_STAGE_TABS.length - 1 && (isDark ? 'border-r border-slate-700' : 'border-r border-slate-200'),
                  // Active state
                  isActive
                    ? cn(
                        'border-b-current',
                        tab.value
                          ? isDark
                            ? stageStyle?.dark.split(' ')[1] // Get text color
                            : stageStyle?.light.split(' ')[1]
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
                    {tab.value && stageStyle && (
                      <span className="text-xs">{stageStyle.icon}</span>
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
                    {count} {count === 1 ? 'trade' : 'trades'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters Row */}
      <div
        className={cn(
          'flex flex-col sm:flex-row gap-3 p-4 rounded-lg border',
          isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
        )}
      >
        {/* Trade Type Filter */}
        <div className="flex items-center gap-2">
          <Filter className={cn('w-4 h-4', isDark ? 'text-slate-500' : 'text-slate-400')} />
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
            {TRADE_TYPE_TABS.map((tab, index) => (
              <button
                key={tab.label}
                onClick={() => setActiveTradeType(tab.value)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium transition-colors',
                  index !== TRADE_TYPE_TABS.length - 1 && (isDark ? 'border-r border-slate-700' : 'border-r border-slate-200'),
                  activeTradeType === tab.value
                    ? isDark
                      ? 'bg-cyan-600 text-white'
                      : 'bg-teal-600 text-white'
                    : isDark
                    ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Financial Year Filter */}
        <div className="flex items-center gap-2">
          <Calendar className={cn('w-4 h-4', isDark ? 'text-slate-500' : 'text-slate-400')} />
          <select
            value={selectedFY}
            onChange={(e) => setSelectedFY(e.target.value)}
            className={cn(
              'px-3 py-1.5 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2',
              isDark
                ? 'bg-slate-800 border-slate-700 text-white focus:border-cyan-500 focus:ring-cyan-500/20'
                : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'
            )}
          >
            <option value="">All Financial Years</option>
            {financialYears.map((fy) => (
              <option key={fy.value} value={fy.value}>
                {fy.label}
              </option>
            ))}
          </select>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
              isDark ? 'text-slate-500' : 'text-slate-400'
            )}
          />
          <input
            type="text"
            placeholder="Search trades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-1.5 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2',
              isDark
                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20'
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-teal-500/20'
            )}
          />
        </div>
      </div>

      {/* Active Filters Summary */}
      {(activeTradeType || selectedFY || searchTerm) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
            Active filters:
          </span>
          {activeTradeType && (
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full',
                isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
              )}
            >
              {activeTradeType === TradeTypeEnum.EXPORT ? '📤 Export' : '📥 Import'}
              <button
                onClick={() => setActiveTradeType(undefined)}
                className="ml-1 hover:text-red-500"
              >
                ×
              </button>
            </span>
          )}
          {selectedFY && (
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full',
                isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
              )}
            >
              📅 {financialYears.find((f) => f.value === selectedFY)?.label}
              <button onClick={() => setSelectedFY('')} className="ml-1 hover:text-red-500">
                ×
              </button>
            </span>
          )}
          {searchTerm && (
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full',
                isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
              )}
            >
              🔍 "{searchTerm}"
              <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-red-500">
                ×
              </button>
            </span>
          )}
          <button
            onClick={() => {
              setActiveTradeType(undefined);
              setSelectedFY('');
              setSearchTerm('');
            }}
            className={cn(
              'text-xs underline',
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            )}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
          Showing <span className="font-medium">{filteredTrades.length}</span> of{' '}
          <span className="font-medium">{trades.length}</span> trades
        </p>
      </div>

      {/* Trade Table */}
      <TradeTable
        trades={filteredTrades}
        isDark={isDark}
        userRole={role}
        onView={handleViewTrade}
        onEdit={handleEditTrade}
        onCancel={handleOpenCancel}
        isLoading={isLoading}
      />

      {/* Cancel Trade Modal */}
      <CancelTradeModal
        isOpen={isCancelModalOpen}
        trade={selectedTrade}
        onClose={handleCloseCancel}
        onConfirm={handleConfirmCancel}
        isDark={isDark}
        isLoading={isCancelling}
      />
    </div>
  );
};

export default TradeListPage;
