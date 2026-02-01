import React from 'react';
import { cn } from '../../../utils/helpers';
import type { InvoiceType } from '../types';
import { INVOICE_TYPE_STYLES } from '../invoiceConstants';

interface InvoiceTypeBadgeProps {
  type: InvoiceType;
  isDark?: boolean;
  size?: 'sm' | 'md';
}

export const InvoiceTypeBadge: React.FC<InvoiceTypeBadgeProps> = ({
  type,
  isDark = false,
  size = 'md',
}) => {
  const styles = INVOICE_TYPE_STYLES[type];
  
  if (!styles) {
    return <span className="text-xs text-slate-500">{type}</span>;
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
    >
      <span className="text-[10px]">{styles.icon}</span>
      <span>{styles.label}</span>
    </span>
  );
};

export default InvoiceTypeBadge;
