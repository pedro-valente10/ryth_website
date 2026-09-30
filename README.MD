# RYTH Website

Site institucional da RYTH, construído com **Vite + TypeScript**, sem framework de UI (HTML/CSS/TS puro).

## Stack

- [Vite](https://vitejs.dev/) — bundler e dev server
- TypeScript
- HTML + CSS puro (sem framework de UI)

## Pré-requisitos

- Node.js (LTS mais recente recomendado)
- npm

## Estrutura de pastas

```
ryth_website/
├── index.html                  # Página inicial (home) — entry point do Vite
├── public/                     # Arquivos estáticos servidos sem processamento
│   └── favicon.svg
├── src/
│   ├── main.ts                 # Entry point TypeScript, importa estilos e inicializa componentes globais
│   ├── vite-env.d.ts           # Referência de tipos do Vite (necessário p/ imports de .svg, .css, etc.)
│   ├── styles/
│   │   ├── reset.css
│   │   ├── global.css
│   │   └── variables.css       # Cores, fontes e outras variáveis CSS globais
│   ├── assets/
│   │   └── icons/
│   │       └── ryth-logo.svg   # Logo usada nos componentes (navbar, footer)
│   ├── components/
│   │   ├── navbar/
│   │   │   ├── navbar.ts       # Template + função renderNavbar()
│   │   │   └── navbar.css
│   │   └── footer/
│   │       ├── footer.ts       # Template + função renderFooter()
│   │       └── footer.css
│   └── pages/                  # Páginas internas do site (cada uma com seu próprio index.html)
├── tsconfig.json
└── vite.config.ts
```
