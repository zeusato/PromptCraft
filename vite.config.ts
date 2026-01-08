import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    // Base path for GitHub Pages - repo name
    base: mode === 'production' ? '/PromptCraft/' : '/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true
        },
        includeAssets: ['favicon.png', 'robots.txt', 'pwa-192x192.png'],
        manifest: {
          id: "promptcraft-vn",
          name: "PromptCraft VN",
          short_name: "PromptCraft",
          description: "Tối ưu hóa prompt đa tác vụ với Gemini",
          start_url: "./",
          scope: "./",
          display: "standalone",
          background_color: "#0f172a",
          theme_color: "#0f172a",
          icons: [
            {
              src: "./pwa-192x192.png",
              sizes: "192x192",
              type: "image/png"
            },
            {
              src: "./pwa-512x512.png",
              sizes: "512x512",
              type: "image/png"
            }
          ]
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
