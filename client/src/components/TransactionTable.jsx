// client/src/components/TransactionTable.jsx
// Tableau des transactions : montants signés w alignés à droite, chiffres tabulaires.

import React from 'react';
import { Trash2, Receipt } from 'lucide-react';
import { Button, Badge } from './common';
import { formatSignedTND, formatDate } from '../utils/format';

const TransactionTable = ({
  transactions = [],
  onDelete,
  showEventColumn = true,
  emptyTitle = 'No transactions yet',
  emptyText = 'Record your first sponsorship or expense and it will show up here.'
}) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="empty-state">
        <Receipt className="empty-state-icon" />
        <h4 className="empty-state-title">{emptyTitle}</h4>
        <p className="empty-state-subtitle">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            {showEventColumn && <th>Event</th>}
            <th>Category</th>
            <th>Type</th>
            <th className="num">Amount</th>
            {onDelete && <th aria-label="Actions" />}
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const isRevenue = tx.type === 'revenue';
            return (
              <tr key={tx._id}>
                <td className="num" style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                  {formatDate(tx.date)}
                </td>
                <td style={{ fontWeight: 500 }}>{tx.description}</td>
                {showEventColumn && <td>{tx.event?.name || 'Unassigned'}</td>}
                <td style={{ color: 'var(--text-secondary)' }}>{tx.category?.name || 'General'}</td>
                <td>
                  <Badge variant={isRevenue ? 'revenue' : 'expense'}>
                    {isRevenue ? 'Revenue' : 'Expense'}
                  </Badge>
                </td>
                <td className={`num ${isRevenue ? 'amount-revenue' : 'amount-expense'}`}>
                  {formatSignedTND(isRevenue ? tx.amount : -tx.amount)}
                </td>
                {onDelete && (
                  <td style={{ textAlign: 'right', width: '1%' }}>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      icon={Trash2}
                      onClick={() => onDelete(tx._id, tx.description)}
                      title={`Delete "${tx.description}"`}
                      aria-label={`Delete "${tx.description}"`}
                      style={{ padding: '0.25rem 0.5rem' }}
                    />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
