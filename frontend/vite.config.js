import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import WindiCSS from 'vite-plugin-windicss'

export default defineConfig({
  plugins: [react(), WindiCSS()],
  server: {
    host:'0.0.0.0',
    proxy: {
      '/api': 'http://localhost:8000'
    },

  }
})