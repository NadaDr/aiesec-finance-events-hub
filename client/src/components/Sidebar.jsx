// client/src/components/Sidebar.jsx
// Navigation sidebar for authenticated pages using AIESEC brand identity

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';

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
        <NavLink to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-dark)', letterSpacing: '-0.02em' }}>
            Finance <span style={{ color: 'var(--brand-primary)' }}>Hub</span>
          </span>
        </NavLink>
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
