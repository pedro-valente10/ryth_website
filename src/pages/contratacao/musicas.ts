import "./musicas.css";
import { abrirModal } from "../../components/modal/modal";

function inicializarAcaoCadastrar(): void {
  const btn = document.getElementById("btn-cadastrar-musica");
  if (!btn) return;

  btn.addEventListener("click", () => {
    abrirModal({
      titulo: "Cadastro de Música",
      mensagem: "Em breve você poderá enviar suas faixas diretamente pela plataforma! Entre em contato com a equipe RYTH para parcerias antecipadas.",
      botaoTexto: "Entendi",
    });
  });
}

function init(): void {
  inicializarAcaoCadastrar();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}