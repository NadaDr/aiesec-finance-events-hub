// client/src/pages/Login.jsx
// User login page with Redux Toolkit authentication

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/authSlice';
import Navbar from '../components/Navbar';
import { LogIn, Lock, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [localError, setLocalError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading: isSubmitting, error: reduxError } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (localError) setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.email || !formData.password) {
      setLocalError('Please provide both email and password.');
      return;
    }

    try {
      const resultAction = await dispatch(loginUser(formData));
      if (loginUser.fulfilled.match(resultAction)) {
        navigate('/dashboard');
      }
    } catch (err) {
      setLocalError('Invalid email or password.');
    }
  };

  const displayError = localError || reduxError;

  return (
    <div className="app-container">
      <Navbar />
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">
            Sign in to manage your AIESEC event finances
          </p>

          {displayError && (
            <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} />
              <span>{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.4rem' }}
                  placeholder="name@aiesec.net"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)'
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.4rem' }}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: '1.75rem',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)'
            }}
          >
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{ color: 'var(--primary-blue)', fontWeight: 600 }}
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
