// client/src/pages/Events.jsx
// Event management page with Redux Toolkit slice, search filter, and reusable form components

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents, createEvent, deleteEvent } from '../redux/eventsSlice';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import EventCard from '../components/EventCard';
import { Button, Input, Textarea, Modal, Alert, Spinner } from '../components/common';
import { Plus, Search, CalendarPlus, MapPin, DollarSign, Calendar, FileText } from 'lucide-react';

const Events = () => {
  const dispatch = useDispatch();
  const { events, loading, isSubmitting, error: reduxError } = useSelector((state) => state.events);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formError, setFormError] = useState('');

  const [searchParams] = useSearchParams();

  // New Event Form State
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    budget: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  useEffect(() => {
    dispatch(fetchEvents());
    const querySearch = searchParams.get('search');
    if (querySearch) {
      setSearchTerm(querySearch);
    }
  }, [dispatch, searchParams]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (formError) setFormError('');
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setFormError('');

    const { name, location, startDate, endDate, budget } = formData;
    if (!name || !location || !startDate || !endDate) {
      setFormError('Please provide event name, location, and valid dates.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setFormError('Event start date cannot be after the end date.');
      return;
    }

    try {
      const resultAction = await dispatch(
        createEvent({
          ...formData,
          budget: Number(budget) || 0
        })
      );

      if (createEvent.fulfilled.match(resultAction)) {
        setShowAddModal(false);
        setFormData({
          name: '',
          location: '',
          budget: '',
          startDate: '',
          endDate: '',
          description: ''
        });
      } else {
        setFormError(resultAction.payload || 'Failed to create event.');
      }
    } catch (err) {
      setFormError('Failed to create event.');
    }
  };

  const handleDeleteEvent = async (eventId, eventName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${eventName}"? All associated revenue and expense transactions will also be permanently deleted.`
    );
    if (!confirmDelete) return;

    dispatch(deleteEvent(eventId));
  };

  // Filter events based on search term
  const filteredEvents = events.filter((ev) => {
    const term = searchTerm.toLowerCase();
    return (
      ev.name?.toLowerCase().includes(term) ||
      ev.location?.toLowerCase().includes(term) ||
      (ev.description && ev.description.toLowerCase().includes(term))
    );
  });

  return (
    <div className="auth-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar onSearchChange={setSearchTerm} searchTerm={searchTerm} />

        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Events</h1>
              <p className="page-subtitle">
                Manage your AIESEC events, budgets, and financial records
              </p>
            </div>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => {
                setFormError('');
                setShowAddModal(true);
              }}
            >
              Add Event
            </Button>
          </div>

          {/* Search bar inside Events */}
          <div className="filters-bar">
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <input
                type="text"
                placeholder="Filter events by name or location..."
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.4rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)'
                }}
              />
            </div>
            {searchTerm && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            )}
            <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Showing {filteredEvents.length} of {events.length} events
            </div>
          </div>

          <Alert type="danger" message={reduxError} />

          {loading && events.length === 0 ? (
            <Spinner text="Loading events from MongoDB..." />
          ) : filteredEvents.length === 0 ? (
            <div className="empty-state">
              <CalendarPlus className="empty-state-icon" />
              <h3 className="empty-state-title">
                {searchTerm ? 'No matching events found' : 'No events created yet'}
              </h3>
              <p className="empty-state-subtitle">
                {searchTerm
                  ? 'Try searching with different keywords or clear your filter.'
                  : 'Start by creating your first event like Global Village, Career Fair, or Leadership Conference.'}
              </p>
              {!searchTerm && (
                <Button
                  variant="primary"
                  icon={Plus}
                  onClick={() => setShowAddModal(true)}
                  style={{ marginTop: '1rem' }}
                >
                  Create First Event
                </Button>
              )}
            </div>
          ) : (
            <div className="events-grid">
              {filteredEvents.map((ev) => (
                <EventCard
                  key={ev._id}
                  event={ev}
                  onDelete={handleDeleteEvent}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Event Modal using reusable Modal component */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New Event"
        subtitle="Define an event with budget allocations and timeline"
      >
        <Alert type="danger" message={formError} onClose={() => setFormError('')} />

        <form onSubmit={handleAddEvent}>
          <Input
            label="Event Name"
            name="name"
            placeholder="e.g. Global Village 2026"
            value={formData.name}
            onChange={handleInputChange}
            required
          />

          <div className="form-row">
            <Input
              label="Location"
              name="location"
              placeholder="e.g. Sousse, Tunisia"
              value={formData.location}
              onChange={handleInputChange}
              icon={MapPin}
              required
            />
            <Input
              label="Allocated Budget (TND)"
              name="budget"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 5000"
              value={formData.budget}
              onChange={handleInputChange}
              icon={DollarSign}
              required
            />
          </div>

          <div className="form-row">
            <Input
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleInputChange}
              icon={Calendar}
              required
            />
            <Input
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleInputChange}
              icon={Calendar}
              required
            />
          </div>

          <Textarea
            label="Event Description"
            name="description"
            rows={3}
            placeholder="Brief summary of event objectives and activities..."
            value={formData.description}
            onChange={handleInputChange}
          />

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
            >
              Create Event
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Events;
