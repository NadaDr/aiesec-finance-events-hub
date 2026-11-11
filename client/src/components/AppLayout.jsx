// client/src/components/AppLayout.jsx
// ======================================================================================
// El "coquille" mta3 l'espace connecté : Sidebar 3al ysar + Navbar lfou9 + el page
// el active (<Outlet />). Kol page privée ma 3adech t7ott Sidebar/Navbar wa7adha.
// ======================================================================================

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const AppLayout = () => (
  <div className="auth-layout">
    <Sidebar />
    <div className="main-content">
      <Navbar />
      <Outlet />
    </div>
  </div>
);

export default AppLayout;
