// ==============================================================================
// FICHIER : client/src/redux/authSlice.js
// KHEDMETOU BELFALA9I TOUNSI :
// Hadha el Slice el mas'oul 3la el Authentification w séssion el user :
// - Connexion (Login) w Inscription (Register)
// - Vérification automatique de session (checkAuth) wa9telli yet7all l'application
// - Déconnexion (logout) w session wfet (sessionExpired, yab3athha l'intercepteur Axios)
// El token yetsajjel fel localStorage men store.js (store.subscribe), mouch houni :
// les reducers lezem ykounou purs (ma ya3mlou 7atta effet de bord).
//
// LIEN M3A LES PAGES :
// 1. App.jsx      --> y3ayet l- dispatch(checkAuth()) fi useEffect() awwel ma yet7all el site
// 2. Login.jsx    --> dispatch(loginUser({ email, password }))
// 3. Register.jsx --> dispatch(registerUser({ name, email, password }))
// 4. Navbar.jsx / Sidebar.jsx --> dispatch(logout())
// ==============================================================================

import { createSlice } from '@reduxjs/toolkit';
import api from '../services/api';
import { apiThunk, logout, sessionExpired } from './actions';

export const TOKEN_KEY = 'aiesec_token';
export const USER_KEY = 'aiesec_user';

// ------------------------------------------------------------------------------
// INITIALISATION : Njibou el Token wel User mel localStorage (bech F5 ma ydeconnectich)
// Lecture tolérante : localStorage fased ma lezemch yfarka3 l'application
// ------------------------------------------------------------------------------
const loadSession = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    return token && user ? { token, user } : { token: null, user: null };
  } catch {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      /* localStorage inaccessible */
    }
    return { token: null, user: null };
  }
};

const session = loadSession();

const initialState = {
  user: session.user,                    // Données el user ({ _id, name, email })
  token: session.token,                  // Token JWT (Authorization: Bearer <token>)
  isAuthenticated: !!session.token,      // true ken famma session
  loading: false,                        // true wa9telli 9a3ed yconnecti (spinner fel bouton)
  error: null,                           // Message d'erreur (ex: "Email ou mot de passe incorrect")
  sessionMessage: null                   // Message fel page Login ba3d ma session tofa
};

// ------------------------------------------------------------------------------
// ASYNC THUNKS
// ------------------------------------------------------------------------------
const pickSession = ({ token, user }) => ({ token, user });

// POST /api/auth/register -> { token, user }
export const registerUser = apiThunk(
  'auth/registerUser',
  async ({ name, email, password }) => (await api.post('/auth/register', { name, email, password })).data,
  pickSession
);

// POST /api/auth/login -> { token, user }
export const loginUser = apiThunk(
  'auth/loginUser',
  async ({ email, password }) => (await api.post('/auth/login', { email, password })).data,
  pickSession
);

// GET /api/auth/me : "Ya backend, hadha el token mezel valable ?"
// Ken token wfet, l'intercepteur Axios yab3ath sessionExpired wa7dou.
export const checkAuth = apiThunk(
  'auth/checkAuth',
  async () => (await api.get('/auth/me')).data,
  (data) => data.user,
);

// ------------------------------------------------------------------------------
// SLICE
// ------------------------------------------------------------------------------
const clearSession = (state) => {
  state.user = null;
  state.token = null;
  state.isAuthenticated = false;
  state.loading = false;
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Nna7iw message d'erreur
    clearError: (state) => {
      state.error = null;
    },
    clearSessionMessage: (state) => {
      state.sessionMessage = null;
    }
  },
  extraReducers: (builder) => {
    const onPending = (state) => {
      state.loading = true;
      state.error = null;
      state.sessionMessage = null;
    };
    const onFulfilled = (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
    };
    const onRejected = (fallback) => (state, action) => {
      state.loading = false;
      state.error = action.payload || fallback;
    };

    builder
      // --- Inscription / Connexion ---
      .addCase(registerUser.pending, onPending)
      .addCase(registerUser.fulfilled, onFulfilled)
      .addCase(registerUser.rejected, onRejected('Ghalta fel inscription.'))
      .addCase(loginUser.pending, onPending)
      .addCase(loginUser.fulfilled, onFulfilled)
      .addCase(loginUser.rejected, onRejected('Email wala mot de passe ghalet.'))

      // --- Vérification de session au démarrage ---
      .addCase(checkAuth.fulfilled, (state, action) => {
        if (action.payload) state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state) => {
        // 401 deja t3alj b-sessionExpired ; ken serveur ma jewebch, nkhalliw el session
        if (!state.token) clearSession(state);
      })

      // --- Déconnexion volontaire ---
      .addCase(logout, (state) => {
        clearSession(state);
        state.error = null;
        state.sessionMessage = null;
      })

      // --- Session wfet (401 men l'intercepteur) ---
      .addCase(sessionExpired, (state, action) => {
        clearSession(state);
        state.sessionMessage = action.payload || 'Session mte3ek wfet, 3awed connecti.';
      });
  }
});

export { logout, sessionExpired };
export const { clearError, clearSessionMessage } = authSlice.actions;
export default authSlice.reducer;
