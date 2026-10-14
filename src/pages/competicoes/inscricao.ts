import './inscricao.css';

// AJUSTE os caminhos/nomes abaixo conforme o seu projeto
import { usuarioAtual, fazerLogout } from '../../services/auth';
import { cmsFetch } from '../../services/cms';
import { supabase } from '../../services/supabase';

const LISTA = '/src/pages/competicoes/competicoes.html';
const DETALHE = '/src/pages/competicoes/competicao.html';
const LOGIN = '/src/pages/login/login.html';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const params = new URLSearchParams(location.search);
const competicaoId = params.get('id');

const form = $<HTMLFormElement>('form-inscricao');
const inputVideo = $<HTMLInputElement>('video-url');
const btnInscrever = $<HTMLButtonElement>('btn-inscrever');
const msg = $<HTMLParagraphElement>('inscricao-msg');

function mostrarMsg(texto: string, ok = false) {
  msg.textContent = texto;
  msg.classList.toggle('inscricao__msg--ok', ok);
  msg.hidden = false;
}

function irParaLogin() {
  const volta = encodeURIComponent(location.pathname + location.search);
  location.href = `${LOGIN}?redirect=${volta}`;
}

function linkValido(valor: string) {
  try {
    const url = new URL(valor);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

async function init() {
  // Sem competição na URL, não há o que inscrever
  if (!competicaoId) {
    location.href = LISTA;
    return;
  }

  $<HTMLAnchorElement>('btn-voltar').href = `${DETALHE}?id=${encodeURIComponent(competicaoId)}`;

  // Precisa estar logado
  const usuario: any = await usuarioAtual();
  if (!usuario) {
    irParaLogin();
    return;
  }

  // "É você mesmo?": nome e foto (ajuste os campos conforme seu perfil)
  const meta = usuario.user_metadata ?? {};
  $('perfil-nome').textContent = meta.nome ?? usuario.nome ?? usuario.email ?? 'Nome';
  const fotoUrl: string | undefined = meta.foto ?? usuario.foto;
  if (fotoUrl) {
    const img = $<HTMLImageElement>('perfil-foto');
    img.src = fotoUrl;
    img.hidden = false;
    $('perfil-foto-vazia').hidden = true;
  }

  // Nome da competição vindo do Sanity
  try {
    const comp = await cmsFetch<{ titulo?: string }>(
      `*[_type == "competicao" && _id == $id][0]{ titulo }`,
      { id: competicaoId },
    );
    if (comp?.titulo) $('competicao-nome').textContent = comp.titulo;
  } catch {
    /* mantém o subtítulo vazio se o Sanity não responder */
  }

  $('btn-relogin').addEventListener('click', async () => {
    await fazerLogout();
    irParaLogin();
  });

  form.addEventListener('submit', enviar);
}

async function enviar(e: Event) {
  e.preventDefault();
  msg.hidden = true;

  const video = inputVideo.value.trim();
  if (!video) {
    mostrarMsg('Cole o link do seu vídeo para se inscrever.');
    return;
  }
  if (!linkValido(video)) {
    mostrarMsg('O link do vídeo precisa começar com http:// ou https://.');
    return;
  }

  const usuario: any = await usuarioAtual();
  if (!usuario) {
    irParaLogin();
    return;
  }

  // supabase.ts exporta null quando o .env não está configurado
  if (!supabase) {
    mostrarMsg('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
    return;
  }

  btnInscrever.disabled = true;
  const { error } = await supabase.from('inscricoes').insert({
    competicao_id: competicaoId,
    user_id: usuario.id,
    video_url: video,
  });

  if (error) {
    btnInscrever.disabled = false;
    mostrarMsg(
      error.code === '23505'
        ? 'Você já está inscrito nesta competição.'
        : 'Não foi possível concluir a inscrição. Tente novamente em instantes.',
    );
    return;
  }

  mostrarMsg('Inscrição enviada! Redirecionando…', true);
  setTimeout(() => {
    location.href = `${DETALHE}?id=${encodeURIComponent(competicaoId!)}`;
  }, 1500);
}

init();