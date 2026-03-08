// ═══════════════════════════════════════════════════════════════════════════════
// EXPOSURE STATUS BADGE COMPONENT
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { cn } from '../../../utils/helpers';
import type { ExposureStatus } from '../types';
import { EXPOSURE_STATUS_STYLES } from '../exposureConstants';

interface ExposureStatusBadgeProps {
  status: ExposureStatus;
  isDark?: boolean;
  showIcon?: boolean;
  size?: 'xs' | 'sm' | 'md';
}

export const ExposureStatusBadge: React.FC<ExposureStatusBadgeProps> = ({
  status,
  isDark = false,
  showIcon = true,
  size = 'sm',
}) => {
  const styles = EXPOSURE_STATUS_STYLES[status];

  if (!styles) {
    return <span className="text-xs text-slate-500">{status}</span>;
  }

  const sizeClasses = {
    xs: 'px-1 py-0.5 text-[10px]',
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded border whitespace-nowrap',
        sizeClasses[size],
        isDark ? styles.dark : styles.light
      )}
      title={styles.description}
    >
      {showIcon && <span className="text-[10px]">{styles.icon}</span>}
      <span>{styles.label}</span>
    </span>
  );
};

export default ExposureStatusBadge;
