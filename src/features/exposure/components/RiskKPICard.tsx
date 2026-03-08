// ═══════════════════════════════════════════════════════════════════════════════
// RISK KPI CARD - Treasury Risk Dashboard Component
// Styled KPI card with animated counters for risk metrics
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '../../../utils/helpers';
import type { LucideIcon } from 'lucide-react';

interface RiskKPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  format?: 'currency' | 'percentage' | 'number' | 'count';
  currency?: string;
  trend?: { value: number; label: string };
  isDark?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

/**
 * Animated counter hook for smooth number transitions
 */
const useAnimatedCounter = (
  targetValue: number,
  duration: number = 1000,
  enabled: boolean = true
): number => {
  const [displayValue, setDisplayValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const startValue = useRef(0);
  
  useEffect(() => {
    if (!enabled) {
      setDisplayValue(targetValue);
      return;
    }
    
    startValue.current = displayValue;
    startTime.current = null;
    
    const animate = (currentTime: number) => {
      if (!startTime.current) startTime.current = currentTime;
      const elapsed = currentTime - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = startValue.current + (targetValue - startValue.current) * easeOutQuart;
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [targetValue, duration, enabled]);
  
  return displayValue;
};

/**
 * Format large Indian numbers with Cr/L suffix and 2 decimal precision
 */
const formatIndianCurrency = (value: number, currencySymbol: string = '₹'): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 10000000) {
    // Crores (1 Cr = 10,000,000)
    const crores = absValue / 10000000;
    return `${sign}${currencySymbol}${crores.toFixed(2)} Cr`;
  } else if (absValue >= 100000) {
    // Lakhs (1 L = 100,000)
    const lakhs = absValue / 100000;
    return `${sign}${currencySymbol}${lakhs.toFixed(2)} L`;
  } else if (absValue >= 1000) {
    // Thousands
    return `${sign}${currencySymbol}${absValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  } else {
    return `${sign}${currencySymbol}${absValue.toFixed(2)}`;
  }
};

/**
 * Get currency symbol
 */
const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AED: 'د.إ',
    SGD: 'S$',
    CHF: 'CHF ',
  };
  return symbols[currency] || currency + ' ';
};

/**
 * Format value based on type
 */
const formatValue = (
  value: number,
  format: 'currency' | 'percentage' | 'number' | 'count',
  currency: string = 'INR'
): string => {
  switch (format) {
    case 'currency':
      return formatIndianCurrency(value, getCurrencySymbol(currency));
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'number':
      // For non-currency numbers, use similar Indian formatting
      const absVal = Math.abs(value);
      if (absVal >= 10000000) {
        return `${(value / 10000000).toFixed(2)} Cr`;
      } else if (absVal >= 100000) {
        return `${(value / 100000).toFixed(2)} L`;
      }
      return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value);
    case 'count':
      return Math.round(value).toLocaleString('en-IN');
    default:
      return value.toString();
  }
};

export const RiskKPICard: React.FC<RiskKPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'primary',
  format = 'number',
  currency = 'INR',
  trend,
  isDark = false,
  className,
  size = 'md',
  animate = true,
}) => {
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const animatedValue = useAnimatedCounter(numericValue, 1200, animate);
  
  // Variant styling configurations
  const variantStyles = {
    primary: {
      iconBg: isDark ? 'bg-blue-500/10' : 'bg-blue-50',
      iconColor: isDark ? 'text-blue-400' : 'text-blue-600',
      border: isDark ? 'border-blue-500/20' : 'border-blue-200',
      glow: isDark ? 'shadow-blue-500/10' : '',
    },
    success: {
      iconBg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50',
      iconColor: isDark ? 'text-emerald-400' : 'text-emerald-600',
      border: isDark ? 'border-emerald-500/20' : 'border-emerald-200',
      glow: isDark ? 'shadow-emerald-500/10' : '',
    },
    warning: {
      iconBg: isDark ? 'bg-amber-500/10' : 'bg-amber-50',
      iconColor: isDark ? 'text-amber-400' : 'text-amber-600',
      border: isDark ? 'border-amber-500/20' : 'border-amber-200',
      glow: isDark ? 'shadow-amber-500/10' : '',
    },
    danger: {
      iconBg: isDark ? 'bg-red-500/10' : 'bg-red-50',
      iconColor: isDark ? 'text-red-400' : 'text-red-600',
      border: isDark ? 'border-red-500/20' : 'border-red-200',
      glow: isDark ? 'shadow-red-500/10' : '',
    },
    info: {
      iconBg: isDark ? 'bg-purple-500/10' : 'bg-purple-50',
      iconColor: isDark ? 'text-purple-400' : 'text-purple-600',
      border: isDark ? 'border-purple-500/20' : 'border-purple-200',
      glow: isDark ? 'shadow-purple-500/10' : '',
    },
  };
  
  // Size configurations
  const sizeStyles = {
    sm: {
      padding: 'p-3',
      iconSize: 'p-1.5',
      iconDimensions: 'h-4 w-4',
      titleSize: 'text-xs',
      valueSize: 'text-lg',
      subtitleSize: 'text-[10px]',
    },
    md: {
      padding: 'p-4',
      iconSize: 'p-2',
      iconDimensions: 'h-5 w-5',
      titleSize: 'text-sm',
      valueSize: 'text-2xl',
      subtitleSize: 'text-xs',
    },
    lg: {
      padding: 'p-5',
      iconSize: 'p-2.5',
      iconDimensions: 'h-6 w-6',
      titleSize: 'text-base',
      valueSize: 'text-3xl',
      subtitleSize: 'text-sm',
    },
  };
  
  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];
  
  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-200',
        sizes.padding,
        isDark ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-200',
        isDark ? 'hover:bg-gray-800' : 'hover:shadow-md',
        styles.glow && `shadow-lg ${styles.glow}`,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className={cn(
            sizes.titleSize,
            'font-medium mb-1 truncate',
            isDark ? 'text-gray-400' : 'text-gray-600'
          )}>
            {title}
          </p>
          <p className={cn(
            sizes.valueSize,
            'font-bold tabular-nums tracking-tight',
            isDark ? 'text-white' : 'text-gray-900'
          )}>
            {typeof value === 'string' 
              ? value 
              : formatValue(animatedValue, format, currency)}
          </p>
          {subtitle && (
            <p className={cn(
              sizes.subtitleSize,
              'mt-1',
              isDark ? 'text-gray-500' : 'text-gray-500'
            )}>
              {subtitle}
            </p>
          )}
        </div>
        
        {Icon && (
          <div className={cn(
            'rounded-lg flex-shrink-0',
            sizes.iconSize,
            styles.iconBg
          )}>
            <Icon className={cn(sizes.iconDimensions, styles.iconColor)} />
          </div>
        )}
      </div>
      
      {trend && (
        <div className={cn(
          'mt-3 flex items-center gap-1',
          sizes.subtitleSize
        )}>
          <span className={cn(
            'font-medium',
            trend.value >= 0 
              ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
              : (isDark ? 'text-red-400' : 'text-red-600')
          )}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
          </span>
          <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>
            {trend.label}
          </span>
        </div>
      )}
    </div>
  );
};

export default RiskKPICard;
