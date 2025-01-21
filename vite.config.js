import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration
export default defineConfig({
  plugins: [react()],
  base: '/', 

  server: {
    proxy: {
      '/api': process.env.VITE_API_URL || 'http://127.0.0.1:8000', // Proxy API requests if needed
    },
  },
});
