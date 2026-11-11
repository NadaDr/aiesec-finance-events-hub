// client/src/App.jsx
// Table de routage :
//   /, /login, /register              -> pages publiques
//   /dashboard, /events, /events/:id,
//   /transactions, /categories        -> protégées (ProtectedRoute) + layout commun (AppLayout)

import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './redux/authSlice';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';

function App() {
  const dispatch = useDispatch();
  const hasToken = useSelector((state) => !!state.auth.token);

  // Awwel ma yet7all el site : nthabtou el token el msajjel mazel valable
  useEffect(() => {
    if (hasToken) dispatch(checkAuth());
    // Marra wa7da barka fel démarrage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes : garde + layout mchtarek (Sidebar + Navbar) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/categories" element={<Categories />} />
        </Route>
      </Route>

      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
