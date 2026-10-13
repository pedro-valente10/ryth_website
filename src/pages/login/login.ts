import "./login.css";
import { validarEmail, validarSenhaCadastro, textoRequisitosSenha } from "../../services/erros";
import { fazerLogin, fazerCadastro, confirmarCodigo, reenviarCodigo } from "../../services/auth";
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

function criarFeedback(form: HTMLFormElement): HTMLParagraphElement {
  const el = document.createElement("p");
  el.className = "login__feedback";
  el.setAttribute("role", "alert");
  el.style.fontSize = "0.9rem";
  el.style.marginTop = "0.5rem";
  el.style.textAlign = "center";
  form.appendChild(el);
  return el;
}

function mensagemDeErro(err: unknown): string {
  return err instanceof Error ? err.message : "Algo deu errado. Tente novamente.";
}

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

  // No cadastro, mostra os requisitos da senha logo abaixo do campo
  let dicaSenha: HTMLParagraphElement | null = null;
  if (modo === "cadastro") {
    dicaSenha = document.createElement("p");
    dicaSenha.className = "login__hint";
    dicaSenha.textContent = textoRequisitosSenha();
    senhaInput.insertAdjacentElement("afterend", dicaSenha);
  }

  // Elemento para exibir mensagens dinâmicas
  const feedbackEl =
    form.querySelector<HTMLParagraphElement>(".login__feedback") ?? criarFeedback(form);

  const mostrarFeedback = (texto: string, erro = true): void => {
    feedbackEl.style.color = erro ? "#FF4D4D" : "#2ECC71";
    feedbackEl.textContent = texto;
  };

  // Quando definido, o formulário está no passo "digitar código de confirmação"
  let acaoCodigo: (() => Promise<void>) | null = null;

  // Troca o formulário de cadastro pelo passo de confirmação do e-mail
  const mostrarPassoCodigo = (email: string): void => {
    emailInput.disabled = true;
    senhaInput.style.display = "none";
    if (dicaSenha) dicaSenha.style.display = "none";
    const labelSenha = form.querySelector<HTMLElement>('label[for="senha"]');
    if (labelSenha) labelSenha.style.display = "none";
    submitBtn.style.display = "none";

    const codigoInput = document.createElement("input");
    codigoInput.type = "text";
    codigoInput.inputMode = "numeric";
    codigoInput.autocomplete = "one-time-code";
    codigoInput.placeholder = "código recebido por e-mail";
    codigoInput.className = senhaInput.className;

    const confirmarBtn = document.createElement("button");
    confirmarBtn.type = "button";
    confirmarBtn.className = submitBtn.className;
    confirmarBtn.textContent = "confirmar";

    const reenviarBtn = document.createElement("button");
    reenviarBtn.type = "button";
    reenviarBtn.textContent = "reenviar código";

    const confirmar = async (): Promise<void> => {
      const codigo = codigoInput.value.trim();
      if (!codigo) {
        mostrarFeedback("Digite o código que enviamos para o seu e-mail.");
        codigoInput.focus();
        return;
      }

      try {
        confirmarBtn.disabled = true;
        await confirmarCodigo(email, codigo);
        window.location.href = ROTAS.perfil;
      } catch (err: unknown) {
        mostrarFeedback(mensagemDeErro(err));
        confirmarBtn.disabled = false;
      }
    };

    // Enter dentro do campo de código também confirma (em vez de refazer o cadastro)
    acaoCodigo = confirmar;
    confirmarBtn.addEventListener("click", confirmar);

    reenviarBtn.addEventListener("click", async () => {
      try {
        reenviarBtn.disabled = true;
        await reenviarCodigo(email);
        mostrarFeedback("Novo código enviado. Confira sua caixa de entrada e o spam.", false);
      } catch (err: unknown) {
        mostrarFeedback(mensagemDeErro(err));
      } finally {
        // Bloqueia o botão por 120s para evitar spam de e-mails
        let restante = 120;
        reenviarBtn.disabled = true;
        const timer = setInterval(() => {
          restante--;
          reenviarBtn.textContent = restante > 0 ? `reenviar em ${restante}s` : "reenviar código";
          if (restante <= 0) {
            clearInterval(timer);
            reenviarBtn.disabled = false;
          }
        }, 1000);
      }
    });

    feedbackEl.before(codigoInput, confirmarBtn, reenviarBtn);
    codigoInput.focus();
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedbackEl.textContent = "";

    // Já está no passo do código: Enter confirma o código
    if (acaoCodigo) {
      await acaoCodigo();
      return;
    }

    const email = emailInput.value.trim();
    const senha = senhaInput.value; // senha não deve ser alterada com trim()

    const erroEmail = validarEmail(email);
    if (erroEmail) {
      mostrarFeedback(erroEmail);
      emailInput.focus();
      return;
    }

    if (modo === "login" && !senha) {
      mostrarFeedback("Informe sua senha.");
      senhaInput.focus();
      return;
    }

    if (modo === "cadastro") {
      const erroSenha = validarSenhaCadastro(senha);
      if (erroSenha) {
        mostrarFeedback(erroSenha);
        senhaInput.focus();
        return;
      }
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
          mostrarFeedback("Enviamos um código para o seu e-mail. Digite-o abaixo.", false);
          mostrarPassoCodigo(email);
        } else {
          window.location.href = ROTAS.perfil;
        }
      }
    } catch (err: unknown) {
      mostrarFeedback(mensagemDeErro(err));
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = cfg.botao;
    }
  });
}

// Scripts type="module" já executam depois do HTML carregado
inicializarLogin();