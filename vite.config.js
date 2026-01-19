import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: '/widget/',
  build: {
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-framer': ['framer-motion'],
          'vendor-ogl': ['ogl'],
          'vendor-react-core': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  esbuild: {
    // Only drop console in production builds
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  server: {
    host: true,
    allowedHosts: [
      'localhost',
      '.trycloudflare.com', // Accetta tutti i domini cloudflare
    ],
  },
}));
