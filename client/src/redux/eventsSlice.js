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
// 1. Dashboard.jsx    --> y3ayet l- fetchDashboardStats() fi useEffect()
// 2. Events.jsx       --> y3ayet l- fetchEvents() fi useEffect() w createEvent() fel Formulaire
// 3. EventDetails.jsx --> y3ayet l- fetchEventById(id) fi useEffect() w deleteEvent()
// 4. Transactions.jsx --> y3ayet l- fetchEvents() bech y3abbi el Dropdown <select> mta3 les événements
// 5. LandingPage.jsx  --> y3ayet l- fetchPublicStats() fi useEffect() bech yaffichi les chiffres réels
// ==============================================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// ------------------------------------------------------------------------------
// ASYNC THUNK 1 : fetchEvents
// KHEDMETOU     : Yjib el liste mta3 les événements mel MongoDB (GET /api/events)
// REQUETE       : GET /api/events?search=...
// CHKOUN YESTA3MLOU :
// - Events.jsx (fi useEffect wa9telli t7ell l-page, wala wa9telli tektib fel barre de recherche)
// - Transactions.jsx (bech ya3ref les noms d'événements fel filtre wel modal)
// ------------------------------------------------------------------------------
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (searchTerm, { rejectWithValue }) => {
    try {
      // Ken famma mot-clé fel recherche nzidouh fel URL (?search=...)
      const url = searchTerm ? `/events?search=${encodeURIComponent(searchTerm)}` : '/events';
      const response = await api.get(url);
      if (response.data.success) {
        return response.data.events; // Yarja3 tableau fih les événements l-kol
      }
      return rejectWithValue(response.data.message || 'Moshkla fi tajyib les events.');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ma najjamnech njibou les événements.');
    }
  }
);

// ------------------------------------------------------------------------------
// ASYNC THUNK 2 : fetchEventById
// KHEDMETOU     : Yjib tafasil événement we7ed barka bel ID mte3ou (GET /api/events/:id)
// DONNEES       : L'event nafssou + calculat el flous (Revenue, Expense, Balance) + liste transactions mte3ou
// CHKOUN YESTA3MLOU :
// - EventDetails.jsx (fi useEffect([id]) wa9telli tenzel "View Details")
// ------------------------------------------------------------------------------
export const fetchEventById = createAsyncThunk(
  'events/fetchEventById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/events/${id}`);
      if (response.data.success) {
        return {
          event: response.data.event,
          financials: response.data.financials,
          transactions: response.data.transactions
        };
      }
      return rejectWithValue(response.data.message || 'Event mehouche mawjoud.');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ghalta fi chargement el event.');
    }
  }
);

// ------------------------------------------------------------------------------
// ASYNC THUNK 3 : createEvent
// KHEDMETOU     : Yab3ath événement jdid lel backend bech yetsajjel fi MongoDB (POST /api/events)
// DONNEES       : { name, location, budget, startDate, endDate, description }
// CHKOUN YESTA3MLOU :
// - Events.jsx (wa9telli t3abbi el modal "Create New Event" w tenzel Submit)
// ------------------------------------------------------------------------------
export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await api.post('/events', eventData);
      if (response.data.success) {
        return response.data.event; // Yarja3 l'event ejjdid li tsajjel
      }
      return rejectWithValue(response.data.message || 'Moshkla fi sna3an l-événement.');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ghalta fi création d événement.');
    }
  }
);

