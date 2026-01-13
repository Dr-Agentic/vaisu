#!/bin/bash
echo "🛑 Stopping Vaisu development servers..."

# Source ports from backend/.env if available
if [ -f backend/.env ]; then
  # Use grep/cut to extract values to avoid sourcing the whole file which might have issues
  # Or just source it if we trust it. Sourcing is easier.
  set -a
  source backend/.env
  set +a
fi

# Set defaults if not found in .env
PORT=${PORT:-7001}
# Frontend port isn't in backend/.env usually, so we default to 7002 or need to add it there?
# The user asked scripts to use ports defined in .env.
# I set APP_URL=http://localhost:7002 in .env, so I can parse that or just default to 7002.
# Let's try to extract port from APP_URL if possible, or just default to 7002.
FRONTEND_PORT=7002

# If APP_URL is set, try to extract port
if [ ! -z "$APP_URL" ]; then
  # Extract port using basic regex or cut
  # http://localhost:7002 -> 7002
  extracted_port=$(echo $APP_URL | sed -E 's/.*:([0-9]+).*/\1/')
  # Check if it's a number
  if [[ "$extracted_port" =~ ^[0-9]+$ ]]; then
    FRONTEND_PORT=$extracted_port
  fi
fi

echo "Configuration:"
echo "  Backend Port: $PORT"
echo "  Frontend Port: $FRONTEND_PORT"

# Function to kill process on a port
kill_port() {
  local port=$1
  if [ -z "$port" ]; then return; fi
  
  local pid=$(lsof -t -i:$port)
  if [ -n "$pid" ]; then
    echo "Killing process on port $port (PID: $pid)..."
    kill -9 $pid 2>/dev/null
  else
    echo "No process found on port $port."
  fi
}

# Kill Backend
kill_port $PORT

# Kill Frontend
kill_port $FRONTEND_PORT

echo "✅ Servers stopped."