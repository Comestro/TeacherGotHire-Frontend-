import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration
export default defineConfig({
  plugins: [react()],
  base: '/', 

  server: {
    proxy: {
      '/api': process.env.VITE_API_URL || 'https://ptpi.tech/', // Proxy API requests if needed
    },
  },
});
