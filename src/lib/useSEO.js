import { useEffect } from 'react'

const SITE_URL = 'https://srj-inked.netlify.app'
const DEFAULT_IMAGE = `${SITE_URL}/logo-gold.png`

export function useSEO({ title, description, image, path = '' }) {
  useEffect(() => {
    const fullTitle = title ? `${title} — SRJ Inked` : 'SRJ Inked — Where Your Story Meets The Canvas'
    document.title = fullTitle

    const setMeta = (attr, key, content) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, key)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    const desc = description || 'Bristol\'s custom tattoo studio. Book your session online, browse the gallery, and read tattoo guides from SRJ Inked.'
    const img = image || DEFAULT_IMAGE
    const url = `${SITE_URL}${path}`

    setMeta('name', 'description', desc)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:image', img)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:site_name', 'SRJ Inked')
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', desc)
    setMeta('name', 'twitter:image', img)

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)
  }, [title, description, image, path])
}
