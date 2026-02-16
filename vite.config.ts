import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Для GitHub Pages: замените на имя репозитория, например: '/Сайт-с-заданиями-на-ГИТ/'
const base = process.env.GITHUB_PAGES_BASE || '/';

export default defineConfig({
  plugins: [react()],
  base,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
