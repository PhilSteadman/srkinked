import React, { useEffect, useState } from 'react'
import { Instagram } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useSettings } from '../lib/useSettings'
import './SocialStrip.css'

export default function SocialStrip() {
  const [posts, setPosts] = useState([])
  const { settings } = useSettings()

  useEffect(() => {
    supabase.from('social_posts').select('*').order('created_at', { ascending: false }).limit(6)
      .then(({ data }) => setPosts(data || []))
  }, [])

  if (!posts.length) return null

  return (
    <section className="section social" aria-labelledby="social-title">
      <div className="container">
        <div className="section-head">
          <h2 id="social-title" className="section-title">Fresh off the feed</h2>
          {settings.instagram_url && (
            <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="btn btn-outline">
              <Instagram size={18} /> Follow on Instagram
            </a>
          )}
        </div>
        <div className="social-grid">
          {posts.map(p => {
            const img = <img src={p.image_url} alt={p.caption || 'Recent post'} loading="lazy" decoding="async" />
            return p.link_url
              ? <a key={p.id} href={p.link_url} target="_blank" rel="noreferrer" className="social-tile">{img}</a>
              : <div key={p.id} className="social-tile">{img}</div>
          })}
        </div>
      </div>
    </section>
  )
}
