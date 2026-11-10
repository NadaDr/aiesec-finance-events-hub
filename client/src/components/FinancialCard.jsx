// client/src/components/FinancialCard.jsx
// Reusable KPI card displaying financial indicators with sharpened edges and brand styling

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Wallet
} from 'lucide-react';

const formatTND = (amount) => {
  const num = Number(amount) || 0;
  return (
    num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' TND'
  );
};

const FinancialCard = ({
  title,
  value,
  type = 'balance',
  subtitle,
  isCurrency = true
}) => {
  const getIcon = () => {
    switch (type) {
      case 'revenue':
        return <TrendingUp size={20} />;
      case 'expense':
        return <TrendingDown size={20} />;
      case 'events':
        return <Calendar size={20} />;
      case 'budget':
        return <Wallet size={20} />;
      default:
        return <DollarSign size={20} />;
    }
  };

  const getCardClass = () => {
    switch (type) {
      case 'revenue':
        return 'kpi-revenue';
      case 'expense':
        return 'kpi-expense';
      case 'events':
        return 'kpi-events';
      default:
        return 'kpi-balance';
    }
  };

  const getBadgeText = () => {
    switch (type) {
      case 'revenue':
        return 'Inflow';
      case 'expense':
        return 'Outflow';
      case 'events':
        return 'Active';
      default:
        return Number(value) >= 0 ? 'Surplus' : 'Deficit';
    }
  };

  const getBadgeStyle = () => {
    switch (type) {
      case 'revenue':
        return { backgroundColor: 'var(--revenue-bg)', color: 'var(--revenue)', border: '1px solid rgba(0, 193, 110, 0.25)' };
      case 'expense':
        return { backgroundColor: 'var(--expense-bg)', color: 'var(--expense)', border: '1px solid rgba(248, 90, 64, 0.25)' };
      case 'events':
        return { backgroundColor: 'rgba(0, 59, 112, 0.08)', color: 'var(--brand-dark)', border: '1px solid rgba(0, 59, 112, 0.2)' };
      default:
        return Number(value) >= 0
          ? { backgroundColor: 'var(--revenue-bg)', color: 'var(--revenue)', border: '1px solid rgba(0, 193, 110, 0.25)' }
          : { backgroundColor: 'var(--expense-bg)', color: 'var(--expense)', border: '1px solid rgba(248, 90, 64, 0.25)' };
    }
  };

  return (
    <div className={`kpi-card ${getCardClass()}`}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <div className="kpi-title" style={{ margin: 0 }}>{title}</div>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.15rem 0.45rem',
              borderRadius: '2px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              ...getBadgeStyle()
            }}
          >
            {getBadgeText()}
          </span>
        </div>
        <div className="kpi-value">
          {isCurrency ? formatTND(value) : value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            {subtitle}
          </div>
        )}
      </div>
      <div className="kpi-icon-wrap" style={{ marginLeft: '0.75rem', flexShrink: 0 }}>
        {getIcon()}
      </div>
    </div>
  );
};

export default FinancialCard;
