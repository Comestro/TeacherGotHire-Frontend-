// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       '/api': 'http://127.0.0.1:8000', // Proxy API requests to Django server
//     },
//   },
//   build: {
//     rollupOptions: {
//       output: {
//         manualChunks(id) {
//           if (id.includes('node_modules')) {
//             return id.toString().split('node_modules/')[1].split('/')[0].toString();
//           }
//         }
//       }
//     },
//     chunkSizeWarningLimit: 1000, // Adjust the chunk size warning limit if needed
//   },
// })

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
