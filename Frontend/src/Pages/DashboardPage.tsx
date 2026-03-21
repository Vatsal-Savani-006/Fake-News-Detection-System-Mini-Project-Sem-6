import  { useState, useEffect } from 'react';
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
          fetch(`http://localhost:3001/api/analysis/statistics`, {
            credentials: "include",
          }),
          fetch(`http://localhost:3001/api/analysis/recent`, {
            credentials: "include",
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
             
              <span className="stat-time">All time</span>
            </div>
          </div>

          {/* Fake News Detected Card */}
          <div className="stat-card">
            <h3 className="stat-label">Fake News Detected</h3>
            <div className="stat-value fake">{statistics.fakeNewsDetected}</div>
            <div className="stat-footer">
             
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
            <button className="start-analysis-btn" onClick={()=>navigate('/Analysis')}>
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
                    {(analysis.confidence * 100).toFixed(2)}% confidence
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