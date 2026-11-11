// ==============================================================================
// FICHIER : client/src/services/api.js
// ROLE    : Instance Axios configurée avec Intercepteurs de Requête & Réponse
//   - Requête : yzid el token JWT mel store Redux
//   - Réponse : 401 -> dispatch(sessionExpired()) (ProtectedRoute yhezzek lel /login
//               men ghir rechargement de page), w message wadh7 fi err.userMessage
// ==============================================================================

import axios from 'axios';
import { sessionExpired } from '../redux/actions';

// URL de base de l'API Express (variable d'environnement wala localhost:5000 par défaut)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// El store yet7at mel store.js (bech ma ysirch import circulaire store <-> api)
let store;
export const injectStore = (s) => {
  store = s;
};

// 401 3la hedhom ya3ni "email/mot de passe ghaltin", mouch "session wfet"
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register'];

// ------------------------------------------------------------------------------
// REQUEST INTERCEPTOR : yzid "Authorization: Bearer <token>" ken famma token
// ------------------------------------------------------------------------------
api.interceptors.request.use((config) => {
  const token = store?.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ------------------------------------------------------------------------------
// RESPONSE INTERCEPTOR
// ------------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthEndpoint = AUTH_ENDPOINTS.some((p) => url.includes(p));

    // Token wfet / ghalet : nsakkrou el session marra wa7da barka,
    // 7atta ken barcha requêtes fashlou fi nafs el wa9t
    if (status === 401 && !isAuthEndpoint && store?.getState().auth.token) {
      store.dispatch(sessionExpired(error.response.data?.message));
    }

    // Message 7adher bech yetaffiche fi toast wala formulaire
    if (error.response) {
      error.userMessage = error.response.data?.message || `Erreur serveur (${status})`;
    } else if (error.code === 'ECONNABORTED') {
      error.userMessage = 'El serveur tawwel barcha fi jweb. 3awed jarreb.';
    } else {
      error.userMessage = `Moshkla fi connexion el serveur backend (${API_BASE_URL}).`;
    }

    return Promise.reject(error);
  }
);

export default api;
