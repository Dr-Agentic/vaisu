// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
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
  const possiblePaths = [
    path.join(__dirname, '../../../../frontend/dist'), // Relative to dist/src/server.js
    path.join(process.cwd(), '../frontend/dist'),      // Relative to process working directory (backend)
    path.join(process.cwd(), 'frontend/dist'),         // If running from root
  ];

  let frontendDistPath = '';
  for (const p of possiblePaths) {
    if (import.meta.url.startsWith('file:')) {
      const fs = await import('fs');
      if (fs.existsSync(p)) {
        frontendDistPath = p;
        break;
      }
    }
  }

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
    console.warn('⚠️  Frontend static files not found in any expected location:');
    possiblePaths.forEach(p => console.warn(`   - ${p}`));
  }
}

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
