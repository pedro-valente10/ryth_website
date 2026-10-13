import { defineField, defineType } from "sanity";

export const competicaoType = defineType({
  name: "competicao",
  title: "Competição",
  type: "document",
  fields: [
    defineField({
      name: "titulo",
      title: "Nome da competição",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Endereço da página",
      description: "Clique em 'Generate' para criar a partir do nome. Não precisa mexer depois.",
      type: "slug",
      options: { source: "titulo", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "ativa",
      title: "Competição ativa?",
      description: "Ligado: aparece em 'Ativas'. Desligado: aparece em 'Finalizadas'.",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "ordem",
      title: "Ordem de exibição",
      description: "Número menor aparece primeiro. Opcional.",
      type: "number",
    }),
    defineField({
      name: "imagemCard",
      title: "Foto do card (lista de competições)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "banner",
      title: "Banner (topo da página da competição)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({ name: "musicaTitulo", title: "Música: título", type: "string" }),
    defineField({ name: "musicaDescricao", title: "Música: descrição", type: "string" }),
    defineField({ name: "premios", title: "Texto dos prêmios", type: "text", rows: 4 }),
    defineField({ name: "prazos", title: "Texto dos prazos", type: "text", rows: 4 }),
    defineField({ name: "estilo", title: "Texto do estilo", type: "text", rows: 4 }),
  ],
  preview: {
    select: { title: "titulo", media: "imagemCard", ativa: "ativa" },
    prepare: ({ title, media, ativa }) => ({
      title,
      subtitle: ativa ? "Ativa" : "Finalizada",
      media,
    }),
  },
});