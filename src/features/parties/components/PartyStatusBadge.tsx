import React from 'react';
import { cn } from '../../../utils/helpers';
import { PARTY_STATUS_STYLES } from '../partyConstants';

interface PartyStatusBadgeProps {
  isActive: boolean;
  isDark?: boolean;
  size?: 'sm' | 'md';
}

export const PartyStatusBadge: React.FC<PartyStatusBadgeProps> = ({ 
  isActive, 
  isDark = false,
  size = 'sm',
}) => {
  const status = isActive ? 'ACTIVE' : 'INACTIVE';
  const styles = PARTY_STATUS_STYLES[status];
  const colorClasses = isDark ? styles.dark : styles.light;
  
  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5' 
    : 'text-sm px-2.5 py-1';

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded border',
        colorClasses,
        sizeClasses
      )}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
};

export default PartyStatusBadge;
