import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

const analyze = process.env.ANALYZE === 'true';

export default defineConfig({
  plugins: [
    react(),
    ...(analyze
      ? [
          visualizer({
            filename: 'build/stats.html',
            open: true,
            gzipSize: true,
            brotliSize: true
          })
        ]
      : [])
  ],
  server: {
    host: true
  },
  build: {
    outDir: 'build',
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
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'BukazuPortal',
      formats: ['es', 'umd'],
      fileName: (format) => `portal.${format}.js`,
      cssFileName: 'index'
    },
    rolldownOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'ReactJSXRuntime',
          'react/jsx-dev-runtime': 'ReactJSXDevRuntime'
        },
        minify: true
      }
    }
  }
});
