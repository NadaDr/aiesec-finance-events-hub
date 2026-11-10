// client/src/redux/eventsSlice.js
// Redux Toolkit slice for managing Event entities, dashboard stats, and public live metrics

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// ------------------------------------------------------------------------------
// THUNK: fetchEvents
// ROLE : Fetches events from MongoDB with optional search query
// ------------------------------------------------------------------------------
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (searchTerm, { rejectWithValue }) => {
    try {
      const url = searchTerm ? `/events?search=${encodeURIComponent(searchTerm)}` : '/events';
      const response = await api.get(url);
      if (response.data.success) {
        return response.data.events;
      }
      return rejectWithValue(response.data.message || 'Failed to fetch events.');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load events.');
    }
  }
);

// ------------------------------------------------------------------------------
// THUNK: fetchEventById
// ROLE : Fetches full event details including calculations and transaction list
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
      return rejectWithValue(response.data.message || 'Failed to load event details.');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Event not found.');
    }
  }
);

// ------------------------------------------------------------------------------
// THUNK: createEvent
// ROLE : Creates a new event record in MongoDB
// ------------------------------------------------------------------------------
export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await api.post('/events', eventData);
      if (response.data.success) {
        return response.data.event;
      }
      return rejectWithValue(response.data.message || 'Failed to create event.');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create event.');
    }
  }
);

// ------------------------------------------------------------------------------
// THUNK: deleteEvent
// ROLE : Deletes an event and cascades to all its associated transactions
// ------------------------------------------------------------------------------
export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/events/${id}`);
      if (response.data.success) {
        return id;
      }
      return rejectWithValue(response.data.message || 'Failed to delete event.');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete event.');
    }
  }
);

// ------------------------------------------------------------------------------
// THUNK: fetchDashboardStats
// ROLE : Calculates live financial KPIs, Recharts data, and recent transactions
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
      return rejectWithValue(response.data.message || 'Failed to load dashboard.');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load dashboard data.');
    }
  }
);

// ------------------------------------------------------------------------------
// THUNK: fetchPublicStats
// ROLE : Fetches live global statistics directly from MongoDB for the Landing Page
// ------------------------------------------------------------------------------
export const fetchPublicStats = createAsyncThunk(
  'events/fetchPublicStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/events/public/stats');
      if (response.data.success) {
        return response.data.stats;
      }
      return rejectWithValue(response.data.message || 'Failed to load public metrics.');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load public stats.');
    }
  }
);

const initialState = {
  events: [],
  currentEvent: null,
  dashboardData: {
    stats: {
      totalRevenue: 0,
      totalExpenses: 0,
      netBalance: 0,
      totalEvents: 0
    },
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
  loading: false,
  currentEventLoading: false,
  isSubmitting: false,
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
    // fetchEvents
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // fetchEventById
    builder
      .addCase(fetchEventById.pending, (state) => {
        state.currentEventLoading = true;
        state.currentEventError = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.currentEventLoading = false;
        state.currentEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.currentEventLoading = false;
        state.currentEventError = action.payload;
      });

    // createEvent
    builder
      .addCase(createEvent.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.events.unshift(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });

    // deleteEvent
    builder
      .addCase(deleteEvent.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.events = state.events.filter((ev) => ev._id !== action.payload);
        if (state.currentEvent?.event?._id === action.payload) {
          state.currentEvent = null;
        }
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });

    // fetchDashboardStats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // fetchPublicStats
    builder
      .addCase(fetchPublicStats.fulfilled, (state, action) => {
        state.publicStats = action.payload;
      });
  }
});

export const { clearCurrentEvent, clearEventsError } = eventsSlice.actions;
export default eventsSlice.reducer;