// ------------------------------------------------------------------------------
// ASYNC THUNK 4 : deleteEvent (Faskh bel Cascade)
// KHEDMETOU     : Yfasa5 l'événement mel base de données w en même temps yfasa5 kol les transactions li marboutin bih
// REQUETE       : DELETE /api/events/:id
// CHKOUN YESTA3MLOU :
// - Events.jsx (wa9telli tenzel 3la botona el poubelle 🗑️)
// - EventDetails.jsx (wa9telli tenzel "Delete Event")
// ------------------------------------------------------------------------------
export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/events/${id}`);
      if (response.data.success) {
        return id; // Nraj3ou l'ID mta3 li tfasa5 bech na7iweh mil state
      }
      return rejectWithValue(response.data.message || 'Moshkla fi faskh l-événement.');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ghalta fi faskh l-événement.');
    }
  }
);

// ------------------------------------------------------------------------------
// ASYNC THUNK 5 : fetchDashboardStats
// KHEDMETOU     : Y7adher kol chay yest7a9ou el Dashboard :
//                 1. stats: Total Revenue, Total Expenses, Net Balance, Total Events
//                 2. chartData: Les données formatées lel composant Chart.js (Bar Chart)
//                 3. eventsOverview: Tableau mta3 el 7ala el maliya mta3 kol event
//                 4. recentTransactions: E5er 6 transactions tsajlou
// REQUETE       : GET /api/events/dashboard/stats
// CHKOUN YESTA3MLOU :
// - Dashboard.jsx (fi useEffect wa9telli yet7all el Dashboard)
// ------------------------------------------------------------------------------
export const fetchDashboardStats = createAsyncThunk(
  'events/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/events/dashboard/stats');
      if (response.data.success) {
        return {
          stats: response.data.stats,
          chartData: response.data.chartData,
          eventsOverview: response.data.eventsOverview,
          recentTransactions: response.data.recentTransactions
        };
      }
      return rejectWithValue(response.data.message || 'Moshkla fi chargement el Dashboard.');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ghalta fi statistiques el Dashboard.');
    }
  }
);

// ------------------------------------------------------------------------------
// ASYNC THUNK 6 : fetchPublicStats (Direct mel MongoDB lel Landing Page)
// KHEDMETOU     : Yjib chiffres réels 3la kol chay (blech login) bech el Landing Page ma tkounch faha fake data
// REQUETE       : GET /api/events/public/stats
// CHKOUN YESTA3MLOU :
// - LandingPage.jsx (fi useEffect wa9telli t7ell el page d'accueil)
// ------------------------------------------------------------------------------
export const fetchPublicStats = createAsyncThunk(
  'events/fetchPublicStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/events/public/stats');
      if (response.data.success) {
        return response.data.stats; // { totalEvents, totalRevenue, totalExpenses, netBalance }
      }
      return rejectWithValue(response.data.message || 'Moshkla fi public stats.');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ghalta fi public stats.');
    }
  }
);

// ------------------------------------------------------------------------------
// INITIAL STATE : El 7ala el ibtide'iya mta3 les événements fel Redux
// ------------------------------------------------------------------------------
const initialState = {
  events: [],              // Tableau fih les événements l-kol (affiche fel Events.jsx)
  currentEvent: null,      // L'événement li 7allinou tawwa fel EventDetails.jsx
  dashboardData: {         // Données el Dashboard l-kol
    stats: {
      totalRevenue: 0,
      totalExpenses: 0,
      netBalance: 0,
      totalEvents: 0
    },
    chartData: [],         // Données el graphe Chart.js
    eventsOverview: [],    // Données tableau el Dashboard
    recentTransactions: [] // E5er transactions
  },
  publicStats: {           // Chiffres réels lel Landing Page
    totalEvents: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netBalance: 0
  },
  loading: false,              // true wa9telli 9a3ed yjib fel events wala fel dashboard
  currentEventLoading: false,  // true wa9telli 9a3ed yjib fi événement spécifique
  isSubmitting: false,         // true wa9telli tenzel "Create Event" (spinner 3al bouton)
  error: null,                 // Message d'erreur
  currentEventError: null      // Erreur mta3 événement spécifique
};

// ------------------------------------------------------------------------------
// SLICE CONFIGURATION & EXTRA REDUCERS
// ------------------------------------------------------------------------------
const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    // Action synchrone : Nnadhfou l'event li ken ma7loul wa9telli no5rjou men EventDetails.jsx
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
      state.currentEventError = null;
    },
    // Action synchrone : Nna7iw l'erreur
    clearEventsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // --- 1. fetchEvents ---
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload; // N7ottou les events l-kol fel store
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // --- 2. fetchEventById ---
    builder
      .addCase(fetchEventById.pending, (state) => {
        state.currentEventLoading = true;
        state.currentEventError = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.currentEventLoading = false;
        state.currentEvent = action.payload; // N7ottou les détails mta3 l'event
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.currentEventLoading = false;
        state.currentEventError = action.payload;
      });

    // --- 3. createEvent ---
    builder
      .addCase(createEvent.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Nzidou l'event ejjdid awwel we7ed fel liste (unshift)
        state.events.unshift(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });

    // --- 4. deleteEvent ---
    builder
      .addCase(deleteEvent.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Na7iw l'event li tfasa5 mel liste bel filter
        state.events = state.events.filter((ev) => ev._id !== action.payload);
        if (state.currentEvent?.event?._id === action.payload) {
          state.currentEvent = null;
        }
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });

    // --- 5. fetchDashboardStats ---
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload; // N7ottou kol chay fel Dashboard
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // --- 6. fetchPublicStats ---
    builder
      .addCase(fetchPublicStats.fulfilled, (state, action) => {
        state.publicStats = action.payload; // Mta3 el Landing Page
      });
  }
});

export const { clearCurrentEvent, clearEventsError } = eventsSlice.actions;
export default eventsSlice.reducer;
