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
  // 1. REDUX HOOKS :
  // dispatch : bech neb3thou biha les actions lel Redux store (ex: fetchEvents, createEvent, deleteEvent)
  const dispatch = useDispatch();

  // useSelector : njibou les données li 7achtna behom mel eventsSlice :
  // - events: liste des événements li jéyetna mel MongoDB
  // - loading: true wa9telli 9a3ed ytelechargi
  // - isSubmitting: true wa9telli tenzel "Create Event" (spinner 3al bouton)
  // - reduxError: ken famma ghalta jéyetna mel serveur
  const { events, loading, isSubmitting, error: reduxError } = useSelector((state) => state.events);

  // 2. LOCAL REACT USESTATE :
  // - searchTerm: yched el texte li ktbtou fel barre de recherche (ex: "Sousse", "Global")
  const [searchTerm, setSearchTerm] = useState('');

  // - showAddModal: booléen (true / false) ykhalas el modal mta3 "+ Add Event" ya yodhher ya yetkhaffa
  const [showAddModal, setShowAddModal] = useState(false);

  // - formError: yched les erreurs mta3 el formulaire fi wost el modal (ex: "Veuillez renseigner les dates")
  const [formError, setFormError] = useState('');

  // - searchParams: yekhou les paramètres mel URL (ken el user 7all ?search=Global)
  const [searchParams] = useSearchParams();

  // - formData: yched el valeurs li ktbhom el user fel inputs mta3 el modal
  const [formData, setFormData] = useState({
    name: '',        // Nom de l'événement (ex: "Global Village 2026")
    location: '',    // Emplacement (ex: "Sousse, Tunisia")
    budget: '',      // Budget alloué en TND (ex: 5000)
    startDate: '',   // Date de début
    endDate: '',     // Date de fin
    description: ''  // Description facultative
  });

  // 3. USEEFFECT HOOK :
  // Khedmetou: yekhdem AUTOMATIQUEMENT wa9telli l-page tchargi awwel mara (Mount)
  // 1. Yba3eth dispatch(fetchEvents()) lel Redux bech yjib les événements mel MongoDB
  // 2. Ythabet ken famma mot de recherche fel URL (?search=...) w y7ottou fel searchTerm
  useEffect(() => {
    dispatch(fetchEvents());
    const querySearch = searchParams.get('search');
    if (querySearch) {
      setSearchTerm(querySearch);
    }
  }, [dispatch, searchParams]);

  // 4. HANDLERS (Fonctions mta3 l-evenements) :
  // handleInputChange: kol ma el user yekteb 7arf fel input, nbadlou el formData
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (formError) setFormError('');
  };

  // handleAddEvent: wa9telli el user yenzal "Create Event" fel modal
  // 1. Nthabtou fel les champs obligatoires wel dates (startDate < endDate)
  // 2. Nbathou dispatch(createEvent(...)) lel Redux
  // 3. Ken t3adda b-naje7, nsakkrou el modal w nfarghou el formData
  const handleAddEvent = async (e) => {
    e.preventDefault();
    setFormError('');

    const { name, location, startDate, endDate, budget } = formData;
    if (!name || !location || !startDate || !endDate) {
      setFormError('Renseigner el nom, l-emplacement wel les dates s il vous plaît.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setFormError('La date de début ma tnajamch tkoun ba3d la date de fin.');
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
        setShowAddModal(false); // Nsakrou el modal
        setFormData({           // Nfarghou el formulaire
          name: '',
          location: '',
          budget: '',
          startDate: '',
          endDate: '',
          description: ''
        });
      } else {
        setFormError(resultAction.payload || 'Échec de création d événement.');
      }
    } catch (err) {
      setFormError('Ghalta fi création d événement.');
    }
  };

  // handleDeleteEvent: wa9telli tenzel 3la botona "Delete" fi carte événement
  // Yab3ath dispatch(deleteEvent(id)) li yfasa5 l'événement m3a ses transactions (Cascade Delete)
  const handleDeleteEvent = async (eventId, eventName) => {
    const confirmDelete = window.confirm(
      `Met'akked t7eb tfasa5 "${eventName}" ? Kol les transactions mte3ou bech yetfas5ou m3ah.`
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
