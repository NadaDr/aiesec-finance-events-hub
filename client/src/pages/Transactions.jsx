// client/src/pages/Transactions.jsx
// View all transactions across all events with event and type filters, and reusable form components

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions, createTransaction, deleteTransaction } from '../redux/transactionsSlice';
import { fetchEvents } from '../redux/eventsSlice';
import { fetchCategories } from '../redux/categoriesSlice';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TransactionTable from '../components/TransactionTable';
import { Button, Input, Select, Modal, Alert, Spinner } from '../components/common';
import { Plus, Filter, ArrowUpRight, ArrowDownRight, DollarSign, Calendar } from 'lucide-react';

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
  const dispatch = useDispatch();

  const { transactions, loading, isSubmitting, error: txError } = useSelector(
    (state) => state.transactions
  );
  const { events } = useSelector((state) => state.events);
  const { categories } = useSelector((state) => state.categories);

  // Filters State
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState('');
  const [txForm, setTxForm] = useState({
    event: '',
    category: '',
    type: 'revenue',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    dispatch(fetchEvents());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchTransactions({ event: selectedEvent, type: selectedType }));
  }, [dispatch, selectedEvent, selectedType]);

  const handleOpenAddModal = () => {
    setFormError('');
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
    setFormError('');

    const { event, category, type, description, amount, date } = txForm;
    if (!event || !category || !type || !description || !amount) {
      setFormError('Please fill in all transaction fields.');
      return;
    }

    try {
      const resultAction = await dispatch(
        createTransaction({
          event,
          category,
          type,
          description,
          amount: Number(amount),
          date
        })
      );

      if (createTransaction.fulfilled.match(resultAction)) {
        setShowModal(false);
      } else {
        setFormError(resultAction.payload || 'Failed to record transaction.');
      }
    } catch (err) {
      setFormError('Failed to record transaction.');
    }
  };

  const handleDeleteTransaction = async (txId, txDescription) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete transaction "${txDescription}"?`
    );
    if (!confirmDelete) return;

    dispatch(deleteTransaction(txId));
  };

  // Filtered categories for modal
  const filteredModalCategories = categories.filter((c) => c.type === txForm.type);

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
            <Button
              variant="primary"
              icon={Plus}
              onClick={handleOpenAddModal}
            >
              Record Transaction
            </Button>
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
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedEvent('all');
                  setSelectedType('all');
                }}
              >
                Reset Filters
              </Button>
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

          <Alert type="danger" message={txError} />

          {loading && transactions.length === 0 ? (
            <Spinner text="Loading transactions from MongoDB..." />
          ) : (
            <TransactionTable
              transactions={transactions}
              onDelete={handleDeleteTransaction}
              showEventColumn={true}
            />
          )}
        </div>
      </div>

      {/* Record Transaction Modal using reusable Modal component */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Record New Transaction"
        subtitle="Log a revenue incoming or expenditure outgoing"
      >
        <Alert type="danger" message={formError} onClose={() => setFormError('')} />

        <form onSubmit={handleFormSubmit}>
          {/* Transaction Type Radio Selector */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Transaction Type *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Button
                type="button"
                variant={txForm.type === 'revenue' ? 'success' : 'secondary'}
                onClick={() => handleTypeChangeInModal('revenue')}
                icon={ArrowUpRight}
                fullWidth
              >
                Revenue
              </Button>
              <Button
                type="button"
                variant={txForm.type === 'expense' ? 'danger' : 'secondary'}
                onClick={() => handleTypeChangeInModal('expense')}
                icon={ArrowDownRight}
                fullWidth
              >
                Expense
              </Button>
            </div>
          </div>

          {/* Event Dropdown */}
          <Select
            label="Associated Event"
            name="event"
            value={txForm.event}
            onChange={(e) => setTxForm({ ...txForm, event: e.target.value })}
            placeholder="Select an event"
            options={events.map((ev) => ({
              value: ev._id,
              label: `${ev.name} (${ev.location})`
            }))}
            required
          />

          {/* Category Dropdown */}
          <Select
            label="Category"
            name="category"
            value={txForm.category}
            onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}
            placeholder={`Select a ${txForm.type} category`}
            options={filteredModalCategories.map((c) => ({
              value: c._id,
              label: c.name
            }))}
            required
          />

          {/* Description */}
          <Input
            label="Description"
            name="description"
            placeholder="e.g. Sponsoring partnership contract"
            value={txForm.description}
            onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
            required
          />

          {/* Amount & Date */}
          <div className="form-row">
            <Input
              label="Amount (TND)"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 1000"
              value={txForm.amount}
              onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
              icon={DollarSign}
              required
            />
            <Input
              label="Date"
              name="date"
              type="date"
              value={txForm.date}
              onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
              icon={Calendar}
              required
            />
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={txForm.type === 'revenue' ? 'success' : 'danger'}
              loading={isSubmitting}
            >
              Record {txForm.type === 'revenue' ? 'Revenue' : 'Expense'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Transactions;
