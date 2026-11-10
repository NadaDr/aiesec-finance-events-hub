// ==============================================================================
// FICHIER : client/src/redux/authSlice.js
// ROLE    : Gestion de l'état d'authentification global avec Redux Toolkit
// ==============================================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// ------------------------------------------------------------------------------
// INITIALISATION DE L'ETAT : Récupération de la session existante depuis localStorage
// Permet à l'utilisateur de rester connecté même s'il rafraîchit la page (F5)
// ------------------------------------------------------------------------------
const storedToken = localStorage.getItem('aiesec_token') || null;
const storedUser = localStorage.getItem('aiesec_user')
  ? JSON.parse(localStorage.getItem('aiesec_user'))
  : null;

const initialState = {
  user: storedUser, // Données de l'utilisateur ({ _id, name, email })
  token: storedToken, // Token JWT pour les requêtes HTTP
  isAuthenticated: !!(storedToken && storedUser), // Booléen : true si connecté
  loading: false, // Indicateur de chargement (spinner sur les boutons)
  error: null // Message d'erreur éventuel (ex: "Mot de passe incorrect")
};

// ------------------------------------------------------------------------------
// ASYNC THUNK : registerUser
// ROLE : Envoie les données d'inscription au backend (POST /api/auth/register)
//        Si succès, enregistre le token dans localStorage et met à jour le store
// ------------------------------------------------------------------------------
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      if (response.data.success) {
        const { token, user } = response.data;
        // Sauvegarde dans le navigateur pour persister la session
        localStorage.setItem('aiesec_token', token);
        localStorage.setItem('aiesec_user', JSON.stringify(user));
        return { token, user };
      }
      return rejectWithValue(response.data.message || 'Échec de l inscription.');
    } catch (err) {
      let msg = err.response?.data?.message;
      if (!msg) {
        if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
          msg = 'Erreur de connexion : Impossible de joindre le serveur backend (http://localhost:5000). Vérifiez que le serveur est bien démarré.';
        } else {
          msg = err.message || 'Erreur lors de l inscription.';
        }
      }
      return rejectWithValue(msg);
    }
  }
);

// ------------------------------------------------------------------------------
// ASYNC THUNK : loginUser
// ROLE : Envoie email + mot de passe au backend (POST /api/auth/login)
//        Si valide, enregistre le token dans localStorage et connecte l'utilisateur
// ------------------------------------------------------------------------------
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token, user } = response.data;
        // Sauvegarde de la session
        localStorage.setItem('aiesec_token', token);
        localStorage.setItem('aiesec_user', JSON.stringify(user));
        return { token, user };
      }
      return rejectWithValue(response.data.message || 'Échec de la connexion.');
    } catch (err) {
      let msg = err.response?.data?.message;
      if (!msg) {
        if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
          msg = 'Erreur de connexion : Impossible de joindre le serveur backend (http://localhost:5000). Vérifiez que le serveur est bien démarré.';
        } else {
          msg = err.message || 'Email ou mot de passe incorrect.';
        }
      }
      return rejectWithValue(msg);
    }
  }
);

// ------------------------------------------------------------------------------
// ASYNC THUNK : checkAuth
// ROLE : Vérifie auprès du backend si le token en cache est toujours valide
// ------------------------------------------------------------------------------
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('aiesec_token');
    if (!token) return null;
    try {
      const response = await api.get('/auth/me');
      if (response.data.success && response.data.user) {
        localStorage.setItem('aiesec_user', JSON.stringify(response.data.user));
        return response.data.user;
      }
      return rejectWithValue('Session expirée.');
    } catch (err) {
      // En cas de token expiré ou corrompu, on nettoie le localStorage
      localStorage.removeItem('aiesec_token');
      localStorage.removeItem('aiesec_user');
      return rejectWithValue('Token invalide ou expiré.');
    }
  }
);

// ------------------------------------------------------------------------------
// SLICE REDUX : authSlice
// ROLE : Définit les reducers et extraReducers pour faire évoluer l'état
// ------------------------------------------------------------------------------
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Action synchrone : Déconnexion de l'utilisateur
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('aiesec_token');
      localStorage.removeItem('aiesec_user');
    },
    // Action synchrone : Réinitialiser le message d'erreur
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- INSCRIPTION (registerUser) ---
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
        state.error = action.payload || 'Échec de l inscription.';
      })

      // --- CONNEXION (loginUser) ---
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
        state.error = action.payload || 'Échec de la connexion.';
      })

      // --- VÉRIFICATION DE SESSION (checkAuth) ---
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

// Export des actions synchrones
export const { logout, clearError } = authSlice.actions;

// Export du reducer principal pour le store
export default authSlice.reducer;
