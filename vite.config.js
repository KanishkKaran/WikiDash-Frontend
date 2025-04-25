import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'https://wikidash-backend.onrender.com' // ✅ use live backend on Render
    }
  },
  define: {
    'process.env': {} // 🔧 optional: avoids issues if env used
  }
})
