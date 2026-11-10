// ==============================================================================
// FICHIER : client/src/redux/store.js
// KHEDMETOU BELFALA9I :
// Hadha el "Cerveau Central" (el makhzen l-kbir) mta3 l-application l-kol.
// Fi 3oudh ma n9e3dou npassiw fel données men composant l-composant bel props,
// el Redux Store ykoun fi blastou wa7da, fih kol chay (el user, les events, 
// les transactions, wel categories).
//
// KIFECH EL PAGES YESTA3MLOUH ?
// 1. useSelector((state) => state.xxx) : Bech el page tekhou el donnee (read data)
//    - Mathalan: state.auth.user, state.events.events, state.transactions.transactions
// 2. useDispatch() : Bech el page teb3ath amr (dispatch an action/thunk)
//    - Mathalan: dispatch(fetchDashboardStats()), dispatch(createEvent(formData))
// ==============================================================================

import { configureStore } from '@reduxjs/toolkit';

// Njibou les reducers (les tranches mta3 el khzena) mta3 kol entité
import authReducer from './authSlice';             // tranche 1: el connexion, el token, wel compte user
import eventsReducer from './eventsSlice';         // tranche 2: les événements, el budget, wel Dashboard
import transactionsReducer from './transactionsSlice'; // tranche 3: les revenus wel dépenses
import categoriesReducer from './categoriesSlice'; // tranche 4: les catégories (Sponsoring, Venue, etc.)

export const store = configureStore({
  reducer: {
    // state.auth : Yemchi lel authSlice (Login, Register, Logout, Me)
    auth: authReducer,

    // state.events : Yemchi lel eventsSlice (Dashboard KPIs, Events list, Details)
    events: eventsReducer,

    // state.transactions : Yemchi lel transactionsSlice (Transactions list, Filters)
    transactions: transactionsReducer,

    // state.categories : Yemchi lel categoriesSlice (Categories list, Create, Delete)
    categories: categoriesReducer
  },
  // Nkhalliw Redux DevTools yemchi ken fel mode développement bech ntab3ou el state fel inspecteur
  devTools: process.env.NODE_ENV !== 'production'
});

export default store;
