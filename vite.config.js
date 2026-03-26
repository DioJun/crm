import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    include: [
      '@fullcalendar/core',
      '@fullcalendar/timegrid',
      '@fullcalendar/interaction',
    ],
  },
  server: {
    port: 5173,
    open: true
  },
  build: {
    target: 'esnext',
    minify: 'terser'
  }
})
