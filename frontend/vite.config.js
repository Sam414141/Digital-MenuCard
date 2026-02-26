import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      protocolImports: true,
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      modules: {
        events: true,
        util: true,
      }
    }),
  ],
  server: {
    host: true, // Allow external connections
    port: 5174,
    hmr: {
      port: 5174,
      host: 'localhost' // Use localhost for HMR in development
    }
    ,
    // Dev proxy: forward /api to backend during development to avoid CORS issues
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Use HTTP to match backend
        changeOrigin: true,
        secure: false, // Self-signed certificates
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})