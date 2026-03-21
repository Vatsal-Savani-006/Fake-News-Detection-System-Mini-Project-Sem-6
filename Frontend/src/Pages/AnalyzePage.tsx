import React, { useState } from 'react';
import './css/AnalyzePage.css';
import { predictApi, logoutApi } from "../api";
import Navbar from './Navbar';

export default function NewsAnalyzer() {
  const [newsText, setNewsText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [result, setResult] = useState<{
    prediction: string;
    confidence: number;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);


  const handleAnalyze = async () => {
    if (!newsText.trim()) {
      alert('Please enter some text to analyze');
      return;
    }
    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const data = await predictApi(newsText);
      setResult({
        prediction: data.prediction,
        confidence: data.confidence,
      });
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsAnalyzing(false);
    }
  };

  

  return (
    <div className="news-analyzer">
      
      <Navbar />
      
      {/* Main Content */}
      <main className="main-content">
        <div className="title-section">
          <h1 className="title">Analyze News</h1>
          <p className="subtitle">Enter a news article or claim to verify its authenticity</p>
        </div>

        {/* Analysis Form */}
        <div className="form-card">
          <div className="form-group">
            <label className="form-label">Enter News Text</label>
            <p className="form-description">
              Paste the news article, headline, or claim you want to verify
            </p>
            <textarea
              value={newsText}
              onChange={(e) => setNewsText(e.target.value)}
              placeholder="Enter the news text here..."
              className="textarea"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!newsText.trim() || isAnalyzing}
            className={`analyze-btn ${(!newsText.trim() || isAnalyzing) ? 'disabled' : ''}`}
          >
            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {isAnalyzing ? 'Analyzing...' : 'Analyze News'}
          </button>
        </div>
      </main>
      
      {/* Result / Error */}
      <div className="result-area">
        {error && (
          <div className="result error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="result-card">
            <h2>Analysis Result</h2>
            <p>
              <strong>Prediction:</strong>{' '}
              <span className={result.prediction === 'Real' ? 'real' : 'fake'}>{result.prediction}</span>
            </p>
            <p>
              <strong>Confidence:</strong> {(Number(result.confidence) * 100).toFixed(1)}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

