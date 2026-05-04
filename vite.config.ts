import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'inline',
        devOptions: {
          enabled: true,
          type: 'module'
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          navigateFallback: '/index.html',
          cleanupOutdatedCaches: true
        },
        includeAssets: ['logo.svg'],
        manifest: {
          id: '/',
          name: 'AccounX Pro - Financial System',
          short_name: 'AccounX',
          description: 'Sistem akuntansi profesional berbasis cloud',
          theme_color: '#4f46e5',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '.',
          scope: '/',
          icons: [
            {
              src: 'logo.svg',
              sizes: '192x192 512x512',
              type: 'image/svg+xml',
              purpose: 'any'
            },
            {
              src: 'logo.svg',
              sizes: '192x192 512x512',
              type: 'image/svg+xml',
              purpose: 'maskable'
            }
          ]
        }
      })
    ],
    base: '/',
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          sales: path.resolve(__dirname, 'sales.html'),
          purchase: path.resolve(__dirname, 'purchase.html'),
          finance: path.resolve(__dirname, 'finance.html'),
          masterdata: path.resolve(__dirname, 'masterdata.html'),
          accounting: path.resolve(__dirname, 'accounting.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
