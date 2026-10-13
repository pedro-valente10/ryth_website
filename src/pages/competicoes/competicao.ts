// 1. Estilos Globais e Componentes
import "../../styles/reset.css";
import "../../styles/global.css";
import "../../styles/variables.css";

import "../../components/navbar/navbar.css";
import "../../components/footer/footer.css";
import "./competicao.css";

// 2. Componentes e Serviços
import { renderNavbar } from "../../components/navbar/navbar";
import { renderFooter } from "../../components/footer/footer";
import { cmsFetch } from "../../services/cms";

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

async function carregarDadosSanity(): Promise<void> {
  const slug = new URLSearchParams(window.location.search).get("slug");
  if (!slug) return; // Mantém a imagem padrão e textos do HTML se não houver parâmetro ?slug=

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

function inicializarInteratividadeVotacao(): void {
  const participantes = document.querySelectorAll<HTMLButtonElement>(".competicao__participante");
  const confirmarNome = document.querySelector<HTMLElement>("#confirmar-nome");
  const btnVotarMain = document.querySelector<HTMLButtonElement>("#btn-votar");
  const btnConfirmarVoto = document.querySelector<HTMLButtonElement>("#btn-confirmar");

  let participanteSelecionado: string | null = null;

  // Seleção dinâmica dos participantes
  participantes.forEach((p) => {
    p.addEventListener("click", () => {
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

  // Botão "votar" da seção de ações faz rolagem suave até a caixa de confirmação
  if (btnVotarMain) {
    btnVotarMain.addEventListener("click", () => {
      if (!participanteSelecionado) {
        alert("Selecione um participante no grid antes de votar!");
        return;
      }
      const cardConfirmar = document.querySelector<HTMLElement>("#confirmar-voto");
      cardConfirmar?.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Ação de registrar voto no botão dentro da caixa
  if (btnConfirmarVoto) {
    btnConfirmarVoto.addEventListener("click", () => {
      if (!participanteSelecionado) {
        alert("Selecione um participante no grid acima.");
        return;
      }
      alert(`Voto registrado com sucesso em "${participanteSelecionado}"!`);
    });
  }
}

// Inicialização da página
async function init(): Promise<void> {
  renderFooter();
  await renderNavbar();
  await carregarDadosSanity();
  inicializarInteratividadeVotacao();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}