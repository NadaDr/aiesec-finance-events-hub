// client/src/components/common/Textarea.jsx
// Reusable Textarea component with label, error display, and flexible rows

import React from 'react';
import { AlertCircle } from 'lucide-react';

const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder = '',
  rows = 3,
  required = false,
  error = '',
  helperText = '',
  disabled = false,
  id,
  className = '',
  style = {},
  textareaStyle = {},
  ...props
}) => {
  const textareaId = id || name || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`form-group ${className}`} style={{ marginBottom: '1.25rem', ...style }}>
      {label && (
        <label
          htmlFor={textareaId}
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

      <textarea
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        className="form-input"
        style={{
          width: '100%',
          fontFamily: 'inherit',
          resize: 'vertical',
          borderRadius: '4px',
          borderColor: error ? 'var(--expense)' : undefined,
          backgroundColor: disabled ? 'var(--surface)' : '#fff',
          cursor: disabled ? 'not-allowed' : undefined,
          ...textareaStyle
        }}
        {...props}
      />

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

export default Textarea;
