// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import pages
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import SubscriptionPage from './pages/SubscriptionPage';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import RewardStore from './pages/RewardStore';
// (Optional) If you implement a NotFound page for unmatched routes
// import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />

        {/* Auth-protected or internal routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/rewards" element={<RewardStore />} />

        {/* Optional 404 route */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
