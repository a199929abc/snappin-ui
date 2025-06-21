import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import * as fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(),
      // Fix for SPA routing with dots in URL (like JWT tokens)
      {
        name: 'spa-fallback',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            // Only handle GET requests that don't start with special prefixes
            if (req.method === 'GET' && 
                !req.url?.startsWith('/@') && 
                !req.url?.startsWith('/api/')) {
              
              // Check if it's a gallery route (even with dots in JWT tokens)
              if (req.url?.startsWith('/gallery/')) {
                req.url = '/'
              }
            }
            next()
          })
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/components': path.resolve(__dirname, './src/components'),
        '@/pages': path.resolve(__dirname, './src/pages'),
        '@/hooks': path.resolve(__dirname, './src/hooks'),
        '@/utils': path.resolve(__dirname, './src/utils'),
        '@/types': path.resolve(__dirname, './src/types'),
        '@/services': path.resolve(__dirname, './src/services'),
        '@/assets': path.resolve(__dirname, './src/assets'),
      },
    },
    server: {
      port: 3000,
      host: true, // Enable access from network
      https: {
        key: fs.readFileSync('localhost+2-key.pem'),
        cert: fs.readFileSync('localhost+2.pem'),
      },
      proxy: {
        '/api': {
          target: 'https://localhost:8080',
          changeOrigin: true,
          secure: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  }
}) 