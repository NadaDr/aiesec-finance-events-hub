// client/src/components/EventCard.jsx
// Event card component for event list overview

import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Trash2, ArrowUpRight } from 'lucide-react';

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

const EventCard = ({ event, onDelete }) => {
  const {
    _id,
    name,
    location,
    startDate,
    endDate,
    budget,
    totalRevenue = 0,
    totalExpenses = 0,
    netBalance = 0,
    financialStatus = 'no_transactions'
  } = event;

  const getStatusBadge = () => {
    if (financialStatus === 'positive' || netBalance > 0) {
      return <span className="badge badge-positive">Positive (+{formatTND(netBalance)})</span>;
    }
    if (financialStatus === 'negative' || netBalance < 0) {
      return <span className="badge badge-negative">Deficit ({formatTND(netBalance)})</span>;
    }
    return <span className="badge badge-neutral">No transactions</span>;
  };

  return (
    <div className="event-card">
      <div>
        <div className="event-card-header">
          <h3 className="event-card-title">{name}</h3>
          {getStatusBadge()}
        </div>

        <div className="event-card-meta">
          <div className="event-card-meta-item">
            <MapPin size={15} />
            <span>{location}</span>
          </div>
          <div className="event-card-meta-item">
            <Calendar size={15} />
            <span>
              {formatDate(startDate)} &mdash; {formatDate(endDate)}
            </span>
          </div>
        </div>

        <div className="event-card-financials">
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Budget</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{formatTND(budget)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Revenue</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-revenue)' }}>
              +{formatTND(totalRevenue)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Expenses</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-expense)' }}>
              -{formatTND(totalExpenses)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Net Balance</div>
            <div
              style={{
                fontWeight: 700,
                fontSize: '0.9rem',
                color: netBalance >= 0 ? 'var(--color-revenue)' : 'var(--color-expense)'
              }}
            >
              {netBalance >= 0 ? '+' : ''}{formatTND(netBalance)}
            </div>
          </div>
        </div>
      </div>

      <div className="event-card-actions">
        <Link to={`/events/${_id}`} className="btn btn-primary btn-sm">
          <span>View Details</span>
          <ArrowUpRight size={14} />
        </Link>
        <button
          onClick={() => onDelete && onDelete(_id, name)}
          className="btn btn-outline-danger btn-sm"
          title="Delete Event"
        >
          <Trash2 size={14} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default EventCard;

