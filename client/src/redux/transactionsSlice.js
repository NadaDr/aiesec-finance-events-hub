// client/src/redux/transactionsSlice.js
// Redux Toolkit slice for managing Transaction entities (Revenues & Expenses)

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// ------------------------------------------------------------------------------
// THUNK: fetchTransactions
// ROLE : Retrieves transactions filtered by event ID and/or type ('revenue' / 'expense')
// ------------------------------------------------------------------------------
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.event && filters.event !== 'all') params.append('event', filters.event);
      if (filters.type && filters.type !== 'all') params.append('type', filters.type);

      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await api.get(`/transactions${query}`);
      if (response.data.success) {
        return response.data.transactions;
      }
      return rejectWithValue(response.data.message || 'Failed to fetch transactions.');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load transactions.');
    }
  }
);

// ------------------------------------------------------------------------------
// THUNK: createTransaction
// ROLE : Records a new revenue or expenditure in MongoDB
// ------------------------------------------------------------------------------
export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await api.post('/transactions', transactionData);
      if (response.data.success) {
        return response.data.transaction;
      }
      return rejectWithValue(response.data.message || 'Failed to record transaction.');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to record transaction.');
    }
  }
);

// ------------------------------------------------------------------------------
// THUNK: deleteTransaction
// ROLE : Removes a financial transaction record from MongoDB
// ------------------------------------------------------------------------------
export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/transactions/${id}`);
      if (response.data.success) {
        return id;
      }
      return rejectWithValue(response.data.message || 'Failed to delete transaction.');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete transaction.');
    }
  }
);

const initialState = {
  transactions: [],
  loading: false,
  isSubmitting: false,
  error: null,
  filters: {
    event: 'all',
    type: 'all'
  }
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactionFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearTransactionsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // fetchTransactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // createTransaction
    builder
      .addCase(createTransaction.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.transactions.unshift(action.payload);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });

    // deleteTransaction
    builder
      .addCase(deleteTransaction.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.transactions = state.transactions.filter((tx) => tx._id !== action.payload);
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });
  }
});

export const { setTransactionFilters, clearTransactionsError } = transactionsSlice.actions;
export default transactionsSlice.reducer;
