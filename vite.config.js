import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/widget/',
  build: {
    minify: 'esbuild',
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  server: {
    host: true,
    allowedHosts: [
      'localhost',
      '.trycloudflare.com', // Accetta tutti i domini cloudflare
    ],
  },
});
