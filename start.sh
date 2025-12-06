#!/bin/bash

echo "🚀 Starting Vaisu..."

# Check if .env exists
if [ ! -f backend/.env ]; then
    echo "⚠️  backend/.env not found. Creating from example..."
    cp backend/.env.example backend/.env
    echo "📝 Please edit backend/.env and add your OPENROUTER_API_KEY"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the application
echo "✅ Starting development servers..."
npm run dev
