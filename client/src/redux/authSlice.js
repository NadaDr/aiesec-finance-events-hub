// ==============================================================================
// FICHIER : client/src/redux/authSlice.js
// KHEDMETOU BELFALA9I TOUNSI :
// Hadha el Slice el mas'oul 3la el Authentification w séssion el user :
// - Connexion (Login) w Inscription (Register)
// - Hifdh el Token JWT fel localStorage mta3 el navigateur bech ma yetna7ach bel F5
// - Vérification automatique de session (checkAuth) wa9telli yet7all l'application
// - Déconnexion (Logout) w tnadhyif el localStorage
//
// LIEN M3A LES PAGES :
// 1. App.jsx      --> y3ayet l- dispatch(checkAuth()) fi useEffect() awwel ma yet7all el site
// 2. Login.jsx    --> yekhou el formData mel useState() w yab3ath dispatch(loginUser({ email, password }))
// 3. Register.jsx --> yekhou el formData mel useState() w yab3ath dispatch(registerUser({ name, email, password }))
// 4. Navbar.jsx   --> y3ayet l- dispatch(logout()) wa9telli tenzel Logout fel menu déroulant
// 5. Sidebar.jsx  --> y3ayet l- dispatch(logout()) wa9telli tenzel Logout louta 3al ysar
// ==============================================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// ------------------------------------------------------------------------------
// INITIALISATION DE L'ETAT : Njibou el Token wel User mel localStorage
// Bech ki el user ya3mel Refresh lel page (F5), ma yarja3ch yconnecti men jdid
// ------------------------------------------------------------------------------
const storedToken = localStorage.getItem('aiesec_token') || null;
const storedUser = localStorage.getItem('aiesec_user')
  ? JSON.parse(localStorage.getItem('aiesec_user'))
  : null;

const initialState = {
  user: storedUser,                               // Données el user ({ _id, name, email })
  token: storedToken,                             // Token JWT li yab3ath fel Headers Authorization: Bearer <token>
  isAuthenticated: !!(storedToken && storedUser), // true ken famma token w user m5aznin
  loading: false,                                 // true wa9telli 9a3ed yconnecti (bech n7ottou spinner fel bouton)
  error: null                                     // Message d'erreur (ex: "Email ou mot de passe incorrect")
};

// ------------------------------------------------------------------------------
// ASYNC THUNK 1 : registerUser
// KHEDMETOU     : Yab3ath { name, email, password } lel backend (POST /api/auth/register)
//                 Ki yenja7, ysajjel el token fel localStorage w yconnectih direct
// CHKOUN YESTA3MLOU :
// - Register.jsx (fi handleSubmit wa9telli tenzel "Create Account")
// ------------------------------------------------------------------------------
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      if (response.data.success) {
        const { token, user } = response.data;
        // Nsajjlou fel navigateur bech el session to93od 7atta ken sakker l'onglet
        localStorage.setItem('aiesec_token', token);
        localStorage.setItem('aiesec_user', JSON.stringify(user));
        return { token, user };
      }
      return rejectWithValue(response.data.message || 'Moshkla fel inscription.');
    } catch (err) {
      let msg = err.response?.data?.message;
      if (!msg) {
        if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
          msg = 'Moshkla fi connexion el serveur backend. Thabbet fel port 5000.';
        } else {
          msg = err.message || 'Ghalta fel inscription.';
        }
      }
      return rejectWithValue(msg);
    }
  }
);

// ------------------------------------------------------------------------------
// ASYNC THUNK 2 : loginUser
// KHEDMETOU     : Yab3ath { email, password } lel backend (POST /api/auth/login)
//                 El backend ythabbet bel bcrypt wel JWT, ken s7i7 yrajja3 token w user
// CHKOUN YESTA3MLOU :
// - Login.jsx (fi handleSubmit wa9telli tenzel "Login")
// ------------------------------------------------------------------------------
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token, user } = response.data;
        // Nsajjlou fel navigateur
        localStorage.setItem('aiesec_token', token);
        localStorage.setItem('aiesec_user', JSON.stringify(user));
        return { token, user };
      }
      return rejectWithValue(response.data.message || 'Moshkla fel connexion.');
    } catch (err) {
      let msg = err.response?.data?.message;
      if (!msg) {
        if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
          msg = 'Moshkla fi connexion el serveur backend. Thabbet fel port 5000.';
        } else {
          msg = err.message || 'Email wala mot de passe ghalet.';
        }
      }
      return rejectWithValue(msg);
    }
  }
);

// ------------------------------------------------------------------------------
// ASYNC THUNK 3 : checkAuth
// KHEDMETOU     : Awwel ma yethall el site, yhez el token li fel navigateur w yemchi ysa9si el backend
//                 (GET /api/auth/me) : "Ya backend, hadha el token mezel valable ?"
// CHKOUN YESTA3MLOU :
// - App.jsx (fi useEffect([]) awwel ma tchargi l-application)
// ------------------------------------------------------------------------------
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('aiesec_token');
    if (!token) return null; // Ma fammech token, ya3ni mehouche connecté
    try {
      const response = await api.get('/auth/me');
      if (response.data.success && response.data.user) {
        localStorage.setItem('aiesec_user', JSON.stringify(response.data.user));
        return response.data.user;
      }
      return rejectWithValue('Session wfé wa9tha.');
    } catch (err) {
      // Ken el token expiré wala fased, nfas5ouh bech ma ya3melch ghalat
      localStorage.removeItem('aiesec_token');
      localStorage.removeItem('aiesec_user');
      return rejectWithValue('Token expiré.');
    }
  }
);

// ------------------------------------------------------------------------------
// SLICE CONFIGURATION & REDUCERS
// ------------------------------------------------------------------------------
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Action synchrone : Déconnexion mta3 el user
    // Nfas5ou el user mel store w nfas5ou el token mel localStorage
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('aiesec_token');
      localStorage.removeItem('aiesec_user');
    },
    // Action synchrone : Nna7iw message d'erreur
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- Inscription (registerUser) ---
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Ghalta fel inscription.';
      })

      // --- Connexion (loginUser) ---
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Email wala mot de passe ghalet.';
      })

      // --- Vérification automatique de session (checkAuth) ---
      .addCase(checkAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
