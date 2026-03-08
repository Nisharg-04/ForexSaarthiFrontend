// ═══════════════════════════════════════════════════════════════════════════════
// EXPOSURE ACTIONS MENU COMPONENT
// Context-aware action buttons for exposure detail
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Shield, RefreshCcw, XCircle, ChevronDown } from 'lucide-react';
import { cn } from '../../../utils/helpers';
import type { Exposure } from '../types';
import type { UserRole } from '../../../types';
import {
  canApplyForwardHedge,
  canApplyNaturalHedge,
  canCloseExposureHedge,
} from '../exposureUtils';

interface ExposureActionsMenuProps {
  exposure: Exposure;
  userRole?: UserRole;
  onApplyForwardHedge?: () => void;
  onApplyNaturalHedge?: () => void;
  onCloseHedge?: () => void;
  isDark?: boolean;
  layout?: 'horizontal' | 'vertical' | 'dropdown';
  size?: 'sm' | 'md';
}

export const ExposureActionsMenu: React.FC<ExposureActionsMenuProps> = ({
  exposure,
  userRole,
  onApplyForwardHedge,
  onApplyNaturalHedge,
  onCloseHedge,
  isDark = false,
  layout = 'horizontal',
  size = 'md',
}) => {
  const canForward = canApplyForwardHedge(exposure, userRole);
  const canNatural = canApplyNaturalHedge(exposure, userRole);
  const canClose = canCloseExposureHedge(exposure, userRole);

  // No actions available
  if (!canForward && !canNatural && !canClose) {
    return (
      <div
        className={cn(
          'text-sm',
          isDark ? 'text-slate-500' : 'text-slate-400'
        )}
      >
        No actions available
      </div>
    );
  }

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-3 py-2 text-sm gap-2',
  };

  const buttonBase = cn(
    'inline-flex items-center font-medium rounded-lg transition-all duration-200 border',
    sizeClasses[size]
  );

  // Dropdown layout
  if (layout === 'dropdown') {
    return (
      <div className="relative group">
        <button
          className={cn(
            buttonBase,
            isDark
              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          )}
        >
          <span>Actions</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        <div
          className={cn(
            'absolute right-0 top-full mt-1 w-48 rounded-lg border shadow-lg z-20',
            'opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200',
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          )}
        >
          {canForward && (
            <button
              onClick={onApplyForwardHedge}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left',
                isDark
                  ? 'text-slate-300 hover:bg-slate-700'
                  : 'text-slate-700 hover:bg-slate-50'
              )}
            >
              <Shield className="w-4 h-4 text-emerald-500" />
              Forward Hedge
            </button>
          )}
          {canNatural && (
            <button
              onClick={onApplyNaturalHedge}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left',
                isDark
                  ? 'text-slate-300 hover:bg-slate-700'
                  : 'text-slate-700 hover:bg-slate-50'
              )}
            >
              <RefreshCcw className="w-4 h-4 text-cyan-500" />
              Natural Hedge
            </button>
          )}
          {canClose && (
            <button
              onClick={onCloseHedge}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left',
                isDark
                  ? 'text-slate-300 hover:bg-slate-700'
                  : 'text-slate-700 hover:bg-slate-50'
              )}
            >
              <XCircle className="w-4 h-4 text-amber-500" />
              Close Hedge
            </button>
          )}
        </div>
      </div>
    );
  }

  // Vertical layout
  if (layout === 'vertical') {
    return (
      <div className="flex flex-col gap-2">
        {canForward && (
          <button
            onClick={onApplyForwardHedge}
            className={cn(
              buttonBase,
              'w-full justify-center',
              isDark
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
            )}
          >
            <Shield className="w-4 h-4" />
            <span>Forward Hedge</span>
          </button>
        )}

        {canNatural && (
          <button
            onClick={onApplyNaturalHedge}
            className={cn(
              buttonBase,
              'w-full justify-center',
              isDark
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                : 'bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100'
            )}
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Natural Hedge</span>
          </button>
        )}

        {canClose && (
          <button
            onClick={onCloseHedge}
            className={cn(
              buttonBase,
              'w-full justify-center',
              isDark
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
            )}
          >
            <XCircle className="w-4 h-4" />
            <span>Close Hedge</span>
          </button>
        )}
      </div>
    );
  }

  // Horizontal layout (default)
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {canForward && (
        <button
          onClick={onApplyForwardHedge}
          className={cn(
            buttonBase,
            isDark
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
          )}
        >
          <Shield className="w-4 h-4" />
          <span>Forward Hedge</span>
        </button>
      )}

      {canNatural && (
        <button
          onClick={onApplyNaturalHedge}
          className={cn(
            buttonBase,
            isDark
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
              : 'bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100'
          )}
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Natural Hedge</span>
        </button>
      )}

      {canClose && (
        <button
          onClick={onCloseHedge}
          className={cn(
            buttonBase,
            isDark
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
              : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
          )}
        >
          <XCircle className="w-4 h-4" />
          <span>Close Hedge</span>
        </button>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────────
// INLINE ACTION BUTTON (for table rows)
// ─────────────────────────────────────────────────────────────────────────────────

interface InlineHedgeButtonProps {
  exposure: Exposure;
  userRole?: UserRole;
  onClick?: () => void;
  isDark?: boolean;
}

export const InlineHedgeButton: React.FC<InlineHedgeButtonProps> = ({
  exposure,
  userRole,
  onClick,
  isDark = false,
}) => {
  const canHedge = canApplyForwardHedge(exposure, userRole);

  if (!canHedge) {
    return null;
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        'px-2 py-1 text-xs font-medium rounded transition-colors',
        isDark
          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
      )}
    >
      Hedge
    </button>
  );
};

export default ExposureActionsMenu;
