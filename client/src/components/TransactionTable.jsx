// client/src/components/TransactionTable.jsx
// Reusable table for displaying financial transactions

import React from 'react';
import { Trash2, ArrowUpRight, ArrowDownRight, Receipt } from 'lucide-react';

const formatTND = (amount) => {
  const num = Number(amount) || 0;
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' TND';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const TransactionTable = ({
  transactions = [],
  onDelete,
  showEventColumn = true
}) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="empty-state">
        <Receipt className="empty-state-icon" />
        <h4 className="empty-state-title">No transactions recorded yet</h4>
        <p className="empty-state-subtitle">
          Record your first revenue or expense to start monitoring your financial activities.
        </p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Description</th>
            {showEventColumn && <th>Event</th>}
            <th>Category</th>
            <th>Date</th>
            <th>Amount</th>
            {onDelete && <th style={{ textAlign: 'right' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const isRevenue = tx.type === 'revenue';
            return (
              <tr key={tx._id}>
                <td>
                  <span className={`badge ${isRevenue ? 'badge-revenue' : 'badge-expense'}`}>
                    {isRevenue ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {tx.type}
                  </span>
                </td>
                <td style={{ fontWeight: 500 }}>{tx.description}</td>
                {showEventColumn && (
                  <td>
                    {tx.event?.name || 'Unassigned'}
                  </td>
                )}
                <td>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {tx.category?.name || 'General'}
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  {formatDate(tx.date)}
                </td>
                <td>
                  <span className={isRevenue ? 'amount-revenue' : 'amount-expense'}>
                    {isRevenue ? '+' : '-'}{formatTND(tx.amount)}
                  </span>
                </td>
                {onDelete && (
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => onDelete(tx._id, tx.description)}
                      className="btn btn-outline-danger btn-sm"
                      title="Delete Transaction"
                      style={{ padding: '0.25rem 0.5rem' }}
                    >
                      <Trash2 size={14} />
                    </button>
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

