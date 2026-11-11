// client/src/components/EventCard.jsx
// Carte événement : statut, lieu, période, flous (revenue / expenses / net) w budget utilisé.

import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Trash2, ArrowUpRight } from 'lucide-react';
import { Button, Badge } from './common';
import BudgetBar from './BudgetBar';
import { formatTND, formatSignedTND, formatDateRange } from '../utils/format';

const StatusBadge = ({ financialStatus, netBalance }) => {
  if (financialStatus === 'no_transactions') return <Badge variant="neutral">No activity yet</Badge>;
  return netBalance >= 0 ? <Badge variant="positive">Profitable</Badge> : <Badge variant="negative">Deficit</Badge>;
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

  return (
    <div className="event-card">
      <div>
        <div className="event-card-header">
          <h3 className="event-card-title">{name}</h3>
          <StatusBadge financialStatus={financialStatus} netBalance={netBalance} />
        </div>

        <div className="event-card-meta">
          <div className="event-card-meta-item">
            <MapPin size={15} />
            <span>{location}</span>
          </div>
          <div className="event-card-meta-item">
            <Calendar size={15} />
            <span>{formatDateRange(startDate, endDate)}</span>
          </div>
        </div>

        <div className="event-card-financials">
          <div>
            <div className="stat-label">Revenue</div>
            <div className="stat-value amount-revenue">{formatTND(totalRevenue)}</div>
          </div>
          <div>
            <div className="stat-label">Expenses</div>
            <div className="stat-value amount-expense">{formatTND(totalExpenses)}</div>
          </div>
          <div>
            <div className="stat-label">Net</div>
            <div className={`stat-value ${netBalance >= 0 ? 'amount-revenue' : 'amount-expense'}`}>
              {formatSignedTND(netBalance)}
            </div>
          </div>
        </div>

        <BudgetBar spent={totalExpenses} budget={budget} />
      </div>

      <div className="event-card-actions">
        <Link to={`/events/${_id}`} style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="sm" icon={ArrowUpRight} iconPosition="right">
            Open
          </Button>
        </Link>
        <Button
          variant="outline-danger"
          size="sm"
          icon={Trash2}
          onClick={() => onDelete && onDelete(_id, name)}
          title={`Delete ${name}`}
          aria-label={`Delete ${name}`}
        />
      </div>
    </div>
  );
};

export default EventCard;
