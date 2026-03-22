import  { useState, useEffect } from 'react';
import './css/ProfilePage.css';
import Navbar from './Navbar';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  memberSince: string;
}

interface AnalysisDetail {
  _id: string;
  title: string;
  newsText: string;
  content: string;
  result: 'REAL' | 'FAKE' | 'UNCERTAIN';
  confidence: number;
  analyzedAt: string;
  details: string[];
}

interface ProfileStats {
  totalAnalyses: number;
  fakeNewsDetected: number;
  realNews: number;
  uncertain: number;
}

type FilterType = 'ALL' | 'FAKE' | 'REAL' ;

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    totalAnalyses: 0,
    fakeDetected: 0,
    realNews: 0,
    uncertain: 0,
  });
  const [analyses, setAnalyses] = useState<AnalysisDetail[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<AnalysisDetail[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAnalysisId, setExpandedAnalysisId] = useState<string | null>(null);

  // Fetch user profile and analyses
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const [profileRes, statsRes, analysesRes] = await Promise.all([
          fetch(`http://localhost:3001/api/user/profile`, {
            credentials: "include",
          }),
          fetch(`http://localhost:3001/api/analysis/statistics`, {
            credentials: "include",
          }),
          fetch(`http://localhost:3001/api/analysis/all`, {
            credentials: "include",
          }),
        ]);

        if (!profileRes.ok || !statsRes.ok || !analysesRes.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const profileData = await profileRes.json();
        const statsData = await statsRes.json();
        const analysesData = await analysesRes.json();

        const normalizedAnalyses = analysesData.map((item: any) => ({
          ...item,
          title: item.title || item.newsText?.slice(0, 60) || 'Untitled Analysis',
          newsText: item.newsText || item.content || '',
          result: item.result || item.prediction || 'UNCERTAIN',
        }));

        setUserProfile(profileData);
        setStats(statsData);
        setAnalyses(normalizedAnalyses);
        setFilteredAnalyses(normalizedAnalyses);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // Filter analyses based on selected filter
  const handleFilterChange = (filter: FilterType) => {
    setSelectedFilter(filter);

    if (filter === 'ALL') {
      setFilteredAnalyses(analyses);
    } else {
      setFilteredAnalyses(analyses.filter((a) => a.result === filter));
    }
  };

  // Get avatar initials
  const getAvatarInitial = (): string => {
    return userProfile?.name?.charAt(0).toUpperCase() || 'U';
  };

  // Get avatar background color based on initial
  const getAvatarColor = (): string => {
    const colors = [
      '#6366f1',
      '#3b82f6',
      '#06b6d4',
      '#10b981',
      '#f59e0b',
      '#ef4444',
    ];
    const charCode = (userProfile?.name?.charCodeAt(0) || 0) % colors.length;
    return colors[charCode];
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
      default:
        return '';
    }
  };

  const getFilterCount = (filter: FilterType): number => {
    if (filter === 'ALL') return stats.totalAnalyses;
    if (filter === 'FAKE') return stats.fakeNewsDetected;
    if (filter === 'REAL') return stats.realNews;
   
    return 0;
  };



  return (
    <>
      <Navbar />
      <main className="profile-container">
        {/* Page Header */}
        <section className="profile-header-section">
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">
            View your account information and analysis history
          </p>
        </section>

        {error && <div className="error-banner">{error}</div>}

        <div className="profile-layout">
          {/* Left Sidebar */}
          <aside className="profile-sidebar">
            {loading ? (
              <div className="skeleton-loader"></div>
            ) : userProfile ? (
              <>
                {/* Account Information Card */}
                <div className="info-card account-card">
                  <h2 className="card-title">Account Information</h2>

                  {/* Avatar */}
                  <div className="avatar-container">
                    <div
                      className="avatar"
                      style={{ backgroundColor: getAvatarColor() }}
                    >
                      {getAvatarInitial()}
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="user-details">
                    <div className="detail-item">
                      <span className="detail-label">Name</span>
                      <p className="detail-value">{userProfile.name}</p>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Email</span>
                      <p className="detail-value">{userProfile.email}</p>
                    </div>
                    
                      
                  </div>
                </div>

                {/* Statistics Summary Card */}
                <div className="info-card stats-card">
                  <h2 className="card-title">Statistics Summary</h2>

                  <div className="stats-list">
                    <div className="stat-row">
                      <div className="stat-info">
                        <svg
                          className="stat-icon total"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                        </svg>
                        <span className="stat-label">Total Analyses</span>
                      </div>
                      <span className="stat-number">
                        {stats.totalAnalyses}
                      </span>
                    </div>

                    <div className="stat-row">
                      <div className="stat-info">
                        <svg
                          className="stat-icon fake"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                        </svg>
                        <span className="stat-label">Fake Detected</span>
                      </div>
                      <span className="stat-number fake">
                        {stats.fakeNewsDetected}
                      </span>
                    </div>

                    <div className="stat-row">
                      <div className="stat-info">
                        <svg
                          className="stat-icon real"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        <span className="stat-label">Real News</span>
                      </div>
                      <span className="stat-number real">
                        {stats.realNews}
                      </span>
                    </div>

                    <div className="stat-row">
                      <div className="stat-info">
                        <svg
                          className="stat-icon uncertain"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                        <span className="stat-label">Uncertain</span>
                      </div>
                      <span className="stat-number uncertain">
                        {stats.uncertain}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </aside>

          {/* Main Content */}
          <main className="profile-main">
            {/* Analysis History Section */}
            <section className="analysis-section">
              <div className="section-header">
                <div>
                  <h2 className="section-title">Analysis History</h2>
                  <p className="section-subtitle">
                    Complete record of all your news verification activities
                  </p>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="filter-tabs">
                {(['ALL', 'FAKE', 'REAL'] as FilterType[]).map(
                  (filter) => (
                    <button
                      key={filter}
                      className={`filter-tab ${
                        selectedFilter === filter ? 'active' : ''
                      }`}
                      onClick={() => handleFilterChange(filter)}
                    >
                      {filter} ({getFilterCount(filter)})
                    </button>
                  )
                )}
              </div>

              {/* Analyses List */}
              {loading ? (
                <div className="loading-state">
                  <p>Loading analysis history...</p>
                </div>
              ) : filteredAnalyses.length === 0 ? (
                <div className="empty-state">
                  <p>No analyses found in this category.</p>
                </div>
              ) : (
                <div className="analyses-container">
                  {filteredAnalyses.map((analysis) => (
                    <div
                      key={analysis._id}
                      className={`analysis-card ${getResultColor(
                        analysis.result
                      )}`}
                    >
                      <div className="analysis-header">
                        <div className="analysis-top">
                          <span
                            className={`result-badge ${getResultColor(
                              analysis.result
                            )}`}
                          >
                            {analysis.result}
                          </span>
                          <span className="confidence">
                            {Math.round(analysis.confidence * 100)}% confidence
                          </span>
                          <span className="analysis-date">
                            📅 {formatDate(analysis.analyzedAt)}
                          </span>
                        </div>
                      </div>

                      <h3 className="analysis-title">{analysis.title}</h3>
                      <p className="analysis-input">Input: {analysis.newsText}</p>

    
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      </main>
    </>
  );
}