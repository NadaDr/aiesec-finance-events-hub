// client/src/pages/Categories.jsx
// ======================================================================================
// 📌 CATEGORIES MANAGEMENT PAGE (Belfala9i Tounsi)
// ======================================================================================
// Hathi el-Page mte3 gestion des catégories financières (Revenue w Expense):
// 1) useSelector: njibou el liste mte3 les catégories mel categoriesSlice fel Redux.
// 2) useEffect: n3aytou l-`fetchCategories()` wa9t el page tet7al bech njibouhom mel MongoDB.
// 3) useState (formData): yched les inputs mte3 formulaire l-idhafa (esm el catégorie w naw3ha: revenue walla expense).
// 4) handleAddCategory: yab3eth `createCategory()` lel API backend `/api/categories`.
// 5) handleDeleteCategory: yfasakh catégorie b-`deleteCategory(catId)`.
// ======================================================================================

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCategories,
  createCategory,
  deleteCategory,
  clearCategoryMessages
} from '../redux/categoriesSlice';
import {
  Button,
  Input,
  Select,
  Alert,
  Spinner,
  Badge,
  useToast,
  useConfirm
} from '../components/common';
import { Plus, Trash2, TrendingUp, TrendingDown, Tags } from 'lucide-react';

const Categories = () => {
  // dispatch: bch naba3thou les actions lel Redux store
  const dispatch = useDispatch();
  const toast = useToast();
  const confirm = useConfirm();

  // useSelector: njibou les catégories, loading, w el message d'erreur
  // (les messages de succès yetaffichaw b-toast)
  const { categories, loading, isSubmitting, error } = useSelector(
    (state) => state.categories
  );

  // useState 1: formData -> yched el esm (name) w naw3 (type: revenue walla expense)
  const [formData, setFormData] = useState({
    name: '',
    type: 'revenue'
  });
  // useState 2: localError -> yched erreur ken l'utilisateur nsé ma ktebch esm
  const [localError, setLocalError] = useState('');

  // useEffect: yet7all awwel ma todkhol lel page -> yjib el liste des catégories mel serveur
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Fonction tcapturi el kteba fel formulaire
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (localError) setLocalError('');
    if (error) dispatch(clearCategoryMessages());
  };

  // Fonction tzid catégorie jdida lel backend
  const handleAddCategory = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.name.trim()) {
      setLocalError('Please provide a category name.');
      return;
    }

    const resultAction = await dispatch(
      createCategory({
        name: formData.name.trim(),
        type: formData.type
      })
    );

    if (createCategory.fulfilled.match(resultAction)) {
      setFormData({ name: '', type: formData.type });
      toast.success(`Category "${resultAction.payload.name}" added.`);
    }
  };

  // Fonction tfasakh catégorie ba3d ma yet3ada l-confirm popup
  const handleDeleteCategory = async (catId, catName) => {
    dispatch(clearCategoryMessages());

    const ok = await confirm({
      title: 'Delete category',
      message: `Delete category "${catName}"?`
    });
    if (!ok) return;

    const resultAction = await dispatch(deleteCategory(catId));
    if (deleteCategory.fulfilled.match(resultAction)) {
      toast.success(`Category "${catName}" deleted.`);
    }
  };

  const revenueCategories = categories.filter((c) => c.type === 'revenue');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">
            Group money in and out so your reports make sense
          </p>
        </div>
      </div>

      <Alert
        type="danger"
        message={localError || error}
        onClose={() => {
          setLocalError('');
          dispatch(clearCategoryMessages());
        }}
      />

      {/* Add Category Card with Reusable Input, Select, and Button */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--brand-dark)', marginBottom: '1rem' }}>
          Add a category
        </h3>
        <form
          onSubmit={handleAddCategory}
          style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}
        >
          <div style={{ flex: '1', minWidth: '240px' }}>
            <Input
              label="Category Name"
              name="name"
              placeholder="e.g. Merchandise, Sound System, Booth Fees"
              value={formData.name}
              onChange={handleInputChange}
              icon={Tags}
              required
              style={{ marginBottom: 0 }}
            />
          </div>

          <div style={{ width: '180px' }}>
            <Select
              label="Category Type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              options={[
                { value: 'revenue', label: 'Revenue' },
                { value: 'expense', label: 'Expense' }
              ]}
              required
              style={{ marginBottom: 0 }}
            />
          </div>

          <div style={{ alignSelf: 'flex-end' }}>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              icon={Plus}
              style={{ height: '42px' }}
            >
              Add
            </Button>
          </div>
        </form>
      </div>

      {loading && categories.length === 0 ? (
        <Spinner text="Loading categories…" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
          {/* Revenue Categories Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="kpi-icon-wrap" style={{ width: '32px', height: '32px', backgroundColor: 'var(--revenue-bg)', color: 'var(--revenue)' }}>
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-dark)' }}>
                    Money in
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Revenue categories ({revenueCategories.length})
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {revenueCategories.map((cat) => (
                <div
                  key={cat._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--surface)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Badge variant="revenue">Revenue</Badge>
                    <span style={{ fontWeight: 600 }}>{cat.name}</span>
                  </div>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDeleteCategory(cat._id, cat.name)}
                    title="Delete category"
                    style={{ padding: '0.25rem 0.5rem' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Expense Categories Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="kpi-icon-wrap" style={{ width: '32px', height: '32px', backgroundColor: 'var(--expense-bg)', color: 'var(--expense)' }}>
                  <TrendingDown size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-dark)' }}>
                    Money out
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Expense categories ({expenseCategories.length})
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {expenseCategories.map((cat) => (
                <div
                  key={cat._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--surface)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Badge variant="expense">Expense</Badge>
                    <span style={{ fontWeight: 600 }}>{cat.name}</span>
                  </div>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDeleteCategory(cat._id, cat.name)}
                    title="Delete category"
                    style={{ padding: '0.25rem 0.5rem' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
