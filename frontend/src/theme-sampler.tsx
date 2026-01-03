import React from 'react';
import ReactDOM from 'react-dom/client';
import ComponentSamplerDemo from './electron/ComponentSamplerDemo';
import { ThemeProvider } from './design-system/ThemeProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark">
      <ComponentSamplerDemo />
    </ThemeProvider>
  </React.StrictMode>
);
