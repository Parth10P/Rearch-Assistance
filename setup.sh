#!/bin/bash

# Simple Setup Script with Version Check

echo "🚀 Setting up Backend..."

# Find Python 3.12 or 3.11 explicitly
if command -v python3.12 &> /dev/null; then
    PYTHON_CMD=python3.12
elif command -v python3.11 &> /dev/null; then
    PYTHON_CMD=python3.11
else
    # Fallback but check version
    PYTHON_CMD=python3
fi

echo "Using Python: $PYTHON_CMD"
$PYTHON_CMD -m venv venv
source venv/bin/activate

# Upgrade pip and install
pip install --upgrade pip
pip install -r requirements.txt

echo "🚀 Setting up Frontend..."
cd frontend
npm install
cd ..

echo "✅ Setup Complete!"
echo "Run backend: source venv/bin/activate && uvicorn app:app --reload"
echo "Run frontend: cd frontend && npm run dev"
