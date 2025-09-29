import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from "path";
import compression from 'vite-plugin-compression';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      deleteOriginFile: false,
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/ace-builds/src-noconflict/worker-javascript.js',
          dest: 'ace'
        }
      ]
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://gisonline.vietbando.vn',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/oauth': {
        target: 'https://gisonline.vietbando.vn',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/oauth/, ''),
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});