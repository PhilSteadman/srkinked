import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Image } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useSEO } from '../lib/useSEO'
import './Gallery.css'

const STYLES = ['All','Black & Grey','Realism','Traditional','Fine Line','Japanese','Geometric','Lettering','Watercolour']
const PH = Array.from({length:12},(_,i)=>({id:i+1,title:`Tattoo ${i+1}`,style:STYLES[1+(i%(STYLES.length-1))],placeholder:true}))

export default function Gallery() {
  const [items, setItems] = useState(PH)
  const [searchParams, setSearchParams] = useSearchParams()
  const filter = searchParams.get('style') || 'All'
  const [lightbox, setLightbox] = useState(null)

  useSEO({
    title: filter !== 'All' ? `${filter} Tattoos` : 'Gallery',
    description: 'Browse the SRJ Inked tattoo portfolio — black & grey, realism, traditional, fine line, Japanese, and geometric work from Bristol\'s custom tattoo studio.',
    path: filter !== 'All' ? `/gallery?style=${encodeURIComponent(filter)}` : '/gallery',
  })

  useEffect(() => {
    supabase.from('gallery').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data?.length) setItems(data) })
  }, [])

  const setFilter = (s) => {
    if (s === 'All') setSearchParams({})
    else setSearchParams({ style: s })
  }

  const filtered = filter === 'All' ? items : items.filter(i => i.style === filter)
  // Featured items float to the top within the filtered set
  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))

  return (
    <div className="gallery-page page-enter">
      <div className="page-hero">
        <p className="section-eyebrow">Portfolio</p>
        <h1 className="section-title">The <span>Gallery</span></h1>
        <div className="gold-line" style={{ margin: '1rem auto' }} />
        <p>Every piece is original. Every tattoo tells a story.</p>
      </div>

      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
        <div className="filter-bar">
          {STYLES.map(s => (
            <button key={s} className={`filter-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {s}
            </button>
          ))}
        </div>

        <div className="gallery-masonry">
          {sorted.map((item, i) => (
            <div
              key={item.id}
              className="gm-card"
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => item.image_url && setLightbox(item)}
            >
              {item.featured && <span className="gm-featured-badge">Featured</span>}
              {item.image_url ? (
                <img src={item.image_url} alt={item.title} />
              ) : (
                <div className="gm-placeholder">
                  <Image size={28} strokeWidth={1} />
                  <span>{item.style}</span>
                </div>
              )}
              <div className="gm-overlay">
                <span className="tag">{item.style}</span>
                <p>{item.title}</p>
              </div>
            </div>
          ))}
        </div>

        {sorted.length === 0 && (
          <div className="gallery-empty"><p>No pieces in this style yet. Check back soon!</p></div>
        )}
      </div>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
            <button className="lb-close" onClick={() => setLightbox(null)}>✕</button>
            <img src={lightbox.image_url} alt={lightbox.title} />
            <div className="lb-info">
              <span className="tag">{lightbox.style}</span>
              <h3>{lightbox.title}</h3>
              {lightbox.description && <p>{lightbox.description}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
