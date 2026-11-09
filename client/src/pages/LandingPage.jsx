// client/src/pages/LandingPage.jsx
// Exact landing page matching the AIESEC Finance Hub reference design

import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import heroComposition from '../assets/hero-composition.png';
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  BarChart3,
  CalendarCheck,
  ShieldCheck,
  Coins,
  Sparkles,
  PieChart,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="landing-wrapper">
      {/* Header matching reference mockup */}
      <Navbar />

      <main>
        {/* ============================================================
            HERO SECTION: 100% Exact Match to Reference Design
            ============================================================ */}
        <section className="exact-hero-section">
          <div className="exact-hero-container">
            {/* Left Column: Headlines & CTA */}
            <div className="exact-hero-left">
              <h1 className="exact-hero-headline">
                Track Your Events’<br />
                Finances with<br />
                <span className="exact-hero-accent">
                  AIESEC Finance Hub
                  <svg
                    className="exact-hero-underline"
                    viewBox="0 0 340 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M 6 13 C 85 24, 225 24, 334 11"
                      stroke="#037EF3"
                      strokeWidth="6.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              <p className="exact-hero-subtitle">
                Monitor revenues and expenses for every event, and keep your organization on track.
              </p>

              <div className="exact-hero-cta">
                <Link
                  to={isAuthenticated ? "/dashboard" : "/register"}
                  className="exact-btn-get-started"
                >
                  <span>{isAuthenticated ? "Go to Dashboard" : "Get Started"}</span>
                  <span className="exact-arrow">→</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Visual Artwork (Tilted Photo + Blobs + Floating Cards) */}
            <div className="exact-hero-right">
              <div className="exact-visual-wrapper">
                <img
                  src={heroComposition}
                  alt="AIESEC event finances tracking illustration"
                  className="exact-hero-img"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            LIVE DEMO STATS STRIP
            ============================================================ */}
        <section className="stats-strip-section">
          <div className="stats-strip-container">
            <div className="stat-item">
              <span className="stat-label">Organized Events</span>
              <strong className="stat-number">3 Events</strong>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-label">Total Revenues</span>
              <strong className="stat-number text-revenue">+20,000 TND</strong>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-label">Total Expenses</span>
              <strong className="stat-number text-expense">-14,000 TND</strong>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-label">Net Surplus</span>
              <strong className="stat-number text-primary">+6,000 TND</strong>
            </div>
          </div>
        </section>

        {/* ============================================================
            CORE CAPABILITIES / FEATURES
            ============================================================ */}
        <section className="features-section">
          <div className="features-container">
            <div className="section-header-center">
              <span className="section-kicker">Built for Event Managers</span>
              <h2 className="section-heading">Financial Clarity for Every AIESEC Initiative</h2>
              <p className="section-description">
                Replace scattered spreadsheets with a single, structured source of truth designed for Local Committee leaders and event teams.
              </p>
            </div>

            <div className="features-grid">
              {/* Feature 1 */}
              <div className="feature-card">
                <div className="feature-icon-box bg-blue-subtle">
                  <CalendarCheck size={26} color="var(--brand-primary)" />
                </div>
                <h3 className="feature-title">Event-Centric Tracking</h3>
                <p className="feature-text">
                  Create and organize individual financial records for Global Village, Career Fairs, YouthSpeak Forums, and Leadership Conferences.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="feature-card">
                <div className="feature-icon-box bg-green-subtle">
                  <TrendingUp size={26} color="var(--revenue)" />
                </div>
                <h3 className="feature-title">Revenues & Sponsorships</h3>
                <p className="feature-text">
                  Record incoming funds by category — ticket sales, partner sponsorships, delegate registration fees, and corporate donations.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="feature-card">
                <div className="feature-icon-box bg-coral-subtle">
                  <TrendingDown size={26} color="var(--expense)" />
                </div>
                <h3 className="feature-title">Expenses & Budget Control</h3>
                <p className="feature-text">
                  Log outgoing costs like venue rental, catering, transportation, and marketing to ensure events stay strictly within budget.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="feature-card">
                <div className="feature-icon-box bg-navy-subtle">
                  <BarChart3 size={26} color="var(--brand-dark)" />
                </div>
                <h3 className="feature-title">Visual Analytics & KPIs</h3>
                <p className="feature-text">
                  Instant visual feedback with interactive Recharts bar charts, category breakdowns, and net surplus/deficit indicators.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            FEATURED DEMO EVENTS SHOWCASE
            ============================================================ */}
        <section className="demo-events-section">
          <div className="demo-events-container">
            <div className="section-header-split">
              <div>
                <span className="section-kicker">Live Demonstration</span>
                <h2 className="section-heading">Pre-Seeded Academic Events</h2>
              </div>
              <Link to="/events" className="btn btn-secondary">
                <span>View All Events</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="demo-cards-grid">
              {/* Event 1 */}
              <div className="demo-event-card">
                <div className="demo-event-badge revenue-badge">Net Surplus +4,000 TND</div>
                <h4 className="demo-event-title">Global Village 2026</h4>
                <p className="demo-event-loc">Sousse, Tunisia &bull; Cultural Festival</p>
                <div className="demo-metrics">
                  <div>
                    <span className="demo-metric-label">Budget</span>
                    <strong>5,000 TND</strong>
                  </div>
                  <div>
                    <span className="demo-metric-label">Revenues</span>
                    <strong className="text-revenue">+6,000 TND</strong>
                  </div>
                  <div>
                    <span className="demo-metric-label">Expenses</span>
                    <strong className="text-expense">-2,000 TND</strong>
                  </div>
                </div>
              </div>

              {/* Event 2 */}
              <div className="demo-event-card">
                <div className="demo-event-badge revenue-badge">Net Surplus +2,500 TND</div>
                <h4 className="demo-event-title">Career Fair 2026</h4>
                <p className="demo-event-loc">Tunis, Tunisia &bull; Corporate Networking</p>
                <div className="demo-metrics">
                  <div>
                    <span className="demo-metric-label">Budget</span>
                    <strong>4,000 TND</strong>
                  </div>
                  <div>
                    <span className="demo-metric-label">Revenues</span>
                    <strong className="text-revenue">+6,000 TND</strong>
                  </div>
                  <div>
                    <span className="demo-metric-label">Expenses</span>
                    <strong className="text-expense">-3,500 TND</strong>
                  </div>
                </div>
              </div>

              {/* Event 3 */}
              <div className="demo-event-card">
                <div className="demo-event-badge deficit-badge">Budget Deficit -500 TND</div>
                <h4 className="demo-event-title">Leadership Conference 2026</h4>
                <p className="demo-event-loc">Hammamet, Tunisia &bull; National Summit</p>
                <div className="demo-metrics">
                  <div>
                    <span className="demo-metric-label">Budget</span>
                    <strong>8,000 TND</strong>
                  </div>
                  <div>
                    <span className="demo-metric-label">Revenues</span>
                    <strong className="text-revenue">+8,000 TND</strong>
                  </div>
                  <div>
                    <span className="demo-metric-label">Expenses</span>
                    <strong className="text-expense">-8,500 TND</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Evaluation Callout Box */}
            <div className="eval-callout-box">
              <div className="eval-callout-icon">
                <ShieldCheck size={28} color="var(--brand-primary)" />
              </div>
              <div className="eval-callout-content">
                <h4>Academic Evaluation & Demo Credentials</h4>
                <p>
                  You can explore with our preloaded account: <strong>demo@aiesec.net</strong> (password: <strong>password123</strong> or <strong>password12</strong>), or create a fresh account anytime.
                </p>
              </div>
              <Link to="/login" className="btn btn-primary">
                Quick Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================================
            BOTTOM CALL TO ACTION
            ============================================================ */}
        <section className="bottom-cta-section">
          <div className="bottom-cta-card">
            <h2>Ready to Elevate Your Event Financial Management?</h2>
            <p>
              Join AIESEC event leaders who maintain transparency, accountability, and financial sustainability.
            </p>
            <div className="bottom-cta-actions">
              <Link
                to={isAuthenticated ? "/dashboard" : "/register"}
                className="exact-btn-get-started"
              >
                <span>{isAuthenticated ? "Open Dashboard" : "Get Started Now"}</span>
                <span className="exact-arrow">→</span>
              </Link>
              {!isAuthenticated && (
                <Link to="/login" className="btn btn-secondary btn-lg" style={{ backgroundColor: '#fff' }}>
                  Sign In to Account
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="ref-footer">
        <div className="ref-footer-container">
          <div className="ref-footer-top">
            <div>
              <div className="ref-footer-brand">AIESEC Finance Hub</div>
              <p className="ref-footer-tagline">
                Empowering youth leadership through disciplined, transparent financial management.
              </p>
            </div>
            <div className="ref-footer-links">
              <Link to="/events">Events</Link>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/categories">Categories</Link>
              <Link to="/login">Sign In</Link>
            </div>
          </div>
          <div className="ref-footer-bottom">
            <span>&copy; {new Date().getFullYear()} AIESEC Finance Hub. Academic Project — MERN Stack.</span>
            <span>Technology: MongoDB Atlas &bull; Express &bull; React 18 &bull; Redux Toolkit &bull; Node.js</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
