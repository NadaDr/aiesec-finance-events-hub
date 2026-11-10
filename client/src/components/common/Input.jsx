// client/src/components/common/Input.jsx
// Reusable Input component with label, error message, helper text, leading icon, and required indicator

import React from 'react';
import { AlertCircle } from 'lucide-react';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  helperText = '',
  icon: Icon = null,
  disabled = false,
  id,
  min,
  max,
  step,
  autoComplete,
  className = '',
  style = {},
  inputStyle = {},
  ...props
}) => {
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`form-group ${className}`} style={{ marginBottom: '1.25rem', ...style }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: error ? 'var(--expense)' : 'var(--text-primary)',
            marginBottom: '0.4rem'
          }}
        >
          {label} {required && <span style={{ color: 'var(--expense)' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          autoComplete={autoComplete}
          className="form-input"
          style={{
            width: '100%',
            paddingLeft: Icon ? '2.4rem' : '0.95rem',
            borderRadius: '4px',
            borderColor: error ? 'var(--expense)' : undefined,
            backgroundColor: disabled ? 'var(--surface)' : undefined,
            cursor: disabled ? 'not-allowed' : undefined,
            ...inputStyle
          }}
          {...props}
        />

        {Icon && (
          <Icon
            size={16}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: error ? 'var(--expense)' : 'var(--text-secondary)',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>

      {error ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: 'var(--expense)',
            fontSize: '0.78rem',
            marginTop: '0.35rem',
            fontWeight: 500
          }}
        >
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export default Input;
