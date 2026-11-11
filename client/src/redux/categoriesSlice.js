// ==============================================================================
// FICHIER : client/src/redux/categoriesSlice.js
// KHEDMETOU BELFALA9I TOUNSI :
// Hadha el Slice el mas'oul 3la les "Catégories Financières" (Tasneefat el flous) :
// - Catégories mta3 Recettes (Sponsoring, Ticket sales, Frais d'inscription, Subvention)
// - Catégories mta3 Dépenses (Location salle, Traiteur/Catering, Transport, Goodies, Sonorisation)
// Les messages de succès yetaffichaw b-toast fel page (mouch fel Redux).
//
// LIEN M3A LES PAGES :
// 1. Categories.jsx   --> fetchCategories(), createCategory(), deleteCategory()
// 2. Transactions.jsx --> fetchCategories() bech y3abbi el Dropdown
// 3. EventDetails.jsx --> fetchCategories() bech y3abbi el modal
// ==============================================================================

import { createSlice } from '@reduxjs/toolkit';
import api from '../services/api';
import { apiThunk } from './actions';

// GET /api/categories
export const fetchCategories = apiThunk(
  'categories/fetchCategories',
  async () => (await api.get('/categories')).data,
  (data) => data.categories
);

// POST /api/categories  { name, type }
export const createCategory = apiThunk(
  'categories/createCategory',
  async (categoryData) => (await api.post('/categories', categoryData)).data,
  (data) => data.category
);

// DELETE /api/categories/:id (el backend yrefusi ken famma transactions mosta3mlinha)
export const deleteCategory = apiThunk(
  'categories/deleteCategory',
  async (id) => (await api.delete(`/categories/${id}`)).data,
  (data, id) => id
);

const initialState = {
  categories: [],      // ({ _id, name, type })
  loading: false,
  isSubmitting: false,
  error: null
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoryMessages: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- fetchCategories ---
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
      })

      // --- createCategory ---
      .addCase(createCategory.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // --- deleteCategory ---
      .addCase(deleteCategory.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.categories = state.categories.filter((cat) => cat._id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });
  }
});

export const { clearCategoryMessages } = categoriesSlice.actions;
export default categoriesSlice.reducer;
