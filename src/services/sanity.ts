// src/services/sanity.ts
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  useCdn: true, // Garante requisições rápidas via CDN
  apiVersion: '2024-01-01',
})

const builder = imageUrlBuilder(sanityClient)

// Função auxiliar para gerar URLs das imagens cadastradas no Sanity
export function urlFor(source: any) {
  return builder.image(source)
}