// server/controllers/transactionController.js
// Handles CRUD operations and filters for financial transactions

const Transaction = require('../models/Transaction');
const Event = require('../models/Event');
const Category = require('../models/Category');

// @desc    Get all transactions with optional filters (by event, by type)
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { event, type } = req.query;

    // Base query: ensure transactions belong to the authenticated user
    const query = { createdBy: req.user._id };

    // Filter by Event ID if provided
    if (event && event !== 'all') {
      query.event = event;
    }

    // Filter by Transaction Type (revenue / expense) if provided
    if (type && ['revenue', 'expense'].includes(type.toLowerCase())) {
      query.type = type.toLowerCase();
    }

    const transactions = await Transaction.find(query)
      .populate('event', 'name location startDate')
      .populate('category', 'name type')
      .populate('createdBy', 'name email')
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    console.error('[Transaction Controller] getTransactions error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve transactions.'
    });
  }
};

// @desc    Create a new transaction (revenue or expense)
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  try {
    const { event, category, type, description, amount, date } = req.body;

    if (!event || !category || !type || !description || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide event, category, type, description, and amount.'
      });
    }

    const normalizedType = type.toLowerCase().trim();
    if (!['revenue', 'expense'].includes(normalizedType)) {
      return res.status(400).json({
        success: false,
        message: 'Transaction type must be "revenue" or "expense".'
      });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number greater than 0.'
      });
    }

    // Verify event exists and belongs to user
    const eventExists = await Event.findOne({
      _id: event,
      createdBy: req.user._id
    });
    if (!eventExists) {
      return res.status(404).json({
        success: false,
        message: 'Associated event not found or access denied.'
      });
    }

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Selected category does not exist.'
      });
    }

    const transaction = await Transaction.create({
      event,
      category,
      type: normalizedType,
      description: description.trim(),
      amount: numericAmount,
      date: date ? new Date(date) : new Date(),
      createdBy: req.user._id
    });

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('event', 'name')
      .populate('category', 'name type')
      .populate('createdBy', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully.',
      transaction: populatedTransaction
    });
  } catch (error) {
    console.error('[Transaction Controller] createTransaction error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to record transaction.'
    });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      _id: id,
      createdBy: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or access denied.'
      });
    }

    await Transaction.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully.'
    });
  } catch (error) {
    console.error('[Transaction Controller] deleteTransaction error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete transaction.'
    });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  deleteTransaction
};

