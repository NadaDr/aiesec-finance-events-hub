// client/src/components/common/Select.jsx
// Reusable Select dropdown component with options mapping, error handling, and label

import React from 'react';
import { AlertCircle } from 'lucide-react';

const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = '',
  required = false,
  error = '',
  helperText = '',
  disabled = false,
  id,
  className = '',
  style = {},
  selectStyle = {},
  ...props
}) => {
  const selectId = id || name || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`form-group ${className}`} style={{ marginBottom: '1.25rem', ...style }}>
      {label && (
        <label
          htmlFor={selectId}
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

      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="form-select"
        style={{
          width: '100%',
          borderRadius: '4px',
          borderColor: error ? 'var(--expense)' : undefined,
          backgroundColor: disabled ? 'var(--surface)' : '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer',
          ...selectStyle
        }}
        {...props}
      >
        {placeholder && (
          <option value="" disabled={required}>
            {placeholder}
          </option>
        )}
        {options.map((opt) => {
          if (typeof opt === 'object' && opt !== null) {
            return (
              <option key={opt.value ?? opt._id ?? opt.id} value={opt.value ?? opt._id ?? opt.id}>
                {opt.label ?? opt.name ?? opt.value}
              </option>
            );
          }
          return (
            <option key={opt} value={opt}>
              {opt}
            </option>
          );
        })}
      </select>

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

export default Select;
