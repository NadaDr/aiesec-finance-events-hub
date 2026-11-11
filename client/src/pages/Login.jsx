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

import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError, clearSessionMessage } from '../redux/authSlice';
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
  const location = useLocation();
  // El page eli 7ab ya3melha 9bal ma ProtectedRoute yhezzou lel /login
  const from = location.state?.from?.pathname || '/dashboard';
  // useSelector: njibou loading, error w sessionMessage mel authSlice
  const {
    loading: isSubmitting,
    error: reduxError,
    sessionMessage,
    isAuthenticated
  } = useSelector((state) => state.auth);

  // Nna7iw erreur 9dima (mathalan men page Register) wa9t nod5lou
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

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
        navigate(from, { replace: true });
      }
    } catch (err) {
      setLocalError('Invalid email or password.');
    }
  };

  const displayError = localError || reduxError;

  // Deja connecté : ma fammech 3lech naffichiw el formulaire
  if (isAuthenticated && !isSubmitting) {
    return <Navigate to={from} replace />;
  }

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

          {sessionMessage && !displayError && (
            <Alert
              type="warning"
              message={sessionMessage}
              onClose={() => dispatch(clearSessionMessage())}
            />
          )}

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
              style={{ color: 'var(--brand-primary)', fontWeight: 600 }}
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
