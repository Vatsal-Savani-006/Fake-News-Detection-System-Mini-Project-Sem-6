// import React from 'react';
// import './css/Navbar.css';
// import { predictApi, logoutApi } from "../api";
import { logoutApi } from '../api';
import './css/AnalyzePage.css';

const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("user");
    window.location.href = "/";
  };

 function Navbar() {
    return (
        <>
      {/* Header */}
      <header className="header">
        <div className="header-container">
          {/* Logo */}
          <div className="logo-section">
            <div className="logo-icon">
              <svg className="checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="logo-text">Check4Facts</span>
          </div>

          {/* Navigation */}
          <nav className="nav">
            <button className="nav-btn">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile</span>
            </button>
            <button className="nav-btn" onClick={handleLogout} aria-label="Logout">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </header>
      </>
    );
}

export default Navbar;