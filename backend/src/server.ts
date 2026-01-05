// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import documentsRouter from './routes/documents.js';
import { validateAWSConfig } from './config/aws.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ extended: true, limit: '1gb' }));

// API Routes
app.use('/api/documents', documentsRouter);

// Health check
app.all('/api/health', (req: any, res: any) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve frontend static files in production
if (isProduction) {
  // Try multiple possible locations for frontend/dist
  // In Render, CWD is usually the 'backend' folder, so '../frontend/dist' is the target.
  const possiblePaths = [
    path.resolve(process.cwd(), '../frontend/dist'),
    path.resolve(__dirname, '../../../../frontend/dist'),
    path.resolve(process.cwd(), 'frontend/dist')
  ];

  console.log('🔍 Searching for frontend build in:', possiblePaths);

  const frontendDistPath = possiblePaths.find(p => fs.existsSync(p));

  if (frontendDistPath) {
    console.log(`📡 Serving frontend from: ${frontendDistPath}`);
    app.use(express.static(frontendDistPath));

    // Handle client-side routing - serve index.html for all non-API routes
    app.get('*', (req: any, res: any) => {
      // Don't intercept API routes
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
      }
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
  } else {
    console.warn('⚠️  Frontend static files not found in any expected location.');
    // Fallback route to indicate server is running but frontend is missing
    app.get('*', (req: any, res: any) => {
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
      }
      res.status(500).send(`
        <h1>Backend Online</h1>
        <p>The backend is running, but the frontend build could not be located.</p>
        <p>Checked paths:</p>
        <ul>${possiblePaths.map(p => `<li>${p}</li>`).join('')}</ul>
      `);
    });
  }
}

// Global 404 handler for unmatched routes
app.use('*', (req: any, res: any) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    environment: process.env.NODE_ENV || 'development',
    message: 'The requested resource was not found on this server.'
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Validate AWS configuration on startup
try {
  validateAWSConfig();
} catch (error) {
  console.error('⚠️  AWS configuration error:', error instanceof Error ? error.message : error);
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Vaisu backend server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});

export default app;
