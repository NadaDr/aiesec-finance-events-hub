// client/src/pages/Categories.jsx
// Management page for Revenue and Expense Categories using Redux Toolkit and reusable form components

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCategories,
  createCategory,
  deleteCategory,
  clearCategoryMessages
} from '../redux/categoriesSlice';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Button, Input, Select, Alert, Spinner, Badge } from '../components/common';
import { Plus, Trash2, TrendingUp, TrendingDown, Tags } from 'lucide-react';

const Categories = () => {
  const dispatch = useDispatch();
  const { categories, loading, isSubmitting, error, success } = useSelector(
    (state) => state.categories
  );

  // New Category Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'revenue'
  });
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (localError) setLocalError('');
    if (error || success) dispatch(clearCategoryMessages());
  };

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
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    dispatch(clearCategoryMessages());

    const confirmDelete = window.confirm(
      `Are you sure you want to delete category "${catName}"?`
    );
    if (!confirmDelete) return;

    dispatch(deleteCategory(catId));
  };

  const revenueCategories = categories.filter((c) => c.type === 'revenue');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <div className="auth-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />

        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Categories</h1>
              <p className="page-subtitle">
                Organize your financial activities into Revenue and Expense streams
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

          <Alert
            type="success"
            message={success}
            onClose={() => dispatch(clearCategoryMessages())}
          />

          {/* Add Category Card with Reusable Input, Select, and Button */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark-blue)', marginBottom: '1rem' }}>
              + Add New Category
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
                  Add Category
                </Button>
              </div>
            </form>
          </div>

          {loading && categories.length === 0 ? (
            <Spinner text="Loading categories from MongoDB..." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
              {/* Revenue Categories Card */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="kpi-icon-wrap" style={{ width: '32px', height: '32px', backgroundColor: 'var(--color-revenue-bg)', color: 'var(--color-revenue)' }}>
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark-blue)' }}>
                        Revenue Categories
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Income and sponsorship sources ({revenueCategories.length})
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
                        backgroundColor: 'var(--bg-light)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)'
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="kpi-icon-wrap" style={{ width: '32px', height: '32px', backgroundColor: 'var(--color-expense-bg)', color: 'var(--color-expense)' }}>
                      <TrendingDown size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark-blue)' }}>
                        Expense Categories
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Expenditure & logistics streams ({expenseCategories.length})
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
                        backgroundColor: 'var(--bg-light)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)'
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
      </div>
    </div>
  );
};

export default Categories;
