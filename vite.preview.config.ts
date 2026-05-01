import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'preview-build',
    rollupOptions: {
      input: {
        main: 'index.html',
        calendar: 'calendar.html',
        reviews: 'reviews.html'
      }
    }
  }
});
