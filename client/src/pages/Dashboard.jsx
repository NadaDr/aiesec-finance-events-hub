// client/src/pages/Dashboard.jsx
// Main Dashboard displaying dynamic financial KPIs, Chart.js comparison, events overview, and recent transactions using Redux

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboardStats } from '../redux/eventsSlice';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FinancialCard from '../components/FinancialCard';
import TransactionTable from '../components/TransactionTable';
import { Button, Alert, Spinner, Badge } from '../components/common';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  Plus,
  ArrowRight,
  BarChart3,
  CalendarDays,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Layers,
  Receipt,
  Tag
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const formatTND = (amount) => {
  const num = Number(amount) || 0;
  return (
    num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' TND'
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { dashboardData, loading, error } = useSelector((state) => state.events);

  const [chartView, setChartView] = useState('comparison'); // 'comparison' | 'net'

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const {
    stats = { totalRevenue: 0, totalExpenses: 0, netBalance: 0, totalEvents: 0 },
    chartData = [],
    eventsOverview = [],
    recentTransactions = []
  } = dashboardData || {};

  // Humanized contextual greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const todayDateFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Chart.js data configuration
  const chartLabels = chartData.map((item) => item.fullName || item.name);

  const comparisonChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Revenues (TND)',
        data: chartData.map((item) => item.Revenue || 0),
        backgroundColor: '#00C16E',
        hoverBackgroundColor: '#00A35C',
        borderRadius: 4,
        borderSkipped: false,
        barPercentage: 0.65,
        categoryPercentage: 0.6
      },
      {
        label: 'Expenses (TND)',
        data: chartData.map((item) => item.Expenses || 0),
        backgroundColor: '#F85A40',
        hoverBackgroundColor: '#E0472F',
        borderRadius: 4,
        borderSkipped: false,
        barPercentage: 0.65,
        categoryPercentage: 0.6
      }
    ]
  };

  const netBalanceChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Net Balance (TND)',
        data: chartData.map((item) => item.NetBalance || 0),
        backgroundColor: chartData.map((item) =>
          item.NetBalance >= 0 ? '#037EF3' : '#F85A40'
        ),
        hoverBackgroundColor: chartData.map((item) =>
          item.NetBalance >= 0 ? '#0266C8' : '#E0472F'
        ),
        borderRadius: 4,
        borderSkipped: false,
        barPercentage: 0.55
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'rect',
          boxWidth: 10,
          boxHeight: 10,
          font: {
            family: 'Inter, sans-serif',
            size: 12,
            weight: 600
          },
          color: '#172B4D',
          padding: 16
        }
      },
      tooltip: {
        backgroundColor: '#003B70',
        titleFont: {
          family: 'Manrope, sans-serif',
          size: 13,
          weight: 700
        },
        bodyFont: {
          family: 'Inter, sans-serif',
          size: 12
        },
        padding: 12,
        cornerRadius: 4,
        displayColors: true,
        boxPadding: 4,
        callbacks: {
          label: (context) => {
            const val = context.parsed.y || 0;
            return ` ${context.dataset.label}: ${val.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })} TND`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif',
            size: 11,
            weight: 500
          },
          color: '#64748B',
          maxRotation: 0,
          autoSkip: true
        }
      },
      y: {
        grid: {
          color: '#F1F5F9'
        },
        border: {
          dash: [4, 4]
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif',
            size: 11
          },
          color: '#64748B',
          callback: (value) => `${value.toLocaleString()} TND`
        }
      }
    }
  };

  return (
    <div className="auth-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />

        <div className="page-content">
          {/* Welcome Header with Humanized Time-Aware Greeting */}
          <div className="page-header" style={{ marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Local Committee Overview &bull; {todayDateFormatted}
                </span>
              </div>
              <h1 className="page-title" style={{ fontSize: '1.9rem' }}>
                {getGreeting()}, {user?.name || 'AIESEC Leader'} 👋
              </h1>
              <p className="page-subtitle">
                Here is the real-time financial health and transaction pulse across your AIESEC events.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              <Link to="/events" style={{ textDecoration: 'none' }}>
                <Button variant="primary" icon={Plus}>
                  New Event
                </Button>
              </Link>
              <Link to="/transactions" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" icon={Receipt}>
                  Log Transaction
                </Button>
              </Link>
            </div>
          </div>

          <Alert type="danger" message={error} />

          {/* Humanized Financial Health Pulse Banner */}
          <div
            className="card"
            style={{
              padding: '1.15rem 1.45rem',
              marginBottom: '1.75rem',
              borderLeft: `4px solid ${stats.netBalance >= 0 ? 'var(--revenue)' : 'var(--expense)'}`,
              backgroundColor: stats.netBalance >= 0 ? '#F4FBF8' : '#FEF5F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: stats.netBalance >= 0 ? 'var(--revenue-bg)' : 'var(--expense-bg)',
                  color: stats.netBalance >= 0 ? 'var(--revenue)' : 'var(--expense)'
                }}
              >
                {stats.netBalance >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              </div>
              <div>
                <strong style={{ fontSize: '0.95rem', color: 'var(--brand-dark)' }}>
                  {stats.netBalance >= 0
                    ? `Positive Financial Surplus: +${formatTND(stats.netBalance)}`
                    : `Budget Deficit Alert: ${formatTND(stats.netBalance)}`}
                </strong>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>
                  {stats.netBalance >= 0
                    ? `Your events have generated +${formatTND(stats.netBalance)} more in sponsorships and ticket revenues than total expenses. Operating margin is healthy.`
                    : `Expenditures currently exceed revenues by ${formatTND(Math.abs(stats.netBalance))}. Review open delegate tickets, pending partners, and logistics costs.`}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Badge variant={stats.netBalance >= 0 ? 'positive' : 'negative'}>
                {stats.netBalance >= 0 ? 'Healthy Balance' : 'Action Needed'}
              </Badge>
              <Link to="/transactions" style={{ textDecoration: 'none' }}>
                <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                  Details
                </Button>
              </Link>
            </div>
          </div>

          {loading && (!eventsOverview || eventsOverview.length === 0) ? (
            <Spinner text="Calculating live financial figures from MongoDB..." />
          ) : (
            <>
              {/* 4.1 Four Financial KPI Cards with Sharpened Edges */}
              <div className="kpi-grid">
                <FinancialCard
                  title="Total Revenue"
                  value={stats.totalRevenue}
                  type="revenue"
                  subtitle="Incoming sponsorships & fees"
                />
                <FinancialCard
                  title="Total Expenses"
                  value={stats.totalExpenses}
                  type="expense"
                  subtitle="Venue, marketing & logistics costs"
                />
                <FinancialCard
                  title="Net Balance"
                  value={stats.netBalance}
                  type="balance"
                  subtitle={
                    stats.netBalance >= 0
                      ? 'Positive financial reserve'
                      : 'Operating with budget deficit'
                  }
                />
                <FinancialCard
                  title="Total Events"
                  value={stats.totalEvents}
                  type="events"
                  isCurrency={false}
                  subtitle="Active initiatives tracked"
                />
              </div>

              {/* 4.2 Interactive Chart.js Section with Sharpened Edges & Brand Palette */}
              <div className="card" style={{ marginBottom: '2rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.25rem',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <BarChart3 size={18} color="var(--brand-primary)" />
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-dark)' }}>
                        Event Financial Breakdown (Chart.js)
                      </h3>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Live visual comparison of revenues, expenditures, and net surplus across your AIESEC events
                    </p>
                  </div>

                  {/* Toggle between Revenue/Expense comparison and Net Balance view */}
                  <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: 'var(--surface)', padding: '3px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                    <button
                      type="button"
                      onClick={() => setChartView('comparison')}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.785rem',
                        fontWeight: 600,
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        backgroundColor: chartView === 'comparison' ? '#FFFFFF' : 'transparent',
                        color: chartView === 'comparison' ? 'var(--brand-dark)' : 'var(--text-secondary)',
                        boxShadow: chartView === 'comparison' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Revenue vs Expenses
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartView('net')}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.785rem',
                        fontWeight: 600,
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        backgroundColor: chartView === 'net' ? '#FFFFFF' : 'transparent',
                        color: chartView === 'net' ? 'var(--brand-dark)' : 'var(--text-secondary)',
                        boxShadow: chartView === 'net' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Net Balance
                    </button>
                  </div>
                </div>

                {chartData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-secondary)' }}>
                    <p style={{ fontSize: '0.95rem' }}>No financial data to display on chart yet.</p>
                    <p style={{ fontSize: '0.825rem', marginTop: '0.25rem' }}>Create your first event or log a transaction to see live Chart.js visualizations.</p>
                    <Link to="/events" style={{ textDecoration: 'none', marginTop: '1rem', display: 'inline-block' }}>
                      <Button variant="outline-primary" size="sm" icon={Plus}>
                        Create an Event
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div style={{ width: '100%', height: 320, position: 'relative' }}>
                    <Bar
                      data={chartView === 'comparison' ? comparisonChartData : netBalanceChartData}
                      options={chartOptions}
                    />
                  </div>
                )}
              </div>

              {/* 4.3 Events Financial Overview Table */}
              <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-dark)' }}>
                      Events Financial Status
                    </h3>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      Individual event budgets and live operating balances
                    </p>
                  </div>
                  <Link to="/events" style={{ textDecoration: 'none' }}>
                    <Button variant="secondary" size="sm" icon={ArrowRight} iconPosition="right">
                      View All Events
                    </Button>
                  </Link>
                </div>

                {eventsOverview.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2.5rem 1.5rem' }}>
                    <CalendarDays className="empty-state-icon" />
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                      No events registered yet in your database.
                    </p>
                    <Link to="/events" style={{ textDecoration: 'none' }}>
                      <Button variant="primary" size="sm" icon={Plus}>
                        Create First Event
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Event Name</th>
                          <th>Dates</th>
                          <th>Allocated Budget</th>
                          <th>Total Revenue</th>
                          <th>Total Expenses</th>
                          <th>Net Balance</th>
                          <th>Financial Status</th>
                          <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eventsOverview.map((item) => (
                          <tr key={item._id}>
                            <td style={{ fontWeight: 600, color: 'var(--brand-dark)' }}>{item.name}</td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                              {formatDate(item.startDate)} &mdash; {formatDate(item.endDate)}
                            </td>
                            <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {formatTND(item.budget)}
                            </td>
                            <td className="amount-revenue">
                              +{formatTND(item.totalRevenue)}
                            </td>
                            <td className="amount-expense">
                              -{formatTND(item.totalExpenses)}
                            </td>
                            <td>
                              <span
                                style={{
                                  fontWeight: 700,
                                  color:
                                    item.netBalance >= 0
                                      ? 'var(--revenue)'
                                      : 'var(--expense)'
                                }}
                              >
                                {item.netBalance >= 0 ? '+' : ''}
                                {formatTND(item.netBalance)}
                              </span>
                            </td>
                            <td>
                              {item.financialStatus === 'positive' && (
                                <Badge variant="positive">Positive balance</Badge>
                              )}
                              {item.financialStatus === 'negative' && (
                                <Badge variant="negative">Negative balance</Badge>
                              )}
                              {item.financialStatus === 'no_transactions' && (
                                <Badge variant="neutral">No transactions</Badge>
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <Link to={`/events/${item._id}`} style={{ textDecoration: 'none' }}>
                                <Button variant="secondary" size="sm">
                                  View
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 4.4 Recent Transactions Section */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-dark)' }}>
                      Recent Financial Activity
                    </h3>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      Latest revenues and expenses recorded across all Local Committee events
                    </p>
                  </div>
                  <Link to="/transactions" style={{ textDecoration: 'none' }}>
                    <Button variant="secondary" size="sm" icon={ArrowRight} iconPosition="right">
                      View All Transactions
                    </Button>
                  </Link>
                </div>

                <TransactionTable
                  transactions={recentTransactions}
                  showEventColumn={true}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
