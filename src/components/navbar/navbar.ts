import logoUrl from "../../assets/icons/ryth-logo.svg";
import navbarHtml from "./navbar.html?raw";
import { usuarioAtual } from "../../services/auth";
import { ROTAS } from "../../config/routes";

export async function renderNavbar(rootSelector: string = "#navbar-root"): Promise<void> {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  // Injeta o template HTML na página
  root.innerHTML = navbarHtml;

  // Injeta a logo
  const logoImage = root.querySelector<HTMLImageElement>("#navbar-logo");
  if (logoImage) {
    logoImage.src = logoUrl;
  }

  // Vincula a marca/logo à Home
  const brandLink = root.querySelector<HTMLAnchorElement>(".navbar__brand");
  if (brandLink) brandLink.href = ROTAS.home;

  // Vincula os links de navegação estáticos
  const contratacaoLink = root.querySelector<HTMLAnchorElement>('a[href*="contratacao"]');
  if (contratacaoLink) contratacaoLink.href = ROTAS.contratacao;

  const competicoesLink = root.querySelector<HTMLAnchorElement>('a[href*="competicoes"]');
  if (competicoesLink) competicoesLink.href = ROTAS.competicoes;

  // Vincula o botão de conta (Login ou Perfil de acordo com a sessão)
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