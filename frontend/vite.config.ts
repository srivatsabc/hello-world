import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Date: October 1, 2026
// Name: Sri
// Desc: Dev server pinned to 5430, proxying /api to the backend on 8430,
//       and polling watch mode since /c/ (DrvFs on WSL2) misses native fs
//       events. host: true so the URL/port never needs a CLI flag added.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5430,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8430',
        changeOrigin: true,
      },
      '/diagram': {
        target: 'http://localhost:8440',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/diagram/, ''),
      },
    },
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
