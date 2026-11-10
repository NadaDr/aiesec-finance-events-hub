// ==============================================================================
// BLASA   : server/server.js
// CHNOWA  : El Point d'Entrée el kbir mta3 el Backend REST API
// ==============================================================================

const express = require('express');
const cors = require('cors'); // Bech ykhelli React (client) ya7ki m3a Node (server) men ghayr bloquage
const dotenv = require('dotenv'); // Bech ya9ra el variables mel fichier .env
const connectDB = require('./config/db'); // Fonction l'authentification bel MongoDB Atlas

// Njibou les modules des routes mte3na
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

// 1. Nchargiw les variables d'environnement (PORT, MONGO_URI, JWT_SECRET)
dotenv.config();

// 2. Nconnectiw 3al base MongoDB Atlas
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// 3. N7ellou el CORS bech React ynajem yab3ath requêtes
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

// 4. Body parser : Bech Express yefhem les données JSON eli jeyin mel frontend
app.use(express.json());

// 5. Les Routes Principales mta3 l'API
app.use('/api/auth', authRoutes); // Authentification (register, login, me)
app.use('/api/events', eventRoutes); // Les Evénements (CRUD + Stats)
app.use('/api/categories', categoryRoutes); // Les Catégories (Sponsorship, Venue...)
app.use('/api/transactions', transactionRoutes); // Flous el madkhoul wel masrouf

// 6. Route de vérification (Health Check)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'AIESEC Finance Hub API yemchi jawou behi',
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

// 8. Gestion des routes ghaltin (404 Not Found)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route mehech mawjouda: ${req.method} ${req.originalUrl}`
  });
});

// 9. Middleware global mta3 les erreurs (500 Server Error)
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Moshkla dakhiliya fel serveur'
  });
});

// 10. Nlansiou el serveur 3al Port 5000
const server = app.listen(PORT, () => {
  console.log(`[Server] AIESEC Finance Hub yemchi 3la http://localhost:${PORT}`);
});

// 11. Gestion d'erreur ken el port 5000 masta3mel men 9bal (EADDRINUSE)
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[Server Error] El Port ${PORT} deja masta3mel b application okhra.`);
    console.error(`[Server Solution] Sakker el process l'9dim wala baddel el PORT fi server/.env\n`);
    process.exit(1);
  } else {
    console.error('[Server Error]', err);
  }
});

// 12. Sakker el serveur ndhif wa9t ma tenzel Ctrl+C
const gracefulShutdown = () => {
  console.log('\n[Server] Nsakkrou fel serveur HTTP ndhif...');
  server.close(() => {
    console.log('[Server] Serveur tsakker b naje7.');
    process.exit(0);
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = { app, server };
