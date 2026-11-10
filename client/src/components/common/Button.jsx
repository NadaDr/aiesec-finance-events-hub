// client/src/components/common/Button.jsx
// Reusable Button component with multiple variants, sizes, loading state with spinner, and icon support

import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'outline-danger' | 'outline-primary' | 'ghost' | 'success'
  size = 'md', // 'sm' | 'md' | 'lg'
  type = 'button',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon = null,
  iconPosition = 'left',
  onClick,
  className = '',
  title,
  style = {},
  ...props
}) => {
  // Map variant to proper CSS class
  const getVariantClass = () => {
    switch (variant) {
      case 'secondary':
        return 'btn-secondary';
      case 'danger':
        return 'btn-danger';
      case 'outline-danger':
        return 'btn-outline-danger';
      case 'outline-primary':
        return 'btn-outline-primary';
      case 'success':
        return 'btn-success';
      case 'ghost':
        return 'btn-ghost';
      case 'primary':
      default:
        return 'btn-primary';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'btn-sm';
      case 'lg':
        return 'btn-lg';
      case 'md':
      default:
        return '';
    }
  };

  const combinedClasses = [
    'btn',
    getVariantClass(),
    getSizeClass(),
    fullWidth ? 'btn-full-width' : '',
    loading ? 'btn-loading' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={isDisabled}
      onClick={onClick}
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.7 : 1,
        width: fullWidth ? '100%' : undefined,
        position: 'relative',
        borderRadius: '4px',
        transition: 'all 0.18s ease',
        ...style
      }}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="animate-spin" />
          <span>{children || 'Loading...'}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
          )}
          {children && <span>{children}</span>}
          {Icon && iconPosition === 'right' && (
            <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
          )}
        </>
      )}
    </button>
  );
};

export default Button;
