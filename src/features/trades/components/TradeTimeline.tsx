import React from 'react';
import { Check, Clock, XCircle } from 'lucide-react';
import { cn, formatDateTime } from '../../../utils/helpers';
import type { Trade, TradeTimelineEvent } from '../types';
import { TradeStage } from '../types';
import { buildTradeTimeline } from '../tradeUtils';
import { TRADE_STAGE_STYLES } from '../tradeConstants';

interface TradeTimelineProps {
  trade: Trade;
  isDark?: boolean;
}

export const TradeTimeline: React.FC<TradeTimelineProps> = ({ trade, isDark = false }) => {
  const events = buildTradeTimeline(trade);

  const getEventIcon = (event: TradeTimelineEvent) => {
    if (event.stage === TradeStage.CANCELLED) {
      return <XCircle className="w-4 h-4" />;
    }
    if (event.isCurrent) {
      return <Clock className="w-4 h-4" />;
    }
    return <Check className="w-4 h-4" />;
  };

  const getEventStyles = (event: TradeTimelineEvent) => {
    if (event.stage === 'CREATED') {
      return {
        iconBg: isDark ? 'bg-slate-700' : 'bg-slate-200',
        iconColor: isDark ? 'text-slate-300' : 'text-slate-600',
        line: isDark ? 'bg-slate-700' : 'bg-slate-200',
      };
    }

    const stage = event.stage as TradeStage;
    const stageStyle = TRADE_STAGE_STYLES[stage];

    if (event.isCurrent) {
      return {
        iconBg: isDark ? 'bg-cyan-500/20' : 'bg-teal-100',
        iconColor: isDark ? 'text-cyan-400' : 'text-teal-600',
        line: isDark ? 'bg-cyan-500/30' : 'bg-teal-200',
      };
    }

    if (stage === TradeStage.CANCELLED) {
      return {
        iconBg: isDark ? 'bg-red-500/20' : 'bg-red-100',
        iconColor: isDark ? 'text-red-400' : 'text-red-600',
        line: isDark ? 'bg-red-500/30' : 'bg-red-200',
      };
    }

    return {
      iconBg: isDark ? 'bg-emerald-500/20' : 'bg-emerald-100',
      iconColor: isDark ? 'text-emerald-400' : 'text-emerald-600',
      line: isDark ? 'bg-emerald-500/30' : 'bg-emerald-200',
    };
  };

  return (
    <div className={cn('rounded-lg border p-4', isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white')}>
      <h3 className={cn('text-sm font-semibold mb-4', isDark ? 'text-white' : 'text-slate-900')}>
        Trade Lifecycle
      </h3>

      <div className="relative">
        {events.map((event, index) => {
          const styles = getEventStyles(event);
          const isLast = index === events.length - 1;

          return (
            <div key={`${event.stage}-${index}`} className="flex gap-3">
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                {/* Icon */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    styles.iconBg,
                    styles.iconColor
                  )}
                >
                  {getEventIcon(event)}
                </div>

                {/* Line */}
                {!isLast && (
                  <div className={cn('w-0.5 flex-1 my-1 min-h-[24px]', styles.line)} />
                )}
              </div>

              {/* Content */}
              <div className={cn('pb-4', isLast && 'pb-0')}>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      event.isCurrent
                        ? isDark
                          ? 'text-cyan-400'
                          : 'text-teal-600'
                        : isDark
                        ? 'text-white'
                        : 'text-slate-900'
                    )}
                  >
                    {event.label}
                  </span>
                  {event.isCurrent && (
                    <span
                      className={cn(
                        'text-xs px-1.5 py-0.5 rounded',
                        isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-teal-100 text-teal-700'
                      )}
                    >
                      Current
                    </span>
                  )}
                </div>

                <div className={cn('text-xs mt-0.5', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  {formatDateTime(event.timestamp)}
                  {event.userName && (
                    <span>
                      {' '}
                      · by <span className="font-medium">{event.userName}</span>
                    </span>
                  )}
                </div>

                {/* Cancel reason */}
                {event.details && (
                  <div
                    className={cn(
                      'mt-2 text-sm p-2 rounded',
                      isDark ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'
                    )}
                  >
                    <span className="font-medium">Reason: </span>
                    {event.details}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TradeTimeline;
