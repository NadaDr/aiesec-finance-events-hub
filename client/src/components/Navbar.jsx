// client/src/components/Navbar.jsx
// ======================================================================================
// Hatha el-Navbar el-faw9ani (Header) el-thabet mte3 l'application:
// 1) 3al issar: Logo officiel mte3 AIESEC en bleu.
// 2) 3al ymin: L'Avatar mte3 el-User (awwel 7arf men esmou) fih Dropdown menu lel Profile w Logout.
// 3) Bouton Hamburger Menu: y7el Drawer 3al ymin fel mobile w responsive.
// 4) Sticky Header: yo93ed lasseq mel fou9 wa9t el user yscrolly el page louta.
// ======================================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import aiesecBlueLogo from '../assets/AIESEClogo-blue.png';
import {
  User as UserIcon,
  Menu,
  X,
  LayoutDashboard,
  Calendar,
  Tag,
  ArrowRight,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';

const Navbar = () => {
  // useSelector: njibou el user w status mte3 l'authentification mel Redux
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // useState 1: drawerOpen -> bech n7ellou w nsakkrou el drawer fel mobile (true/false)
  const [drawerOpen, setDrawerOpen] = useState(false);
  // useState 2: profileDropdownOpen -> y7el w ysakker el dropdown mte3 el profile sous l'avatar
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // useRef: bech ncapturiw el clics lbara mel dropdown w drawer bech yetsakkrou automatiquement
  const profileRef = useRef(null);
  const drawerRef = useRef(null);

  // useEffect: yrakkez EventListener lel click-outside w touche Escape mte3 el clavier
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (drawerOpen && drawerRef.current && !drawerRef.current.contains(event.target) && !event.target.closest('.nav-menu-btn')) {
        setDrawerOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawerOpen]);

  // Fonction Logout: tdeconnecti el user w trajj3ou lel Home page
  const handleLogout = () => {
    dispatch(logout());
    setProfileDropdownOpen(false);
    setDrawerOpen(false);
    navigate('/');
  };

  return (
    <>
      <header className="ref-navbar">
        <div className="ref-navbar-container">
          {/* Left: Official Blue AIESEC Logo */}
          <div className="ref-nav-left">
            <Link to="/" className="ref-logo-link" title="AIESEC Finance Hub">
              <img
                src={aiesecBlueLogo}
                alt="AIESEC"
                className="ref-aiesec-logo"
              />
            </Link>
          </div>

          {/* Right: User Avatar Circle + Hamburger Button */}
          <div className="ref-nav-right">
            {/* User Profile Avatar Button */}
            <div className="ref-profile-container" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className={`ref-user-btn ${profileDropdownOpen ? 'active' : ''}`}
                title={isAuthenticated ? user?.name || user?.email : 'Account'}
                aria-label="User Account Menu"
              >
                {isAuthenticated && user?.name ? (
                  <span className="ref-user-initial">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <UserIcon size={19} className="ref-user-icon" />
                )}
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="ref-dropdown-menu">
                  {isAuthenticated ? (
                    <>
                      <div className="ref-dropdown-header">
                        <div className="ref-dropdown-name">{user?.name || 'AIESEC Member'}</div>
                        <div className="ref-dropdown-email">{user?.email}</div>
                        <span className="ref-dropdown-badge">Local Committee Member</span>
                      </div>
                      <div className="ref-dropdown-divider"></div>
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="ref-dropdown-item"
                      >
                        <LayoutDashboard size={16} />
                        <span>Financial Dashboard</span>
                      </Link>
                      <Link
                        to="/events"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="ref-dropdown-item"
                      >
                        <Calendar size={16} />
                        <span>All Events</span>
                      </Link>
                      <Link
                        to="/categories"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="ref-dropdown-item"
                      >
                        <Tag size={16} />
                        <span>Manage Categories</span>
                      </Link>
                      <div className="ref-dropdown-divider"></div>
                      <button
                        onClick={handleLogout}
                        className="ref-dropdown-item text-danger"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="ref-dropdown-header">
                        <div className="ref-dropdown-name">Welcome to Finance Hub</div>
                        <div className="ref-dropdown-email">Sign in to manage event finances</div>
                      </div>
                      <div className="ref-dropdown-divider"></div>
                      <Link
                        to="/login"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="ref-dropdown-item"
                      >
                        <LogIn size={16} />
                        <span>Sign In</span>
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="ref-dropdown-item font-semibold"
                        style={{ color: 'var(--brand-primary)' }}
                      >
                        <UserPlus size={16} />
                        <span>Create Account</span>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="ref-menu-btn nav-menu-btn"
              title="Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Navigation Drawer */}
      {drawerOpen && (
        <div className="ref-drawer-overlay">
          <aside className="ref-drawer" ref={drawerRef}>
            <div className="ref-drawer-header">
              <img
                src={aiesecBlueLogo}
                alt="AIESEC"
                className="ref-drawer-logo"
              />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="ref-drawer-close"
                aria-label="Close Menu"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="ref-drawer-nav">
              <Link
                to="/"
                onClick={() => setDrawerOpen(false)}
                className="ref-drawer-link"
              >
                Home
              </Link>
              <Link
                to="/events"
                onClick={() => setDrawerOpen(false)}
                className="ref-drawer-link"
              >
                Events
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setDrawerOpen(false)}
                className="ref-drawer-link"
              >
                Financial Dashboard
              </Link>
              <Link
                to="/categories"
                onClick={() => setDrawerOpen(false)}
                className="ref-drawer-link"
              >
                Categories
              </Link>
            </nav>

            <div className="ref-drawer-footer">
              {isAuthenticated ? (
                <div>
                  <div className="ref-drawer-user-info">
                    <div className="ref-drawer-user-avatar">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="ref-drawer-user-name">{user?.name}</div>
                      <div className="ref-drawer-user-email">{user?.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary w-full"
                    style={{ marginTop: '1rem', justifyContent: 'center' }}
                  >
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Link
                    to="/register"
                    onClick={() => setDrawerOpen(false)}
                    className="btn btn-primary w-full"
                    style={{ justifyContent: 'center' }}
                  >
                    <span>Get Started</span>
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setDrawerOpen(false)}
                    className="btn btn-secondary w-full"
                    style={{ justifyContent: 'center' }}
                  >
                    <span>Sign In</span>
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default Navbar;
