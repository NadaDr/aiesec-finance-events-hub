// server/routes/eventRoutes.js
// Routes for event management and event financials

const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  deleteEvent,
  getDashboardStats
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

// Dashboard statistics route (must be before :id to prevent matching 'dashboard' as an ID)
router.get('/dashboard/stats', protect, getDashboardStats);

// Main event CRUD routes
router.get('/', protect, getEvents);
router.post('/', protect, createEvent);
router.get('/:id', protect, getEventById);
router.delete('/:id', protect, deleteEvent);

module.exports = router;

