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
// 2. useDispatch() : Bech el page teb3ath amr (dispatch an action/thunk)
//
// ZEYDIN :
// - rootReducer : ki ya3mel logout (wala session wfet), kol les données yetfas5ou
//   -> el user el jey ma ychoufch les events/transactions mta3 eli 9balou.
// - Persistance : el localStorage yetsajjel houni (store.subscribe), mouch fel
//   reducers (les reducers lezem ykounou "purs").
// ==============================================================================

import { combineReducers, configureStore } from '@reduxjs/toolkit';

import authReducer from './authSlice';             // tranche 1: el connexion, el token, wel compte user
import eventsReducer from './eventsSlice';         // tranche 2: les événements, el budget, wel Dashboard
import transactionsReducer from './transactionsSlice'; // tranche 3: les revenus wel dépenses
import categoriesReducer from './categoriesSlice'; // tranche 4: les catégories (Sponsoring, Venue, etc.)
import { logout, sessionExpired } from './actions';
import { injectStore } from '../services/api';
import { TOKEN_KEY, USER_KEY } from './authSlice';

const appReducer = combineReducers({
  auth: authReducer,
  events: eventsReducer,
  transactions: transactionsReducer,
  categories: categoriesReducer
});

// Logout / session wfet : nraj3ou kol tranche l-7altha el initiale (ken auth tetbaddel wa7adha)
const rootReducer = (state, action) => {
  if (logout.match(action) || sessionExpired.match(action)) {
    return appReducer({ auth: state?.auth }, action);
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer
});

// Persistance mta3 el session : nsajjlou fel localStorage ken ki tetbaddel
let lastAuth = store.getState().auth;
store.subscribe(() => {
  const { auth } = store.getState();
  if (auth.token === lastAuth.token && auth.user === lastAuth.user) return;
  lastAuth = auth;
  try {
    if (auth.token && auth.user) {
      localStorage.setItem(TOKEN_KEY, auth.token);
      localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  } catch {
    // localStorage mamnou3 (navigation privée...) : el session to93od fel mémoire barka
  }
});

// Na3tiw l'intercepteur Axios accès lel store (token + logout 3la 401)
injectStore(store);

export default store;
