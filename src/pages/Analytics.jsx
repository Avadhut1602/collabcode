// src/pages/Analytics.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Code2,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Users,
  Flame,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';
import './Analytics.css';

export default function Analytics() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/auth/analytics');
      setData(res.data);
    } catch (err) {
      setError('Failed to load coding analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const languageDistribution = data?.languageDistribution || {};
  const totalLangs = Object.values(languageDistribution).reduce((a, b) => a + b, 0) || 1;

  const weeklyActivity = data?.weeklyActivity || [0, 0, 0, 0, 0, 0, 0];
  const maxWeekly = Math.max(...weeklyActivity, 1);
  const daysOfWeek = ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today'];

  const getLanguageColor = (lang) => {
    switch (lang.toLowerCase()) {
      case 'python': return '#38bdf8';
      case 'javascript': return '#eab308';
      case 'cpp': return '#ec4899';
      case 'java': return '#f97316';
      case 'c': return '#a855f7';
      default: return '#3b82f6';
    }
  };

  return (
    <div className="analytics-page-container">
      <div className="analytics-header">
        <Link to="/dashboard" className="back-link">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div className="header-titles">
          <h1>Personal Coding Analytics</h1>
          <p>Real-time telemetry and coding statistics derived from your stored projects and execution logs.</p>
        </div>
      </div>

      {error && (
        <div className="dashboard-error-banner" style={{ marginBottom: '1.5rem' }}>
          <span>{error}</span>
          <button type="button" className="btn btn-outline btn-sm" onClick={fetchAnalytics}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="analytics-loading">Loading telemetry data...</div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="metrics-banner-grid">
            <div className="card metric-card">
              <div className="metric-icon-box bg-blue">
                <Layers size={20} />
              </div>
              <div>
                <span className="metric-label">Workspaces Created</span>
                <h3 className="metric-value">{data?.totalProjectsCreated || 0}</h3>
              </div>
            </div>

            <div className="card metric-card">
              <div className="metric-icon-box bg-emerald">
                <Users size={20} />
              </div>
              <div>
                <span className="metric-label">Collaborations</span>
                <h3 className="metric-value">{data?.totalCollaborations || 0}</h3>
              </div>
            </div>

            <div className="card metric-card">
              <div className="metric-icon-box bg-amber">
                <Play size={20} />
              </div>
              <div>
                <span className="metric-label">Total Code Runs</span>
                <h3 className="metric-value">{data?.totalExecutions || 0}</h3>
              </div>
            </div>

            <div className="card metric-card">
              <div className="metric-icon-box bg-purple">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <span className="metric-label">Execution Success Rate</span>
                <h3 className="metric-value">{data?.successRate || 100}%</h3>
              </div>
            </div>
          </div>

          <div className="analytics-charts-grid">
            {/* Language Breakdown */}
            <div className="card chart-card">
              <div className="chart-header">
                <h3>Languages Distribution</h3>
                <span className="chart-subtitle">Based on your active workspaces</span>
              </div>

              {Object.keys(languageDistribution).length === 0 ? (
                <div className="chart-empty">No language records found yet.</div>
              ) : (
                <div className="language-breakdown-list">
                  {Object.entries(languageDistribution).map(([lang, count]) => {
                    const percentage = Math.round((count / totalLangs) * 100);
                    const color = getLanguageColor(lang);
                    return (
                      <div key={lang} className="lang-bar-row">
                        <div className="lang-meta">
                          <span className="lang-name">{lang.toUpperCase()}</span>
                          <span className="lang-pct">{percentage}% ({count} projects)</span>
                        </div>
                        <div className="lang-bar-track">
                          <div
                            className="lang-bar-fill"
                            style={{ width: `${percentage}%`, backgroundColor: color }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Weekly Activity Histogram */}
            <div className="card chart-card">
              <div className="chart-header">
                <h3>Weekly Execution Activity</h3>
                <span className="chart-subtitle">Code runs across the last 7 days</span>
              </div>

              <div className="weekly-histogram">
                {weeklyActivity.map((count, index) => {
                  const heightPct = Math.max(12, Math.round((count / maxWeekly) * 100));
                  return (
                    <div key={index} className="histogram-col">
                      <div className="bar-wrapper">
                        <div
                          className="histogram-bar"
                          style={{ height: `${heightPct}%` }}
                          title={`${count} executions`}
                        >
                          {count > 0 && <span className="bar-count-tooltip">{count}</span>}
                        </div>
                      </div>
                      <span className="bar-day-label">{daysOfWeek[index]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Executions Table */}
          <div className="card table-card" style={{ marginTop: '2rem' }}>
            <div className="chart-header">
              <h3>Recent Execution Log</h3>
              <span className="chart-subtitle">Detailed records from sandboxed runs</span>
            </div>

            {(!data?.recentExecutions || data.recentExecutions.length === 0) ? (
              <div className="chart-empty">No executions recorded yet. Open a workspace and click "Run" to view logs.</div>
            ) : (
              <div className="table-responsive">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Language</th>
                      <th>Duration</th>
                      <th>Timestamp</th>
                      <th>Diagnostics</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentExecutions.map((log) => (
                      <tr key={log._id}>
                        <td>
                          <span className={`status-badge status-${log.status}`}>
                            {log.status === 'success' ? '✓ Passed' : '✕ Error'}
                          </span>
                        </td>
                        <td>
                          <strong>{log.language?.toUpperCase()}</strong>
                        </td>
                        <td>{log.executionTimeMs}ms</td>
                        <td>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="log-summary font-mono">
                          {log.stderr ? log.stderr.slice(0, 60) : (log.stdout || 'Clean exit')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
