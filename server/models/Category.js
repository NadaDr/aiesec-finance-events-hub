// server/models/Category.js
// Mongoose model for Financial Categories (Revenue or Expense)

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Category type is required'],
      enum: {
        values: ['revenue', 'expense'],
        message: 'Category type must be either "revenue" or "expense"'
      },
      lowercase: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate categories of the same type
categorySchema.index({ name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);

