// src/services/sanity.ts
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production'

if (!projectId) {
  console.warn('[Sanity] VITE_SANITY_PROJECT_ID ausente: o site usará o conteúdo padrão do HTML.')
}

// null se não houver projectId, em vez de quebrar a importação
export const sanityClient = projectId
  ? createClient({
      projectId,
      dataset,
      useCdn: true, // requisições rápidas via CDN
      apiVersion: '2024-01-01',
    })
  : null

const builder = sanityClient ? imageUrlBuilder(sanityClient) : null

// Gera URLs das imagens cadastradas no Sanity (retorna '' se o Sanity não estiver configurado)
export function urlFor(source: any): string {
  return builder && source ? builder.image(source).auto('format').url() : ''
}