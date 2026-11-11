// ==============================================================================
// FICHIER : client/src/redux/eventsSlice.js
// KHEDMETOU BELFALA9I TOUNSI :
// Hadha el Slice el mas'oul 3la kol chay ykhos les "Événements" (Events) mta3 AIESEC :
// - Liste des événements (Global Village, Career Fair, YouthSpeak, etc.)
// - Calcul des statistiques mta3 el Dashboard (Totaux, graphe Chart.js, KPI cards)
// - Faskh l'événement m3a les transactions mte3ou (Cascade Delete)
// - Tajmi3 les chiffres réels mta3 el Landing Page (Public Stats)
//
// LIEN M3A LES PAGES :
// 1. Dashboard.jsx    --> fetchDashboardStats()
// 2. Events.jsx       --> fetchEvents(), createEvent(), deleteEvent()
// 3. EventDetails.jsx --> fetchEventById(id), deleteEvent()
// 4. Transactions.jsx --> fetchEvents() bech y3abbi el Dropdown <select>
// 5. LandingPage.jsx  --> fetchPublicStats()
// ==============================================================================

import { createSlice } from '@reduxjs/toolkit';
import api from '../services/api';
import { apiThunk } from './actions';

// GET /api/events?search=...
export const fetchEvents = apiThunk(
  'events/fetchEvents',
  async (searchTerm) => (await api.get('/events', { params: searchTerm ? { search: searchTerm } : {} })).data,
  (data) => data.events
);

// GET /api/events/:id
// El backend yrajja3 { event: { ...event, ...financials, transactions } }
// -> nfar9ouh l { event, transactions } kima testanna EventDetails.jsx
export const fetchEventById = apiThunk(
  'events/fetchEventById',
  async (id) => (await api.get(`/events/${id}`)).data,
  (data) => {
    const { transactions = [], ...event } = data.event;
    return { event, transactions };
  }
);

// POST /api/events
export const createEvent = apiThunk(
  'events/createEvent',
  async (eventData) => (await api.post('/events', eventData)).data,
  (data) => data.event
);

// DELETE /api/events/:id (Cascade : el backend yfasa5 les transactions mte3ou zeda)
export const deleteEvent = apiThunk(
  'events/deleteEvent',
  async (id) => (await api.delete(`/events/${id}`)).data,
  (data, id) => id
);

// GET /api/events/dashboard/stats
export const fetchDashboardStats = apiThunk(
  'events/fetchDashboardStats',
  async () => (await api.get('/events/dashboard/stats')).data,
  ({ stats, trends, chartData, eventsOverview, recentTransactions }) => ({
    stats,
    trends: trends || null,
    chartData,
    eventsOverview,
    recentTransactions
  })
);

// GET /api/events/public/stats (blech login, lel Landing Page)
export const fetchPublicStats = apiThunk(
  'events/fetchPublicStats',
  async () => (await api.get('/events/public/stats')).data,
  (data) => data.stats
);

// ------------------------------------------------------------------------------
// INITIAL STATE
// ------------------------------------------------------------------------------
const initialState = {
  events: [],              // Les événements l-kol (Events.jsx)
  currentEvent: null,      // { event, transactions } (EventDetails.jsx)
  dashboardData: {
    stats: {
      totalRevenue: 0,
      totalExpenses: 0,
      netBalance: 0,
      totalEvents: 0
    },
    trends: null,          // { revenue|expense|net: { current, previous } } (had el chhar vs eli fet)
    chartData: [],
    eventsOverview: [],
    recentTransactions: []
  },
  publicStats: {
    totalEvents: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netBalance: 0
  },
  loading: false,              // fetchEvents / fetchDashboardStats
  currentEventLoading: false,  // fetchEventById
  isSubmitting: false,         // createEvent / deleteEvent
  error: null,
  currentEventError: null
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
      state.currentEventError = null;
    },
    clearEventsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    const startLoading = (state) => {
      state.loading = true;
      state.error = null;
    };
    const startSubmitting = (state) => {
      state.isSubmitting = true;
      state.error = null;
    };
    const fail = (flag) => (state, action) => {
      state[flag] = false;
      state.error = action.payload;
    };

    builder
      // --- fetchEvents ---
      .addCase(fetchEvents.pending, startLoading)
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, fail('loading'))

      // --- fetchEventById ---
      .addCase(fetchEventById.pending, (state, action) => {
        state.currentEventLoading = true;
        state.currentEventError = null;
        // Ma nwarriwch détails mta3 event 9dim wa9t ma yetchargi event e5er
        if (state.currentEvent?.event?._id !== action.meta.arg) state.currentEvent = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.currentEventLoading = false;
        state.currentEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.currentEventLoading = false;
        state.currentEventError = action.payload;
      })

      // --- createEvent ---
      .addCase(createEvent.pending, startSubmitting)
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.events.unshift(action.payload);
      })
      .addCase(createEvent.rejected, fail('isSubmitting'))

      // --- deleteEvent ---
      .addCase(deleteEvent.pending, startSubmitting)
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.events = state.events.filter((ev) => ev._id !== action.payload);
        if (state.currentEvent?.event?._id === action.payload) {
          state.currentEvent = null;
        }
      })
      .addCase(deleteEvent.rejected, fail('isSubmitting'))

      // --- fetchDashboardStats ---
      .addCase(fetchDashboardStats.pending, startLoading)
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, fail('loading'))

      // --- fetchPublicStats ---
      .addCase(fetchPublicStats.fulfilled, (state, action) => {
        state.publicStats = action.payload;
      });
  }
});

export const { clearCurrentEvent, clearEventsError } = eventsSlice.actions;
export default eventsSlice.reducer;
