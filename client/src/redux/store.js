// client/src/redux/store.js
// Redux Toolkit centralized store configuration combining all entity slices

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import eventsReducer from './eventsSlice';
import transactionsReducer from './transactionsSlice';
import categoriesReducer from './categoriesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    transactions: transactionsReducer,
    categories: categoriesReducer
  },
  devTools: process.env.NODE_ENV !== 'production'
});

export default store;
