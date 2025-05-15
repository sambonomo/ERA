// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Global CSS
import { AuthProvider } from './contexts/AuthContext';
import { RecognitionProvider } from './contexts/RecognitionContext';
// If you want to measure performance, uncomment below
// import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <RecognitionProvider>
        <App />
      </RecognitionProvider>
    </AuthProvider>
  </React.StrictMode>
);

// If you want to measure performance (e.g. track page load times):
// reportWebVitals(console.log);
