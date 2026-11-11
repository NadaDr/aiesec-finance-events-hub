// ==============================================================================
// BLASA   : server/server.js
// CHNOWA  : El Point d'Entrée el kbir mta3 el Backend REST API
// ==============================================================================

const express = require('express');
const cors = require('cors'); // Bech ykhelli React (client) ya7ki m3a Node (server) men ghayr bloquage
const dotenv = require('dotenv'); // Bech ya9ra el variables mel fichier .env
const mongoose = require('mongoose');
const connectDB = require('./config/db'); // Connexion lel MongoDB Atlas
const { disconnectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Njibou les modules des routes mte3na
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

// 1. Nchargiw les variables d'environnement (PORT, MONGO_URI, JWT_SECRET, CLIENT_URL)
dotenv.config();

// 2. Nthabtou fel variables el obligatoires mel bdeya (échec rapide w wadh7)
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET'];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length) {
  console.error(`[Server Error] Variables d'environnement na9sin : ${missingEnv.join(', ')}`);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// 3. CORS : ken les origines mawjoudin fi CLIENT_URL (ynajem ykounou barcha, mfar9in b-virgule)
//    Ex : CLIENT_URL=http://localhost:5173,https://aiesec-finance-hub.vercel.app
//    Pas de "credentials" : el token yet3adda fel header Authorization, mouch fi cookie.
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

if (allowedOrigins.length === 0) {
  console.warn('[CORS] CLIENT_URL mehech mdefinia : kol les origines msam7in (ok ken fel développement).');
}

// Fel développement, Vite ynajem ybaddel el port (5173 -> 5174...) ki projet e5er
// 7at el port : ykhali  http://localhost:<port>. Fel production : CLIENT_URL barka.
const isDev = process.env.NODE_ENV !== 'production';
const LOCALHOST_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

const corsOrigin = (origin, callback) => {
  if (
    !origin || // requêtes men ghir navigateur (curl, Postman, health checks)
    allowedOrigins.length === 0 ||
    allowedOrigins.includes(origin) ||
    (isDev && LOCALHOST_ORIGIN.test(origin))
  ) {
    return callback(null, true);
  }
  return callback(null, false);
};

app.use(
  cors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// 4. Body parser : Bech Express yefhem les données JSON (limite 1mb)
app.use(express.json({ limit: '1mb' }));

// 5. Les Routes Principales mta3 l'API
app.use('/api/auth', authRoutes); // Authentification (register, login, me)
app.use('/api/events', eventRoutes); // Les Evénements (CRUD + Stats)
app.use('/api/categories', categoryRoutes); // Les Catégories (Sponsorship, Venue...)
app.use('/api/transactions', transactionRoutes); // Flous el madkhoul wel masrouf

// 6. Health Check : yrajja3 503 ken MongoDB ma7loulch
app.get('/api/health', (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({
    status: dbUp ? 'OK' : 'DEGRADED',
    database: dbUp ? 'connected' : 'disconnected',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// 7. Route mar7ba (Page d'accueil API)
app.get('/', (req, res) => {
  res.json({
    message: 'Mar7ba bik fi AIESEC Finance Hub API',
    endpoints: {
      auth: '/api/auth',
      events: '/api/events',
      categories: '/api/categories',
      transactions: '/api/transactions',
      health: '/api/health'
    }
  });
});

// 8. 404 JSON, ba3dha gestionnaire d'erreurs centralisé (dima e5er wa7ed)
app.use(notFound);
app.use(errorHandler);

// ==============================================================================
// Démarrage w Arrêt ndhif (graceful shutdown)
// ==============================================================================
let server;
let shuttingDown = false;

const shutdown = async (signal, exitCode = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`\n[Server] ${signal} : nsakkrou fel serveur ndhif...`);

  // Filet de sécurité : ken el fermeture tawwlet akther men 10s, nsakkrou bel forsa
  const forceExit = setTimeout(() => {
    console.error('[Server] Arrêt forcé (10s fetou)');
    process.exit(1);
  }, 10000);
  forceExit.unref();

  try {
    // Ken el serveur ma bdech ysma3 (ex : port masta3mel), ma fammech chay nsakkrouh
    if (server && server.listening) {
      // 1. Ma na9blouch connexions jdod w nkammlou les requêtes eli bdet
      await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
      console.log('[Server] Serveur HTTP tsakker.');
    }
    // 2. Nsakkrou connexion MongoDB
    await disconnectDB();
  } catch (err) {
    console.error("[Server] Ghalta wa9t el arrêt :", err.message);
    exitCode = 1;
  }
  process.exit(exitCode);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  console.error('[Server] Promesse rejetée non gérée :', reason);
  shutdown('unhandledRejection', 1);
});
process.on('uncaughtException', (err) => {
  console.error('[Server] Exception non interceptée :', err);
  shutdown('uncaughtException', 1);
});

(async () => {
  try {
    // 1. Nconnectiw 3al MongoDB 9bal ma n7ellou el port
    await connectDB(process.env.MONGO_URI);

    // 2. Nlansiou el serveur
    server = app.listen(PORT, () => {
      console.log(`[Server] AIESEC Finance Hub yemchi 3la http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n[Server Error] El Port ${PORT} deja masta3mel b application okhra.`);
        console.error(`[Server Solution] Sakker el process l'9dim wala baddel el PORT fi server/.env\n`);
      } else {
        console.error('[Server Error]', err);
      }
      shutdown('serverError', 1);
    });
  } catch (err) {
    console.error('[Server Error] Ma najjamnech nlansiou el serveur :', err.message);
    await disconnectDB().catch(() => { });
    process.exit(1);
  }
})();

module.exports = { app };
