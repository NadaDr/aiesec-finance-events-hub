// client/src/redux/categoriesSlice.js
// Redux Toolkit slice for managing Category entities (Revenues & Expenses classifications)

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// ------------------------------------------------------------------------------
// THUNK: fetchCategories
// ROLE : Loads all categories from MongoDB (auto-seeds defaults if empty)
// ------------------------------------------------------------------------------
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/categories');
      if (response.data.success) {
        return response.data.categories;
      }
      return rejectWithValue(response.data.message || 'Failed to load categories.');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load categories.');
    }
  }
);

// ------------------------------------------------------------------------------
// THUNK: createCategory
// ROLE : Adds a custom financial category (type: 'revenue' or 'expense')
// ------------------------------------------------------------------------------
export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await api.post('/categories', categoryData);
      if (response.data.success) {
        return response.data.category;
      }
      return rejectWithValue(response.data.message || 'Failed to create category.');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create category.');
    }
  }
);

// ------------------------------------------------------------------------------
// THUNK: deleteCategory
// ROLE : Deletes a category if not in use by any transactions
// ------------------------------------------------------------------------------
export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      if (response.data.success) {
        return id;
      }
      return rejectWithValue(response.data.message || 'Failed to delete category.');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete category.');
    }
  }
);

const initialState = {
  categories: [],
  loading: false,
  isSubmitting: false,
  error: null,
  success: null
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoryMessages: (state) => {
      state.error = null;
      state.success = null;
    }
  },
  extraReducers: (builder) => {
    // fetchCategories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // createCategory
    builder
      .addCase(createCategory.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.categories.push(action.payload);
        state.success = `Category "${action.payload.name}" created successfully.`;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });

    // deleteCategory
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.categories = state.categories.filter((cat) => cat._id !== action.payload);
        state.success = 'Category deleted successfully.';
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });
  }
});

export const { clearCategoryMessages } = categoriesSlice.actions;
export default categoriesSlice.reducer;
