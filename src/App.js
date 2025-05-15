import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import RewardStore from './pages/RewardStore';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/rewards" element={<RewardStore />} />
      </Routes>
    </Router>
  );
}

export default App;
