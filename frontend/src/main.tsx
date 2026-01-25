import React from 'react';
import ReactDOM from 'react-dom/client';

import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './design-system/ThemeProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark">
      <Router>
        <App />
      </Router>
    </ThemeProvider>
  </React.StrictMode>,
);
