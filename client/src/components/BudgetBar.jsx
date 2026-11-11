// client/src/components/BudgetBar.jsx
// ======================================================================================
// Budget vs dépenses réelles : "6,200 of 8,000 TND spent · 78%"
//   - bleu    : < 90 %
//   - orange  : 90–100 % (9rib yofa)
//   - a7mer   : > 100 % (fet el budget)
// ======================================================================================

import React from 'react';
import { budgetUsage, formatWholeTND } from '../utils/format';

const BudgetBar = ({ spent = 0, budget = 0 }) => {
  const usage = budgetUsage(spent, budget);

  if (usage === null) {
    return <div className="budget-bar-empty">No budget set</div>;
  }

  const pct = Math.round(usage);
  const state = usage > 100 ? 'budget-bar-over' : usage >= 90 ? 'budget-bar-warn' : '';
  const label =
    usage > 100
      ? `${formatWholeTND(spent - budget)} over`
      : `${pct}%`;

  return (
    <div
      className={`budget-bar ${state}`}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.min(pct, 100)}
      aria-label="Budget used"
    >
      <div className="budget-bar-head">
        <span>
          <strong>{formatWholeTND(spent)}</strong> of {formatWholeTND(budget)} spent
        </span>
        <span className="budget-bar-pct">{label}</span>
      </div>
      <div className="budget-bar-track">
        <div className="budget-bar-fill" style={{ width: `${Math.min(usage, 100)}%` }} />
      </div>
    </div>
  );
};

export default BudgetBar;
