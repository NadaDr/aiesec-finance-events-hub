// ==============================================================================
// FICHIER : client/src/redux/transactionsSlice.js
// KHEDMETOU BELFALA9I TOUNSI :
// Hadha el Slice el mas'oul 3la 7arakat el flous (el flous li dekhla wel flous li khorjet) :
// - Les Revenus (Sponsoring, Ticket sales, Frais d'inscription)
// - Les Dépenses (Kré de salle, Catering, Transport, Matériel, Marketing)
//
// LIEN M3A LES PAGES :
// 1. Transactions.jsx --> y3ayet l- fetchTransactions({ event, type }) fi useEffect()
//                         wa9telli tbadil el filtre mta3 l-événement wala type
//                         w y3ayet l- createTransaction(...) wa9telli t3abbi el modal
// 2. EventDetails.jsx --> y3ayet l- createTransaction(...) wa9telli tenzel "+ Add Revenue"
//                         wala "+ Add Expense" w y3ayet l- deleteTransaction(...)
// ==============================================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// ------------------------------------------------------------------------------
// ASYNC THUNK 1 : fetchTransactions
// KHEDMETOU     : Yjib les transactions mel MongoDB bel filtre :
//                 - Par événement : ?event=<id> (wala "all" bech yjib kol chay)
//                 - Par type      : ?type=revenue wala ?type=expense
// REQUETE       : GET /api/transactions?event=...&type=...
// CHKOUN YESTA3MLOU :
// - Transactions.jsx (wa9telli tbadil el filtres fel barres lfou9)
// ------------------------------------------------------------------------------
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      // Ken el filtre mehouche "all" nzidouh fel query URL
      if (filters.event && filters.event !== 'all') params.append('event', filters.event);
      if (filters.type && filters.type !== 'all') params.append('type', filters.type);

      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await api.get(`/transactions${query}`);

      if (response.data.success) {
        return response.data.transactions; // Yarja3 tableau des transactions
      }
      return rejectWithValue(response.data.message || 'Moshkla fi tajyib les transactions.');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ghalta fi chargement les transactions.');
    }
  }
);

// ------------------------------------------------------------------------------
// ASYNC THUNK 2 : createTransaction
// KHEDMETOU     : Ysajjel transaction jdida (dépense wala recette) fi MongoDB (POST /api/transactions)
// DONNEES       : { event, category, type, description, amount, date }
// CHKOUN YESTA3MLOU :
// - Transactions.jsx (wa9telli t3abbi el modal "Record New Transaction")
// - EventDetails.jsx (wa9telli t3abbi le modal "+ Record Revenue" wala "+ Record Expense")
// ------------------------------------------------------------------------------
export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await api.post('/transactions', transactionData);
      if (response.data.success) {
        return response.data.transaction; // Yarja3 l-objet transaction jdida
      }
      return rejectWithValue(response.data.message || 'Moshkla fi tasjil el transaction.');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ghalta fi tasjil el transaction.');
    }
  }
);

// ------------------------------------------------------------------------------
// ASYNC THUNK 3 : deleteTransaction
// KHEDMETOU     : Yfasa5 transaction bel ID mte3ha mel MongoDB (DELETE /api/transactions/:id)
// CHKOUN YESTA3MLOU :
// - Transactions.jsx (wa9telli tenzel 3al poubelle 🗑️ fel tableau)
// - EventDetails.jsx (wa9telli tfasa5 transaction teb3a el event hedheka)
// ------------------------------------------------------------------------------
export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/transactions/${id}`);
      if (response.data.success) {
        return id; // Nraj3ou l'ID bech nnahhiweh mel tableau instantanément
      }
      return rejectWithValue(response.data.message || 'Moshkla fi faskhan el transaction.');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ghalta fi faskhan el transaction.');
    }
  }
);

// ------------------------------------------------------------------------------
// INITIAL STATE : El 7ala el ibtide'iya mta3 les transactions fel Redux
// ------------------------------------------------------------------------------
const initialState = {
  transactions: [],     // Tableau fih les transactions l-kol li yetaffichaw fel tableau
  loading: false,       // true wa9telli 9a3ed yjib fel transactions mel serveur
  isSubmitting: false,  // true wa9telli tenzel "Save" bech n7ottou spinner fel bouton
  error: null,          // Message d'erreur
  filters: {            // El filtres el msta3mlin tawwa
    event: 'all',       // "all" wala l'ID mta3 event mo3ayyan
    type: 'all'         // "all", "revenue", wala "expense"
  }
};

// ------------------------------------------------------------------------------
// SLICE CONFIGURATION & EXTRA REDUCERS
// ------------------------------------------------------------------------------
const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    // Action synchrone : Nbadlou el filtres mta3 l-page
    setTransactionFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    // Action synchrone : Nna7iw l'erreur
    clearTransactionsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // --- 1. fetchTransactions ---
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload; // N7ottou les transactions fel store
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // --- 2. createTransaction ---
    builder
      .addCase(createTransaction.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Nzidou el transaction ejjdida men fou9 fel tableau (unshift)
        state.transactions.unshift(action.payload);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });

    // --- 3. deleteTransaction ---
    builder
      .addCase(deleteTransaction.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Nna7iw el transaction li tfas5et bel ID mte3ha
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
