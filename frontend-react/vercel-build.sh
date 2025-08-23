#!/bin/bash

echo "🔍 Debugging Vercel build process..."
echo "📁 Current directory: $(pwd)"
echo "📁 Contents of current directory:"
ls -la

echo ""
echo "📁 Contents of src directory:"
ls -la src/

echo ""
echo "📁 Contents of src/components directory:"
ls -la src/components/

echo ""
echo "🔍 Checking if App.tsx exists:"
if [ -f "src/App.tsx" ]; then
    echo "✅ App.tsx exists"
    echo "📄 First few lines of App.tsx:"
    head -5 src/App.tsx
else
    echo "❌ App.tsx NOT found!"
fi

echo ""
echo "🚀 Starting build process..."
npm run build