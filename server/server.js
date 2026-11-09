// server/server.js
// Main entry point for AIESEC Finance Hub REST API

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Import route modules
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend communication (allow all origins in development)
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

// Body parser
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'AIESEC Finance Hub API is running',
    timestamp: new Date().toISOString()
  });
});

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to AIESEC Finance Hub API',
    endpoints: {
      auth: '/api/auth',
      events: '/api/events',
      categories: '/api/categories',
      transactions: '/api/transactions',
      health: '/api/health'
    }
  });
});

// 404 Route handler for undefined endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start listening
const server = app.listen(PORT, () => {
  console.log(`[Server] AIESEC Finance Hub running on http://localhost:${PORT}`);
});

// Handle server errors (e.g. port already in use)
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[Server Error] Port ${PORT} is already in use by another process.`);
    console.error(`[Server Solution] Stop any other running server instance, or change PORT in server/.env\n`);
    process.exit(1);
  } else {
    console.error('[Server Error]', err);
  }
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('\n[Server] Closing HTTP server cleanly...');
  server.close(() => {
    console.log('[Server] HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = { app, server };
