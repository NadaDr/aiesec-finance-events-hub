// client/src/components/ProtectedRoute.jsx
// Garde de route (layout route) : ken ma famma 7atta session -> /login,
// w nfakkrou el page eli kan 7ab ya3melha bech nraj3ouh liha ba3d el connexion.
// Ki session tofa (401), l'intercepteur Axios yfasa5ha w hadha yhezzou lel /login wa7dou.

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
