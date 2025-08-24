#!/bin/bash

# Vercel Deployment Script for AirVXM Platform
echo "🚀 Starting Vercel deployment for AirVXM Platform..."

# Kiểm tra Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Build project local để test trước
echo "🔨 Building project locally first..."
cd frontend-react
npm ci
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Local build successful!"
    cd ..
    
    # Deploy lên Vercel
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    
    echo "🎉 Deployment completed!"
    echo "📝 Check your deployment at: https://vercel.com/dashboard"
else
    echo "❌ Local build failed! Please fix errors before deploying."
    exit 1
fi