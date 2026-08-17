import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/recharts')) return 'charts';
          if (id.includes('node_modules/html5-qrcode')) return 'scanner';
          if (id.includes('node_modules/@stripe/')) return 'payments';
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) return 'react';
        },
      },
    },
  },
})
