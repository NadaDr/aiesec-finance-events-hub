// server/controllers/categoryController.js
// Handles CRUD operations for financial categories

const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

// Default initial categories based on specifications
const DEFAULT_CATEGORIES = [
  // Revenue categories
  { name: 'Sponsorship', type: 'revenue' },
  { name: 'Ticket Sales', type: 'revenue' },
  { name: 'Registration Fees', type: 'revenue' },
  { name: 'Booth Fees', type: 'revenue' },
  { name: 'Donations', type: 'revenue' },
  // Expense categories
  { name: 'Venue Rental', type: 'expense' },
  { name: 'Marketing', type: 'expense' },
  { name: 'Transportation', type: 'expense' },
  { name: 'Catering', type: 'expense' },
  { name: 'Decoration', type: 'expense' },
  { name: 'Equipment', type: 'expense' }
];

// @desc    Get all categories (auto-seed if empty)
// @route   GET /api/categories
// @access  Public / Protected
const getCategories = async (req, res, next) => {
  try {
    let categories = await Category.find().sort({ type: 1, name: 1 });

    // Auto-seed default categories if database is empty
    if (categories.length === 0) {
      console.log('[Categories] Seeding default categories into database...');
      await Category.insertMany(DEFAULT_CATEGORIES);
      categories = await Category.find().sort({ type: 1, name: 1 });
    }

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res, next) => {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both category name and type (revenue or expense).'
      });
    }

    const normalizedType = type.toLowerCase().trim();
    if (!['revenue', 'expense'].includes(normalizedType)) {
      return res.status(400).json({
        success: false,
        message: 'Category type must be either "revenue" or "expense".'
      });
    }

    const trimmedName = name.trim();

    // Check if category already exists with same name & type
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      type: normalizedType
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A ${normalizedType} category named "${trimmedName}" already exists.`
      });
    }

    const category = await Category.create({
      name: trimmedName,
      type: normalizedType
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      });
    }

    // Specification requirement: Prevent deletion if transactions still use this category
    const transactionCount = await Transaction.countDocuments({ category: id });
    if (transactionCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category "${category.name}": it is currently associated with ${transactionCount} transaction(s). Please reassign or remove those transactions first.`
      });
    }

    await Category.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Category "${category.name}" was successfully deleted.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  deleteCategory
};

