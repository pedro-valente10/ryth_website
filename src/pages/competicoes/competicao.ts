import "./competicao.css";
import { cmsFetch } from "../../services/cms";
import { usuarioAtual } from "../../services/auth";
import { ROTAS } from "../../config/routes";
import { abrirModal } from "../../components/modal/modal";

type Competicao = {
  titulo: string;
  musicaTitulo?: string;
  musicaDescricao?: string;
  premios?: string;
  prazos?: string;
  estilo?: string;
  banner?: string;
};

function setText(id: string, valor?: string): void {
  const el = document.getElementById(id);
  if (el && valor) el.textContent = valor;
}

function slugAtual(): string | null {
  return new URLSearchParams(window.location.search).get("slug");
}

// Helpers do LocalStorage para gerenciar o estado de voto
function jaVotouNestaCompeticao(slug: string): boolean {
  return !!localStorage.getItem(`voto_competicao_${slug}`);
}

function registrarVotoLocal(slug: string, participante: string): void {
  localStorage.setItem(`voto_competicao_${slug}`, participante);
}

async function carregarDadosSanity(): Promise<void> {
  const slug = slugAtual();
  if (!slug) return;

  const comp = await cmsFetch<Competicao>(
    `*[_type == "competicao" && slug.current == $slug]{
      titulo,
      musicaTitulo,
      musicaDescricao,
      premios,
      prazos,
      estilo,
      "banner": banner.asset->url
    }`,
    { slug }
  );

  if (!comp) return;

  document.title = `RYTH - ${comp.titulo}`;
  setText("musica-titulo", comp.musicaTitulo);
  setText("musica-descricao", comp.musicaDescricao);
  setText("premios-texto", comp.premios);
  setText("prazos-texto", comp.prazos);
  setText("estilo-texto", comp.estilo);

  const bannerEl = document.querySelector<HTMLImageElement>("#competicao-banner");
  if (bannerEl && comp.banner) {
    bannerEl.src = `${comp.banner}?w=1600&auto=format`;
    bannerEl.alt = comp.titulo;
  }
}

function inicializarBotaoInscricao(): void {
  const btnInscrever = document.querySelector<HTMLButtonElement>("#btn-inscrever");
  if (!btnInscrever) return;

  btnInscrever.addEventListener("click", async () => {
    const slug = slugAtual();
    const usuario = await usuarioAtual();

    if (!usuario) {
      const destinoInscricao = slug 
        ? `${ROTAS.inscricao}?slug=${encodeURIComponent(slug)}` 
        : ROTAS.competicoes;
      const redirectParam = encodeURIComponent(destinoInscricao);
      
      window.location.href = `${ROTAS.login}?aviso=login&redirect=${redirectParam}`;
      return;
    }

    window.location.href = slug 
      ? `${ROTAS.inscricao}?slug=${encodeURIComponent(slug)}` 
      : ROTAS.competicoes;
  });
}

function inicializarInteratividadeVotacao(): void {
  const slug = slugAtual();
  const participantes = document.querySelectorAll<HTMLButtonElement>(".competicao__participante");
  const confirmarNome = document.querySelector<HTMLElement>("#confirmar-nome");
  const btnVotarMain = document.querySelector<HTMLButtonElement>("#btn-votar");
  const btnConfirmarVoto = document.querySelector<HTMLButtonElement>("#btn-confirmar");
  const cardConfirmar = document.querySelector<HTMLElement>("#confirmar-voto");

  let participanteSelecionado: string | null = null;

  // Função para aplicar estado de voto já registrado na interface
  const aplicarEstadoJaVotou = () => {
    if (btnVotarMain) {
      btnVotarMain.textContent = "voto registrado";
      btnVotarMain.disabled = true;
      btnVotarMain.style.opacity = "0.6";
      btnVotarMain.style.cursor = "not-allowed";
    }
    if (cardConfirmar) {
      cardConfirmar.classList.remove("competicao__confirmar--active");
    }
  };

  // Se o usuário já votou anteriormente nesta competição, desabilita a ação
  if (slug && jaVotouNestaCompeticao(slug)) {
    aplicarEstadoJaVotou();
  }

  // Seleção de participante no grid
  participantes.forEach((p) => {
    p.addEventListener("click", () => {
      if (slug && jaVotouNestaCompeticao(slug)) return;

      participantes.forEach((el) => el.classList.remove("competicao__participante--selecionado"));
      p.classList.add("competicao__participante--selecionado");

      const nome = p.getAttribute("data-nome") || 
                   p.querySelector(".competicao__participante-nome")?.textContent;
      if (nome) {
        participanteSelecionado = nome;
        if (confirmarNome) {
          confirmarNome.textContent = participanteSelecionado;
        }
      }
    });
  });

  // Clique no botão 'votar' principal
  if (btnVotarMain) {
    btnVotarMain.addEventListener("click", () => {
      if (slug && jaVotouNestaCompeticao(slug)) {
        abrirModal({
          titulo: "Votação",
          mensagem: "Você já computou seu voto nesta competição.",
          botaoTexto: "Entendi",
        });
        return;
      }

      if (!participanteSelecionado) {
        abrirModal({
          titulo: "Atenção",
          mensagem: "Selecione um participante no grid antes de votar.",
          botaoTexto: "Entendi",
        });
        return;
      }

      cardConfirmar?.classList.add("competicao__confirmar--active");

      setTimeout(() => {
        cardConfirmar?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 150);
    });
  }

  // Clique no botão final de confirmação dentro do card roxo
  if (btnConfirmarVoto) {
    btnConfirmarVoto.addEventListener("click", () => {
      if (slug && jaVotouNestaCompeticao(slug)) {
        abrirModal({
          titulo: "Votação",
          mensagem: "Você já computou seu voto nesta competição.",
          botaoTexto: "Entendi",
        });
        return;
      }

      if (!participanteSelecionado) {
        abrirModal({
          titulo: "Atenção",
          mensagem: "Selecione um participante no grid acima.",
          botaoTexto: "Entendi",
        });
        return;
      }

      // Registra o voto localmente
      if (slug) {
        registrarVotoLocal(slug, participanteSelecionado);
      }

      // Aplica o bloqueio visual
      aplicarEstadoJaVotou();

      // Dispara o popup de sucesso
      abrirModal({
        titulo: "Sucesso!",
        mensagem: "Voto confirmado",
        botaoTexto: "OK",
      });
    });
  }
}

async function init(): Promise<void> {
  await carregarDadosSanity();
  inicializarBotaoInscricao();
  inicializarInteratividadeVotacao();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}