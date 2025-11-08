import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
  // Оптимизация для DevTools
  server: {
    hmr: {
      // Увеличиваем таймаут для HMR, чтобы не конфликтовать с DevTools
      overlay: true,
    },
  },
  // Отключаем оптимизацию в dev режиме для лучшей работы DevTools
  optimizeDeps: {
    exclude: [],
  },
})
