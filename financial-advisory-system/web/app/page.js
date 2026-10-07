'use client';

import { useState, useRef } from 'react';

const PRESETS = [
  {
    label: 'Early Career',
    data: {
      age: '25',
      income: '50000',
      expenses: '32000',
      savings: '80000',
      debt: '20000',
      risk: 'high',
      horizon: '20',
    },
  },
  {
    label: 'Balanced Mid-Career',
    data: {
      age: '38',
      income: '120000',
      expenses: '65000',
      savings: '600000',
      debt: '150000',
      risk: 'medium',
      horizon: '15',
    },
  },
  {
    label: 'Debt Payoff Focus',
    data: {
      age: '32',
      income: '55000',
      expenses: '45000',
      savings: '25000',
      debt: '350000',
      risk: 'low',
      horizon: '5',
    },
  },
  {
    label: 'Pre-Retirement',
    data: {
      age: '58',
      income: '175000',
      expenses: '70000',
      savings: '3500000',
      debt: '0',
      risk: 'low',
      horizon: '7',
    },
  },
];

export default function AdvisoryPage() {
  const [formData, setFormData] = useState({
    age: '30',
    income: '75000',
    expenses: '45000',
    savings: '200000',
    debt: '0',
    risk: 'medium',
    horizon: '10',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [results, setResults] = useState(null);

  const resultsRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const applyPreset = (presetData) => {
    setFormData(presetData);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    // Pre-validate numeric values before dispatch
    const payload = {
      age: Number(formData.age),
      income: Number(formData.income),
      expenses: Number(formData.expenses),
      savings: Number(formData.savings),
      debt: Number(formData.debt),
      risk: formData.risk,
      horizon: Number(formData.horizon),
    };

    if (
      Number.isNaN(payload.age) ||
      Number.isNaN(payload.income) ||
      Number.isNaN(payload.expenses) ||
      Number.isNaN(payload.savings) ||
      Number.isNaN(payload.debt) ||
      Number.isNaN(payload.horizon)
    ) {
      setErrorMessage('Please ensure all numerical input fields contain valid numbers.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/advise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Failed to process financial assessment.');
      } else {
        setResults(data);
        // Smooth scroll down to the horizontal results section below the form
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      }
    } catch {
      setErrorMessage('Unable to communicate with the advisory service. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (rate) => {
    if (typeof rate !== 'number') return '0.0%';
    return `${(rate * 100).toFixed(1)}%`;
  };

  const formatINR = (val) => {
    const num = Number(val);
    if (Number.isNaN(num)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const savingsPercent = results?.savingsRate
    ? Math.max(0, Math.min(100, Math.round(results.savingsRate * 100)))
    : 0;

  const monthlySurplus = Math.max(0, Number(formData.income || 0) - Number(formData.expenses || 0));

  const emergencyRunwayMonths = Number(formData.expenses) > 0
    ? (Number(formData.savings || 0) / Number(formData.expenses)).toFixed(1)
    : '0.0';

  const dtiPercent = Number(formData.income) > 0
    ? Math.round((Number(formData.debt || 0) / Number(formData.income)) * 100)
    : 0;

  return (
    <div className="app-viewport">
      {/* Floating Top Navigation */}
      <nav className="masthead-nav" aria-label="Main Navigation">
        <div className="masthead-inner">
          <div className="nav-left">
            <button type="button" className="nav-menu-btn" aria-label="Toggle Menu">
              <span className="nav-hamburger-icon" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span>Menu</span>
            </button>
          </div>

          <div className="nav-center-brand">
            <svg
              className="nav-brand-emblem"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <polygon points="12,2 22,7 18,21 6,21 2,7" />
              <polyline points="12,2 12,13 18,21" />
              <polyline points="12,13 6,21" />
            </svg>
            <span className="nav-brand-title">Financial Advisory System</span>
          </div>

          <div className="nav-right-telemetry">
            <div className="telemetry-status-badge">
              <span className="pulse-dot" aria-hidden="true" />
              <span>INR Engine Ready</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="main-content">
        {/* Hero Section */}
        <header className="hero-section">
          <div className="hero-meta-badge">Prolog Logical Engine • Financial Advisory</div>
          <h1 className="hero-title">Financial Advisory System</h1>
          <p className="hero-subtitle">
            Rule-based client capital assessment and strategic portfolio allocation directives in Indian Rupees (₹)
          </p>
        </header>

        {/* Form Card (Top Section) */}
        <section className="card-lambo" aria-labelledby="form-heading">
          <div className="card-lambo-header">
            <h2 id="form-heading" className="card-lambo-title">
              <span>Client Financial Profile</span>
            </h2>
            <span className="card-tag card-tag-ready">Rupee (₹) Profile</span>
          </div>

          {/* Quick Presets Strip */}
          <div className="presets-container">
            <div className="presets-title">Quick Profile Presets</div>
            <div className="presets-button-row">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className="btn-ghost"
                  onClick={() => applyPreset(preset.data)}
                >
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {errorMessage && (
            <div className="lambo-alert lambo-alert-error" role="alert">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="lambo-form-root">
            {/* Matrix Section 1: Demographics & Time Horizon */}
            <div className="form-matrix-section">
              <div className="form-matrix-heading">Demographics &amp; Time Horizon</div>
              <div className="form-fields-grid-3">
                <div className="lambo-form-group">
                  <label htmlFor="age">
                    <span>Age</span>
                    <span>1–120 yrs</span>
                  </label>
                  <div className="lambo-input-box">
                    <input
                      id="age"
                      name="age"
                      type="number"
                      inputMode="numeric"
                      min="1"
                      max="120"
                      required
                      value={formData.age}
                      onChange={handleChange}
                      className="lambo-input with-suffix"
                      placeholder="30"
                    />
                    <span className="input-symbol-suffix">yrs</span>
                  </div>
                </div>

                <div className="lambo-form-group">
                  <label htmlFor="horizon">
                    <span>Investment Horizon</span>
                    <span>0–100 yrs</span>
                  </label>
                  <div className="lambo-input-box">
                    <input
                      id="horizon"
                      name="horizon"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="100"
                      required
                      value={formData.horizon}
                      onChange={handleChange}
                      className="lambo-input with-suffix"
                      placeholder="10"
                    />
                    <span className="input-symbol-suffix">yrs</span>
                  </div>
                </div>

                <div className="lambo-form-group">
                  <label htmlFor="risk">
                    <span>Risk Tolerance</span>
                    <span>Strategy</span>
                  </label>
                  <select
                    id="risk"
                    name="risk"
                    value={formData.risk}
                    onChange={handleChange}
                    className="lambo-select"
                  >
                    <option value="low">Low (Capital preservation &amp; stability)</option>
                    <option value="medium">Medium (Balanced growth &amp; fixed income)</option>
                    <option value="high">High (Aggressive equity growth)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Matrix Section 2: Financial Capital Telemetry */}
            <div className="form-matrix-section">
              <div className="form-matrix-heading">Financial Capital (₹)</div>
              <div className="form-fields-grid-4">
                <div className="lambo-form-group">
                  <label htmlFor="income">Monthly Income</label>
                  <div className="lambo-input-box">
                    <span className="input-symbol-prefix">₹</span>
                    <input
                      id="income"
                      name="income"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      required
                      value={formData.income}
                      onChange={handleChange}
                      className="lambo-input with-prefix"
                      placeholder="75000"
                    />
                  </div>
                </div>

                <div className="lambo-form-group">
                  <label htmlFor="expenses">Monthly Expenses</label>
                  <div className="lambo-input-box">
                    <span className="input-symbol-prefix">₹</span>
                    <input
                      id="expenses"
                      name="expenses"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      required
                      value={formData.expenses}
                      onChange={handleChange}
                      className="lambo-input with-prefix"
                      placeholder="45000"
                    />
                  </div>
                </div>

                <div className="lambo-form-group">
                  <label htmlFor="savings">Liquid Savings</label>
                  <div className="lambo-input-box">
                    <span className="input-symbol-prefix">₹</span>
                    <input
                      id="savings"
                      name="savings"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      required
                      value={formData.savings}
                      onChange={handleChange}
                      className="lambo-input with-prefix"
                      placeholder="200000"
                    />
                  </div>
                </div>

                <div className="lambo-form-group">
                  <label htmlFor="debt">Total Debt</label>
                  <div className="lambo-input-box">
                    <span className="input-symbol-prefix">₹</span>
                    <input
                      id="debt"
                      name="debt"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      required
                      value={formData.debt}
                      onChange={handleChange}
                      className="lambo-input with-prefix"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Action Button (Lamborghini Gold Accent) */}
            <div>
              <button type="submit" className="btn-accent" disabled={loading}>
                {loading && <span className="lambo-spinner" aria-hidden="true" />}
                <span>
                  {loading ? 'Evaluating financial profile...' : 'Analyze Financial Profile'}
                </span>
              </button>
            </div>
          </form>
        </section>

        {/* Results Section (Positioned Horizontally Below the Form) */}
        <section
          ref={resultsRef}
          className="card-lambo"
          aria-labelledby="results-heading"
        >
          <div className="card-lambo-header">
            <h2 id="results-heading" className="card-lambo-title">
              <span>Advisory Assessment &amp; Recommendations</span>
            </h2>
            {loading ? (
              <span className="card-tag card-tag-active">Evaluating</span>
            ) : results ? (
              <span className="card-tag card-tag-ready">Assessment Ready</span>
            ) : (
              <span className="card-tag">Awaiting Input</span>
            )}
          </div>

          {results ? (
            <div className="results-wrapper-horizontal">
              {/* Row 1: Key Performance Metrics (Horizontal Multi-Column Layout) */}
              <div className="metrics-horizontal-strip">
                {/* Hero Metric: Savings Rate */}
                <div className="metric-tile metric-tile-hero">
                  <div className="metric-tile-header">
                    <span className="metric-tile-label">Savings Rate</span>
                    <span className="metric-tile-status">{savingsPercent}% Ratio</span>
                  </div>
                  <div className="metric-tile-value">
                    {formatPercentage(results.savingsRate)}
                  </div>
                  <div
                    className="metric-progress-track"
                    role="progressbar"
                    aria-valuenow={savingsPercent}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <div
                      className="metric-progress-fill"
                      style={{ width: `${savingsPercent}%` }}
                    />
                  </div>
                  <div className="metric-tile-caption">
                    Portion of monthly income retained after living expenditures
                  </div>
                </div>

                {/* Metric 2: Monthly Net Surplus */}
                <div className="metric-tile">
                  <div className="metric-tile-header">
                    <span className="metric-tile-label">Monthly Surplus</span>
                    <span className="metric-tile-status">INR / mo</span>
                  </div>
                  <div className="metric-tile-value">
                    {formatINR(monthlySurplus)}
                  </div>
                  <div className="metric-tile-caption">
                    Estimated monthly surplus retained after living expenditures
                  </div>
                </div>

                {/* Metric 3: Debt Burden */}
                <div className="metric-tile">
                  <div className="metric-tile-header">
                    <span className="metric-tile-label">Total Debt</span>
                    <span className="metric-tile-status">{dtiPercent}% DTI</span>
                  </div>
                  <div className="metric-tile-value">
                    {formatINR(formData.debt)}
                  </div>
                  <div className="metric-tile-caption">
                    Total debt-to-income load affecting financial mobility
                  </div>
                </div>

                {/* Metric 4: Liquidity Runway */}
                <div className="metric-tile">
                  <div className="metric-tile-header">
                    <span className="metric-tile-label">Emergency Runway</span>
                    <span className="metric-tile-status">Reserves</span>
                  </div>
                  <div className="metric-tile-value">
                    {emergencyRunwayMonths} <span style={{ fontSize: '0.9rem', color: '#8e8e8e', fontWeight: 400 }}>mos</span>
                  </div>
                  <div className="metric-tile-caption">
                    Months of living expenses your current savings can sustain
                  </div>
                </div>
              </div>

              {/* Row 2: Strategic Directives Grid (Laid out horizontally across the section) */}
              <div className="recommendations-wrapper">
                <div className="recommendations-header-row">
                  <h3 className="recommendations-title">Strategic Recommendations</h3>
                  <span className="recommendations-count">
                    {results.advice?.length || 0} {results.advice?.length === 1 ? 'recommendation' : 'recommendations'}
                  </span>
                </div>

                <div className="recommendations-grid">
                  {results.advice?.map((item, index) => (
                    <article key={index} className="advice-card">
                      <div className="advice-card-top">
                        <div className="advice-meta-row">
                          <span className="hex-badge">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="advice-classification">
                            Recommendation #{index + 1}
                          </span>
                        </div>
                        <h4 className="advice-statement">{item.text}</h4>
                      </div>
                      <p className="advice-rationale">{item.reason}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Standby State (Horizontal Layout across the card) */
            <div className="standby-horizontal-card">
              <div className="standby-left">
                <svg
                  className="standby-radar-icon"
                  viewBox="0 0 48 48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <polygon points="24,4 42,14 42,34 24,44 6,34 6,14" />
                  <polygon points="24,12 35,18 35,30 24,36 13,30 13,18" />
                  <circle cx="24" cy="24" r="2.5" fill="currentColor" />
                </svg>
                <div className="standby-texts">
                  <h3>No Analysis Run Yet</h3>
                  <p>
                    Complete your financial details above or pick a preset profile, then click Analyze Financial Profile to generate tailored, rule-based recommendations.
                  </p>
                </div>
              </div>

              <div className="standby-badges-right">
                <span className="standby-pill">Engine: SWI-Prolog 9.2</span>
                <span className="standby-pill">Currency: INR (₹)</span>
                <span className="standby-pill">Status: Ready</span>
              </div>
            </div>
          )}
        </section>

        {/* Mandatory Educational Disclaimer Footer */}
        <footer className="compliance-footer" role="note">
          <strong>Important Disclaimer:</strong> This automated advisory system employs deterministic Prolog logical rules for demonstrative educational evaluations only. It does not constitute certified, licensed financial, investment, tax, or legal advice. Always consult a SEBI registered financial advisor before executing significant capital allocations or investments.
        </footer>
      </main>
    </div>
  );
}
