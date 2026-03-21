// import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './Pages/Loginpage';
import AnalyzePage from './Pages/AnalyzePage';
import DashboardPage from './Pages/DashboardPage';
import ProfilePage from './Pages/ProfilePage';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/Analysis" element={<AnalyzePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
