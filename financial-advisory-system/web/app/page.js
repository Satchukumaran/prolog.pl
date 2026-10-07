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
        setErrorMessage(data.error || 'Failed to generate financial assessment. Please check your entries.');
      } else {
        setResults(data);
        // Smoothly bring results into view on mobile viewports
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
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

  return (
    <div className="container">
      <header className="header">
        <div className="header-badge">AI Knowledge Engine</div>
        <h1>Financial Advisory System</h1>
        <p>Rule-based financial assessment and portfolio allocation guidance tailored to Indian Rupee (₹) profiles</p>
      </header>

      <div className="grid-layout">
        {/* Input Form Card */}
        <section className="card" aria-labelledby="profile-heading">
          <div className="card-header">
            <h2 id="profile-heading" className="card-title">
              <span>Client Financial Profile</span>
            </h2>
            <span className="status-badge status-badge-ready">INR (₹)</span>
          </div>

          {/* Quick Presets */}
          <div className="presets-section">
            <div className="presets-label">Quick Rupee Profile Presets</div>
            <div className="presets-row">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className="btn-preset"
                  onClick={() => applyPreset(preset.data)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {errorMessage && (
            <div className="alert alert-error" role="alert">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-grid form-grid-2col">
              <div className="form-group">
                <label htmlFor="age">Age</label>
                <div className="input-wrapper">
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
                    className="has-suffix"
                    placeholder="30"
                  />
                  <span className="input-suffix">yrs</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="horizon">Investment Horizon</label>
                <div className="input-wrapper">
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
                    className="has-suffix"
                    placeholder="10"
                  />
                  <span className="input-suffix">yrs</span>
                </div>
              </div>
            </div>

            <div className="form-grid form-grid-2col">
              <div className="form-group">
                <label htmlFor="income">Monthly Income (₹)</label>
                <div className="input-wrapper">
                  <span className="input-prefix">₹</span>
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
                    className="has-prefix"
                    placeholder="75000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="expenses">Monthly Expenses (₹)</label>
                <div className="input-wrapper">
                  <span className="input-prefix">₹</span>
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
                    className="has-prefix"
                    placeholder="45000"
                  />
                </div>
              </div>
            </div>

            <div className="form-grid form-grid-2col">
              <div className="form-group">
                <label htmlFor="savings">Liquid Savings (₹)</label>
                <div className="input-wrapper">
                  <span className="input-prefix">₹</span>
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
                    className="has-prefix"
                    placeholder="200000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="debt">Total Debt (₹)</label>
                <div className="input-wrapper">
                  <span className="input-prefix">₹</span>
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
                    className="has-prefix"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="risk">Risk Tolerance</label>
              <select
                id="risk"
                name="risk"
                value={formData.risk}
                onChange={handleChange}
              >
                <option value="low">Low (Capital preservation & stability)</option>
                <option value="medium">Medium (Balanced growth & fixed income)</option>
                <option value="high">High (Long-term aggressive equity growth)</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading && <span className="spinner" aria-hidden="true" />}
                {loading ? 'Evaluating Rupee Profile...' : 'Analyze Financial Profile'}
              </button>
            </div>
          </form>
        </section>

        {/* Results Card */}
        <section
          ref={resultsRef}
          className="card results-card"
          aria-labelledby="advisory-heading"
        >
          <div className="card-header">
            <h2 id="advisory-heading" className="card-title">
              <span>Advisory Assessment</span>
            </h2>
            {loading ? (
              <span className="status-badge status-badge-evaluating">Evaluating</span>
            ) : results ? (
              <span className="status-badge status-badge-ready">Assessment Ready</span>
            ) : (
              <span className="status-badge status-badge-waiting">Awaiting Input</span>
            )}
          </div>

          {results ? (
            <div className="results-section">
              <div className="savings-metric-card">
                <div className="savings-metric-header">
                  <span>Savings Rate</span>
                  <span>{savingsPercent}% of Monthly Income</span>
                </div>
                <div className="savings-metric-value">
                  {formatPercentage(results.savingsRate)}
                </div>
                <div className="savings-bar-container" role="progressbar" aria-valuenow={savingsPercent} aria-valuemin="0" aria-valuemax="100">
                  <div
                    className="savings-bar-fill"
                    style={{ width: `${savingsPercent}%` }}
                  />
                </div>
                <div className="savings-metric-desc">
                  Estimated monthly surplus: <strong>{formatINR(monthlySurplus)}</strong> retained after living expenditures.
                </div>
              </div>

              <div className="metrics-summary-grid">
                <div className="metric-pill">
                  <span className="metric-pill-label">Monthly Surplus</span>
                  <span className="metric-pill-value">{formatINR(monthlySurplus)}</span>
                </div>
                <div className="metric-pill">
                  <span className="metric-pill-label">Total Debt</span>
                  <span className="metric-pill-value">{formatINR(formData.debt)}</span>
                </div>
              </div>

              <div>
                <div className="advice-section-title">
                  <span>Strategic Recommendations</span>
                  <span className="advice-count-pill">
                    {results.advice?.length || 0} {results.advice?.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <div className="advice-list">
                  {results.advice?.map((item, index) => (
                    <article key={index} className="advice-item">
                      <div className="advice-item-top">
                        <span className="advice-badge">{index + 1}</span>
                        <h3 className="advice-text">{item.text}</h3>
                      </div>
                      <p className="advice-reason">{item.reason}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <h3>No Analysis Run Yet</h3>
              <p>
                Complete your financial details in Rupees (₹) on the form or pick a preset, then tap Analyze to receive tailored,
                rule-based recommendations.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Mandatory Disclaimer */}
      <footer className="disclaimer-card" role="note">
        <strong>Important Disclaimer:</strong> This system is an automated, rule-based computational
        demonstration providing general educational perspectives only. It does not constitute certified,
        licensed financial, investment, accounting, or legal advice. Consult a licensed SEBI registered financial advisor
        before executing significant investment or financial commitments.
      </footer>
    </div>
  );
}
