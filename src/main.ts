import "./styles/reset.css";
import "./styles/global.css";
import "./styles/variables.css";

import "./components/navbar/navbar.css";
import "./components/footer/footer.css";

import { renderNavbar } from "./components/navbar/navbar";
import { renderFooter } from "./components/footer/footer";

/**
 * Remove o bloqueio de visibilidade assim que os componentes e estilos terminam de carregar.
 */
function revelarPagina(): void {
  document.documentElement.classList.add("ready");
}

/**
 * Normaliza os caminhos de URL para marcar o link ativo da Navbar.
 */
function markActiveLink(): void {
  const normalize = (path: string): string =>
    path.replace(/\/index\.html$/, "/").replace(/\/$/, "") || "/";

  const current = normalize(location.pathname);

  document
    .querySelectorAll<HTMLAnchorElement>(".navbar__link a")
    .forEach((link) => {
      const href = normalize(new URL(link.href, location.origin).pathname);

      if (href === current) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
}

/**
 * Inicializa a Navbar, o Footer e libera a exibição limpa da página.
 */
async function init(): Promise<void> {
  try {
    renderFooter();
    await renderNavbar(); // espera a sessão do usuário e monta a navbar
    markActiveLink();     // marca o link ativo com a navbar pronta
  } catch (error) {
    console.error("Erro ao carregar os componentes globais:", error);
  } finally {
    revelarPagina();      // revela a página perfeitamente montada sem vazamentos de HTML
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}