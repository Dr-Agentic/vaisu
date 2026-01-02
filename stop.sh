#!/bin/bash
echo "🛑 Stopping Vaisu development servers..."

# Function to kill process on a port
kill_port() {
  local port=$1
  local pid=$(lsof -t -i:$port)
  if [ -n "$pid" ]; then
    echo "Killing process on port $port (PID: $pid)..."
    kill -9 $pid 2>/dev/null
  else
    echo "No process found on port $port."
  fi
}

# Kill Backend (3001)
kill_port 3001

# Kill Frontend (5173)
kill_port 5173

echo "✅ Servers stopped."
