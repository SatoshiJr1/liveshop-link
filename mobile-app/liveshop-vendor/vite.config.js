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
      includeAssets: ['favicon.jpg'],
      manifest: {
        name: 'LiveShop Vendor',
        short_name: 'LS Vendor',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#111827',
        icons: [
          { src: '/favicon.jpg', sizes: '512x512', type: 'image/jpeg' }
        ]
      },
      workbox: {
        navigateFallback: '/offline.html',
        runtimeCaching: [
          {
            // Ne jamais mettre en cache la page d'offline pour éviter le faux "hors ligne" en prod
            urlPattern: ({ url }) => url.pathname.endsWith('/offline.html'),
            handler: 'NetworkOnly'
          },
          {
            urlPattern: ({ request }) => ['script', 'style', 'font'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'assets' }
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            // API: NetworkFirst pour GET, timeout plus long pour éviter faux hors-ligne
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            method: 'GET',
            options: { cacheName: 'api', networkTimeoutSeconds: 10 }
          },
          {
            urlPattern: ({ url, request }) => url.pathname.startsWith('/api/products') && ['POST','PUT','DELETE'].includes(request.method),
            handler: 'NetworkOnly',
            options: {
              backgroundSync: {
                name: 'products-queue',
                options: {
                  maxRetentionTime: 24 * 60
                }
              }
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
