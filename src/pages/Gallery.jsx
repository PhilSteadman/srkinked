import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useSEO } from '../lib/useSEO'
import './Gallery.css'

export default function Gallery() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [params, setParams] = useSearchParams()
  const style = params.get('style') || 'All'
  const healedOnly = params.get('view') === 'healed'
  const [index, setIndex] = useState(null)

  useSEO({
    title: style !== 'All' ? `${style} tattoos` : healedOnly ? 'Healed tattoos' : 'Work',
    description: 'The SRJ Inked portfolio: fresh and healed tattoos across black and grey, realism, fine line, traditional and more.',
    path: '/gallery',
  })

  useEffect(() => {
    supabase.from('gallery').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setItems(data || []); setLoading(false) })
  }, [])

  // Only offer style filters that actually have work in them
  const styles = ['All', ...Array.from(new Set(items.map(i => i.style).filter(Boolean)))]
  const hasHealed = items.some(i => i.healed)

  const shown = items.filter(i => (style === 'All' || i.style === style) && (!healedOnly || i.healed))

  const setParam = (key, val) => {
    const next = new URLSearchParams(params)
    if (val) next.set(key, val); else next.delete(key)
    setParams(next, { replace: true })
  }

  const close = () => setIndex(null)
  const step = useCallback(d => setIndex(i => (i + d + shown.length) % shown.length), [shown.length])

  useEffect(() => {
    if (index === null) return
    const onKey = e => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [index, step])

  const current = index !== null ? shown[index] : null

  return (
    <div className="gallery-page page-enter">
      <header className="page-hero">
        <h1 className="section-title">The work</h1>
        <div className="gold-line" />
        <p>Every piece here was drawn for the person wearing it.</p>
      </header>

      <div className="container gallery-body">
        {hasHealed && (
          <div className="gallery-views" role="tablist" aria-label="Show">
            <button role="tab" aria-selected={!healedOnly} className={!healedOnly ? 'is-active' : ''} onClick={() => setParam('view', null)}>All work</button>
            <button role="tab" aria-selected={healedOnly} className={healedOnly ? 'is-active' : ''} onClick={() => setParam('view', 'healed')}>Healed</button>
          </div>
        )}

        {styles.length > 2 && (
          <div className="filter-bar">
            {styles.map(s => (
              <button key={s} className={`filter-btn ${style === s ? 'active' : ''}`} onClick={() => setParam('style', s === 'All' ? null : s)}>{s}</button>
            ))}
          </div>
        )}

        {loading ? (
          <p className="gallery-loading">Loading the work…</p>
        ) : shown.length === 0 ? (
          <div className="empty-state"><p>{items.length ? 'Nothing in this filter yet.' : 'New work is on the way. Check back soon.'}</p></div>
        ) : (
          <div className="masonry">
            {shown.map((item, i) => (
              <button key={item.id} className="masonry-tile" onClick={() => setIndex(i)} aria-label={`Open ${item.title || item.style}`}>
                <img src={item.image_url} alt={item.title || item.style || 'Tattoo'} loading="lazy" decoding="async" />
                {item.healed && <span className="masonry-badge">Healed</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {current && (
        <div className="lb" role="dialog" aria-modal="true" aria-label={current.title || current.style} onClick={close}>
          <button className="lb-btn lb-close" onClick={close} aria-label="Close"><X size={26} /></button>
          {shown.length > 1 && (
            <>
              <button className="lb-btn lb-prev" onClick={e => { e.stopPropagation(); step(-1) }} aria-label="Previous"><ChevronLeft size={30} /></button>
              <button className="lb-btn lb-next" onClick={e => { e.stopPropagation(); step(1) }} aria-label="Next"><ChevronRight size={30} /></button>
            </>
          )}
          <figure className="lb-figure" onClick={e => e.stopPropagation()}>
            <img src={current.image_url} alt={current.title || current.style} />
            <figcaption>
              <span className="lb-title">{current.title || current.style}</span>
              <span className="lb-meta">{[current.style, current.healed && 'Healed'].filter(Boolean).join(', ')}</span>
              {current.description && <p>{current.description}</p>}
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  )
}
