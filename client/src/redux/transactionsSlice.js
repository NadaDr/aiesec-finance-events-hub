// ==============================================================================
// FICHIER : client/src/redux/transactionsSlice.js
// KHEDMETOU BELFALA9I TOUNSI :
// Hadha el Slice el mas'oul 3la 7arakat el flous (el flous li dekhla wel flous li khorjet) :
// - Les Revenus (Sponsoring, Ticket sales, Frais d'inscription)
// - Les Dépenses (Kré de salle, Catering, Transport, Matériel, Marketing)
//
// LIEN M3A LES PAGES :
// 1. Transactions.jsx --> fetchTransactions({ event, type }), createTransaction(), deleteTransaction()
// 2. EventDetails.jsx --> createTransaction(), deleteTransaction()
// ==============================================================================

import { createSlice } from '@reduxjs/toolkit';
import api from '../services/api';
import { apiThunk } from './actions';
import { deleteEvent } from './eventsSlice';

// GET /api/transactions?event=...&type=...
export const fetchTransactions = apiThunk(
  'transactions/fetchTransactions',
  async (filters = {}) => {
    const params = {};
    if (filters.event && filters.event !== 'all') params.event = filters.event;
    if (filters.type && filters.type !== 'all') params.type = filters.type;
    return (await api.get('/transactions', { params })).data;
  },
  (data) => data.transactions
);

// POST /api/transactions
export const createTransaction = apiThunk(
  'transactions/createTransaction',
  async (transactionData) => (await api.post('/transactions', transactionData)).data,
  (data) => data.transaction
);

// DELETE /api/transactions/:id
export const deleteTransaction = apiThunk(
  'transactions/deleteTransaction',
  async (id) => (await api.delete(`/transactions/${id}`)).data,
  (data, id) => id
);

const initialState = {
  transactions: [],     // Les transactions li yetaffichaw fel tableau
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
    builder
      // --- fetchTransactions ---
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
      })

      // --- createTransaction ---
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
      })

      // --- deleteTransaction ---
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
      })

      // --- Event tfasa5 : el backend fasa5 les transactions mte3ou (cascade),
      //     nna7iwhom mel liste zeda bech ma yo93douch "orphelins" fel affichage
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(
          (tx) => (tx.event?._id || tx.event) !== action.payload
        );
      });
  }
});

export const { setTransactionFilters, clearTransactionsError } = transactionsSlice.actions;
export default transactionsSlice.reducer;
