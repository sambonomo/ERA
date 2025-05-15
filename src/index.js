// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Your global CSS for any non-MUI styles

import { AuthProvider } from './contexts/AuthContext';
import { RecognitionProvider } from './contexts/RecognitionContext';

// MUI imports
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Example: define a custom SparkBlaze theme
const sparkBlazeTheme = createTheme({
  palette: {
    primary: {
      main: '#ff6b6b', // Vibrant coral
    },
    secondary: {
      main: '#1dd1a1', // Teal
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
    // Adjust default heading styles, etc. if desired
  },
  // You can customize components or breakpoints here if needed
  // components: {
  //   MuiButton: {
  //     styleOverrides: {
  //       root: {
  //         textTransform: 'none',
  //         borderRadius: '6px',
  //       },
  //     },
  //   },
  // },
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* Provide the custom MUI theme to the entire app */}
    <ThemeProvider theme={sparkBlazeTheme}>
      {/* Global Material UI resets & baseline */}
      <CssBaseline />

      <AuthProvider>
        <RecognitionProvider>
          <App />
        </RecognitionProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
