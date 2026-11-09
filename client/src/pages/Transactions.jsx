// client/src/pages/Transactions.jsx
// View all transactions across all events with event and type filters, and Add Transaction capability

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TransactionTable from '../components/TransactionTable';
import { Plus, X, Filter, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const formatTND = (amount) => {
  const num = Number(amount) || 0;
  return (
    num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' TND'
  );
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters State
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txForm, setTxForm] = useState({
    event: '',
    category: '',
    type: 'revenue',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      let query = '';
      const params = new URLSearchParams();
      if (selectedEvent !== 'all') params.append('event', selectedEvent);
      if (selectedType !== 'all') params.append('type', selectedType);
      if (params.toString()) query = `?${params.toString()}`;

      const res = await api.get(`/transactions${query}`);
      if (res.data.success) {
        setTransactions(res.data.transactions);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [eventsRes, catsRes] = await Promise.all([
        api.get('/events'),
        api.get('/categories')
      ]);
      if (eventsRes.data.success) setEvents(eventsRes.data.events);
      if (catsRes.data.success) setCategories(catsRes.data.categories);
    } catch (err) {
      console.error('Error fetching dropdown filters:', err);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [selectedEvent, selectedType]);

  const handleOpenAddModal = () => {
    setError('');
    const matchingCats = categories.filter((c) => c.type === 'revenue');
    setTxForm({
      event: events.length > 0 ? events[0]._id : '',
      category: matchingCats.length > 0 ? matchingCats[0]._id : '',
      type: 'revenue',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleTypeChangeInModal = (type) => {
    const matchingCats = categories.filter((c) => c.type === type);
    setTxForm({
      ...txForm,
      type,
      category: matchingCats.length > 0 ? matchingCats[0]._id : ''
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { event, category, type, description, amount, date } = txForm;
    if (!event || !category || !type || !description || !amount) {
      setError('Please fill in all transaction fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/transactions', {
        event,
        category,
        type,
        description,
        amount: Number(amount),
        date
      });
      if (res.data.success) {
        setShowModal(false);
        fetchTransactions();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (txId, txDescription) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete transaction "${txDescription}"?`
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/transactions/${txId}`);
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete transaction.');
    }
  };

  // Filtered categories for modal
  const filteredModalCategories = categories.filter(
    (c) => c.type === txForm.type
  );

  // Compute live subtotal of displayed transactions
  const totalAmount = transactions.reduce((sum, tx) => {
    return tx.type === 'revenue'
      ? sum + Number(tx.amount)
      : sum - Number(tx.amount);
  }, 0);

  return (
    <div className="auth-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />

        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Transactions</h1>
              <p className="page-subtitle">
                Record and filter all event revenues and expenses
              </p>
            </div>
            <button onClick={handleOpenAddModal} className="btn btn-primary">
              <Plus size={16} />
              <span>Record Transaction</span>
            </button>
          </div>

          {/* Filters Bar: Event and Type */}
          <div className="filters-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <Filter size={16} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filters:</span>
            </div>

            {/* Filter by Event */}
            <div>
              <select
                className="form-select"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
              >
                <option value="all">All Events</option>
                {events.map((ev) => (
                  <option key={ev._id} value={ev._id}>
                    {ev.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Type */}
            <div>
              <select
                className="form-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types (Revenue & Expenses)</option>
                <option value="revenue">Revenues Only</option>
                <option value="expense">Expenses Only</option>
              </select>
            </div>

            {(selectedEvent !== 'all' || selectedType !== 'all') && (
              <button
                onClick={() => {
                  setSelectedEvent('all');
                  setSelectedType('all');
                }}
                className="btn btn-secondary btn-sm"
              >
                Reset Filters
              </button>
            )}

            <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Total: <strong>{transactions.length}</strong> transactions &bull; Net Sum:{' '}
              <span
                style={{
                  fontWeight: 700,
                  color: totalAmount >= 0 ? 'var(--color-revenue)' : 'var(--color-expense)'
                }}
              >
                {totalAmount >= 0 ? '+' : ''}{formatTND(totalAmount)}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading transactions...</p>
            </div>
          ) : (
            <TransactionTable
              transactions={transactions}
              onDelete={handleDeleteTransaction}
              showEventColumn={true}
            />
          )}
        </div>
      </div>

      {/* Record Transaction Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Record New Transaction</h3>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              {/* Transaction Type Radio Selector */}
              <div className="form-group">
                <label>Transaction Type *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => handleTypeChangeInModal('revenue')}
                    className={`btn ${txForm.type === 'revenue' ? 'btn-success' : 'btn-secondary'}`}
                    style={{ width: '100%' }}
                  >
                    <ArrowUpRight size={16} />
                    <span>Revenue</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChangeInModal('expense')}
                    className={`btn ${txForm.type === 'expense' ? 'btn-danger' : 'btn-secondary'}`}
                    style={{ width: '100%' }}
                  >
                    <ArrowDownRight size={16} />
                    <span>Expense</span>
                  </button>
                </div>
              </div>

              {/* Event Dropdown */}
              <div className="form-group">
                <label htmlFor="event">Associated Event *</label>
                <select
                  id="event"
                  name="event"
                  className="form-select"
                  style={{ width: '100%' }}
                  value={txForm.event}
                  onChange={(e) => setTxForm({ ...txForm, event: e.target.value })}
                  required
                >
                  <option value="">Select an event</option>
                  {events.map((ev) => (
                    <option key={ev._id} value={ev._id}>
                      {ev.name} ({ev.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Dropdown */}
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
                  <option value="">Select a {txForm.type} category</option>
                  {filteredModalCategories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <input
                  id="description"
                  name="description"
                  type="text"
                  className="form-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. Sponsoring partnership contract"
                  value={txForm.description}
                  onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                  required
                />
              </div>

              {/* Amount & Date */}
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
                    placeholder="e.g. 1000"
                    value={txForm.amount}
                    onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="date">Date *</label>
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
                  className={txForm.type === 'revenue' ? 'btn btn-success' : 'btn btn-danger'}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Recording...' : `Record ${txForm.type === 'revenue' ? 'Revenue' : 'Expense'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;

