import { cmsFetch } from "../../services/cms";

type FaqItem = { pergunta: string; resposta: string };

export async function renderizarFAQ(): Promise<void> {
  const faqContainer = document.querySelector<HTMLElement>('.faq__list');
  if (!faqContainer) return;

  // Só busca os campos necessários e define a ordem
  const faqs = await cmsFetch<FaqItem[]>(
    `*[_type == "faq"] | order(_createdAt asc){ pergunta, resposta }`
  );

  // Se o Sanity falhar ou vier vazio, o HTML padrão da página permanece
  if (!faqs) return;

  faqContainer.replaceChildren(
    ...faqs.map((item) => {
      const li = document.createElement('li');
      li.className = 'faq__item';

      const h3 = document.createElement('h3');
      h3.className = 'faq__question';
      h3.textContent = item.pergunta;

      const p = document.createElement('p');
      p.className = 'faq__answer';
      p.textContent = item.resposta;

      li.append(h3, p);
      return li;
    })
  );
}