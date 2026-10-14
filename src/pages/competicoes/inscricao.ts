// 1. Estilos Globais e Componentes
import "../../styles/reset.css";
import "../../styles/global.css";
import "../../styles/variables.css";

import "../../components/navbar/navbar.css";
import "../../components/footer/footer.css";
import "./inscricao.css";

// 2. Componentes e Serviços
import { renderNavbar } from "../../components/navbar/navbar";
import { renderFooter } from "../../components/footer/footer";
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

function irParaLogin(): void {
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
    `*[_type == "competicao" && slug.current == $slug][0]{ titulo }`,
    { slug }
  );
  if (comp?.titulo) $("competicao-nome").textContent = comp.titulo;
}

async function carregarUsuario(): Promise<boolean> {
  const usuario = await usuarioAtual();
  if (!usuario) {
    irParaLogin();
    return false;
  }
  // usuarioAtual() só devolve id e e-mail; troque pelo nome/foto do perfil quando tiver
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

  // supabase.ts exporta null quando o .env não está configurado
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
  renderFooter();
  await renderNavbar();

  // Sem ?slug= na URL não há competição para inscrever
  if (!slug) {
    location.href = ROTAS.competicoes;
    return;
  }

  $<HTMLAnchorElement>("btn-voltar").href = `${ROTAS.competicao}?slug=${encodeURIComponent(slug)}`;

  if (!(await carregarUsuario())) return;
  await carregarCompeticao();

  $("btn-relogin").addEventListener("click", async () => {
    await fazerLogout();
    irParaLogin();
  });
  form.addEventListener("submit", enviar);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}