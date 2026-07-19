import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Cible du proxy WAMP — surchageable via VITE_DEV_API_HOST (.env local), sinon
// IPv4 explicite en dev pour éviter le problème localhost→IPv6.
const devApiHost = process.env.VITE_DEV_API_HOST || 'http://127.0.0.1'

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
        target: devApiHost,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/Capedig-coop-ca/backend/api'),
        secure: false,
      },
      '/uploads': {
        target: devApiHost,
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
