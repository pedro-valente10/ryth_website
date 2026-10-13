import "./competicoes.css";
import { cmsFetch } from "../../services/cms";

type Competicao = {
  titulo: string;
  slug: string;
  ativa?: boolean;
  imagem?: string;
};

const BASE_DETALHE = "/src/pages/competicoes/competicao.html";

function cardHTML(c: Competicao, estado: "active" | "finished") {
  const href = `${BASE_DETALHE}?slug=${encodeURIComponent(c.slug)}`;
  const cta =
    estado === "active" ? `<span class="competicoes__cta">Inscreva-se</span>` : "";
  const img = c.imagem
    ? `<img src="${c.imagem}?w=800&auto=format" alt="${c.titulo}" loading="lazy" />`
    : "";

  return `
    <a class="competicoes__card competicoes__card--${estado}" href="${href}">
      <span class="competicoes__media">${img}${cta}</span>
      <span class="competicoes__name">${c.titulo}</span>
    </a>`;
}

async function renderLista() {
  const gridAtivas = document.querySelector<HTMLElement>("#grid-ativas");
  const gridFinalizadas = document.querySelector<HTMLElement>("#grid-finalizadas");
  if (!gridAtivas || !gridFinalizadas) return;

  const competicoes = await cmsFetch<Competicao[]>(
    `*[_type == "competicao"] | order(ordem asc, _createdAt desc) {
      titulo,
      "slug": slug.current,
      ativa,
      "imagem": imagemCard.asset->url
    }`
  );

  if (!competicoes) {
    console.warn("Competições não carregadas: confira o .env do Sanity.");
    return;
  }

  const ativas = competicoes.filter((c) => c.ativa);
  const finalizadas = competicoes.filter((c) => !c.ativa);

  gridAtivas.innerHTML =
    ativas.map((c) => cardHTML(c, "active")).join("") ||
    "<p>Nenhuma competição ativa no momento.</p>";

  gridFinalizadas.innerHTML =
    finalizadas.map((c) => cardHTML(c, "finished")).join("") ||
    "<p>Nenhuma competição finalizada.</p>";
}

renderLista();