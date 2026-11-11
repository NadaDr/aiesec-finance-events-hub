// ==============================================================================
// FICHIER : client/src/redux/actions.js
// KHEDMETOU :
// Actions mchtarkin bin barcha slices (bech ma ysirch import circulaire
// bin services/api.js w authSlice.js), w "fabrique" mta3 thunks API.
// ==============================================================================

import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

// Déconnexion volontaire : tfasa5 el session W kol les données (events, transactions...)
export const logout = createAction('auth/logout');

// Session wfet (401) : yab3athha l'intercepteur Axios wa7dou
export const sessionExpired = createAction('auth/sessionExpired');

// ------------------------------------------------------------------------------
// apiThunk(type, request)
// Fi 3oudh ma nkterbou nafs el try/catch + check `success` fi kol thunk :
// - request(arg, thunkApi) yrajja3 el `response.data` mta3 Axios
// - ken el backend jeweb { success: false } -> rejectWithValue(message)
// - ken Axios ghalet -> rejectWithValue(message wadh7 bech yetaffiche)
// Fel composant : dispatch(thunk(arg)).unwrap() yrmi string message direct.
// ------------------------------------------------------------------------------
export const apiThunk = (type, request, select = (data) => data) =>
  createAsyncThunk(type, async (arg, thunkApi) => {
    try {
      const data = await request(arg, thunkApi);
      if (data && data.success === false) {
        return thunkApi.rejectWithValue(data.message || 'Moshkla fel serveur.');
      }
      return select(data, arg);
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.userMessage || err.response?.data?.message || err.message || 'Ghalta ma tetsawwarech.'
      );
    }
  });
