import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import socialPreviewHandler from './api/social-preview.js'

export default defineConfig({
  plugins: [
    { name: 'social-preview-api', configureServer(server) {
      server.middlewares.use('/api/social-preview', (req, res) => {
        res.status = code => { res.statusCode = code; return res; };
        res.json = data => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); };
        return socialPreviewHandler(req, res);
      });
    } },
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
})
