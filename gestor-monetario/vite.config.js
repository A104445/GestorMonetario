import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      
      // ISTO É A MAGIA QUE FALTA PARA O LOCALHOST:
      devOptions: {
        enabled: true
      },
      
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Gestor Monetário',
        short_name: 'Gestor',
        description: 'A tua aplicação de gestão financeira pessoal.',
        theme_color: '#3b82f6', 
        background_color: '#ffffff',
        display: 'standalone', 
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})