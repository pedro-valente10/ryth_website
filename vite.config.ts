// ryth_website/vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  // ... outras configurações do Vite que você já tiver ...
  server: {
    proxy: {
      '/studio': {
        target: 'http://localhost:3333', // Redireciona para o servidor do Sanity
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
