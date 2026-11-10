// ==============================================================================
// FICHIER : client/src/services/api.js
// ROLE    : Instance Axios configurée avec Intercepteurs de Requête & Réponse
// ==============================================================================

import axios from 'axios';

// URL de base de l'API Express (utilise la variable d'environnement ou localhost:5000 par défaut)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ------------------------------------------------------------------------------
// INSTANCE AXIOS PRINCIPALE
// ------------------------------------------------------------------------------
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ------------------------------------------------------------------------------
// REQUEST INTERCEPTOR : Intercepteur de Requête
// ROLE : S'exécute automatiquement AVANT que chaque requête HTTP parte vers le serveur.
//        Récupère le token JWT dans localStorage et l'attache dans l'en-tête Authorization.
// ------------------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    // 1. Lire le token JWT sauvegardé dans le navigateur
    const token = localStorage.getItem('aiesec_token');

    // 2. Si le token existe, l'ajouter au format standard "Bearer <token>"
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ------------------------------------------------------------------------------
// RESPONSE INTERCEPTOR : Intercepteur de Réponse
// ROLE : S'exécute automatiquement LORSQUE le serveur renvoie une réponse.
//        Si le serveur renvoie un code 401 (Token expiré ou invalide),
//        nettoie la session et redirige automatiquement vers /login.
// ------------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => {
    // Si la requête a réussi (statut 2xx), on renvoie la réponse telle quelle
    return response;
  },
  (error) => {
    // Vérifier si l'erreur est un 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Si une session existait mais qu'elle est désormais expirée
      if (localStorage.getItem('aiesec_token')) {
        localStorage.removeItem('aiesec_token');
        localStorage.removeItem('aiesec_user');

        // Redirection vers la page de connexion si l'utilisateur est sur une page privée
        if (
          !window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/register') &&
          window.location.pathname !== '/'
        ) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
