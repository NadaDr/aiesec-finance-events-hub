// client/src/components/common/Alert.jsx
// Reusable Alert banner for displaying errors, successes, warnings, and informational notices

import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const Alert = ({
  type = 'danger', // 'danger' | 'success' | 'warning' | 'info'
  message = '',
  children,
  onClose = null,
  className = '',
  style = {}
}) => {
  if (!message && !children) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'var(--revenue-bg, #e6f9f0)',
          color: 'var(--revenue, #00c16e)',
          border: 'rgba(0, 193, 110, 0.25)',
          Icon: CheckCircle2
        };
      case 'warning':
        return {
          bg: 'var(--warning-bg, #fffbeb)',
          color: '#b47814',
          border: 'rgba(180, 120, 20, 0.25)',
          Icon: AlertTriangle
        };
      case 'info':
        return {
          bg: 'var(--brand-light, #ebf5ff)',
          color: 'var(--brand-primary, #037ef3)',
          border: 'rgba(3, 126, 243, 0.25)',
          Icon: Info
        };
      case 'danger':
      default:
        return {
          bg: 'var(--expense-bg, #fef2f2)',
          color: 'var(--expense, #f85a40)',
          border: 'rgba(248, 90, 64, 0.25)',
          Icon: AlertCircle
        };
    }
  };

  const { bg, color, border, Icon } = getTypeStyles();

  return (
    <div
      className={`alert alert-${type} ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        padding: '0.85rem 1.15rem',
        borderRadius: '4px',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        marginBottom: '1.25rem',
        fontSize: '0.875rem',
        fontWeight: 500,
        ...style
      }}
      role="alert"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1 }}>
        <Icon size={18} style={{ flexShrink: 0 }} />
        <div>{message || children}</div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            opacity: 0.75
          }}
          aria-label="Dismiss alert"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
};

export default Alert;
