import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import WindiCSS from 'vite-plugin-windicss'

export default ({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  return defineConfig({
    plugins: [react(), WindiCSS()],
    server: {
      host: '0.0.0.0',
      proxy: {
        '/api': env.VITE_BASE_URL || 'http://localhost:8000',
        '/uploads': env.VITE_BASE_URL || 'http://localhost:8000',
      },
      allowedHosts: [
        "  https://add4-129-222-147-205.ngrok-free.app ", // current ngrok domain
        '.ngrok-free.app',                     // wildcard for future ngrok links
      ],
    },
  })
}
