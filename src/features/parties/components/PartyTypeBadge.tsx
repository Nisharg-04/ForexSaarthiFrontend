import React from 'react';
import { cn } from '../../../utils/helpers';
import { PartyType } from '../types';
import { PARTY_TYPE_STYLES } from '../partyConstants';

interface PartyTypeBadgeProps {
  type: PartyType;
  isDark?: boolean;
  size?: 'sm' | 'md';
}

export const PartyTypeBadge: React.FC<PartyTypeBadgeProps> = ({ 
  type, 
  isDark = false,
  size = 'sm',
}) => {
  const styles = PARTY_TYPE_STYLES[type];
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
      {type === PartyType.BUYER ? 'Buyer' : 'Supplier'}
    </span>
  );
};

export default PartyTypeBadge;
