import { defineType, defineField } from 'sanity'

export const competicaoType = defineType({
  name: 'competicao',
  title: 'Competições',
  type: 'document',
  fields: [
    defineField({
      name: 'titulo',
      title: 'Título da Competição',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Identificador URL (Slug)',
      type: 'slug',
      options: {
        source: 'titulo',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'imagem',
      title: 'Imagem / Banner da Competição',
      type: 'image',
      options: {
        hotspot: true, // Permite ajustar o corte da imagem no painel
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'data',
      title: 'Data do Evento',
      type: 'date',
      options: {
        dateFormat: 'DD/MM/YYYY',
      },
    }),
    defineField({
      name: 'local',
      title: 'Local / Cidade',
      type: 'string',
    }),
    defineField({
      name: 'status',
      title: 'Status das Inscrições',
      type: 'string',
      options: {
        list: [
          { title: 'Inscrições Abertas', value: 'abertas' },
          { title: 'Em Breve', value: 'breve' },
          { title: 'Encerrado', value: 'encerrado' },
        ],
        layout: 'radio',
      },
      initialValue: 'abertas',
    }),
    defineField({
      name: 'descricao',
      title: 'Descrição Resumida',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'linkInscricao',
      title: 'Link para Inscrição / Edital',
      type: 'url',
    }),
  ],
  preview: {
    select: {
      title: 'titulo',
      subtitle: 'local',
      media: 'imagem',
    },
  },
})