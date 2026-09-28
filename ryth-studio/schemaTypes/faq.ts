import { defineType, defineField } from 'sanity'

export const faqType = defineType({
  name: 'faq',
  title: 'Perguntas Frequentes (FAQ)',
  type: 'document',
  fields: [
    defineField({
      name: 'pergunta',
      title: 'Pergunta',
      type: 'string',
    }),
    defineField({
      name: 'resposta',
      title: 'Resposta',
      type: 'text',
    }),
  ],
})