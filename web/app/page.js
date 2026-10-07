'use client';

import { useState } from 'react';

export default function AdvisoryPage() {
  const [formData, setFormData] = useState({
    age: '30',
    income: '5000',
    expenses: '3000',
    savings: '10000',
    debt: '0',
    risk: 'medium',
    horizon: '10',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [results, setResults] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  return (
    <div className="container">
      <header className="header">
        <h1>Financial Advisory System</h1>
        <p>Expert rule-based financial assessment and portfolio allocation guidance</p>
      </header>

      <div className="grid-layout">
        {/* Input Form Card */}
        <section className="card">
          <h2 className="card-title">Client Financial Profile</h2>
          
          {errorMessage && (
            <div className="alert alert-error" role="alert">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-grid form-grid-2col">
              <div className="form-group">
                <label htmlFor="age">Age (years)</label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  min="1"
                  max="120"
                  required
                  value={formData.age}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="horizon">Investment Horizon (years)</label>
                <input
                  id="horizon"
                  name="horizon"
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.horizon}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-grid form-grid-2col">
              <div className="form-group">
                <label htmlFor="income">Monthly Income ($)</label>
                <input
                  id="income"
                  name="income"
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={formData.income}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="expenses">Monthly Expenses ($)</label>
                <input
                  id="expenses"
                  name="expenses"
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={formData.expenses}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-grid form-grid-2col">
              <div className="form-group">
                <label htmlFor="savings">Liquid Savings ($)</label>
                <input
                  id="savings"
                  name="savings"
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={formData.savings}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="debt">Total Debt ($)</label>
                <input
                  id="debt"
                  name="debt"
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={formData.debt}
                  onChange={handleChange}
                />
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

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading && <span className="spinner" aria-hidden="true" />}
              {loading ? 'Evaluating Profile...' : 'Analyze Financial Profile'}
            </button>
          </form>
        </section>

        {/* Results Card */}
        <section className="card">
          <h2 className="card-title">Advisory Assessment</h2>

          {results ? (
            <div className="results-section">
              <div className="savings-metric-card">
                <div className="savings-metric-header">Savings Rate</div>
                <div className="savings-metric-value">
                  {formatPercentage(results.savingsRate)}
                </div>
                <div className="savings-metric-desc">
                  Proportion of monthly income retained after living expenditures.
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', fontWeight: '600' }}>
                  Strategic Recommendations
                </h3>
                <div className="advice-list">
                  {results.advice?.map((item, index) => (
                    <article key={index} className="advice-item">
                      <div className="advice-text">{item.text}</div>
                      <div className="advice-reason">{item.reason}</div>
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
                Complete your financial profile details on the left and submit to receive tailored,
                rule-based financial recommendations.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Mandatory Disclaimer */}
      <footer className="disclaimer-card" role="note">
        <strong>Important Disclaimer:</strong> This system is an automated, rule-based computational
        demonstration providing general educational perspectives only. It does not constitute certified,
        licensed financial, investment, accounting, or legal advice. Consult a licensed financial professional
        before executing significant investment or financial commitments.
      </footer>
    </div>
  );
}
