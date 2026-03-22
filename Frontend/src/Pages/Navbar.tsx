// import React from 'react';
// import './css/Navbar.css';
// import { predictApi, logoutApi } from "../api";
import { logoutApi } from '../api';
import './css/AnalyzePage.css';
import { useNavigate } from 'react-router-dom';

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
    const navigator = useNavigate();
    return (
        <>
      {/* Header */}
      <header className="header">
        <div className="header-container">
          {/* Logo */}
          <div className="logo-section">
            <div className="logo-icon">
             <svg 
    className="w-10 h-10" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="shieldGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
    </defs>

    <path 
      d="M12 2L4 6V11C4 16.55 7.84 21.74 12 23C16.16 21.74 20 16.55 20 11V6L12 2Z" 
      fill="url(#shieldGradient)"
    />

    <path 
      d="M9 12L11 14L15 10" 
      stroke="white" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
            </div>
            
            <span className="logo-text">TrustGuard</span>
          </div>

          {/* Navigation */}
          <nav className="nav">
            <button className="nav-btn" onClick={()=>navigator("/dashboard")}>
              <svg 
  className="icon" 
  fill="none" 
  stroke="currentColor" 
  viewBox="0 0 24 24"
>
  <path 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    strokeWidth={2} 
    d="M3 12l9-9 9 9M4 10v10h5v-6h6v6h5V10"
  />
</svg>
              <span>Dashboard</span>
            </button>
            <button className="nav-btn"   onClick={()=>navigator("/profile")} >
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