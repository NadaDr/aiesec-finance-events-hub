// server/models/Transaction.js
// Single Mongoose model for both Revenues and Expenses differentiated by `type`

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Transaction must be associated with an event']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Transaction must have a category']
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: {
        values: ['revenue', 'expense'],
        message: 'Transaction type must be either "revenue" or "expense"'
      },
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a transaction description'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      min: [0.01, 'Amount must be greater than zero']
    },
    date: {
      type: Date,
      required: [true, 'Transaction date is required'],
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);

