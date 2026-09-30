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
ryth\_website/ ├── .editorconfig ├── .gitignore ├── README.MD ├── index.html ├── package.json ├── package-lock.json ├── pegacodigo.py ├── projeto\_consolidado.txt ├── tsconfig.json ├── vite.config.ts ├── public/ │ └── favicon.svg ├── ryth-studio/ └── src/ ├── main.ts ├── vite-env.d.ts ├── assets/ │ └── icons/ │ └── ryth-logo.svg ├── components/ │ ├── footer/ │ │ ├── footer.css │ │ └── footer.ts │ └── navbar/ │ ├── navbar.css │ └── navbar.ts ├── pages/ │ ├── competicoes/ │ ├── contratacao/ │ ├── home/ │ ├── login/ │ └── perfil/ ├── services/ │ ├── cms.ts │ └── sanity.ts └── styles/ ├── global.css ├── reset.css └── variables.css
```
