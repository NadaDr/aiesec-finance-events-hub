// client/src/pages/Events.jsx
// Event management page with list of events, search filter, and Add Event modal

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import EventCard from '../components/EventCard';
import { Plus, X, Search, CalendarPlus, AlertCircle } from 'lucide-react';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events');
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const querySearch = searchParams.get('search');
    if (querySearch) {
      setSearchTerm(querySearch);
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setError('');

    const { name, location, startDate, endDate, budget } = formData;
    if (!name || !location || !startDate || !endDate) {
      setError('Please provide event name, location, and valid dates.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Event start date cannot be after the end date.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/events', {
        ...formData,
        budget: Number(budget) || 0
      });
      if (res.data.success) {
        setShowAddModal(false);
        setFormData({
          name: '',
          location: '',
          budget: '',
          startDate: '',
          endDate: '',
          description: ''
        });
        fetchEvents();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId, eventName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${eventName}"? All associated revenue and expense transactions will also be permanently deleted.`
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/events/${eventId}`);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event.');
    }
  };

  // Filter events based on search term
  const filteredEvents = events.filter((ev) => {
    const term = searchTerm.toLowerCase();
    return (
      ev.name.toLowerCase().includes(term) ||
      ev.location.toLowerCase().includes(term) ||
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
            <button
              onClick={() => {
                setError('');
                setShowAddModal(true);
              }}
              className="btn btn-primary"
            >
              <Plus size={16} />
              <span>Add Event</span>
            </button>
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
              <button
                onClick={() => setSearchTerm('')}
                className="btn btn-secondary btn-sm"
              >
                Clear Search
              </button>
            )}
            <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Showing {filteredEvents.length} of {events.length} events
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading events...</p>
            </div>
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
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn btn-primary"
                >
                  <Plus size={16} />
                  <span>Create First Event</span>
                </button>
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

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Event</h3>
              <button
                onClick={() => setShowAddModal(false)}
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

            <form onSubmit={handleAddEvent}>
              <div className="form-group">
                <label htmlFor="name">Event Name *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="form-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. Global Village 2026"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="location">Location *</label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    className="form-input"
                    style={{ width: '100%' }}
                    placeholder="e.g. Sousse, Tunisia"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="budget">Allocated Budget (TND) *</label>
                  <input
                    id="budget"
                    name="budget"
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    style={{ width: '100%' }}
                    placeholder="e.g. 5000"
                    value={formData.budget}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Start Date *</label>
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    className="form-input"
                    style={{ width: '100%' }}
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endDate">End Date *</label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    className="form-input"
                    style={{ width: '100%' }}
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Event Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  className="form-input"
                  style={{ width: '100%', resize: 'vertical' }}
                  placeholder="Brief summary of event objectives and activities..."
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;

