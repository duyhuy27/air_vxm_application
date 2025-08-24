import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          charts: ['recharts', 'framer-motion'],
          // Tách leaflet và plugins thành chunk riêng để đảm bảo load order
          leaflet: ['leaflet'],
        },
      },
    },
    // Đảm bảo không tree-shake Leaflet plugins
    commonjsOptions: {
      include: [/leaflet/, /node_modules/],
    },
  },
})