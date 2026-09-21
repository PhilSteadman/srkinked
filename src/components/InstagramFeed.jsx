import React, { useState, useEffect } from 'react'
import { Instagram, ExternalLink } from 'lucide-react'
import { useSettings } from '../lib/useSettings'
import './InstagramFeed.css'

// Instagram Basic Display API requires a long-lived access token.
// Set VITE_INSTAGRAM_ACCESS_TOKEN in Netlify env vars once you've generated one.
// Docs: https://developers.facebook.com/docs/instagram-basic-display-api/getting-started
const IG_TOKEN = import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN || ''

export default function InstagramFeed() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const { settings } = useSettings()

  useEffect(() => {
    if (!IG_TOKEN) { setLoading(false); return }

    fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink,media_type,thumbnail_url&access_token=${IG_TOKEN}&limit=6`)
      .then(r => r.json())
      .then(data => {
        if (data.data) setPosts(data.data.filter(p => p.media_type !== 'VIDEO' || p.thumbnail_url))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Don't render the section at all if there's no token configured and no posts —
  // keeps the home page clean until Instagram is connected
  if (!IG_TOKEN && !loading) return null
  if (loading) return null
  if (posts.length === 0) return null

  return (
    <section className="section instagram-feed">
      <div className="container">
        <div className="section-header">
          <div>
            <p className="section-eyebrow">Follow Along</p>
            <h2 className="section-title">Latest On <span>Instagram</span></h2>
            <div className="gold-line" />
          </div>
          <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '.5rem', alignSelf: 'flex-end', marginBottom: '.5rem' }}>
            <Instagram size={14} /> Follow
          </a>
        </div>
        <div className="ig-grid">
          {posts.slice(0, 6).map(post => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noreferrer"
              className="ig-card"
            >
              <img src={post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url} alt={post.caption?.slice(0, 60) || 'Instagram post'} />
              <div className="ig-overlay">
                <ExternalLink size={20} />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
