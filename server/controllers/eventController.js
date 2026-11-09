// server/controllers/eventController.js
// Handles CRUD operations and financial aggregations for Events

const Event = require('../models/Event');
const Transaction = require('../models/Transaction');

// Helper function to calculate financial metrics for a specific event
const calculateEventFinancials = async (eventId) => {
  const transactions = await Transaction.find({ event: eventId });

  let totalRevenue = 0;
  let totalExpenses = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'revenue') {
      totalRevenue += Number(tx.amount);
    } else if (tx.type === 'expense') {
      totalExpenses += Number(tx.amount);
    }
  });

  const netBalance = totalRevenue - totalExpenses;

  let financialStatus = 'no_transactions';
  if (transactions.length > 0) {
    financialStatus = netBalance >= 0 ? 'positive' : 'negative';
  }

  return {
    totalRevenue,
    totalExpenses,
    netBalance,
    transactionCount: transactions.length,
    financialStatus
  };
};

// @desc    Get all events for the authenticated user with financial summaries
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  try {
    // Retrieve events created by this user, populated with creator info
    const events = await Event.find({ createdBy: req.user._id })
      .populate('createdBy', 'name email')
      .sort({ startDate: -1 });

    // Calculate dynamic financials for each event
    const eventsWithFinancials = await Promise.all(
      events.map(async (event) => {
        const financials = await calculateEventFinancials(event._id);
        return {
          ...event.toObject(),
          ...financials
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: eventsWithFinancials.length,
      events: eventsWithFinancials
    });
  } catch (error) {
    console.error('[Event Controller] getEvents error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve events.'
    });
  }
};

// @desc    Get single event by ID with its transactions & financial metrics
// @route   GET /api/events/:id
// @access  Private
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({
      _id: id,
      createdBy: req.user._id
    }).populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or access denied.'
      });
    }

    // Get all transactions for this event with category details
    const transactions = await Transaction.find({ event: id })
      .populate('category', 'name type')
      .populate('createdBy', 'name email')
      .sort({ date: -1 });

    const financials = await calculateEventFinancials(id);

    return res.status(200).json({
      success: true,
      event: {
        ...event.toObject(),
        ...financials,
        transactions
      }
    });
  } catch (error) {
    console.error('[Event Controller] getEventById error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve event details.'
    });
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res) => {
  try {
    const { name, description, location, startDate, endDate, budget } = req.body;

    if (!name || !location || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide event name, location, start date, and end date.'
      });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Event start date cannot be after the end date.'
      });
    }

    const event = await Event.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      location: location.trim(),
      startDate,
      endDate,
      budget: budget ? Number(budget) : 0,
      createdBy: req.user._id
    });

    const populatedEvent = await Event.findById(event._id).populate(
      'createdBy',
      'name email'
    );

    return res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      event: {
        ...populatedEvent.toObject(),
        totalRevenue: 0,
        totalExpenses: 0,
        netBalance: 0,
        transactionCount: 0,
        financialStatus: 'no_transactions'
      }
    });
  } catch (error) {
    console.error('[Event Controller] createEvent error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create event.'
    });
  }
};

// @desc    Delete an event and its associated transactions (Cascading delete)
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({
      _id: id,
      createdBy: req.user._id
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or access denied.'
      });
    }

    // Specification requirement: Safely remove all associated transactions to avoid orphan data
    const deletedTransactionsResult = await Transaction.deleteMany({ event: id });

    // Delete the event
    await Event.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Event "${event.name}" and its ${deletedTransactionsResult.deletedCount} associated transaction(s) have been successfully deleted.`
    });
  } catch (error) {
    console.error('[Event Controller] deleteEvent error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete event.'
    });
  }
};

// @desc    Get complete dashboard summary statistics & charts data dynamically
// @route   GET /api/events/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    // 1. Get all events created by user
    const events = await Event.find({ createdBy: req.user._id }).sort({
      startDate: -1
    });

    // 2. Get all transactions created by user
    const transactions = await Transaction.find({ createdBy: req.user._id })
      .populate('event', 'name')
      .populate('category', 'name type')
      .sort({ date: -1 });

    // 3. Compute overall financial KPI values dynamically
    let totalRevenue = 0;
    let totalExpenses = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'revenue') {
        totalRevenue += Number(tx.amount);
      } else if (tx.type === 'expense') {
        totalExpenses += Number(tx.amount);
      }
    });

    const netBalance = totalRevenue - totalExpenses;
    const totalEvents = events.length;

    // 4. Compute per-event breakdown for Events Overview table and Recharts Chart
    const eventsOverview = await Promise.all(
      events.map(async (event) => {
        const financials = await calculateEventFinancials(event._id);
        return {
          _id: event._id,
          name: event.name,
          location: event.location,
          startDate: event.startDate,
          endDate: event.endDate,
          budget: event.budget,
          totalRevenue: financials.totalRevenue,
          totalExpenses: financials.totalExpenses,
          netBalance: financials.netBalance,
          financialStatus: financials.financialStatus
        };
      })
    );

    // 5. Format chart data for Recharts (Revenue vs Expenses across events)
    const chartData = eventsOverview.map((item) => ({
      name: item.name.length > 18 ? item.name.substring(0, 16) + '...' : item.name,
      fullName: item.name,
      Revenue: item.totalRevenue,
      Expenses: item.totalExpenses,
      NetBalance: item.netBalance
    }));

    // 6. Recent transactions (latest 5)
    const recentTransactions = transactions.slice(0, 6);

    return res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalExpenses,
        netBalance,
        totalEvents
      },
      chartData,
      eventsOverview,
      recentTransactions
    });
  } catch (error) {
    console.error('[Event Controller] getDashboardStats error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics.'
    });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  deleteEvent,
  getDashboardStats
};

