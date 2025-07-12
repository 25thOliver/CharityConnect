#!/bin/bash

echo "🚀 Starting backend deployment preparation..."

# Navigate to backend directory
cd charity-backend

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Run migrations
echo "🗄️ Running migrations..."
python manage.py migrate

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

echo "✅ Backend deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Deploy to Railway/Render with root directory: charity-backend"
echo "3. Set environment variables"
echo "4. Update CORS settings with your frontend domain" 