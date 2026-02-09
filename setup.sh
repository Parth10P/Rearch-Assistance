#!/bin/bash
cd backend
python3.13 -m venv venv
source venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt

cd ..
echo "🚀 Setting up Frontend..."
cd frontend
npm install
cd ..

echo "✅ Setup Complete!"
echo "Run backend: cd backend && source venv/bin/activate && uvicorn app:app --reload"
echo "Run frontend: cd frontend && npm run dev"
