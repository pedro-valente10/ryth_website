import { sanityClient } from "../../services/sanity";

export async function renderizarFAQ(): Promise<void> {
  const faqList = document.querySelector('.faq__list');
  if (!faqList) return;

  const faqs = await sanityClient.fetch(`*[_type == "faq"]`);

  if (faqs.length > 0) {
    faqList.innerHTML = faqs.map((item: any) => `
      <li class="faq__item">
        <button class="faq__question">
          ${item.pergunta}
          <span class="faq__icon">+</span>
        </button>
        <div class="faq__answer">
          <p>${item.resposta}</p>
        </div>
      </li>
    `).join('');
  }
}