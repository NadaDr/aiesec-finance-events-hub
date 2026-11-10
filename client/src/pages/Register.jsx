// client/src/pages/Register.jsx
// ======================================================================================
// 📌 REGISTER PAGE (Belfala9i Tounsi)
// ======================================================================================
// Hathi el-Page mte3 el-Inscription (Creation de compte) fel Finance Hub:
// 1) useState (formData): yched l-ism (name), l'email, el password, w confirmation de mot de passe.
// 2) useDispatch: naba3thou l-action `registerUser(userData)` lel authSlice fel Redux.
// 3) useSelector: njibou loading w les erreurs de validation (par exemple email déjà utilisé).
// 4) navigate('/dashboard'): wa9t l'inscription tenja7, nhezzou l-user directement lel Dashboard.
// ======================================================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../redux/authSlice';
import Navbar from '../components/Navbar';
import { Button, Input, Alert } from '../components/common';
import aiesecLogo from '../assets/AIESEClogo.png';
import { UserPlus, User, Lock, Mail } from 'lucide-react';

const Register = () => {
  // useState 1: formData -> champs mte3 l'inscription
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  // useState 2: localError -> validation mte3 les champs w confirmation mot de passe
  const [localError, setLocalError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  // useSelector: njibou loading w error mel authSlice
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

    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setLocalError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      const resultAction = await dispatch(registerUser({ name, email, password }));
      if (registerUser.fulfilled.match(resultAction)) {
        navigate('/dashboard');
      }
    } catch (err) {
      setLocalError('Registration failed. Please try again.');
    }
  };

  const displayError = localError || reduxError;

  return (
    <div className="app-container">
      <Navbar />
      <div className="auth-container bg-momentum-lines">
        <div className="auth-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
            <img src={aiesecLogo} alt="AIESEC" style={{ height: '24px', width: 'auto' }} />
            <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border)' }}></div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 800, color: 'var(--brand-dark)' }}>
              Finance Hub
            </span>
          </div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">
            Join AIESEC Finance Hub to manage event budgets
          </p>

          <Alert type="danger" message={displayError} onClose={() => setLocalError('')} />

          <form onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              name="name"
              type="text"
              placeholder="e.g. Nada Dridi"
              value={formData.name}
              onChange={handleChange}
              icon={User}
              required
              autoComplete="name"
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="name@aiesec.net"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              required
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              icon={Lock}
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={isSubmitting}
              icon={UserPlus}
              style={{ marginTop: '1rem' }}
            >
              Create Account
            </Button>
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: '1.75rem',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)'
            }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: 'var(--primary-blue)', fontWeight: 600 }}
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
