import "./parcerias.css";
import { abrirModal } from "../../components/modal/modal";

function inicializarAcaoSerParceiro(): void {
  const btn = document.getElementById("btn-ser-parceiro");
  if (!btn) return;

  btn.addEventListener("click", () => {
    abrirModal({
      titulo: "Seja um Parceiro",
      mensagem: "Entre em contato com a equipe RYTH para propostas de patrocínio, ações de marca e parcerias estratégicas!",
      botaoTexto: "Entendi",
    });
  });
}

function init(): void {
  inicializarAcaoSerParceiro();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
