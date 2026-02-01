import React from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn, formatDate } from '../../../utils/helpers';
import type { Trade } from '../types';
import { TradeStageBadge } from './TradeStageBadge';
import { TradeTypeBadge } from './TradeTypeBadge';
import { TradeStage } from '../types';
import { TRADE_STAGE_STYLES } from '../tradeConstants';

interface TradeHeaderProps {
  trade: Trade;
  isDark?: boolean;
}

export const TradeHeader: React.FC<TradeHeaderProps> = ({ trade, isDark = false }) => {
  const navigate = useNavigate();
  const stageInfo = TRADE_STAGE_STYLES[trade.tradeStage];

  // Get stage-specific banner message
  const getStageBanner = () => {
    switch (trade.tradeStage) {
      case TradeStage.DRAFT:
        return {
          message: 'This trade is in draft mode. You can edit it or submit for approval.',
          type: 'info',
        };
      case TradeStage.SUBMITTED:
        return {
          message: 'This trade is awaiting approval. No edits are allowed.',
          type: 'warning',
        };
      case TradeStage.APPROVED:
        return {
          message: 'This trade has been approved. You can now close it when complete.',
          type: 'success',
        };
      case TradeStage.CANCELLED:
        return {
          message: `This trade was cancelled. Reason: ${trade.cancelReason || 'No reason provided'}`,
          type: 'error',
        };
      case TradeStage.CLOSED:
        return {
          message: 'This trade has been closed. It is now a historical record.',
          type: 'closed',
        };
      default:
        return null;
    }
  };

  const banner = getStageBanner();

  const bannerStyles = {
    info: isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600',
    warning: isDark ? 'bg-amber-900/30 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700',
    success: isDark ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700',
    error: isDark ? 'bg-red-900/30 border-red-500/30 text-red-300' : 'bg-red-50 border-red-200 text-red-700',
    closed: isDark ? 'bg-blue-900/30 border-blue-500/30 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700',
  };

  return (
    <div className="space-y-4">
      {/* Back Button & Title Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/trades')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            )}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-3">
              <h1
                className={cn(
                  'text-xl font-semibold font-mono',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              >
                {trade.tradeNumber}
              </h1>
              <TradeStageBadge stage={trade.tradeStage} isDark={isDark} size="md" showIcon />
              <TradeTypeBadge type={trade.tradeType} isDark={isDark} size="md" />
            </div>

            <div className={cn('flex items-center gap-4 mt-1 text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Created {formatDate(trade.createdAt)}
              </span>
              {trade.partyName && (
                <span>
                    Party: <span className="font-medium">{trade.partyName}</span>
                  </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {banner && (
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-lg border text-sm',
            bannerStyles[banner.type as keyof typeof bannerStyles]
          )}
        >
          <span className="text-base">{stageInfo.icon}</span>
          <span>{banner.message}</span>
        </div>
      )}
    </div>
  );
};

export default TradeHeader;
