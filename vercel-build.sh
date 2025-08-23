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
echo "🔍 Checking if App.tsx exists:"
if [ -f "frontend-react/src/App.tsx" ]; then
    echo "✅ App.tsx exists"
    echo "📄 First few lines of App.tsx:"
    head -5 frontend-react/src/App.tsx
else
    echo "❌ App.tsx NOT found!"
fi

echo ""
echo "🚀 Starting build process..."
cd frontend-react
npm install
npm run build