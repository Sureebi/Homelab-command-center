import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'


export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: [
        'favicon.svg',
        'icons.svg',
      ],

      manifest: {
        name: 'SUREEPI Infrastructure Dashboard',
        short_name: 'SUREEPI',

        description:
          'SUREEPI Infrastructure Dashboard',

        start_url: '/',
        scope: '/',

        display: 'standalone',

        orientation: 'portrait',

        background_color:
          '#11171d',

        theme_color:
          '#11171d',

        icons: [
          {
            src:
              '/pwa-192x192-v2.png',

            sizes:
              '192x192',

            type:
              'image/png',
          },

          {
            src:
              '/pwa-512x512-v2.png',

            sizes:
              '512x512',

            type:
              'image/png',
          },

          {
            src:
              '/pwa-512x512-v2.png',

            sizes:
              '512x512',

            type:
              'image/png',

            purpose:
              'maskable',
          },
        ],
      },

      workbox: {
        navigateFallback:
          '/index.html',

        cleanupOutdatedCaches:
          true,

        importScripts: [
          '/push-sw.js',
        ],

        globPatterns: [
          '**/*.{js,css,html,svg,png,ico}',
        ],

        runtimeCaching: [
          {
            urlPattern:
              /^\/api\//,

            handler:
              'NetworkOnly',
          },
        ],
      },
    }),
  ],


  server: {
    host: '0.0.0.0',
  },
})
