// client/src/pages/EventDetails.jsx
// ======================================================================================
// 📌 EVENT DETAILS PAGE 
// ======================================================================================
// Hathi el-Page mte3 les détails mte3 un évènement spécifique (Revenues, Expenses, Net Balance, Transactions):
// 1) useParams: njibou el `id` mte3 l'évènement mel URL (/events/:id).
// 2) useEffect: nchargiw l'évènement b-`fetchEventById(id)` w les catégories b-`fetchCategories()`.
// 3) useState (showModal, modalType, txForm): bech n7ellou popup mte3 "+ Add Revenue" walla "+ Add Expense".
// 4) handleTxSubmit: yab3eth transaction jdida lel MongoDB b-`createTransaction()`.
// 5) handleDeleteTransaction / handleDeleteEvent: yfasakh transaction walla event klemel mel base de données.
// ======================================================================================

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEventById, deleteEvent } from '../redux/eventsSlice';
import { createTransaction, deleteTransaction } from '../redux/transactionsSlice';
import { fetchCategories } from '../redux/categoriesSlice';
import FinancialCard from '../components/FinancialCard';
import TransactionTable from '../components/TransactionTable';
import BudgetBar from '../components/BudgetBar';
import { formatTND, formatSignedTND, formatDateRange } from '../utils/format';
import {
  Button,
  Input,
  Select,
  Modal,
  Alert,
  Spinner,
  Badge,
  useToast,
  useConfirm
} from '../components/common';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  Trash2,
  DollarSign
} from 'lucide-react';

