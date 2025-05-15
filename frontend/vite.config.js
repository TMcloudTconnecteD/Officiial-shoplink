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
        "  ac35-129-222-187-243.ngrok-free.app ", // current ngrok domain
        '.ngrok-free.app',     
        'shoplink.loca.lt',            // wildcard for future ngrok links
      ],
    },
  })
}
