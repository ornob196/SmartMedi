// ─── Vite Configuration ───────────────────────────────────────────────────────
// Proxies /api requests to the backend at localhost:5001
// This avoids CORS issues during development.

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
  server: {
    port: 5173,
    proxy: {
      // All /api/* requests → http://localhost:5001
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      // All /uploads/* requests → http://localhost:5001 (static files)
      '/uploads': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
