import logoUrl from "../../assets/icons/ryth-logo.svg";
import navbarHtml from "./navbar.html?raw";
import { usuarioAtual } from "../../services/auth";
import { ROTAS } from "../../config/routes";

export async function renderNavbar(rootSelector: string = "#navbar-root"): Promise<void> {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  // Injeta o HTML na página
  root.innerHTML = navbarHtml;

  // Insere dinamicamente o caminho do logo processado pelo bundler
  const logoImage = root.querySelector<HTMLImageElement>("#navbar-logo");
  if (logoImage) {
    logoImage.src = logoUrl;
  }

  // Botão de conta: Login ou Perfil, conforme a sessão
  const contaLink = root.querySelector<HTMLAnchorElement>("#navbar-account");
  if (contaLink) {
    try {
      const usuario = await usuarioAtual();
      contaLink.textContent = usuario ? "Perfil" : "Login";
      contaLink.href = usuario ? ROTAS.perfil : ROTAS.login;
    } catch {
      contaLink.textContent = "Login";
      contaLink.href = ROTAS.login;
    }
  }
}