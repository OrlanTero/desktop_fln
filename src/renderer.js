// Import polyfills first
import './polyfills';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';

// Create root element
const container = document.getElementById('root');
const root = createRoot(container);

// Render the application
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);

// Handle API test button
window.addEventListener('DOMContentLoaded', () => {
  // This is where you would add any non-React specific initialization
  console.log('Renderer process loaded');
});