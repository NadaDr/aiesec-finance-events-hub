// client/src/pages/LandingPage.jsx
// Modern, spacious landing page implementing AIESEC's "Energetic Professionalism" brand identity

import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import aiesecLogo from '../assets/AIESEClogo.png';
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  BarChart3,
  CalendarCheck,
  ShieldCheck,
  Coins,
  Sparkles
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="app-container bg-momentum-lines">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="landing-hero">
          <div>
            <div className="hero-tag">
              <Sparkles size={15} />
              <span>AIESEC Event Financial Management</span>
            </div>

            <h1 className="hero-headline">
              Make Every <br />
              <span style={{ color: 'var(--brand-primary)' }}>Event Count.</span>
            </h1>

            <p className="hero-subtitle">
              One place to track event revenues, manage expenses, and understand the financial impact of everything AIESEC organizes.
            </p>

            <div className="hero-cta-group">
              <Link
                to={isAuthenticated ? "/dashboard" : "/register"}
                className="btn btn-primary btn-lg"
              >
                <span>{isAuthenticated ? "Go to Dashboard" : "Get Started"}</span>
                <ArrowRight size={18} />
              </Link>
              {!isAuthenticated ? (
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Sign In
                </Link>
              ) : (
                <Link to="/events" className="btn btn-secondary btn-lg">
                  Explore Events
                </Link>
              )}
            </div>
          </div>

          {/* Visual Showcase Card with official AIESEC logo and Floating Financial Cards */}
          <div className="hero-visual-card">
            <div className="hero-visual-bg-pattern"></div>

            <div style={{ position: 'relative', zIndex: 1, marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  Event Financial Overview
                </span>
                <div style={{ backgroundColor: '#fff', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
                  <img
                    src={aiesecLogo}
                    alt="AIESEC"
                    style={{ height: '16px', width: 'auto', display: 'block' }}
                  />
                </div>
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
                Global Village 2026
              </h3>
              <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>
                Sousse, Tunisia &bull; Allocated Budget: <strong>5,000.00 TND</strong>
              </p>
            </div>

            {/* Floating Card 1: Revenue */}
            <div className="floating-kpi-card revenue" style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    Total Revenue
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--revenue)' }}>
                    +6,000.00 TND
                  </div>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--revenue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--revenue)' }}>
                  <TrendingUp size={22} />
                </div>
              </div>
            </div>

            {/* Floating Card 2: Expenses */}
            <div className="floating-kpi-card expense" style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    Total Expenses
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--expense)' }}>
                    -2,000.00 TND
                  </div>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--expense-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--expense)' }}>
                  <TrendingDown size={22} />
                </div>
              </div>
            </div>

            {/* Floating Card 3: Net Balance */}
            <div className="floating-kpi-card" style={{ position: 'relative', zIndex: 1, marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    Net Surplus Balance
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-dark)' }}>
                    +4,000.00 TND
                  </div>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(3, 126, 243, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
                  <BarChart3 size={22} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section style={{ backgroundColor: 'var(--background)', borderTop: '1px solid var(--border)', padding: '4.5rem 2.5rem' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Energetic Professionalism
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-dark)', marginTop: '0.35rem' }}>
                Built specifically for AIESEC Event & Finance Teams
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              <div className="card">
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--brand-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <CalendarCheck size={26} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Event Financial Tracking
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                  Organize Career Fairs, Global Villages, Conferences, and campaigns with dedicated budgets and real-time balances.
                </p>
              </div>

              <div className="card">
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--revenue-bg)', color: 'var(--revenue)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <Coins size={26} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Categorized Transactions
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                  Record sponsorships, ticket sales, venue rentals, catering, and equipment with clean revenue & expense streams.
                </p>
              </div>

              <div className="card">
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(0, 59, 112, 0.08)', color: 'var(--brand-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <ShieldCheck size={26} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Dynamic SaaS Analytics
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                  Visualize performance with Recharts comparisons and ensure no transaction is ever lost or left unaccounted for.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '2.5rem 2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <img
            src={aiesecLogo}
            alt="AIESEC"
            style={{ height: '20px', width: 'auto' }}
          />
          <span style={{ fontWeight: 700, color: 'var(--brand-dark)' }}>Finance Hub</span>
        </div>
        <p>&copy; {new Date().getFullYear()} AIESEC Finance Hub &mdash; Empowering events. Making every contribution count.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
