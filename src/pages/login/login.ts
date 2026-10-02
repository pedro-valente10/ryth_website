import "./login.css";
import { fazerLogin, fazerCadastro } from "../../services/auth";
import { ROTAS } from "../../config/routes";

type Modo = "login" | "cadastro";

const CONFIG = {
  login: {
    titulo: "RYTH - Login",
    botao: "entrar",
    botaoCarregando: "entrando...",
    autocomplete: "current-password",
    cardTitulo: "Não tem uma conta?",
    cardTexto:
      "Crie sua conta gratuitamente e comece a construir sua trajetória em um ecossistema que conecta dança, música e oportunidades.",
    cardLink: "Criar minha conta",
    cardHref: `${ROTAS.login}?modo=cadastro`,
  },
  cadastro: {
    titulo: "RYTH - Cadastro",
    botao: "cadastrar-se",
    botaoCarregando: "cadastrando...",
    autocomplete: "new-password",
    cardTitulo: "Já tem uma conta?",
    cardTexto: "Entre para acompanhar suas competições e continuar sua trajetória na RYTH.",
    cardLink: "Fazer login",
    cardHref: ROTAS.login,
  },
} as const;

function inicializarLogin(): void {
  const form = document.querySelector<HTMLFormElement>(".login__form");
  const emailInput = document.querySelector<HTMLInputElement>("#email");
  const senhaInput = document.querySelector<HTMLInputElement>("#senha");
  const submitBtn = document.querySelector<HTMLButtonElement>(".login__btn--submit");
  const cardTitulo = document.querySelector<HTMLElement>("#login-card-titulo");
  const cardTexto = document.querySelector<HTMLElement>("#login-card-texto");
  const cardLink = document.querySelector<HTMLAnchorElement>("#login-card-link");

  if (!form || !emailInput || !senhaInput || !submitBtn || !cardTitulo || !cardTexto || !cardLink) return;

  // Define o modo pela URL: login.html (login) ou login.html?modo=cadastro
  const modo: Modo =
    new URLSearchParams(location.search).get("modo") === "cadastro" ? "cadastro" : "login";
  const cfg = CONFIG[modo];

  // Aplica o modo na página
  document.title = cfg.titulo;
  document.querySelector(".login-page")?.classList.toggle("login-page--cadastro", modo === "cadastro");
  submitBtn.textContent = cfg.botao;
  senhaInput.autocomplete = cfg.autocomplete;
  cardTitulo.textContent = cfg.cardTitulo;
  cardTexto.textContent = cfg.cardTexto;
  cardLink.textContent = cfg.cardLink;
  cardLink.href = cfg.cardHref;

  // Elemento para exibir mensagens dinâmicas
  let feedbackEl = form.querySelector<HTMLParagraphElement>(".login__feedback");
  if (!feedbackEl) {
    feedbackEl = document.createElement("p");
    feedbackEl.className = "login__feedback";
    feedbackEl.setAttribute("role", "alert");
    feedbackEl.style.fontSize = "0.9rem";
    feedbackEl.style.marginTop = "0.5rem";
    feedbackEl.style.textAlign = "center";
    form.appendChild(feedbackEl);
  }

  function mostrarFeedback(texto: string, erro = true): void {
    feedbackEl!.style.color = erro ? "#FF4D4D" : "#2ECC71";
    feedbackEl!.textContent = texto;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedbackEl!.textContent = "";

    const email = emailInput.value.trim();
    const senha = senhaInput.value; // senha não deve ser alterada com trim()

    if (!email || !senha) {
      mostrarFeedback("Preencha todos os campos.");
      return;
    }

    if (modo === "cadastro" && senha.length < 6) {
      mostrarFeedback("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = cfg.botaoCarregando;

      if (modo === "login") {
        await fazerLogin(email, senha);
        window.location.href = ROTAS.perfil;
      } else {
        const { precisaConfirmar } = await fazerCadastro(email, senha);
        if (precisaConfirmar) {
          mostrarFeedback("Conta criada! Confirme seu e-mail para poder entrar.", false);
        } else {
          window.location.href = ROTAS.perfil;
        }
      }
    } catch (err: unknown) {
      mostrarFeedback(
        err instanceof Error ? err.message : "Algo deu errado. Tente novamente."
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = cfg.botao;
    }
  });
}

// Scripts type="module" já executam depois do HTML carregado
inicializarLogin();