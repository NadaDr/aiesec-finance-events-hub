// client/src/components/EventCard.jsx
// Event card component for event list overview using common Button and Badge components

import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Trash2, ArrowUpRight } from 'lucide-react';
import { Button, Badge } from './common';

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

  const renderStatusBadge = () => {
    if (financialStatus === 'positive' || netBalance > 0) {
      return <Badge variant="positive">Positive (+{formatTND(netBalance)})</Badge>;
    }
    if (financialStatus === 'negative' || netBalance < 0) {
      return <Badge variant="negative">Deficit ({formatTND(netBalance)})</Badge>;
    }
    return <Badge variant="neutral">No transactions</Badge>;
  };

  return (
    <div className="event-card">
      <div>
        <div className="event-card-header">
          <h3 className="event-card-title">{name}</h3>
          {renderStatusBadge()}
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
        <Link to={`/events/${_id}`} style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="sm" icon={ArrowUpRight} iconPosition="right">
            View Details
          </Button>
        </Link>
        <Button
          variant="outline-danger"
          size="sm"
          icon={Trash2}
          onClick={() => onDelete && onDelete(_id, name)}
          title="Delete Event"
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default EventCard;
