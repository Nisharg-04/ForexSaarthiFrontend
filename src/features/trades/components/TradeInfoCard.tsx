import React from 'react';
import { Building2, Calendar, FileText, Hash, User, MapPin, Banknote } from 'lucide-react';
import { cn, formatDate, formatDateTime } from '../../../utils/helpers';
import type { Trade } from '../types';
import { TradeStage } from '../types';

interface TradeInfoCardProps {
  trade: Trade;
  isDark?: boolean;
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  isDark?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, isDark = false }) => (
  <div className="flex items-start gap-3">
    <div
      className={cn(
        'p-2 rounded-lg flex-shrink-0',
        isDark ? 'bg-slate-800' : 'bg-slate-100'
      )}
    >
      <div className={cn('w-4 h-4', isDark ? 'text-slate-400' : 'text-slate-500')}>
        {icon}
      </div>
    </div>
    <div className="min-w-0 flex-1">
      <p className={cn('text-xs font-medium', isDark ? 'text-slate-500' : 'text-slate-400')}>
        {label}
      </p>
      <p className={cn('text-sm mt-0.5', isDark ? 'text-white' : 'text-slate-900')}>
        {value || '—'}
      </p>
    </div>
  </div>
);

export const TradeInfoCard: React.FC<TradeInfoCardProps> = ({ trade, isDark = false }) => {
  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
      )}
    >
      <h3 className={cn('text-sm font-semibold mb-4', isDark ? 'text-white' : 'text-slate-900')}>
        Trade Details
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Trade Number */}
        <InfoRow
          icon={<Hash className="w-4 h-4" />}
          label="Trade Number"
          value={
            <span className={cn('font-mono', isDark ? 'text-cyan-400' : 'text-teal-600')}>
              {trade.tradeNumber}
            </span>
          }
          isDark={isDark}
        />

        {/* Trade Reference */}
        <InfoRow
          icon={<FileText className="w-4 h-4" />}
          label="Trade Reference"
          value={trade.tradeReference || '—'}
          isDark={isDark}
        />

        {/* Party */}
        <InfoRow
          icon={<Building2 className="w-4 h-4" />}
          label="Party"
          value={
            trade.partyName ? (
              <span>
                {trade.partyName}

              </span>
            ) : (
              '—'
            )
          }
          isDark={isDark}
        />

       

        {/* Created By */}
        <InfoRow
          icon={<User className="w-4 h-4" />}
          label="Created By"
          value={trade.createdByName || 'Unknown'}
          isDark={isDark}
        />

        {/* Created Date */}
        <InfoRow
          icon={<Calendar className="w-4 h-4" />}
          label="Created At"
          value={formatDateTime(trade.createdAt)}
          isDark={isDark}
        />

        {/* Updated Date */}
        <InfoRow
          icon={<Calendar className="w-4 h-4" />}
          label="Last Updated"
          value={formatDateTime(trade.updatedAt)}
          isDark={isDark}
        />
      </div>

      {/* Remarks Section */}
      {trade.remarks && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: isDark ? '#1e293b' : '#e2e8f0' }}>
          <p className={cn('text-xs font-medium mb-1', isDark ? 'text-slate-500' : 'text-slate-400')}>
            Remarks
          </p>
          <p className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-700')}>
            {trade.remarks}
          </p>
        </div>
      )}

      {/* Approval Details (if approved) */}
      {trade.tradeStage === TradeStage.APPROVED && trade.approvedAt && (
        <div
          className={cn(
            'mt-4 pt-4 border-t',
            isDark ? 'border-slate-800' : 'border-slate-200'
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                isDark ? 'bg-emerald-400' : 'bg-emerald-500'
              )}
            />
            <p className={cn('text-xs font-medium', isDark ? 'text-emerald-400' : 'text-emerald-600')}>
              Approved
            </p>
          </div>
          <p className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-700')}>
            Approved by <span className="font-medium">{trade.approvedByName || 'Unknown'}</span>
            {' '}on {formatDateTime(trade.approvedAt)}
          </p>
        </div>
      )}

      {/* Closed Details (if closed) */}
      {trade.tradeStage === TradeStage.CLOSED && trade.closedAt && (
        <div
          className={cn(
            'mt-4 pt-4 border-t',
            isDark ? 'border-slate-800' : 'border-slate-200'
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                isDark ? 'bg-blue-400' : 'bg-blue-500'
              )}
            />
            <p className={cn('text-xs font-medium', isDark ? 'text-blue-400' : 'text-blue-600')}>
              Closed
            </p>
          </div>
          <p className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-700')}>
            Closed by <span className="font-medium">{trade.closedByName || 'Unknown'}</span>
            {' '}on {formatDateTime(trade.closedAt)}
          </p>
        </div>
      )}
    </div>
  );
};

export default TradeInfoCard;
