// client/src/components/common/Badge.jsx
// Reusable Badge component for financial types, statuses, and tags

import React from 'react';
import { ArrowUpRight, ArrowDownRight, CheckCircle2, AlertTriangle } from 'lucide-react';

const Badge = ({
  variant = 'neutral', // 'revenue' | 'expense' | 'positive' | 'negative' | 'neutral' | 'warning' | 'primary'
  children,
  icon = true,
  className = '',
  style = {}
}) => {
  const getBadgeConfig = () => {
    switch (variant) {
      case 'revenue':
        return {
          cssClass: 'badge-revenue',
          DefaultIcon: ArrowUpRight
        };
      case 'expense':
        return {
          cssClass: 'badge-expense',
          DefaultIcon: ArrowDownRight
        };
      case 'positive':
        return {
          cssClass: 'badge-positive',
          DefaultIcon: ArrowUpRight
        };
      case 'negative':
        return {
          cssClass: 'badge-negative',
          DefaultIcon: ArrowDownRight
        };
      case 'warning':
        return {
          cssClass: 'badge-warning',
          DefaultIcon: AlertTriangle
        };
      case 'primary':
        return {
          cssClass: 'badge-primary',
          DefaultIcon: CheckCircle2
        };
      case 'neutral':
      default:
        return {
          cssClass: 'badge-neutral',
          DefaultIcon: null
        };
    }
  };

  const { cssClass, DefaultIcon } = getBadgeConfig();

  return (
    <span
      className={`badge ${cssClass} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        ...style
      }}
    >
      {icon && DefaultIcon && <DefaultIcon size={12} />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
