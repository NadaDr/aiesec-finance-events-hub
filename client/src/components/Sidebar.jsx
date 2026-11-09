// client/src/components/Sidebar.jsx
// Navigation sidebar for authenticated pages using AIESEC brand identity

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import aiesecLogo from '../assets/AIESEClogo.png';
import {
  LayoutDashboard,
  CalendarDays,
  Receipt,
  Tags,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={aiesecLogo}
            alt="AIESEC"
            style={{ height: '24px', width: 'auto', objectFit: 'contain' }}
          />
          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border)' }}></div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 800, color: 'var(--brand-dark)', lineHeight: 1.1 }}>
              Finance Hub
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Portal
            </div>
          </div>
        </div>
      </div>

      <nav className="sidebar-menu">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/events"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <CalendarDays size={18} />
          <span>Events</span>
        </NavLink>

        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <Receipt size={18} />
          <span>Transactions</span>
        </NavLink>

        <NavLink
          to="/categories"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <Tags size={18} />
          <span>Categories</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="btn-logout">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
