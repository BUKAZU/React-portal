import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration for the self-contained website build.
 *
 * Unlike the library build (vite.config.ts), React and all other dependencies
 * are bundled into the output so that the resulting file can be dropped into
 * any HTML page without any additional tooling or package manager.
 *
 * Output: build/portal.website.js  (IIFE, all dependencies inlined)
 *         build/portal.website.css (extracted styles)
 */
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
    emptyOutDir: false,
    reportCompressedSize: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      mangle: {
        safari10: true
      }
    },
    lib: {
      entry: resolve(__dirname, 'src/website.tsx'),
      name: 'BukazuPortal',
      formats: ['iife'],
      fileName: () => 'portal.website.js',
      cssFileName: 'portal.website'
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  }
});
