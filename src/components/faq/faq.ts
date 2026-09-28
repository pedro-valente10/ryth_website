import { sanityClient } from "../../services/sanity"; // Ajuste o caminho se necessário

export async function renderizarFAQ() {
  const faqContainer = document.querySelector('.faq__list');
  if (!faqContainer) return;

  try {
    const faqs = await sanityClient.fetch(`*[_type == "faq"]`);

    if (faqs.length > 0) {
      faqContainer.innerHTML = faqs.map((item: any) => `
        <li class="faq__item">
          <h3 class="faq__question">${item.pergunta}</h3>
          <p class="faq__answer">${item.resposta}</p>
        </li>
      `).join('');
    }
  } catch (error) {
    console.error("Erro ao carregar o FAQ do Sanity:", error);
  }
}