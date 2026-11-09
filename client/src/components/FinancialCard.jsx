// client/src/components/FinancialCard.jsx
// Reusable KPI card displaying financial indicators

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
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' TND';
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
        return <TrendingUp size={22} />;
      case 'expense':
        return <TrendingDown size={22} />;
      case 'events':
        return <Calendar size={22} />;
      case 'budget':
        return <Wallet size={22} />;
      default:
        return <DollarSign size={22} />;
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

  return (
    <div className={`kpi-card ${getCardClass()}`}>
      <div>
        <div className="kpi-title">{title}</div>
        <div className="kpi-value">
          {isCurrency ? formatTND(value) : value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            {subtitle}
          </div>
        )}
      </div>
      <div className="kpi-icon-wrap">
        {getIcon()}
      </div>
    </div>
  );
};

export default FinancialCard;

