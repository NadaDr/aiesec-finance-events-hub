// ==============================================================================
// FICHIER : client/src/redux/categoriesSlice.js
// KHEDMETOU BELFALA9I TOUNSI :
// Hadha el Slice el mas'oul 3la les "Catégories Financières" (Tasneefat el flous) :
// - Catégories mta3 Recettes (Sponsoring, Ticket sales, Frais d'inscription, Subvention)
// - Catégories mta3 Dépenses (Location salle, Traiteur/Catering, Transport, Goodies, Sonorisation)
//
// LIEN M3A LES PAGES :
// 1. Categories.jsx   --> y3ayet l- fetchCategories() fi useEffect(), w createCategory()
//                         wa9telli tzid tasneef jdid, w deleteCategory() wa9telli tfasa5
// 2. Transactions.jsx --> y3ayet l- fetchCategories() bech ya3ref les catégories li teb3in
//                         "revenue" wala "expense" fi wst el Dropdown <select>
// 3. EventDetails.jsx --> y3ayet l- fetchCategories() bech yaffichi les catégories fel modal
//                         mta3 "+ Record Revenue" wala "+ Record Expense"
// ==============================================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// ------------------------------------------------------------------------------
// ASYNC THUNK 1 : fetchCategories
// KHEDMETOU     : Yjib les catégories l-kol mel MongoDB (GET /api/categories)
//                 (Wken l9aha fergha, el backend ya3mel auto-seed automatique lel catégories par défaut)
// REQUETE       : GET /api/categories
// CHKOUN YESTA3MLOU :
// - Categories.jsx (fi useEffect wa9telli t7ell l-page)
// - Transactions.jsx (bech y3abbi el dropdown)
// - EventDetails.jsx (bech y3abbi el dropdown mta3 el modal)
// ------------------------------------------------------------------------------
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/categories');
      if (response.data.success) {
        return response.data.categories; // Yarja3 tableau fih les catégories l-kol
      }
      return rejectWithValue(response.data.message || 'Moshkla fi tajyib les catégories.');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ghalta fi chargement les catégories.');
    }
  }
);

// ------------------------------------------------------------------------------
// ASYNC THUNK 2 : createCategory
// KHEDMETOU     : Ysajjel catégorie jdida fi MongoDB (POST /api/categories)
// DONNEES       : { name: "Matériel informatique", type: "expense" }
// CHKOUN YESTA3MLOU :
// - Categories.jsx (wa9telli t3abbi el formulaire "+ Add New Category")
// ------------------------------------------------------------------------------
export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await api.post('/categories', categoryData);
      if (response.data.success) {
        return response.data.category; // Yarja3 el catégorie jdida li tsajlet
      }
      return rejectWithValue(response.data.message || 'Moshkla fi sna3an el catégorie.');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ghalta fi création catégorie.');
    }
  }
);

// ------------------------------------------------------------------------------
// ASYNC THUNK 3 : deleteCategory
// KHEDMETOU     : Yfasa5 catégorie mel MongoDB (DELETE /api/categories/:id)
//                 (El backend ythabet: ken famma transactions mosta3mlin ha el catégorie, ma ykhallikch tfasa5ha)
// CHKOUN YESTA3MLOU :
// - Categories.jsx (wa9telli tenzel 3al poubelle 🗑️)
// ------------------------------------------------------------------------------
export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      if (response.data.success) {
        return id; // Nraj3ou l'ID bech nna7iwha mel liste instantanément
      }
      return rejectWithValue(response.data.message || 'Moshkla fi faskhan el catégorie.');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ghalta fi faskhan el catégorie.');
    }
  }
);

// ------------------------------------------------------------------------------
// INITIAL STATE : El 7ala el ibtide'iya mta3 les catégories fel Redux
// ------------------------------------------------------------------------------
const initialState = {
  categories: [],      // Tableau fih les catégories l-kol ({ _id, name, type })
  loading: false,      // true wa9telli 9a3ed ytelechargi fel catégories
  isSubmitting: false, // true wa9telli tenzel "Add Category" (spinner 3al bouton)
  error: null,         // Message d'erreur
  success: null        // Message de succès akhdher (ex: "Catégorie ajoutée avec succès")
};

// ------------------------------------------------------------------------------
// SLICE CONFIGURATION & EXTRA REDUCERS
// ------------------------------------------------------------------------------
const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    // Action synchrone : Nna7iw les messages de succès wala d'erreur
    clearCategoryMessages: (state) => {
      state.error = null;
      state.success = null;
    }
  },
  extraReducers: (builder) => {
    // --- 1. fetchCategories ---
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload; // N7ottou les catégories fel store
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // --- 2. createCategory ---
    builder
      .addCase(createCategory.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Nzidou el catégorie jdida lel tableau
        state.categories.push(action.payload);
        state.success = `Catégorie "${action.payload.name}" tzadit b-naje7.`;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });

    // --- 3. deleteCategory ---
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Nna7iw el catégorie li tfas5et mel tableau
        state.categories = state.categories.filter((cat) => cat._id !== action.payload);
        state.success = 'Catégorie tfas5et b-naje7.';
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });
  }
});

export const { clearCategoryMessages } = categoriesSlice.actions;
export default categoriesSlice.reducer;
