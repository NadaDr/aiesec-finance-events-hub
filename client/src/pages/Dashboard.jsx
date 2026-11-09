// client/src/pages/Dashboard.jsx
// Main Dashboard displaying dynamic financial KPIs, Recharts comparison, events overview, and recent transactions using Redux

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FinancialCard from '../components/FinancialCard';
import TransactionTable from '../components/TransactionTable';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Plus,
  Calendar,
  ArrowRight,
  BarChart2,
  CalendarDays
} from 'lucide-react';

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
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalRevenue: 0,
      totalExpenses: 0,
      netBalance: 0,
      totalEvents: 0
    },
    chartData: [],
    eventsOverview: [],
    recentTransactions: []
  });

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events/dashboard/stats');
      if (res.data.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const { stats, chartData, eventsOverview, recentTransactions } = dashboardData;

  return (
    <div className="auth-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />

        <div className="page-content">
          {/* Welcome Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">
                Welcome back, {user?.name || 'Event Manager'}
              </h1>
              <p className="page-subtitle">
                Here is the real-time financial situation of your AIESEC events.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/events" className="btn btn-primary">
                <Plus size={16} />
                <span>Manage Events</span>
              </Link>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Calculating live financial figures from MongoDB...</p>
            </div>
          ) : (
            <>
              {/* 4.1 Four Financial KPI Cards */}
              <div className="kpi-grid">
                <FinancialCard
                  title="Total Revenue"
                  value={stats.totalRevenue}
                  type="revenue"
                  subtitle="Across all registered events"
                />
                <FinancialCard
                  title="Total Expenses"
                  value={stats.totalExpenses}
                  type="expense"
                  subtitle="Total expenditures recorded"
                />
                <FinancialCard
                  title="Net Balance"
                  value={stats.netBalance}
                  type="balance"
                  subtitle={
                    stats.netBalance >= 0
                      ? 'Positive financial surplus'
                      : 'Financial deficit'
                  }
                />
                <FinancialCard
                  title="Total Events"
                  value={stats.totalEvents}
                  type="events"
                  isCurrency={false}
                  subtitle="Events being tracked"
                />
              </div>

              {/* 4.2 Financial Chart: Revenue vs Expenses across events using Recharts */}
              <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark-blue)' }}>
                      Revenue vs Expenses by Event
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Comparative financial performance across your events
                    </p>
                  </div>
                  <BarChart2 size={20} color="var(--primary-blue)" />
                </div>

                {chartData.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
                    <Calendar className="empty-state-icon" />
                    <p style={{ color: 'var(--text-secondary)' }}>
                      Create an event and record transactions to see comparative financial charts.
                    </p>
                  </div>
                ) : (
                  <div style={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          interval={0}
                        />
                        <YAxis
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          tickFormatter={(v) => `${v} TND`}
                        />
                        <Tooltip
                          formatter={(value) => [`${formatTND(value)}`, '']}
                          labelFormatter={(label, payload) => {
                            if (payload && payload[0] && payload[0].payload) {
                              return payload[0].payload.fullName;
                            }
                            return label;
                          }}
                          contentStyle={{
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Bar
                          dataKey="Revenue"
                          fill="#20B486"
                          name="Revenue"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="Expenses"
                          fill="#F06475"
                          name="Expenses"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* 4.3 Events Overview Section */}
              <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark-blue)' }}>
                      Events Overview
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Current financial standing and balance for each event
                    </p>
                  </div>
                  <Link to="/events" className="btn btn-secondary btn-sm">
                    <span>All Events</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                {eventsOverview.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem' }}>
                    <CalendarDays className="empty-state-icon" />
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      No events registered yet.
                    </p>
                    <Link to="/events" className="btn btn-primary btn-sm">
                      Create First Event
                    </Link>
                  </div>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Event Name</th>
                          <th>Dates</th>
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
                            <td style={{ fontWeight: 600 }}>{item.name}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>
                              {formatDate(item.startDate)} &mdash; {formatDate(item.endDate)}
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
                                      ? 'var(--color-revenue)'
                                      : 'var(--color-expense)'
                                }}
                              >
                                {item.netBalance >= 0 ? '+' : ''}
                                {formatTND(item.netBalance)}
                              </span>
                            </td>
                            <td>
                              {item.financialStatus === 'positive' && (
                                <span className="badge badge-positive">Positive balance</span>
                              )}
                              {item.financialStatus === 'negative' && (
                                <span className="badge badge-negative">Negative balance</span>
                              )}
                              {item.financialStatus === 'no_transactions' && (
                                <span className="badge badge-neutral">No transactions</span>
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <Link
                                to={`/events/${item._id}`}
                                className="btn btn-secondary btn-sm"
                              >
                                View
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
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark-blue)' }}>
                      Recent Transactions
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Latest financial entries recorded across your organization
                    </p>
                  </div>
                  <Link to="/transactions" className="btn btn-secondary btn-sm">
                    <span>View All Transactions</span>
                    <ArrowRight size={14} />
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
