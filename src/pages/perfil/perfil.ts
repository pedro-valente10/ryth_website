import "./perfil.css";
import { usuarioAtual } from "../../services/auth";
import { lerPerfil } from "../../services/perfil";
import { ROTAS } from "../../config/routes";

/** Aceita só links http(s); evita esquemas perigosos como javascript: */
function linkSeguro(valor: string | undefined): string | null {
  if (!valor) return null;
  try {
    const url = new URL(valor);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function configurarRede(id: string, valor: string | undefined): void {
  const link = document.getElementById(id) as HTMLAnchorElement | null;
  if (!link) return;

  const url = linkSeguro(valor);
  if (url) {
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.hidden = false;
  } else {
    link.hidden = true;
  }
}

function renderizarEstilos(estilos: string[] | undefined): void {
  const container = document.querySelector<HTMLElement>("#user-styles");
  if (!container) return;

  container.replaceChildren();

  if (!estilos || estilos.length === 0) {
    container.hidden = true;
    return;
  }

  const botoes: HTMLButtonElement[] = estilos.map((estilo, i) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = i === 0 ? "profile__tab profile__tab--active" : "profile__tab";
    botao.textContent = estilo; // textContent: nunca interpreta HTML
    container.appendChild(botao);
    return botao;
  });

  // Destaque ao clicar em um estilo
  botoes.forEach((botao) => {
    botao.addEventListener("click", () => {
      botoes.forEach((b) => b.classList.remove("profile__tab--active"));
      botao.classList.add("profile__tab--active");
    });
  });

  container.hidden = false;
}

export async function carregarPerfil(): Promise<void> {
  // 1. Verifica se o usuário está logado
  const usuario = await usuarioAtual();

  if (!usuario || !usuario.email) {
    window.location.href = ROTAS.login;
    return;
  }

  // 2. Carrega os dados salvos na edição
  const dados = lerPerfil(usuario.email);

  // 3. Nome (usa o e-mail como padrão se ainda não editou)
  const nameEl = document.querySelector<HTMLElement>("#user-name");
  if (nameEl) {
    nameEl.textContent = dados.nome?.trim() || usuario.email.split("@")[0];
  }

  // 4. Bio (mantém o texto padrão do HTML se estiver vazia)
  const bioEl = document.querySelector<HTMLElement>("#user-bio");
  if (bioEl && dados.bio?.trim()) {
    bioEl.textContent = dados.bio.trim();
  }

  // 5. Estilos de dança (um botão na pílula roxa para cada estilo)
  renderizarEstilos(dados.estilos);

  // 6. Redes sociais (só aparecem se o link foi preenchido)
  configurarRede("link-instagram", dados.instagram);
  configurarRede("link-tiktok", dados.tiktok);

  // 7. Botão "editar" leva para a página de edição
  const btnEditar = document.querySelector<HTMLButtonElement>("#btn-editar");
  if (btnEditar) {
    btnEditar.addEventListener("click", () => {
      window.location.href = ROTAS.edicao;
    });
  }
}

// Executa a função na inicialização do módulo
carregarPerfil();