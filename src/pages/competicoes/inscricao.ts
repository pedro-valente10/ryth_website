import "./inscricao.css";
import { cmsFetch } from "../../services/cms";
import { usuarioAtual, fazerLogout } from "../../services/auth";
import { supabase } from "../../services/supabase";
import { ROTAS } from "../../config/routes";

const $ = <T extends HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Elemento #${id} não encontrado.`);
  }
  return el as T;
};

const slug = new URLSearchParams(window.location.search).get("slug");

const form = $("form-inscricao") as HTMLFormElement;
const inputVideo = $("video-url") as HTMLInputElement;
const btnInscrever = $("btn-inscrever") as HTMLButtonElement;
const msg = $("inscricao-msg") as HTMLParagraphElement;

function mostrarMsg(texto: string, ok = false): void {
  msg.textContent = texto;
  msg.classList.toggle("inscricao__msg--ok", ok);
  msg.hidden = false;
}

function irParaLogin(): void {
  const volta = encodeURIComponent(location.pathname + location.search);
  location.href = `${ROTAS.login}?aviso=login&redirect=${volta}`;
}

function linkValido(valor: string): boolean {
  try {
    const url = new URL(valor);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function carregarCompeticao(): Promise<void> {
  const comp = await cmsFetch<{ titulo?: string }>(
    `*[_type == "competicao" && slug.current == $slug]{ titulo }`,
    { slug }
  );

  if (comp?.titulo) {
    $("competicao-nome").textContent = comp.titulo;
  }
}

async function carregarUsuario(): Promise<boolean> {
  const usuario = await usuarioAtual();
  if (!usuario) {
    irParaLogin();
    return false;
  }

  $("perfil-nome").textContent = usuario.email;
  return true;
}

async function enviar(e: Event): Promise<void> {
  e.preventDefault();
  msg.hidden = true;

  const video = inputVideo.value.trim();
  if (!video) {
    mostrarMsg("Cole o link do seu vídeo para se inscrever.");
    return;
  }

  if (!linkValido(video)) {
    mostrarMsg("O link do vídeo precisa começar com http:// ou https://.");
    return;
  }

  const usuario = await usuarioAtual();
  if (!usuario?.id) {
    irParaLogin();
    return;
  }

  if (!supabase) {
    mostrarMsg("Não foi possível conectar ao servidor. Tente novamente mais tarde.");
    return;
  }

  btnInscrever.disabled = true;
  const { error } = await supabase.from("inscricoes").insert({
    competicao_slug: slug,
    user_id: usuario.id,
    video_url: video,
  });

  if (error) {
    btnInscrever.disabled = false;
    mostrarMsg(
      error.code === "23505"
        ? "Você já está inscrito nesta competição."
        : "Não foi possível concluir a inscrição. Tente novamente em instantes."
    );
    return;
  }

  mostrarMsg("Inscrição enviada! Redirecionando…", true);
  setTimeout(() => {
    location.href = `${ROTAS.competicao}?slug=${encodeURIComponent(slug ?? "")}`;
  }, 1500);
}

async function init(): Promise<void> {
  if (!slug) {
    location.href = ROTAS.competicoes;
    return;
  }

  $("btn-voltar").setAttribute(
    "href",
    `${ROTAS.competicao}?slug=${encodeURIComponent(slug)}`
  );

  if (!(await carregarUsuario())) return;
  await carregarCompeticao();

  $("btn-relogin").addEventListener("click", async () => {
    await fazerLogout();
    irParaLogin();
  });

  form.addEventListener("submit", enviar);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    void init();
  });
} else {
  void init();
}