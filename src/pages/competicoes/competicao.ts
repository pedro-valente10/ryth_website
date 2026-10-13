import "./competicao.css";
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

function setText(id: string, valor?: string) {
  const el = document.getElementById(id);
  if (el && valor) el.textContent = valor;
}

async function renderCompeticao() {
  const slug = new URLSearchParams(window.location.search).get("slug");
  if (!slug) return;

  const comp = await cmsFetch<Competicao>(
    `*[_type == "competicao" && slug.current == $slug][0]{
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

renderCompeticao();