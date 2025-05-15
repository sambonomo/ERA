// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Your global CSS

import { AuthProvider } from './contexts/AuthContext';
import { RecognitionProvider } from './contexts/RecognitionContext';

// MUI imports
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// A more fully fleshed-out SparkBlaze theme
const sparkBlazeTheme = createTheme({
  palette: {
    primary: {
      main: '#ff6b6b', // Vibrant coral for brand
    },
    secondary: {
      main: '#1dd1a1', // Teal
    },
    error: {
      main: '#e74c3c', // A standard red
    },
    warning: {
      main: '#f1c40f', // Warm yellow
    },
    info: {
      main: '#3498db', // Medium blue
    },
    success: {
      main: '#2ecc71', // Green for success
    },
    background: {
      default: '#f8f9fa', // Light grey background
      paper: '#fff',      // Paper surfaces
    },
    text: {
      primary: '#2f3542', // Dark grey for primary text
      secondary: '#666',  // Mid grey for secondary text
    },
  },
  shape: {
    borderRadius: 8, // Slightly more rounded corners
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
    // Overriding some default heading styles if you like:
    h1: {
      fontWeight: 700,
      fontSize: '2.2rem',
      // Additional overrides, e.g. lineHeight
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.8rem',
    },
    // ... and so on for h3, h4, etc.
    button: {
      textTransform: 'none', // Buttons won't auto-uppercase
      fontWeight: 600,
    },
  },
  components: {
    // Example overrides
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Ensure text is not all caps
          borderRadius: 6,
        },
        containedPrimary: {
          color: '#fff',
          '&:hover': {
            backgroundColor: '#e55a5a',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 8,
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ThemeProvider theme={sparkBlazeTheme}>
      <CssBaseline />
      <AuthProvider>
        <RecognitionProvider>
          <App />
        </RecognitionProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
