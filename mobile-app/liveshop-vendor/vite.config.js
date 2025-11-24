import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.jpg', 'apple-touch-icon.png'],
      manifest: {
        name: 'LiveShop Link - Espace Vendeur',
        short_name: 'LiveShop Vendor',
        description: 'L\'app qui vend pour vous pendant que vous animez vos lives',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#8B5CF6',
        scope: '/',
        lang: 'fr',
        categories: ['business', 'shopping', 'productivity'],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          {
            src: '/screenshot-mobile.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ]
      },
      workbox: {
        // Désactiver le navigateFallback pour éviter les faux "hors ligne"
        navigateFallback: null,
        runtimeCaching: [
          {
            // Assets statiques : cache avec revalidation
            urlPattern: ({ request }) => ['script', 'style', 'font'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
            options: { 
              cacheName: 'assets',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 } // 7 jours
            }
          },
          {
            // Images : cache first avec expiration
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            // API calls : toujours NetworkFirst avec timeout court
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: { 
              cacheName: 'api',
              networkTimeoutSeconds: 3, // Timeout court pour éviter faux hors-ligne
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 5 } // 5 minutes
            }
          },
          {
            // Pages HTML : NetworkFirst pour éviter le cache des pages
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: { 
              cacheName: 'pages',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 5 }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(new URL('.', import.meta.url).pathname, "./src"),
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  server: {
    port: 5173,
    host: true
  },
  build: {
    rollupOptions: {
      external: ['crypto'],
    },
  }
})
