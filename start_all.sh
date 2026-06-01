#!/bin/bash

echo "Starting Soulify Services..."

# 1. Start Python Backend (Port 8000)
echo "Starting Python AI Backend (Port 8000)..."
cd /Users/devorbis/Desktop/Soulify_model
source venv/bin/activate
uvicorn api.main:app --reload --port 8000 &
PYTHON_PID=$!

# 2. Start Node.js Backend (Port 5000)
echo "Starting Node.js Auth/Report Backend (Port 5000)..."
cd /Users/devorbis/Downloads/Souli-frontend/backend
node server.js &
NODE_PID=$!

# 3. Start React Frontend (Port 5173)
echo "Starting React Frontend..."
cd /Users/devorbis/Downloads/Souli-frontend
npm run dev &
FRONTEND_PID=$!

echo "======================================================"
echo "✅ All services started successfully!"
echo "Python Backend running on: PID $PYTHON_PID"
echo "Node.js Backend running on: PID $NODE_PID"
echo "React Frontend running on: PID $FRONTEND_PID"
echo "======================================================"
echo "Press [CTRL+C] to stop all services."

# Wait for all background processes to finish
wait $PYTHON_PID $NODE_PID $FRONTEND_PID
