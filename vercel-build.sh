#!/bin/bash

echo "🔍 Debugging Vercel build process..."
echo "📁 Current directory: $(pwd)"
echo "📁 Contents of current directory:"
ls -la

echo ""
echo "📁 Contents of frontend-react directory:"
ls -la frontend-react/

echo ""
echo "📁 Contents of frontend-react/src directory:"
ls -la frontend-react/src/

echo ""
echo "🔍 Checking if App.js exists:"
if [ -f "frontend-react/src/App.js" ]; then
    echo "✅ App.js exists"
    echo "📄 First few lines of App.js:"
    head -5 frontend-react/src/App.js
else
    echo "❌ App.js NOT found!"
fi

echo ""
echo "🚀 Starting build process..."
cd frontend-react && npm install && npm run build
cd ..
echo "✅ Build completed!"