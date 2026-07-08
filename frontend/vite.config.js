import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    host: true,          // Écoute sur toutes les interfaces (localhost ET 127.0.0.1)
    hmr: {
      host: '127.0.0.1',
      port: 5173,
    },
    // ── Proxy : redirige /api/* vers WAMP (PHP backend) ──────
    proxy: {
      '/api': {
        target: 'http://127.0.0.1',   // IPv4 explicite — évite le problème localhost→IPv6
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/Capedig-coop-ca/backend/api'),
        secure: false,
      },
      '/uploads': {
        target: 'http://127.0.0.1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/uploads/, '/Capedig-coop-ca/backend/uploads'),
        secure: false,
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false, // désactive les sourcemaps en production
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Découpe le bundle en chunks pour des chargements plus rapides
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          quill: ['quill'],
          utils: ['axios'],
        },
      },
    },
  },

  // Variables d'environnement accessibles dans React avec import.meta.env
  // Les variables VITE_ sont exposées côté client (pas les autres)
  envPrefix: 'VITE_',
})
