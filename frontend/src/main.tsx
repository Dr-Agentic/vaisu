import React from 'react';
import ReactDOM from 'react-dom/client';
import AppElectron from './AppElectron';
import { ThemeProvider } from './design-system/ThemeProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark">
      <AppElectron />
    </ThemeProvider>
  </React.StrictMode>
);
