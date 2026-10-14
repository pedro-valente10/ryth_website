import "./login.css";
import { checarAvisoLoginNaUrl } from "../../components/modal/modal";
import { fazerLogin, fazerCadastro } from "../../services/auth";
import { ROTAS } from "../../config/routes";

function modoCadastro(): boolean {
  return new URLSearchParams(window.location.search).get("modo") === "cadastro";
}

function alternarInterfaceModo(): void {
  const eCadastro = modoCadastro();
  const tituloCard = document.getElementById("login-card-titulo");
  const textoCard = document.getElementById("login-card-texto");
  const linkCard = document.getElementById("login-card-link") as HTMLAnchorElement | null;
  const btnSubmit = document.querySelector<HTMLButtonElement>(".login__btn--submit");

  if (eCadastro) {
    document.title = "RYTH - Criar Conta";
    if (document.body) document.body.classList.add("login-page--cadastro");

    if (tituloCard) tituloCard.textContent = "Já tem uma conta?";
    if (textoCard) {
      textoCard.textContent =
        "Acesse sua conta para continuar acompanhando competições e interagindo com o ecossistema RYTH.";
    }
    if (linkCard) {
      linkCard.textContent = "Entrar na minha conta";
      linkCard.href = `${ROTAS.login}?modo=login`;
    }
    if (btnSubmit) btnSubmit.textContent = "cadastrar";
  } else {
    document.title = "RYTH - Login";
    if (document.body) document.body.classList.remove("login-page--cadastro");

    if (tituloCard) tituloCard.textContent = "Não tem uma conta?";
    if (textoCard) {
      textoCard.textContent =
        "Crie sua conta gratuitamente e comece a construir sua trajetória em um ecossistema que conecta dança, música e oportunidades.";
    }
    if (linkCard) {
      linkCard.textContent = "Criar minha conta";
      linkCard.href = `${ROTAS.login}?modo=cadastro`;
    }
    if (btnSubmit) btnSubmit.textContent = "entrar";
  }
}

function inicializarFormulario(): void {
  const form = document.querySelector<HTMLFormElement>(".login__form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailEl = document.getElementById("email") as HTMLInputElement | null;
    const senhaEl = document.getElementById("senha") as HTMLInputElement | null;

    const email = emailEl?.value.trim();
    const senha = senhaEl?.value.trim();

    if (!email || !senha) {
      alert("Por favor, preencha o e-mail e a senha.");
      return;
    }

    try {
      if (modoCadastro()) {
        const resultado = await fazerCadastro(email, senha);
        if (resultado.precisaConfirmar) {
          alert("Conta criada com sucesso! Verifique seu e-mail para confirmar a conta.");
        } else {
          alert("Conta criada com sucesso!");
        }
      } else {
        await fazerLogin(email, senha);
      }

      const params = new URLSearchParams(window.location.search);
      const destino = params.get("redirect") ?? ROTAS.home;
      window.location.href = destino;
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Ocorreu um erro ao processar a solicitação. Tente novamente.";
      alert(mensagem);
    }
  });
}

async function init(): Promise<void> {
  alternarInterfaceModo();
  inicializarFormulario();

  checarAvisoLoginNaUrl();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    void init();
  });
} else {
  void init();
}