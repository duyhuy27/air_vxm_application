#!/bin/bash

echo "🚀 Deploying AirVXM Frontend to Vercel..."

# Kiểm tra Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Deploy lên Vercel
echo "📤 Deploying to Vercel..."
vercel --prod --yes

echo "✅ Deployment completed!"
echo "🌐 Check your Vercel dashboard for the URL"