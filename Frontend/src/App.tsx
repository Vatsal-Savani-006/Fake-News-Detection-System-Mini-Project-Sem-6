import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './Pages/Loginpage';
import AnalyzePage from './Pages/AnalyzePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/Analysis" element={<AnalyzePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
