#!/bin/bash

echo "🚀 Starting frontend deployment preparation..."

# Navigate to frontend directory
cd charity-frontend

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Build for production
echo "🔨 Building for production..."
npm run build

echo "✅ Frontend deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Deploy to Vercel/Netlify with root directory: charity-frontend"
echo "3. Set environment variable: VITE_API_URL=https://your-backend-domain.com/api"
echo "4. Update backend CORS settings with your frontend domain" 