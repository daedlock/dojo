import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Proxy API requests to the backend
      '/api': 'http://localhost',
      '/pwncollege_api': 'http://localhost',

      // Proxy asset requests to the backend
      '/belt': 'http://localhost',
      '/static': 'http://localhost',
      '/assets': 'http://localhost',

      // Proxy any other backend routes that might be needed
      '/admin': 'http://localhost',
      '/teams': 'http://localhost',
      '/users': 'http://localhost',
      '/challenges': 'http://localhost',
      '/scoreboard': 'http://localhost',
    }
  }
})
