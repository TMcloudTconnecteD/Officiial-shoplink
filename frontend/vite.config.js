import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import WindiCSS from 'vite-plugin-windicss'

export default defineConfig({
  plugins: [react(), WindiCSS()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': 'http://localhost:8000',
      '/uploads': 'http://localhost:8000',
    },
    allowedHosts: [
      "d475-105-163-157-229.ngrok-free.app ", // current ngrok domain
      '.ngrok-free.app',                     // wildcard for future ngrok links
    ],
  },
})
