import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'src/pages/login/login.html'),
        perfil: resolve(__dirname, 'src/pages/perfil/perfil.html'),
        competicoes: resolve(__dirname, 'src/pages/competicoes/competicoes.html'),
        contratacao: resolve(__dirname, 'src/pages/contratacao/contratacao.html'),
      },
    },
  },
  server: {
    proxy: {
      '/studio': {
        target: 'http://localhost:3333',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});