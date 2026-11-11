// client/src/pages/Dashboard.jsx
// ======================================================================================
// 📌 DASHBOARD PAGE
// ======================================================================================
// Hathi el-Page principale (Tableau de bord) mte3 el-Finance Hub:
// 1) useSelector: njibou el-user connecté w les données financières mel Redux (eventsSlice).
// 2) useEffect: naba3thou `fetchDashboardStats()` lel backend `/api/events/dashboard/stats`.
// 3) Résumé "humain" : ychouf chnowa el moshkla el 7a9i9iya (event fet el budget,
//    event khaser) w y9oulha b-jomla wadh7a, mouch texte générique.
// 4) Cartes KPI b-tendance (had el chhar vs eli fet) w graphe Chart.js.
// ======================================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboardStats } from '../redux/eventsSlice';
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
import { Plus, ArrowRight, CalendarDays, TrendingUp, TrendingDown, AlertTriangle, Receipt } from 'lucide-react';
import {
  formatTND,
  formatSignedTND,
  formatCompactTND,
  formatWholeTND,
  formatDateRange,
  budgetUsage
} from '../utils/format';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Alwen el graphe = nafs les tokens CSS (--revenue, --expense, --brand-primary)
const COLORS = {
  revenue: '#20B486',
  revenueHover: '#1A9A72',
  expense: '#F06475',
  expenseHover: '#D94F61',
  brand: '#037EF3',
  brandHover: '#0266C8',
  text: '#172B4D',
  muted: '#66758A',
  grid: '#EEF2F6'
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

const buildInsight = (stats, eventsOverview) => {
  const overBudget = eventsOverview
    .filter((e) => e.budget > 0 && e.totalExpenses > e.budget)
    .sort((a, b) => b.totalExpenses - b.budget - (a.totalExpenses - a.budget));
  const losing = eventsOverview
    .filter((e) => e.netBalance < 0)
    .sort((a, b) => a.netBalance - b.netBalance);

  const ahead = stats.netBalance >= 0;
  const headline = ahead
    ? `You're ${formatWholeTND(stats.netBalance)} ahead across ${plural(stats.totalEvents, 'event')}.`
    : `You're ${formatWholeTND(Math.abs(stats.netBalance))} short across ${plural(stats.totalEvents, 'event')}.`;

  let detail;
  if (overBudget.length) {
    const top = overBudget[0];
    detail = `${top.name} is ${formatWholeTND(top.totalExpenses - top.budget)} over its budget`;
    detail += overBudget.length > 1 ? `, and ${plural(overBudget.length - 1, 'other event')} too.` : '.';
  } else if (losing.length) {
    const worst = losing[0];
    detail =
      losing.length === 1
        ? `${worst.name} is the only event running at a loss (${formatSignedTND(worst.netBalance)}).`
        : `${plural(losing.length, 'event')} are running at a loss — ${worst.name} has the biggest gap (${formatSignedTND(worst.netBalance)}).`;
  } else {
    detail = 'Every event is covering its costs. Nice work.';
  }

  const needsAttention = !ahead || overBudget.length > 0 || losing.length > 0;
  return { headline, detail, ahead, needsAttention };
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { dashboardData, loading, error } = useSelector((state) => state.events);

  // 'comparison' (Revenue vs Expenses) walla 'net' (Net per event)
  const [chartView, setChartView] = useState('comparison');

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const {
    stats = { totalRevenue: 0, totalExpenses: 0, netBalance: 0, totalEvents: 0 },
    trends = null,
    chartData = [],
    eventsOverview = [],
    recentTransactions = []
  } = dashboardData || {};

  const firstName = user?.name?.split(' ')[0] || 'there';
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const hasEvents = eventsOverview.length > 0;
  const insight = hasEvents ? buildInsight(stats, eventsOverview) : null;

  // ---------------- Chart.js config ----------------
  const chartLabels = chartData.map((item) => item.fullName || item.name);

  const comparisonChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Revenue',
        data: chartData.map((item) => item.Revenue || 0),
        backgroundColor: COLORS.revenue,
        hoverBackgroundColor: COLORS.revenueHover,
        borderRadius: 3,
        borderSkipped: false,
        barPercentage: 0.65,
        categoryPercentage: 0.6
      },
      {
        label: 'Expenses',
        data: chartData.map((item) => item.Expenses || 0),
        backgroundColor: COLORS.expense,
        hoverBackgroundColor: COLORS.expenseHover,
        borderRadius: 3,
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
        label: 'Net',
        data: chartData.map((item) => item.NetBalance || 0),
        backgroundColor: chartData.map((item) => (item.NetBalance >= 0 ? COLORS.brand : COLORS.expense)),
        hoverBackgroundColor: chartData.map((item) => (item.NetBalance >= 0 ? COLORS.brandHover : COLORS.expenseHover)),
        borderRadius: 3,
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
        display: chartView === 'comparison',
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'rect',
          boxWidth: 10,
          boxHeight: 10,
          font: { family: 'Inter, sans-serif', size: 12, weight: 600 },
          color: COLORS.text,
          padding: 16
        }
      },
      tooltip: {
        backgroundColor: '#003B70',
        titleFont: { family: 'Manrope, sans-serif', size: 13, weight: 700 },
        bodyFont: { family: 'Inter, sans-serif', size: 12 },
        padding: 12,
        cornerRadius: 4,
        boxPadding: 4,
        callbacks: {
          label: (context) =>
            ` ${context.dataset.label}: ${chartView === 'net' ? formatSignedTND(context.parsed.y) : formatTND(context.parsed.y)
            }`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { family: 'Inter, sans-serif', size: 11, weight: 500 },
          color: COLORS.muted,
          maxRotation: 0,
          autoSkip: true
        }
      },
      y: {
        grid: { color: COLORS.grid },
        border: { display: false },
        ticks: {
          font: { family: 'Inter, sans-serif', size: 11 },
          color: COLORS.muted,
          callback: (value) => formatCompactTND(value)
        }
      }
    }
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <div className="eyebrow">{today}</div>
          <h1 className="page-title" style={{ fontSize: '1.9rem' }}>
            {getGreeting()}, {firstName}
          </h1>
          <p className="page-subtitle">Here's where your events stand today.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <Link to="/transactions" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" icon={Receipt}>
              Record transaction
            </Button>
          </Link>
          <Link to="/events" style={{ textDecoration: 'none' }}>
            <Button variant="primary" icon={Plus}>
              New event
            </Button>
          </Link>
        </div>
      </div>

      <Alert type="danger" message={error} />

      {loading && !hasEvents ? (
        <Spinner text="Loading your dashboard…" />
      ) : !hasEvents ? (
        <div className="card empty-state" style={{ padding: '3.5rem 1.5rem' }}>
          <CalendarDays className="empty-state-icon" />
          <h3 className="empty-state-title">Let's set up your first event</h3>
          <p className="empty-state-subtitle">
            Add an event with its budget, then record sponsorships and expenses — this page will
            show you how each one is doing.
          </p>
          <Link to="/events" style={{ textDecoration: 'none', marginTop: '1rem', display: 'inline-block' }}>
            <Button variant="primary" icon={Plus}>
              Create your first event
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Résumé humain */}
          <div className={`insight-banner ${insight.needsAttention ? 'insight-warn' : 'insight-good'}`}>
            <div className="insight-icon">
              {insight.needsAttention ? (
                <AlertTriangle size={20} />
              ) : insight.ahead ? (
                <TrendingUp size={20} />
              ) : (
                <TrendingDown size={20} />
              )}
            </div>
            <div className="insight-text">
              <strong>{insight.headline}</strong>
              <p>{insight.detail}</p>
            </div>
            <Badge variant={insight.needsAttention ? 'warning' : 'positive'}>
              {insight.needsAttention ? 'Needs attention' : 'On track'}
            </Badge>
          </div>

          {/* KPI Cards */}
          <div className="kpi-grid">
            <FinancialCard
              title="Revenue"
              value={stats.totalRevenue}
              type="revenue"
              trend={trends?.revenue}
              subtitle="Sponsorships, tickets & fees"
            />
            <FinancialCard
              title="Expenses"
              value={stats.totalExpenses}
              type="expense"
              trend={trends?.expense}
              subtitle="Venue, logistics & marketing"
            />
            <FinancialCard
              title="Net balance"
              value={stats.netBalance}
              type="balance"
              trend={trends?.net}
              subtitle={stats.netBalance >= 0 ? 'Revenue covers costs' : 'Costs exceed revenue'}
            />
            <FinancialCard
              title="Events"
              value={stats.totalEvents}
              type="events"
              isCurrency={false}
              subtitle={`${eventsOverview.filter((e) => e.financialStatus !== 'no_transactions').length} with activity`}
            />
          </div>

          {/* Chart */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="section-header">
              <div>
                <h3 className="section-title">How each event is doing</h3>
                <p className="section-subtitle">
                  {chartView === 'comparison'
                    ? 'Money in vs money out, per event'
                    : 'What each event made or lost'}
                </p>
              </div>
              <div className="segmented" role="tablist" aria-label="Chart view">
                <button
                  type="button"
                  role="tab"
                  aria-selected={chartView === 'comparison'}
                  className={chartView === 'comparison' ? 'active' : ''}
                  onClick={() => setChartView('comparison')}
                >
                  Revenue vs expenses
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={chartView === 'net'}
                  className={chartView === 'net' ? 'active' : ''}
                  onClick={() => setChartView('net')}
                >
                  Net per event
                </button>
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="empty-state" style={{ padding: '3rem 1rem' }}>
                <p className="empty-state-subtitle">
                  Record a transaction and the chart will appear here.
                </p>
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

          {/* Events table */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="section-header">
              <div>
                <h3 className="section-title">Events at a glance</h3>
                <p className="section-subtitle">Budget use and balance for every event</p>
              </div>
              <Link to="/events" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" size="sm" icon={ArrowRight} iconPosition="right">
                  All events
                </Button>
              </Link>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Dates</th>
                    <th className="num">Budget used</th>
                    <th className="num">Revenue</th>
                    <th className="num">Expenses</th>
                    <th className="num">Net</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {eventsOverview.map((item) => {
                    const usage = budgetUsage(item.totalExpenses, item.budget);
                    const usageClass =
                      usage === null ? '' : usage > 100 ? 'amount-expense' : usage >= 90 ? 'text-warning' : '';
                    return (
                      <tr key={item._id}>
                        <td>
                          <Link to={`/events/${item._id}`} className="table-link">
                            {item.name}
                          </Link>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                          {formatDateRange(item.startDate, item.endDate)}
                        </td>
                        <td className={`num ${usageClass}`} title={`Budget: ${formatTND(item.budget)}`}>
                          {usage === null ? '—' : `${Math.round(usage)}%`}
                        </td>
                        <td className="num amount-revenue">{formatTND(item.totalRevenue)}</td>
                        <td className="num amount-expense">{formatTND(item.totalExpenses)}</td>
                        <td className={`num ${item.netBalance >= 0 ? 'amount-revenue' : 'amount-expense'}`}>
                          {formatSignedTND(item.netBalance)}
                        </td>
                        <td>
                          {item.financialStatus === 'positive' && <Badge variant="positive">Profitable</Badge>}
                          {item.financialStatus === 'negative' && <Badge variant="negative">Deficit</Badge>}
                          {item.financialStatus === 'no_transactions' && <Badge variant="neutral">No activity yet</Badge>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent transactions */}
          <div className="card">
            <div className="section-header">
              <div>
                <h3 className="section-title">Recent activity</h3>
                <p className="section-subtitle">The latest money in and out</p>
              </div>
              <Link to="/transactions" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" size="sm" icon={ArrowRight} iconPosition="right">
                  All transactions
                </Button>
              </Link>
            </div>

            <TransactionTable transactions={recentTransactions} showEventColumn={true} />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
