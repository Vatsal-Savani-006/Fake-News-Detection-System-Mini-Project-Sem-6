import React, { useState, useEffect } from 'react';
import './css/HomePage.css';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';

interface Analysis {
  _id: string;
  title: string;
  result: 'REAL' | 'FAKE' | 'UNCERTAIN';
  confidence: number;
  analyzedAt: string;
}

interface Statistics {
  totalAnalyses: number;
  fakeNewsDetected: number;
  realNews: number;
  uncertain: number;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<Statistics>({
    totalAnalyses: 0,
    fakeNewsDetected: 0,
    realNews: 0,
    uncertain: 0,
  });
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const username = 'sujal'; // Replace with dynamic user from context/auth

  // Fetch statistics and recent analyses from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, analysesRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/api/analysis/statistics`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          fetch(`${process.env.REACT_APP_API_URL}/api/analysis/recent`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);

        if (!statsRes.ok || !analysesRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const statsData = await statsRes.json();
        const analysesData = await analysesRes.json();

        setStatistics(statsData);
        setRecentAnalyses(analysesData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up polling to fetch recent analyses every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const calculatePercentage = (count: number): number => {
    if (statistics.totalAnalyses === 0) return 0;
    return Math.round((count / statistics.totalAnalyses) * 100);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getResultColor = (result: string): string => {
    switch (result) {
      case 'REAL':
        return 'real';
      case 'FAKE':
        return 'fake';
      case 'UNCERTAIN':
        return 'uncertain';
      default:
        return '';
    }
  };

  

  return (
    <>
      <Navbar />
      <main className="home-container">
        {/* Welcome Section */}
        <section className="welcome-section">
          <h1 className="welcome-title">Welcome back, {username}!</h1>
          <p className="welcome-subtitle">
            Here's an overview of your fake news detection activity
          </p>
        </section>

        {/* Statistics Cards */}
        <section className="statistics-section">
          {/* Total Analyses Card */}
          <div className="stat-card">
            <h3 className="stat-label">Total Analyses</h3>
            <div className="stat-value">{statistics.totalAnalyses}</div>
            <div className="stat-footer">
              <svg className="stat-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
              </svg>
              <span className="stat-time">All time</span>
            </div>
          </div>

          {/* Fake News Detected Card */}
          <div className="stat-card">
            <h3 className="stat-label">Fake News Detected</h3>
            <div className="stat-value fake">{statistics.fakeNewsDetected}</div>
            <div className="stat-footer">
              <svg className="stat-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
              </svg>
              <span className="stat-percentage">
                {calculatePercentage(statistics.fakeNewsDetected)}% of total
              </span>
            </div>
          </div>

          {/* Real News Card */}
          <div className="stat-card">
            <h3 className="stat-label">Real News</h3>
            <div className="stat-value real">{statistics.realNews}</div>
            <div className="stat-footer">
              <svg className="stat-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
              </svg>
              <span className="stat-percentage">
                {calculatePercentage(statistics.realNews)}% of total
              </span>
            </div>
          </div>

          {/* Uncertain Card */}
          <div className="stat-card">
            <h3 className="stat-label">Uncertain</h3>
            <div className="stat-value uncertain">{statistics.uncertain}</div>
            <div className="stat-footer">
              <svg className="stat-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
              </svg>
              <span className="stat-percentage">
                {calculatePercentage(statistics.uncertain)}% of total
              </span>
            </div>
          </div>
        </section>

        {/* Analyze News Section */}
        <section className="analyze-section">
          <div className="analyze-card">
            <h2 className="analyze-title">Analyze News Article</h2>
            <p className="analyze-description">
              Check if a news article or claim is fake or real
            </p>
            <button className="start-analysis-btn" onClick={navigate('/analyze')}>
              <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Start Analysis
            </button>
          </div>
        </section>

        {/* Recent Analyses Section */}
        <section className="recent-analyses-section">
          <h2 className="recent-title">Recent Analyses</h2>
          <p className="recent-subtitle">Your latest news verification results</p>

          {loading && <p className="loading-message">Loading analyses...</p>}
          {error && <p className="error-message">Error: {error}</p>}

          {!loading && recentAnalyses.length === 0 && (
            <p className="no-analyses-message">
              No analyses yet. Start by analyzing a news article!
            </p>
          )}

          {!loading && recentAnalyses.length > 0 && (
            <div className="analyses-list">
              {recentAnalyses.map((analysis) => (
                <div key={analysis._id} className="analysis-item">
                  <div className="analysis-content">
                    <h3 className="analysis-title">{analysis.title}</h3>
                    <p className="analysis-date">{formatDate(analysis.analyzedAt)}</p>
                  </div>
                  <div className="analysis-result">
                    <span className={`result-badge ${getResultColor(analysis.result)}`}>
                      {analysis.result}
                    </span>
                    <span className="confidence">
                      {Math.round(analysis.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}