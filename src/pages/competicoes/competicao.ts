import "./competicao.css"
import { cmsFetch } from "../../services/cms";

type Competicao = {
  titulo: string;
  musicaTitulo?: string;
  musicaDescricao?: string;
  premios?: string;
  prazos?: string;
  estilo?: string;
};

function setText(id: string, valor?: string) {
  const el = document.getElementById(id);
  if (el && valor) el.textContent = valor;
}

async function renderCompeticao() {
  const slug = new URLSearchParams(window.location.search).get("slug");
  if (!slug) return;

  const comp = await cmsFetch<Competicao>(
    `*[_type == "competicao" && slug.current == $slug][0]`,
    { slug }
  );
  if (!comp) return;

  document.title = `RYTH - ${comp.titulo}`;
  setText("musica-titulo", comp.musicaTitulo);
  setText("musica-descricao", comp.musicaDescricao);
  setText("premios-texto", comp.premios);
  setText("prazos-texto", comp.prazos);
  setText("estilo-texto", comp.estilo);
}

renderCompeticao();