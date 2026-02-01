import React from 'react';
import { cn } from '../../../utils/helpers';
import type { InvoiceStatus } from '../types';
import { INVOICE_STATUS_STYLES } from '../invoiceConstants';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  isDark?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({
  status,
  isDark = false,
  showIcon = true,
  size = 'md',
}) => {
  const styles = INVOICE_STATUS_STYLES[status];
  
  if (!styles) {
    return (
      <span className="text-xs text-slate-500">{status}</span>
    );
  }

  const sizeClasses = size === 'sm' 
    ? 'px-1.5 py-0.5 text-xs' 
    : 'px-2 py-1 text-xs';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded border',
        sizeClasses,
        isDark ? styles.dark : styles.light
      )}
      title={styles.description}
    >
      {showIcon && <span className="text-[10px]">{styles.icon}</span>}
      <span>{status === 'PARTIALLY_PAID' ? 'Part Paid' : status.charAt(0) + status.slice(1).toLowerCase()}</span>
    </span>
  );
};

export default InvoiceStatusBadge;
