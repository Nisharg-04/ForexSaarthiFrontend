import React from 'react';
import { cn } from '../../../utils/helpers';
import { TradeType } from '../types';
import { TRADE_TYPE_STYLES } from '../tradeConstants';
import { getTradeTypeLabel } from '../tradeUtils';

interface TradeTypeBadgeProps {
  type: TradeType;
  isDark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const TradeTypeBadge: React.FC<TradeTypeBadgeProps> = ({
  type,
  isDark = false,
  size = 'sm',
  showIcon = false,
}) => {
  const styles = TRADE_TYPE_STYLES[type];
  const colorClasses = isDark ? styles.dark : styles.light;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded border whitespace-nowrap',
        colorClasses,
        sizeClasses
      )}
    >
      {showIcon && <span className="text-xs">{styles.icon}</span>}
      {getTradeTypeLabel(type)}
    </span>
  );
};

export default TradeTypeBadge;
