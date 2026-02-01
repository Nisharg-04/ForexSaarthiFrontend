import React, { useState, useMemo, useCallback } from 'react';
import { X, Search, ChevronRight } from 'lucide-react';
import { cn, formatDate } from '../../../utils/helpers';
import type { TradeForSelection } from '../types';
import { useGetTradesQuery } from '../../trades/api/tradeApi';
import { TradeStage } from '../../trades/types';

interface TradeSelectorDrawerProps {
  isOpen: boolean;
  isDark?: boolean;
  onClose: () => void;
  onSelect: (trade: TradeForSelection) => void;
}

export const TradeSelectorDrawer: React.FC<TradeSelectorDrawerProps> = ({
  isOpen,
  isDark = false,
  onClose,
  onSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | 'EXPORT' | 'IMPORT'>('ALL');

  // Fetch only APPROVED trades (active trades that can have invoices)
  const { data, isLoading } = useGetTradesQuery(
    { stage: TradeStage.APPROVED },
    { skip: !isOpen }
  );

  const trades = data?.data || [];

  // Filter trades
  const filteredTrades = useMemo(() => {
    let result = trades;

    // Filter by type
    if (selectedType !== 'ALL') {
      result = result.filter((t) => t.tradeType === selectedType);
    }

    // Filter by search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.tradeNumber.toLowerCase().includes(term) ||
          t.partyName?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [trades, selectedType, searchTerm]);

  const handleSelect = useCallback(
    (trade: typeof trades[0]) => {
      onSelect({
        id: trade.id,
        tradeNumber: trade.tradeNumber,
        tradeType: trade.tradeType,
        partyId: trade.partyId,
        partyName: trade.partyName || 'Unknown Party',
        createdAt: trade.createdAt,
      });
    },
    [onSelect]
  );

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-full max-w-lg z-50 shadow-2xl',
          'transform transition-transform duration-300 ease-out',
          isDark ? 'bg-slate-900' : 'bg-white',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="trade-selector-title"
      >
        {/* Header */}
        <div
          className={cn(
            'flex items-center justify-between px-6 py-4 border-b',
            isDark ? 'border-slate-700' : 'border-slate-200'
          )}
        >
          <div>
            <h2
              id="trade-selector-title"
              className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}
            >
              Select Trade
            </h2>
            <p className={cn('text-sm mt-0.5', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Choose an approved trade to create invoice
            </p>
          </div>
          <button
            onClick={onClose}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            )}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className={cn('px-6 py-4 border-b', isDark ? 'border-slate-700' : 'border-slate-200')}>
          {/* Search */}
          <div className="relative">
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
              placeholder="Search by trade number or party..."
              className={cn(
                'w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border transition-colors',
                'focus:outline-none focus:ring-2',
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-cyan-500/50'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-teal-500/50'
              )}
              autoFocus
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-2 mt-3">
            {(['ALL', 'EXPORT', 'IMPORT'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                  selectedType === type
                    ? isDark
                      ? 'bg-cyan-600 text-white'
                      : 'bg-teal-600 text-white'
                    : isDark
                    ? 'bg-slate-800 text-slate-400 hover:text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                )}
              >
                {type === 'ALL' ? 'All Trades' : type === 'EXPORT' ? '📤 Export' : '📥 Import'}
              </button>
            ))}
          </div>
        </div>

        {/* Trade List */}
        <div className="flex-1 overflow-y-auto" style={{ height: 'calc(100vh - 200px)' }}>
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'h-20 rounded-lg animate-pulse',
                    isDark ? 'bg-slate-800' : 'bg-slate-100'
                  )}
                />
              ))}
            </div>
          ) : filteredTrades.length === 0 ? (
            <div className="p-6 text-center">
              <div
                className={cn(
                  'w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center',
                  isDark ? 'bg-slate-800' : 'bg-slate-100'
                )}
              >
                <Search className={cn('w-6 h-6', isDark ? 'text-slate-600' : 'text-slate-400')} />
              </div>
              <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                {searchTerm
                  ? 'No trades match your search'
                  : 'No approved trades available'}
              </p>
              <p className={cn('text-xs mt-1', isDark ? 'text-slate-500' : 'text-slate-400')}>
                Only approved trades can have invoices
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredTrades.map((trade) => (
                <button
                  key={trade.id}
                  onClick={() => handleSelect(trade)}
                  className={cn(
                    'w-full text-left p-4 rounded-lg border transition-all',
                    'focus:outline-none focus:ring-2',
                    isDark
                      ? 'border-slate-700 hover:border-slate-600 hover:bg-slate-800 focus:ring-cyan-500/50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 focus:ring-teal-500/50'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Trade Number & Type */}
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'font-mono text-sm font-semibold',
                            isDark ? 'text-cyan-400' : 'text-teal-600'
                          )}
                        >
                          {trade.tradeNumber}
                        </span>
                        <span
                          className={cn(
                            'px-1.5 py-0.5 text-[10px] font-medium rounded',
                            trade.tradeType === 'EXPORT'
                              ? isDark
                                ? 'bg-teal-500/10 text-teal-400'
                                : 'bg-teal-50 text-teal-700'
                              : isDark
                              ? 'bg-indigo-500/10 text-indigo-400'
                              : 'bg-indigo-50 text-indigo-700'
                          )}
                        >
                          {trade.tradeType === 'EXPORT' ? '📤 Export' : '📥 Import'}
                        </span>
                      </div>

                      {/* Party Name */}
                      <p
                        className={cn(
                          'text-sm mt-1 truncate',
                          isDark ? 'text-white' : 'text-slate-900'
                        )}
                      >
                        {trade.partyName || 'Unknown Party'}
                      </p>

                      {/* Date */}
                      <p
                        className={cn(
                          'text-xs mt-0.5',
                          isDark ? 'text-slate-500' : 'text-slate-400'
                        )}
                      >
                        Created {formatDate(trade.createdAt)}
                      </p>
                    </div>

                    <ChevronRight
                      className={cn(
                        'w-5 h-5 flex-shrink-0',
                        isDark ? 'text-slate-600' : 'text-slate-300'
                      )}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={cn(
            'px-6 py-4 border-t',
            isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
          )}
        >
          <p className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
            Showing {filteredTrades.length} of {trades.length} approved trades
          </p>
        </div>
      </div>
    </>
  );
};

export default TradeSelectorDrawer;
