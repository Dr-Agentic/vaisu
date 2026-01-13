import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root (assuming tests run from project root or similar depth)
dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`TEST SETUP FATAL: Missing required environment variable: ${key}`);
  }
  return value;
}

export const testEnv = {
  PORT: parseInt(process.env.PORT || '7001', 10),
  APP_URL: process.env.APP_URL || 'http://localhost:7002',
  API_URL: `http://localhost:${process.env.PORT || '7001'}/api`,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || 'test-key',
};
