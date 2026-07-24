import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // No GitHub Pages o site fica em usuario.github.io/controle-de-cria/, não
  // na raiz — só nesse build (feito pela Action de publicação) o caminho
  // muda. Localmente (npm run dev / npm run build) continua "/".
  base: process.env.GITHUB_PAGES ? '/controle-de-cria/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png'],
      manifest: {
        name: 'Controle de Cria — Fazenda São Lourenço',
        short_name: 'Controle de Cria',
        description: 'Controle do rebanho de cria, para uso sem internet no curral.',
        start_url: '.',
        display: 'standalone',
        background_color: '#F7F1E4',
        theme_color: '#4A2E1A',
        lang: 'pt-BR',
        icons: [
          {
            src: 'icones/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icones/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icones/icon-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,woff2}'],
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
})
