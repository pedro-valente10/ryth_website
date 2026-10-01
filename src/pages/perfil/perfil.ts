import "./perfil.css";
import { usuarioAtual } from "../../services/auth";
import { ROTAS } from "../../config/routes";

export async function carregarPerfil(): Promise<void> {
  // 1. Verifica se o usuário está logado
  const usuario = await usuarioAtual();

  if (!usuario) {
    window.location.href = ROTAS.login;
    return;
  }

  // 2. Atualiza o nome/e-mail no perfil
  const nameEl = document.querySelector<HTMLElement>("#user-name");
  if (nameEl && usuario.email) {
    nameEl.textContent = usuario.email.split("@")[0];
  }

  // 3. Interatividade das abas
  const tabs = document.querySelectorAll<HTMLButtonElement>(".profile__tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("profile__tab--active"));
      tab.classList.add("profile__tab--active");
    });
  });

  // 4. Ação do botão "editar"
  const btnEditar = document.querySelector<HTMLButtonElement>("#btn-editar");
  if (btnEditar) {
    btnEditar.addEventListener("click", () => {
      alert("Modo de edição de perfil em desenvolvimento!");
    });
  }
}

// Executa a função na inicialização do módulo
carregarPerfil();