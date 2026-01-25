import path from "path";
import { fileURLToPath } from "url";

import dotenv from "dotenv";

// Load .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Assuming this is running from backend/src/config/ or dist/backend/src/config/
// We want to load from backend root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`FATAL: Missing required environment variable: "${key}"`);
  }
  return value;
}

function getRequiredIntEnv(key: string): number {
  const value = getRequiredEnv(key);
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(
      `FATAL: Environment variable "${key}" must be a number, got: "${value}"`,
    );
  }
  return parsed;
}

export const env = {
  PORT: getRequiredIntEnv("PORT"),
  APP_URL: getRequiredEnv("APP_URL"), // Frontend URL
  API_URL: `http://localhost:${getRequiredIntEnv("PORT")}`, // Self URL
  NODE_ENV: process.env.NODE_ENV || "development",

  // External Services
  OPENROUTER_API_KEY: getRequiredEnv("OPENROUTER_API_KEY"),
  OPENROUTER_BASE_URL:
    process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",

  // Email (Resend)
  RESEND_API_KEY: process.env.RESEND_API_KEY || "", // User must provide this
  EMAIL_FROM: process.env.EMAIL_FROM || "onboarding@resend.dev",

  // AWS
  AWS_REGION: process.env.AWS_REGION || "us-east-1",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || "vaisu-documents-dev",

  // Tables
  DYNAMODB_DOCUMENTS_TABLE:
    process.env.DYNAMODB_DOCUMENTS_TABLE || "vaisu-documents",
  DYNAMODB_ANALYSES_TABLE:
    process.env.DYNAMODB_ANALYSES_TABLE || "vaisu-analyses",
  // ... other tables can rely on defaults or be strict if needed.
  // For now, focusing on Ports as requested.
  // User Management tables
  DYNAMODB_USERS_TABLE: process.env.DYNAMODB_USERS_TABLE || "vaisu-users",
  DYNAMODB_SESSIONS_TABLE:
    process.env.DYNAMODB_SESSIONS_TABLE || "vaisu-sessions",
  DYNAMODB_USER_LIMITS_TABLE:
    process.env.DYNAMODB_USER_LIMITS_TABLE || "vaisu-user-limits",

  // JWT secret for authentication
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",

  // Stripe
  STRIPE_SECRET_KEY: getRequiredEnv("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: getRequiredEnv("STRIPE_WEBHOOK_SECRET"),
  STRIPE_PRICE_ID_PRO: getRequiredEnv("STRIPE_PRICE_ID_PRO"),
};
