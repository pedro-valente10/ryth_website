// src/services/cms.ts
import { sanityClient, urlFor } from './sanity'

// Retorna null em qualquer falha ou resultado vazio → o HTML padrão permanece
export async function cmsFetch<T = Record<string, any>>(
  query: string,
  params: Record<string, unknown> = {}
): Promise<T | null> {
  if (!sanityClient) return null
  try {
    const data = await sanityClient.fetch<T>(query, params)
    if (data == null || (Array.isArray(data) && data.length === 0)) return null
    return data
  } catch (err) {
    console.error('[CMS]', err)
    return null
  }
}

// Preenche o HTML com os dados:
//   data-cms="campo"                → textContent
//   data-cms="campo" data-cms-attr="href" → atributo
//   data-cms-img="campo"            → <img src> a partir de uma imagem do Sanity
//   data-cms-list="campo" + <template> → lista repetida
export function applyCms(root: ParentNode, data: Record<string, any>): void {
  root.querySelectorAll<HTMLElement>('[data-cms]').forEach((el) => {
    const value = data[el.dataset.cms!]
    if (typeof value !== 'string') return
    const attr = el.dataset.cmsAttr
    if (attr) el.setAttribute(attr, value)
    else el.textContent = value // textContent evita injeção de HTML
  })

  root.querySelectorAll<HTMLImageElement>('[data-cms-img]').forEach((img) => {
    const src = urlFor(data[img.dataset.cmsImg!])
    if (src) img.src = src
  })

  root.querySelectorAll<HTMLElement>('[data-cms-list]').forEach((container) => {
    const items = data[container.dataset.cmsList!]
    const tpl = container.querySelector('template')
    if (!Array.isArray(items) || items.length === 0 || !tpl) return

    Array.from(container.children).forEach((c) => c !== tpl && c.remove())
    items.forEach((item) => {
      const node = tpl.content.cloneNode(true) as DocumentFragment
      applyCms(node, item)
      container.appendChild(node)
    })
  })
}