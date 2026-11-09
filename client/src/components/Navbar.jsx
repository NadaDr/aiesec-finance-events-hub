// client/src/components/Navbar.jsx
// Main navigation bar for public visitors and authenticated members using Redux

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { Search, LogIn, UserPlus, LogOut, Menu, X, Landmark, Calendar } from 'lucide-react';

const Navbar = ({ onSearchChange, searchTerm = '' }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="navbar">
      {/* Brand & Logo */}
      <Link to={isAuthenticated ? "/dashboard" : "/"} className="navbar-brand">
        <div className="navbar-logo">
          <Landmark size={20} />
        </div>
        <span>AIESEC Finance Hub</span>
      </Link>

      {/* Search Input for Events */}
      <form onSubmit={handleSearchSubmit} className="navbar-search">
        <Search className="search-icon" size={16} />
        <input
          type="text"
          placeholder="Search events by name or location..."
          value={searchTerm}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
        />
      </form>

      {/* Navigation Actions */}
      <div className="navbar-actions">
        {isAuthenticated ? (
          <>
            <div className="user-badge" title={user?.email}>
              <div className="avatar-circle">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'Member'}
              </span>
            </div>
            <Link to="/events" className="btn btn-secondary btn-sm" style={{ display: 'none', md: 'inline-flex' }}>
              <Calendar size={14} />
              Events
            </Link>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Log Out">
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary btn-sm">
              <LogIn size={15} />
              <span>Login</span>
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              <UserPlus size={15} />
              <span>Get Started</span>
            </Link>
          </>
        )}

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="btn btn-secondary btn-sm"
          style={{ display: 'none' }}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
