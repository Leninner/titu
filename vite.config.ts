import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['fonts/*'],
      manifest: {
        name: 'Mi titulación FISEI',
        short_name: 'Mi titulación',
        theme_color: '#f1eef6',
        background_color: '#faf9fc',
        display: 'standalone',
      },
      workbox: {
        globPatterns: ['**/*.{js,mjs,css,html,woff,woff2,ttf,txt}'],
        maximumFileSizeToCacheInBytes: 8000000,
      },
    }),
  ],
})
