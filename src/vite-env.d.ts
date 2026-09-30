/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SANITY_PROJECT_ID: string;
  readonly VITE_SANITY_DATASET?: string;
}

declare module '*.html?raw' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*?url' {
    const content: string;
    export default content;
  }

declare module '*.png' {
    const content: string;
    export default content;
}

declare module '*.jpg' {
    const content: string;
    export default content;
}

declare module '*.jpeg' {
    const content: string;
    export default content;
}

import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        competicoes: resolve(__dirname, 'src/pages/competicoes/competicoes.html'),
        contratacao: resolve(__dirname, 'src/pages/contratacao/contratacao.html'),
        login: resolve(__dirname, 'src/pages/login/login.html'),
        perfil: resolve(__dirname, 'src/pages/perfil/perfil.html'),
      },
    },
  },
})