import "./login.css";
import { fazerLogin } from "../../services/auth";
import { ROTAS } from "../../config/routes";

function inicializarLogin(): void {
  const form = document.querySelector<HTMLFormElement>(".login__form");
  const emailInput = document.querySelector<HTMLInputElement>("#email");
  const senhaInput = document.querySelector<HTMLInputElement>("#senha");
  const submitBtn = document.querySelector<HTMLButtonElement>(".login__btn--submit");

  if (!form || !emailInput || !senhaInput || !submitBtn) return;

  // Elemento para exibir mensagens de erro dinâmicas
  let feedbackEl = form.querySelector<HTMLParagraphElement>(".login__feedback");
  if (!feedbackEl) {
    feedbackEl = document.createElement("p");
    feedbackEl.className = "login__feedback";
    feedbackEl.style.color = "#FF4D4D";
    feedbackEl.style.fontSize = "0.9rem";
    feedbackEl.style.marginTop = "0.5rem";
    feedbackEl.style.textAlign = "center";
    form.appendChild(feedbackEl);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedbackEl!.textContent = "";

    const email = emailInput.value.trim();
    const senha = senhaInput.value.trim();

    if (!email || !senha) {
      feedbackEl!.textContent = "Preencha todos os campos.";
      return;
    }

    try {
      // Estado de carregamento
      submitBtn.disabled = true;
      submitBtn.textContent = "entrando...";

      // Executa a autenticação
      await fazerLogin(email, senha);

      // Redireciona para a página de perfil após sucesso
      window.location.href = ROTAS.perfil;
    } catch (err: unknown) {
      const mensagem = err instanceof Error ? err.message : "Erro ao realizar login.";
      feedbackEl!.textContent = mensagem;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "entrar";
    }
  });
}

// Inicializa quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", inicializarLogin);