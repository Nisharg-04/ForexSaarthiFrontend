import React from 'react';
import { cn } from '../../../utils/helpers';
import { TradeStage } from '../types';
import { TRADE_STAGE_STYLES } from '../tradeConstants';
import { getStageLabel } from '../tradeUtils';

interface TradeStageBadgeProps {
  stage: TradeStage;
  isDark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const TradeStageBadge: React.FC<TradeStageBadgeProps> = ({
  stage,
  isDark = false,
  size = 'sm',
  showIcon = false,
}) => {
  const styles = TRADE_STAGE_STYLES[stage];
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
      {getStageLabel(stage)}
    </span>
  );
};

export default TradeStageBadge;
