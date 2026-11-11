// client/src/components/Sidebar.jsx
// ======================================================================================
// Fih el-Navigation menu mte3na: Dashboard, Events, Transactions, w Categories.
// fih esm el-user w bouton Logout bech yokhrej w yfasakh el-session.
// ======================================================================================

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';

import {
  LayoutDashboard,
  CalendarDays,
  Receipt,
  Tags,
  LogOut,
  ShieldCheck,
  TrendingUp,
  User as UserIcon
} from 'lucide-react';

const Sidebar = () => {
  // dispatch: bch naba3thou action el Redux (kima logout)
  const dispatch = useDispatch();
  // navigate: bch nbadlou el page w nhezzou l'utilisateur lel /login ba3d el-logout
  const navigate = useNavigate();

  // useSelector: njibou el user connecté mel Redux authSlice
  const { user } = useSelector((state) => state.auth);

  // Fonction Logout: tfasakh el-token mel localStorage w Redux w thezou lel /login
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* 1) HEADER EL-SIDEBAR: Brand Logo w Esm el-Plateforme */}
      <div className="sidebar-header">
        <NavLink to="/dashboard" className="sidebar-brand-link">
          <div className="sidebar-brand-badge">
            <TrendingUp size={18} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          <div className="sidebar-brand-text">
            <span className="brand-title">
              Finance <span className="brand-accent">Hub</span>
            </span>
            <span className="brand-subtitle">AIESEC PORTAL</span>
          </div>
        </NavLink>
      </div>

      {/* 2) MENU EL-NAVIGATION: El-Liens l-kol mte3 l'application */}
      <div className="sidebar-content">
        <div className="sidebar-section-label">MAIN NAVIGATION</div>
        <nav className="sidebar-menu">
          {/* Lien 1: Dashboard */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <LayoutDashboard size={18} className="sidebar-icon" />
            <span className="sidebar-link-text">Dashboard</span>
          </NavLink>

          {/* Lien 2: Events */}
          <NavLink
            to="/events"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <CalendarDays size={18} className="sidebar-icon" />
            <span className="sidebar-link-text">Events</span>
          </NavLink>

          {/* Lien 3: Transactions */}
          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Receipt size={18} className="sidebar-icon" />
            <span className="sidebar-link-text">Transactions</span>
          </NavLink>

          {/* Lien 4: Categories */}
          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Tags size={18} className="sidebar-icon" />
            <span className="sidebar-link-text">Categories</span>
          </NavLink>
        </nav>

        {/* 3) CARTE D'INFO LC (Local Committee Status Badge) */}
        <div className="sidebar-widget">
          <div className="sidebar-widget-header">
            <ShieldCheck size={15} color="var(--brand-primary)" />
            <span className="sidebar-widget-badge">LC TUNISIA</span>
          </div>
          <p className="sidebar-widget-text">
            Financial Health & Real-time Budget Audit Active
          </p>
        </div>
      </div>

      {/* 4) FOOTER EL-SIDEBAR (Dima lasseq fel 9a3): User Profile Card + Bouton Logout */}
      <div className="sidebar-footer">
        {/* User mini profile badge */}
        <div className="sidebar-user-card">
          <div className="sidebar-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={16} />}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name" title={user?.name || 'AIESEC Member'}>
              {user?.name || 'AIESEC Member'}
            </span>
            <span className="sidebar-user-role" title={user?.email || 'Finance Team'}>
              {user?.email || 'Finance Team'}
            </span>
          </div>
        </div>

        {/* Bouton Logout */}
        <button
          onClick={handleLogout}
          className="btn-logout"
          title="Sign out of Finance Hub"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
