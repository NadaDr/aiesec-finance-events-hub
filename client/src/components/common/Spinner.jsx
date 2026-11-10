// client/src/components/common/Spinner.jsx
// Reusable Spinner loading indicator with optional label

import React from 'react';

const Spinner = ({ size = 'md', text = 'Loading data from MongoDB...', className = '' }) => {
  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return '24px';
      case 'lg':
        return '48px';
      case 'md':
      default:
        return '36px';
    }
  };

  const dim = getDimensions();

  return (
    <div
      className={`loading-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        gap: '1rem',
        color: 'var(--text-secondary)'
      }}
    >
      <div
        className="spinner"
        style={{
          width: dim,
          height: dim,
          border: '3px solid rgba(3, 126, 243, 0.15)',
          borderTopColor: 'var(--brand-primary, #037ef3)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
      />
      {text && <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{text}</p>}
    </div>
  );
};

export default Spinner;
