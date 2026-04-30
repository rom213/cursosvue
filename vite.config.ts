import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss(), cloudflare()],
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('apexcharts') || id.includes('vue3-apexcharts'))
              return 'vendor-charts'
            if (id.includes('vue3-google-login'))
              return 'vendor-google'
            if (id.includes('/vue/') || id.includes('pinia') || id.includes('vue-router'))
              return 'vendor-core'
            return 'vendor'
          }
        }
      },
    },
  },
})