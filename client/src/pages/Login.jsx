// client/src/pages/Login.jsx
// ======================================================================================
// 📌 LOGIN PAGE (Belfala9i Tounsi)
// ======================================================================================
// Hathi el-Page mte3 el-Connexion (Login) lel Finance Hub:
// 1) useState (formData): yched l'email wel password eli ktebhom l-utilisateur.
// 2) useDispatch: naba3thou l-action `loginUser(formData)` lel authSlice fel Redux.
// 3) useSelector: njibou l-loading wel error ken el mot de passe ghalet.
// 4) navigate('/dashboard'): wa9t el login yenja7, nhezzou l-user directement lel Dashboard.
// ======================================================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/authSlice';
import Navbar from '../components/Navbar';
import { Button, Input, Alert } from '../components/common';
import aiesecLogo from '../assets/AIESEClogo.png';
import { LogIn, Lock, Mail } from 'lucide-react';

const Login = () => {
  // useState 1: formData -> les champs email w password
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  // useState 2: localError -> ken l'utilisateur ma 3abbech les champs
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
      <div className="auth-container bg-momentum-lines">
        <div className="auth-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
            <img src={aiesecLogo} alt="AIESEC" style={{ height: '24px', width: 'auto' }} />
            <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border)' }}></div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 800, color: 'var(--brand-dark)' }}>
              Finance Hub
            </span>
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">
            Sign in to manage your AIESEC event finances
          </p>

          <Alert type="danger" message={displayError} onClose={() => setLocalError('')} />

          <form onSubmit={handleSubmit}>
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
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={isSubmitting}
              icon={LogIn}
              style={{ marginTop: '1rem' }}
            >
              Login
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
