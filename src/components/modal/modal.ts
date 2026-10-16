import modalHtml from "./modal.html?raw";
import "./modal.css";

export interface ModalOpcoes {
  titulo?: string;
  mensagem: string;
  botaoTexto?: string;
  aoConfirmar?: () => void;
}

let modalInjetado = false;

/**
 * Injeta a estrutura HTML do modal no DOM se ainda não existir.
 */
function garantirModalNoDom(): void {
  if (modalInjetado || document.getElementById("modal-container")) return;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = modalHtml;
  document.body.appendChild(wrapper.firstElementChild!);
  modalInjetado = true;
}

/**
 * Exibe o popup com mensagem e configurações customizadas.
 */
export function abrirModal(opcoes: ModalOpcoes): void {
  garantirModalNoDom();

  const modal = document.getElementById("modal-container");
  const overlay = document.getElementById("modal-overlay");
  const closeBtn = document.getElementById("modal-close");
  const confirmBtn = document.getElementById("modal-confirm-btn") as HTMLButtonElement | null;
  const titleEl = document.getElementById("modal-title");
  const messageEl = document.getElementById("modal-message");

  if (!modal || !messageEl) return;

  // Atualiza textos
  if (titleEl) titleEl.textContent = opcoes.titulo || "Aviso";
  messageEl.textContent = opcoes.mensagem;
  if (confirmBtn) confirmBtn.textContent = opcoes.botaoTexto || "Entendi";

  const fechar = () => {
    modal.classList.remove("modal--open");
    modal.setAttribute("aria-hidden", "true");
    setTimeout(() => {
      modal.hidden = true;
    }, 250);
  };

  // Eventos de fechar
  overlay?.addEventListener("click", fechar, { once: true });
  closeBtn?.addEventListener("click", fechar, { once: true });

  if (confirmBtn) {
    confirmBtn.onclick = () => {
      fechar();
      if (opcoes.aoConfirmar) opcoes.aoConfirmar();
    };
  }

  // Exibe com animação
  modal.hidden = false;
  requestAnimationFrame(() => {
    modal.classList.add("modal--open");
    modal.setAttribute("aria-hidden", "false");
    confirmBtn?.focus();
  });
}

/**
 * Checa os parâmetros da URL para disparar o popup automaticamente
 * caso venha do redirecionamento de autenticação (ex: ?redirect=... ou ?aviso=login).
 */
export function checarAvisoLoginNaUrl(): void {
  const params = new URLSearchParams(window.location.search);
  
  // Abre o modal APENAS se a URL contiver aviso=login
  if (params.get("aviso") === "login") {
    abrirModal({
      titulo: "Atenção",
      mensagem: "Você precisa estar logado para realizar essa ação",
      botaoTexto: "Fazer login",
    });
  }
}