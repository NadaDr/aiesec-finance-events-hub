// client/src/components/FinancialCard.jsx
// ======================================================================================
// Carte KPI : valeur courte (37.3K TND) — el montant exact yodhher ki t7ott el souris —
// w tendance had el chhar vs el chhar eli fet (▲ 12% vs last month).
// Pour les dépenses, tal3a = mouch behi (a7mer) ; pour revenue/net, tal3a = behi (a5dher).
// ======================================================================================

import React from 'react';
import { TrendingUp, TrendingDown, Calendar, Wallet, Scale, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatTND, formatCompactTND, formatWholeTND, percentChange } from '../utils/format';

const ICONS = {
  revenue: TrendingUp,
  expense: TrendingDown,
  events: Calendar,
  budget: Wallet,
  balance: Scale
};

// Chnowa yetkteb ta7t el valeur : tendance ken famma, sinon el subtitle
const TrendLine = ({ trend, type, subtitle }) => {
  if (!trend) {
    return subtitle ? <div className="kpi-sub">{subtitle}</div> : null;
  }

  const pct = percentChange(trend.current, trend.previous);

  // Ma fammech chhar 9bal bech nqarnou bih
  if (pct === null) {
    return (
      <div className="kpi-sub">
        {trend.current !== 0 ? `${formatWholeTND(trend.current)} this month` : subtitle || 'No activity this month'}
      </div>
    );
  }

  const rounded = Math.round(pct);
  if (rounded === 0) {
    return <div className="kpi-sub">Same as last month</div>;
  }

  const up = rounded > 0;
  const goodWhenUp = type !== 'expense';
  const tone = up === goodWhenUp ? 'kpi-trend-good' : 'kpi-trend-bad';
  const Arrow = up ? ArrowUpRight : ArrowDownRight;

  return (
    <div className={`kpi-trend ${tone}`} title={`This month: ${formatTND(trend.current)} · Last month: ${formatTND(trend.previous)}`}>
      <Arrow size={14} />
      <span>{Math.abs(rounded)}%</span>
      <span className="kpi-trend-label">vs last month</span>
    </div>
  );
};

const FinancialCard = ({ title, value, type = 'balance', subtitle, isCurrency = true, trend = null }) => {
  const Icon = ICONS[type] || Scale;
  const cardClass = type === 'events' ? 'kpi-events' : `kpi-${type === 'budget' ? 'balance' : type}`;

  return (
    <div className={`kpi-card ${cardClass}`}>
      <div className="kpi-body">
        <div className="kpi-title">{title}</div>
        <div className="kpi-value" title={isCurrency ? formatTND(value) : undefined}>
          {isCurrency ? formatCompactTND(value) : value}
        </div>
        <TrendLine trend={trend} type={type} subtitle={subtitle} />
      </div>
      <div className="kpi-icon-wrap">
        <Icon size={20} />
      </div>
    </div>
  );
};

export default FinancialCard;
