import "./edicao.css";
import { usuarioAtual } from "../../services/auth";
import { ROTAS } from "../../config/routes";

interface DadosPerfil {
  nome: string;
  bio: string;
  estilos: string[];
  instagram: string;
  tiktok: string;
}

const TAMANHO_MAX_IMAGEM = 5 * 1024 * 1024; // 5 MB

/* --------------------------------------------------------------------------
   Persistência
   Por enquanto salva no localStorage (por usuário). Quando o backend
   estiver pronto, troque APENAS as funções lerPerfil e salvarPerfil.
   -------------------------------------------------------------------------- */
function chaveStorage(email: string): string {
  return `ryth:perfil:${email}`;
}

function lerPerfil(email: string): Partial<DadosPerfil> {
  try {
    const bruto = localStorage.getItem(chaveStorage(email));
    return bruto ? (JSON.parse(bruto) as Partial<DadosPerfil>) : {};
  } catch {
    return {};
  }
}

async function salvarPerfil(email: string, dados: DadosPerfil): Promise<void> {
  localStorage.setItem(chaveStorage(email), JSON.stringify(dados));
}

/* --------------------------------------------------------------------------
   Utilitários
   -------------------------------------------------------------------------- */
function el<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

function autoAjustarAltura(textarea: HTMLTextAreaElement): void {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

function linkValido(valor: string): boolean {
  if (!valor) return true; // campo opcional
  try {
    const url = new URL(valor);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function mostrarErro(mensagem: string): void {
  const erroEl = el<HTMLParagraphElement>("edit-erro");
  if (!erroEl) return;
  erroEl.textContent = mensagem;
  erroEl.hidden = !mensagem;
}

/* --------------------------------------------------------------------------
   Pré-visualização das fotos
   (apenas visual por enquanto; o upload real depende de um storage)
   -------------------------------------------------------------------------- */
function inicializarPreviewFoto(inputId: string, previewId: string, placeholderId?: string): void {
  const input = el<HTMLInputElement>(inputId);
  const preview = el<HTMLElement>(previewId);
  const placeholder = placeholderId ? el<HTMLElement>(placeholderId) : null;
  if (!input || !preview) return;

  let urlAnterior: string | null = null;

  input.addEventListener("change", () => {
    const arquivo = input.files?.[0];
    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/")) {
      mostrarErro("Selecione um arquivo de imagem.");
      input.value = "";
      return;
    }
    if (arquivo.size > TAMANHO_MAX_IMAGEM) {
      mostrarErro("A imagem deve ter no máximo 5 MB.");
      input.value = "";
      return;
    }

    mostrarErro("");
    if (urlAnterior) URL.revokeObjectURL(urlAnterior);
    urlAnterior = URL.createObjectURL(arquivo);

    preview.style.backgroundImage = `url("${urlAnterior}")`;
    if (placeholder) placeholder.hidden = true;
  });
}

/* --------------------------------------------------------------------------
   Inicialização
   -------------------------------------------------------------------------- */
export async function carregarEdicao(): Promise<void> {
  // 1. Só usuário logado pode editar
  const usuario = await usuarioAtual();
  if (!usuario || !usuario.email) {
    window.location.href = ROTAS.login;
    return;
  }
  const email = usuario.email;

  // 2. Botão voltar
  const btnVoltar = el<HTMLAnchorElement>("btn-voltar");
  if (btnVoltar) btnVoltar.href = ROTAS.perfil;

  // 3. Preenche os campos com os dados salvos (ou valores padrão)
  const salvo = lerPerfil(email);

  const campoNome = el<HTMLInputElement>("campo-nome");
  const campoBio = el<HTMLTextAreaElement>("campo-bio");
  const campoEstilos = el<HTMLTextAreaElement>("campo-estilos");
  const campoInstagram = el<HTMLInputElement>("campo-instagram");
  const campoTiktok = el<HTMLInputElement>("campo-tiktok");

  if (campoNome) campoNome.value = salvo.nome ?? email.split("@")[0];
  if (campoBio) campoBio.value = salvo.bio ?? "";
  if (campoEstilos) campoEstilos.value = (salvo.estilos ?? []).join(", ");
  if (campoInstagram) campoInstagram.value = salvo.instagram ?? "";
  if (campoTiktok) campoTiktok.value = salvo.tiktok ?? "";

  // 4. Textareas crescem conforme o texto
  [campoBio, campoEstilos].forEach((textarea) => {
    if (!textarea) return;
    autoAjustarAltura(textarea);
    textarea.addEventListener("input", () => autoAjustarAltura(textarea));
  });

  // 5. Clicar em qualquer ponto da pílula foca o campo
  document.querySelectorAll<HTMLElement>(".edit__field").forEach((campo) => {
    campo.addEventListener("click", (e) => {
      if (e.target === campo) {
        campo.querySelector<HTMLInputElement | HTMLTextAreaElement>(".edit__input")?.focus();
      }
    });
  });

  // 6. Pré-visualização das fotos
  inicializarPreviewFoto("input-avatar", "avatar-preview", "avatar-placeholder");
  inicializarPreviewFoto("input-cover", "cover-preview");

  // 7. Salvar
  const form = el<HTMLFormElement>("form-edicao");
  const btnSalvar = el<HTMLButtonElement>("btn-salvar");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    mostrarErro("");

    const nome = campoNome?.value.trim() ?? "";
    const bio = campoBio?.value.trim() ?? "";
    const estilos = (campoEstilos?.value ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const instagram = campoInstagram?.value.trim() ?? "";
    const tiktok = campoTiktok?.value.trim() ?? "";

    if (!nome) {
      mostrarErro("Informe um nome de usuário.");
      campoNome?.focus();
      return;
    }
    if (!linkValido(instagram)) {
      mostrarErro("O link do Instagram é inválido. Use o endereço completo, começando com https://");
      campoInstagram?.focus();
      return;
    }
    if (!linkValido(tiktok)) {
      mostrarErro("O link do TikTok é inválido. Use o endereço completo, começando com https://");
      campoTiktok?.focus();
      return;
    }

    if (btnSalvar) btnSalvar.disabled = true;

    try {
      await salvarPerfil(email, { nome, bio, estilos, instagram, tiktok });
      window.location.href = ROTAS.perfil;
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Não foi possível salvar o perfil. Tente novamente.";
      mostrarErro(mensagem);
      if (btnSalvar) btnSalvar.disabled = false;
    }
  });
}

// Executa a função na inicialização do módulo
carregarEdicao();