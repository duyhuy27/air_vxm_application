import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      'leaflet',
      'leaflet.heat',
      'leaflet.markercluster',
      'react-leaflet'
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          leaflet: ['leaflet', 'react-leaflet'],
          ui: ['framer-motion', 'lucide-react'],
          charts: ['recharts'],
          router: ['react-router-dom'],
        },
      },
    },
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
    // Ensure static assets are copied correctly
    assetsInlineLimit: 0,
    // Copy public assets to dist
    copyPublicDir: true,
  },
  server: {
    port: 3000,
    host: true,
    // Configure proper MIME types for JSON files
    fs: {
      strict: false,
    },
  },
  preview: {
    port: 3000,
    host: true,
  },
  // Ensure JSON files are served with correct MIME type
  assetsInclude: ['**/*.json'],
  // Public directory configuration
  publicDir: 'public',
})
