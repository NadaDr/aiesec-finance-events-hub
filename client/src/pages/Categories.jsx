// client/src/pages/Categories.jsx
// Management page for Revenue and Expense Categories

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Tags
} from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New Category Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'revenue'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Please provide a category name.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/categories', {
        name: formData.name.trim(),
        type: formData.type
      });
      if (res.data.success) {
        setSuccess(`Category "${formData.name}" added successfully.`);
        setFormData({ name: '', type: formData.type });
        fetchCategories();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    setError('');
    setSuccess('');

    const confirmDelete = window.confirm(
      `Are you sure you want to delete category "${catName}"?`
    );
    if (!confirmDelete) return;

    try {
      const res = await api.delete(`/categories/${catId}`);
      if (res.data.success) {
        setSuccess(res.data.message);
        fetchCategories();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Cannot delete category in use.'
      );
    }
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

          {error && (
            <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          )}

          {/* Add Category Card */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark-blue)', marginBottom: '1rem' }}>
              + Add New Category
            </h3>
            <form
              onSubmit={handleAddCategory}
              style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}
            >
              <div style={{ flex: '1', minWidth: '220px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. Merchandise, Sound System, Booth Fees"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div style={{ width: '180px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Category Type *
                </label>
                <select
                  name="type"
                  className="form-select"
                  style={{ width: '100%' }}
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="revenue">Revenue</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{ height: '42px' }}
              >
                <Plus size={16} />
                <span>{isSubmitting ? 'Adding...' : 'Add Category'}</span>
              </button>
            </form>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading categories...</p>
            </div>
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
                        <span className="badge badge-revenue">Revenue</span>
                        <span style={{ fontWeight: 600 }}>{cat.name}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(cat._id, cat.name)}
                        className="btn btn-outline-danger btn-sm"
                        title="Delete category"
                        style={{ padding: '0.25rem 0.5rem' }}
                      >
                        <Trash2 size={13} />
                      </button>
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
                        <span className="badge badge-expense">Expense</span>
                        <span style={{ fontWeight: 600 }}>{cat.name}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(cat._id, cat.name)}
                        className="btn btn-outline-danger btn-sm"
                        title="Delete category"
                        style={{ padding: '0.25rem 0.5rem' }}
                      >
                        <Trash2 size={13} />
                      </button>
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

