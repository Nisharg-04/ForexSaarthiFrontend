import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  RefreshCcw,
  FileText,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../../../utils/helpers';
import { useAppSelector } from '../../../hooks/useRedux';
import { getCurrentQuarter, getQuarterLabel } from '../hedgingUtils';

// ─────────────────────────────────────────────────────────────────────────────────
// PROPS INTERFACE
// ─────────────────────────────────────────────────────────────────────────────────
interface QuarterlyHedgingDashboardSectionProps {
  isDark?: boolean;
  onApplyNaturalHedge?: (quarter: string, currency: string) => void;
  onBookForward?: () => void;
}
export const QuarterlyHedgingDashboardSection: React.FC<QuarterlyHedgingDashboardSectionProps> = ({
  isDark: propIsDark,
  onApplyNaturalHedge,
  onBookForward,
}) => {
  const theme = useAppSelector((state) => state.ui?.theme);
  const isDark = propIsDark ?? theme === 'dark';

  const currentQuarter = getCurrentQuarter();

  // Theme classes
  const textClass = isDark ? 'text-white' : 'text-slate-900';
  const mutedTextClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const cardBgClass = isDark ? 'bg-slate-800' : 'bg-white';
  const borderClass = isDark ? 'border-slate-700' : 'border-slate-200';

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', isDark ? 'bg-violet-500/20' : 'bg-violet-100')}>
            <Shield className={cn('w-5 h-5', isDark ? 'text-violet-400' : 'text-violet-600')} />
          </div>
          <div>
            <h2 className={cn('text-lg font-semibold', textClass)}>Quarterly Hedging Overview</h2>
            <p className={cn('text-sm', mutedTextClass)}>
              Simplified actions for {getQuarterLabel(currentQuarter)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={cn('rounded-lg border p-4', cardBgClass, borderClass)}>
        <h3 className={cn('text-sm font-semibold mb-3', textClass)}>Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {onApplyNaturalHedge && (
            <button
              onClick={() => onApplyNaturalHedge(currentQuarter, 'USD')}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                isDark
                  ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                  : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
              )}
            >
              <RefreshCcw className="w-4 h-4" />
              Apply Quarterly Natural Hedge
            </button>
          )}
          {onBookForward && (
            <button
              onClick={onBookForward}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                isDark
                  ? 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
                  : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
              )}
            >
              <FileText className="w-4 h-4" />
              Book Forward Contract
            </button>
          )}
        </div>

        {/* Primary CTA */}
        <Link
          to="/dashboard/exposures/quarterly-report"
          className={cn(
            'mt-4 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-base font-semibold transition-colors',
            isDark
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          <Calendar className="w-5 h-5" />
          View Quarterly Reports
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

export default QuarterlyHedgingDashboardSection;
