// client/src/pages/EventDetails.jsx
// Detailed view of an event showing financial summary, Add Revenue & Add Expense modals, and transaction history

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FinancialCard from '../components/FinancialCard';
import TransactionTable from '../components/TransactionTable';
import {
  ArrowLeft,
  Plus,
  X,
  MapPin,
  Calendar,
  Wallet,
  TrendingUp,
  TrendingDown,
  Trash2,
  AlertCircle
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

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('revenue'); // 'revenue' or 'expense'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [txForm, setTxForm] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/events/${id}`);
      if (res.data.success) {
        setEvent(res.data.event);
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError('Event not found or access denied.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchEventData();
    fetchCategories();
  }, [id]);

  const openAddModal = (type) => {
    setError('');
    setModalType(type);
    // Find first matching category for convenience
    const matchingCats = categories.filter((c) => c.type === type);
    setTxForm({
      category: matchingCats.length > 0 ? matchingCats[0]._id : '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleTxSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { category, description, amount, date } = txForm;
    if (!category || !description || !amount) {
      setError('Please fill in all transaction fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/transactions', {
        event: id,
        category,
        type: modalType,
        description,
        amount: Number(amount),
        date
      });
      if (res.data.success) {
        setShowModal(false);
        fetchEventData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (txId, txDescription) => {
    const confirmDelete = window.confirm(
      `Delete transaction "${txDescription}"? This will update the event financials dynamically.`
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/transactions/${txId}`);
      fetchEventData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete transaction.');
    }
  };

  const handleDeleteEvent = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${event.name}" and all its financial records? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/events/${id}`);
      navigate('/events');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event.');
    }
  };

  if (loading) {
    return (
      <div className="auth-layout">
        <Sidebar />
        <div className="main-content">
          <Navbar />
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading event financial details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="auth-layout">
        <Sidebar />
        <div className="main-content">
          <Navbar />
          <div className="page-content">
            <div className="alert alert-danger">{error || 'Event not found.'}</div>
            <Link to="/events" className="btn btn-secondary">
              <ArrowLeft size={16} />
              <span>Back to Events</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter categories by modal type
  const availableCategories = categories.filter((c) => c.type === modalType);

  return (
    <div className="auth-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />

        <div className="page-content">
          {/* Breadcrumb / Back Navigation */}
          <div style={{ marginBottom: '1.25rem' }}>
            <Link
              to="/events"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Events</span>
            </Link>
          </div>

          {/* Event Header Banner */}
          <div className="card" style={{ marginBottom: '1.75rem', borderLeft: '5px solid var(--primary-blue)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                  <h1 className="page-title" style={{ fontSize: '1.75rem' }}>
                    {event.name}
                  </h1>
                  {event.netBalance >= 0 ? (
                    <span className="badge badge-positive">Positive Surplus</span>
                  ) : (
                    <span className="badge badge-negative">Budget Deficit</span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={16} />
                    <span>{event.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={16} />
                    <span>
                      {formatDate(event.startDate)} &mdash; {formatDate(event.endDate)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Wallet size={16} />
                    <span>Budget: <strong>{formatTND(event.budget)}</strong></span>
                  </div>
                </div>

                {event.description && (
                  <p style={{ marginTop: '0.85rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                    {event.description}
                  </p>
                )}
              </div>

              {/* Action Buttons: Add Revenue, Add Expense, Delete */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => openAddModal('revenue')}
                  className="btn btn-success"
                >
                  <TrendingUp size={16} />
                  <span>+ Add Revenue</span>
                </button>
                <button
                  onClick={() => openAddModal('expense')}
                  className="btn btn-danger"
                >
                  <TrendingDown size={16} />
                  <span>+ Add Expense</span>
                </button>
                <button
                  onClick={handleDeleteEvent}
                  className="btn btn-outline-danger"
                  title="Delete Event"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* 3 Event KPI Cards */}
          <div className="kpi-grid">
            <FinancialCard
              title="Total Event Revenue"
              value={event.totalRevenue}
              type="revenue"
              subtitle="All sponsorship & ticket sales"
            />
            <FinancialCard
              title="Total Event Expenses"
              value={event.totalExpenses}
              type="expense"
              subtitle="All venue, catering & logistics"
            />
            <FinancialCard
              title="Event Net Balance"
              value={event.netBalance}
              type="balance"
              subtitle={
                event.netBalance >= 0
                  ? `Surplus: +${formatTND(event.netBalance)}`
                  : `Deficit: ${formatTND(event.netBalance)}`
              }
            />
          </div>

          {/* Transactions for this Event */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark-blue)' }}>
                  Event Financial Transactions
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  All incoming revenues and outgoing expenses recorded for this event
                </p>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {event.transactions?.length || 0} transaction(s)
              </div>
            </div>

            <TransactionTable
              transactions={event.transactions}
              onDelete={handleDeleteTransaction}
              showEventColumn={false}
            />
          </div>
        </div>
      </div>

      {/* Add Revenue / Add Expense Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {modalType === 'revenue' ? '+ Record Revenue' : '+ Record Expense'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="modal-close"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleTxSubmit}>
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  className="form-select"
                  style={{ width: '100%' }}
                  value={txForm.category}
                  onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}
                  required
                >
                  <option value="">Select a {modalType} category</option>
                  {availableCategories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <input
                  id="description"
                  name="description"
                  type="text"
                  className="form-input"
                  style={{ width: '100%' }}
                  placeholder={
                    modalType === 'revenue'
                      ? 'e.g. Gold Sponsorship from Tech Corp'
                      : 'e.g. Venue rental down payment'
                  }
                  value={txForm.description}
                  onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="amount">Amount (TND) *</label>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-input"
                    style={{ width: '100%' }}
                    placeholder="e.g. 1500"
                    value={txForm.amount}
                    onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="date">Transaction Date *</label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    className="form-input"
                    style={{ width: '100%' }}
                    value={txForm.date}
                    onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={modalType === 'revenue' ? 'btn btn-success' : 'btn btn-danger'}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : `Save ${modalType === 'revenue' ? 'Revenue' : 'Expense'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;

