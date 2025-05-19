import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import WindiCSS from 'vite-plugin-windicss'

export default ({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  return defineConfig({
    plugins: [react(), WindiCSS()],
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
      preserveSymlinks: true,
      alias: {
        '@': '/src',
        '../../redux': '/src/redux'
      }
    },
    build: {
      target: 'esnext',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: undefined,
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        },
      },
    },
    server: {
      host: '0.0.0.0',
      proxy: {
        '/api': env.VITE_BASE_URL || 'https://shoplink-b.onrender.com',
        '/uploads': env.VITE_BASE_URL || 'https://shoplink-b.onrender.com',
      },
      allowedHosts: [
        "  ac35-129-222-187-243.ngrok-free.app ", // current ngrok domain
        '.ngrok-free.app',     
        'shoplink.loca.lt',            // wildcard for future ngrok links
      ],
    },
  })
}
