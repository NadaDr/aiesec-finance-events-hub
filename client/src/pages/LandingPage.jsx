// client/src/pages/LandingPage.jsx
// Modern and spacious landing page inspired by AIESEC's visual identity using Redux

import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ShieldCheck,
  CalendarCheck,
  Coins
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="app-container">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="landing-hero">
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.85rem',
                backgroundColor: 'rgba(0, 119, 255, 0.08)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--primary-blue)',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '1.25rem'
              }}
            >
              <Coins size={15} />
              <span>AIESEC Event Financial Management</span>
            </div>

            <h1 className="hero-headline">
              Manage Your Events. <br />
              <span style={{ color: 'var(--primary-blue)' }}>Understand Your Finances.</span>
            </h1>

            <p className="hero-subtitle">
              Track revenues and expenses for every AIESEC event and keep your organization financially on track.
            </p>

            <div className="hero-cta-group">
              <Link
                to={isAuthenticated ? "/dashboard" : "/register"}
                className="btn btn-primary btn-lg"
              >
                <span>{isAuthenticated ? "Go to Dashboard" : "Get Started"}</span>
                <ArrowRight size={18} />
              </Link>
              {!isAuthenticated && (
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Visual Showcase with floating KPI cards */}
          <div className="hero-visual-card">
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Event Financial Overview
              </div>
              <h3 style={{ fontSize: '1.65rem', fontWeight: 800 }}>
                Global Village 2026
              </h3>
              <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>
                Sousse, Tunisia &bull; Budget: 5,000.00 TND
              </p>
            </div>

            {/* Floating Card 1: Revenue */}
            <div className="floating-kpi-card revenue">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Revenue</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-revenue)' }}>
                    +6,000.00 TND
                  </div>
                </div>
                <div style={{ color: 'var(--color-revenue)' }}>
                  <TrendingUp size={24} />
                </div>
              </div>
            </div>

            {/* Floating Card 2: Expenses */}
            <div className="floating-kpi-card expense">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Expenses</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-expense)' }}>
                    -2,000.00 TND
                  </div>
                </div>
                <div style={{ color: 'var(--color-expense)' }}>
                  <TrendingDown size={24} />
                </div>
              </div>
            </div>

            {/* Floating Card 3: Net Balance */}
            <div className="floating-kpi-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Net Balance</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--dark-blue)' }}>
                    +4,000.00 TND
                  </div>
                </div>
                <div style={{ color: 'var(--primary-blue)' }}>
                  <BarChart3 size={24} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section style={{ backgroundColor: '#fff', borderTop: '1px solid var(--color-border)', padding: '4rem 2rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark-blue)', marginBottom: '2.5rem' }}>
              Built specifically for AIESEC Event & Finance Teams
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              <div className="card">
                <div style={{ color: 'var(--primary-blue)', marginBottom: '1rem' }}>
                  <CalendarCheck size={32} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Event Financial Tracking
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Organize Career Fairs, Global Villages, Conferences and campaigns with dedicated budgets and real-time balances.
                </p>
              </div>

              <div className="card">
                <div style={{ color: 'var(--color-revenue)', marginBottom: '1rem' }}>
                  <Coins size={32} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Categorized Transactions
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Record sponsorships, ticket sales, venue rentals, catering and equipment with clean revenue & expense categorization.
                </p>
              </div>

              <div className="card">
                <div style={{ color: 'var(--dark-blue)', marginBottom: '1rem' }}>
                  <ShieldCheck size={32} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Dynamic SaaS Analytics
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Visualize performance with Recharts comparisons and ensure no transaction is ever lost or left unaccounted for.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--bg-light)', borderTop: '1px solid var(--color-border)', padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        <p>&copy; {new Date().getFullYear()} AIESEC Finance Hub &mdash; Academic MERN Stack Project.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
