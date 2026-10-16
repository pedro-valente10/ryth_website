import "./inscricao.css";
import { cmsFetch } from "../../services/cms";
import { usuarioAtual, fazerLogout } from "../../services/auth";
import { supabase } from "../../services/supabase";
import { ROTAS } from "../../config/routes";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const slug = new URLSearchParams(window.location.search).get("slug");

const form = $<HTMLFormElement>("form-inscricao");
const inputVideo = $<HTMLInputElement>("video-url");
const btnInscrever = $<HTMLButtonElement>("btn-inscrever");
const msg = $<HTMLParagraphElement>("inscricao-msg");

function mostrarMsg(texto: string, ok = false): void {
  msg.textContent = texto;
  msg.classList.toggle("inscricao__msg--ok", ok);
  msg.hidden = false;
}

// Redireciona para o login SEM a flag aviso=login
function irParaLoginSemAviso(): void {
  const volta = encodeURIComponent(location.pathname + location.search);
  location.href = `${ROTAS.login}?redirect=${volta}`;
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
  if (comp?.titulo) $("competicao-nome").textContent = comp.titulo;
}

async function carregarUsuario(): Promise<boolean> {
  const usuario = await usuarioAtual();
  if (!usuario) {
    irParaLoginSemAviso();
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
    irParaLoginSemAviso();
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
    location.href = `${ROTAS.competicao}?slug=${encodeURIComponent(slug!)}`;
  }, 1500);
}

async function init(): Promise<void> {
  if (!slug) {
    location.href = ROTAS.competicoes;
    return;
  }

  $<HTMLAnchorElement>("btn-voltar").href = `${ROTAS.competicao}?slug=${encodeURIComponent(slug)}`;

  if (!(await carregarUsuario())) return;
  await carregarCompeticao();

  // "refaça seu login" desloga e vai para a tela de login sem exibir o popup
  $("btn-relogin").addEventListener("click", async () => {
    await fazerLogout();
    irParaLoginSemAviso();
  });

  form.addEventListener("submit", enviar);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
