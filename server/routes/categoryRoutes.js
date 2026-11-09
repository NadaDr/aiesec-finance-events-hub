// server/routes/categoryRoutes.js
// Routes for financial categories

const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

// Anyone authenticated or visiting can get categories, but creating/deleting requires authentication
router.get('/', getCategories);
router.post('/', protect, createCategory);
router.delete('/:id', protect, deleteCategory);

module.exports = router;

