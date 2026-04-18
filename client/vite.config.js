import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  envDir: '../',
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    hmr: {
      protocol: 'wss',
      clientPort: 443,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
