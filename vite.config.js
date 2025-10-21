import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  server: {
    proxy: {
      '/api': 'https://wikidash-backend.onrender.com' 
    },
    historyApiFallback: true,
  },
  

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  
  preview: {
    port: 4173,
    host: true,
    historyApiFallback: true,
  },
  
  define: {
    'process.env': {} 
  }
})