const EventDetails = () => {
  // useParams: yjbed l-id mte3 l-évènement mel lien (URL)
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const confirm = useConfirm();

  // useSelector 1: njibou l-évènement sélectionné w loading/error mel eventsSlice
  const { currentEvent, currentEventLoading, currentEventError } = useSelector(
    (state) => state.events
  );
  // useSelector 2: état mte3 soumission transaction mel transactionsSlice
  const { isSubmitting: isTxSubmitting } = useSelector((state) => state.transactions);
  // useSelector 3: les catégories mte3na mel categoriesSlice
  const { categories } = useSelector((state) => state.categories);

  // useState 1: showModal -> yched ken el popup ma7loula (true) walla msakkra (false)
  const [showModal, setShowModal] = useState(false);
  // useState 2: modalType -> ya 'revenue' ya 'expense'
  const [modalType, setModalType] = useState('revenue');
  // useState 3: modalError -> yched ken fama ghalka fel formulaire mte3 transaction
  const [modalError, setModalError] = useState('');

  // useState 4: txForm -> les données mte3 el-formulaire (category, description, amount, date)
  const [txForm, setTxForm] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  // useEffect: yet7all wa9t el page tet7al walla l-id yetbaddel -> yjib l-event w les catégories
  useEffect(() => {
    if (id) {
      dispatch(fetchEventById(id));
      dispatch(fetchCategories());
    }
  }, [dispatch, id]);

  // Fonction t7el el modal mte3 el transaction (revenue walla expense)
  const openAddModal = (type) => {
    setModalError('');
    setModalType(type);
    const matchingCats = categories.filter((c) => c.type === type);
    setTxForm({
      category: matchingCats.length > 0 ? matchingCats[0]._id : '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  // Fonction tvalider w tab3eth el transaction jdida lel MongoDB
  const handleTxSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    const { category, description, amount, date } = txForm;
    if (!category || !description || !amount) {
      setModalError('Please fill in all transaction fields.');
      return;
    }

    try {
      const resultAction = await dispatch(
        createTransaction({
          event: id,
          category,
          type: modalType,
          description,
          amount: Number(amount),
          date
        })
      );

      if (createTransaction.fulfilled.match(resultAction)) {
        setShowModal(false);
        toast.success(`${modalType === 'revenue' ? 'Revenue' : 'Expense'} recorded.`);
        // Refresh event details to update live calculated totals and table
        dispatch(fetchEventById(id));
      } else {
        setModalError(resultAction.payload || 'Failed to record transaction.');
      }
    } catch (err) {
      setModalError('Failed to record transaction.');
    }
  };

  // Fonction tfasakh transaction men west l-évènement
  const handleDeleteTransaction = async (txId, txDescription) => {
    const ok = await confirm({
      title: 'Delete transaction',
      message: `Delete transaction "${txDescription}"? The event financials will be recalculated.`
    });
    if (!ok) return;

    try {
      await dispatch(deleteTransaction(txId)).unwrap();
      toast.success('Transaction deleted.');
      dispatch(fetchEventById(id));
    } catch (message) {
      toast.error(message);
    }
  };

  // Fonction tfasakh l-évènement kemel mel base de données
  const handleDeleteEvent = async () => {
    const eventName = currentEvent?.event?.name || 'this event';
    const ok = await confirm({
      title: 'Delete event',
      message: `Delete "${eventName}" and all its financial records? This action cannot be undone.`
    });
    if (!ok) return;

    try {
      await dispatch(deleteEvent(id)).unwrap();
      toast.success(`"${eventName}" deleted.`);
      navigate('/events');
    } catch (message) {
      toast.error(message);
    }
  };

  // Ma naffichiw ken l'event mta3 el URL (mouch event 9dim b9a fel store)
  const event = currentEvent?.event?._id === id ? currentEvent.event : null;
  const transactions = event ? currentEvent.transactions || [] : [];

  // Spinner ken awwel chargement barka (ba3d add/delete transaction, nkhalliw el page affichée)
  if (!event && (currentEventLoading || !currentEventError)) {
    return <Spinner text="Loading event…" />;
  }

  if (!event) {
    return (
      <div className="page-content">
        <Alert type="danger" message={currentEventError || 'Event not found.'} />
        <Link to="/events" style={{ textDecoration: 'none' }}>
          <Button variant="secondary" icon={ArrowLeft}>
            Back to Events
          </Button>
        </Link>
      </div>
    );
  }

  // Filter categories by modal type
  const availableCategories = categories.filter((c) => c.type === modalType);

  return (
    <>
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
              fontWeight: 500,
              textDecoration: 'none'
            }}
          >
            <ArrowLeft size={16} />
            <span>All events</span>
          </Link>
        </div>

        {/* Event Header Banner */}
        <div className="card" style={{ marginBottom: '1.75rem', borderLeft: '5px solid var(--brand-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                <h1 className="page-title" style={{ fontSize: '1.75rem' }}>
                  {event.name}
                </h1>
                {event.financialStatus === 'no_transactions' ? (
                  <Badge variant="neutral">No activity yet</Badge>
                ) : event.netBalance >= 0 ? (
                  <Badge variant="positive">Profitable</Badge>
                ) : (
                  <Badge variant="negative">Deficit</Badge>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={16} />
                  <span>{event.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={16} />
                  <span>{formatDateRange(event.startDate, event.endDate)}</span>
                </div>
              </div>

              {event.description && (
                <p style={{ marginTop: '0.85rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  {event.description}
                </p>
              )}

              <div style={{ maxWidth: '420px' }}>
                <BudgetBar spent={event.totalExpenses} budget={event.budget} />
              </div>
            </div>

            {/* Action Buttons: Add Revenue, Add Expense, Delete */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Button
                variant="success"
                icon={TrendingUp}
                onClick={() => openAddModal('revenue')}
              >
                Add revenue
              </Button>
              <Button
                variant="danger"
                icon={TrendingDown}
                onClick={() => openAddModal('expense')}
              >
                Add expense
              </Button>
              <Button
                variant="outline-danger"
                icon={Trash2}
                onClick={handleDeleteEvent}
                title="Delete event"
                aria-label="Delete event"
              />
            </div>
          </div>
        </div>

        {/* 3 Event KPI Cards */}
        <div className="kpi-grid">
          <FinancialCard
            title="Revenue"
            value={event.totalRevenue}
            type="revenue"
            subtitle="Sponsorships, tickets & fees"
          />
          <FinancialCard
            title="Expenses"
            value={event.totalExpenses}
            type="expense"
            subtitle="Venue, logistics & marketing"
          />
          <FinancialCard
            title="Net balance"
            value={event.netBalance}
            type="balance"
            subtitle={
              event.financialStatus === 'no_transactions'
                ? 'Nothing recorded yet'
                : event.netBalance >= 0
                  ? `This event made ${formatSignedTND(event.netBalance)}`
                  : `This event lost ${formatTND(Math.abs(event.netBalance))}`
            }
          />
        </div>

        {/* Transactions for this Event */}
        <div className="card">
          <div className="section-header">
            <div>
              <h3 className="section-title">Transactions</h3>
              <p className="section-subtitle">
                {transactions.length === 0
                  ? 'Nothing recorded for this event yet'
                  : `${transactions.length} ${transactions.length === 1 ? 'entry' : 'entries'} for this event`}
              </p>
            </div>
          </div>

          <TransactionTable
            transactions={transactions}
            onDelete={handleDeleteTransaction}
            showEventColumn={false}
            emptyText="Use “Add revenue” or “Add expense” above to record the first one."
          />
        </div>
      </div>

    {/* Add Revenue / Add Expense Modal using reusable Modal component */}
    <Modal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      title={modalType === 'revenue' ? 'Record revenue' : 'Record expense'}
      subtitle={`For ${event.name}`}
    >
      <Alert type="danger" message={modalError} onClose={() => setModalError('')} />

      <form onSubmit={handleTxSubmit}>
        <Select
          label="Category"
          name="category"
          value={txForm.category}
          onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}
          placeholder={`Select a ${modalType} category`}
          options={availableCategories.map((c) => ({
            value: c._id,
            label: c.name
          }))}
          required
        />

        <Input
          label="Description"
          name="description"
          placeholder={
            modalType === 'revenue'
              ? 'e.g. Gold Sponsorship from Tech Corp'
              : 'e.g. Venue rental down payment'
          }
          value={txForm.description}
          onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
          required
        />

        <div className="form-row">
          <Input
            label="Amount (TND)"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="e.g. 1500"
            value={txForm.amount}
            onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
            icon={DollarSign}
            required
          />
          <Input
            label="Transaction Date"
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
            variant={modalType === 'revenue' ? 'success' : 'danger'}
            loading={isTxSubmitting}
          >
            Save {modalType === 'revenue' ? 'Revenue' : 'Expense'}
          </Button>
        </div>
      </form>
    </Modal>
    </>
  );
};

export default EventDetails;
