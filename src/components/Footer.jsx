import React from 'react'
import { Link } from 'react-router-dom'
import { Instagram, Facebook, Youtube } from 'lucide-react'
import { useSettings } from '../lib/useSettings'
import './Footer.css'

export const TikTokIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.74a4.85 4.85 0 01-1.01-.05z" />
  </svg>
)

export default function Footer() {
  const { settings } = useSettings()
  const socials = [
    { url: settings.instagram_url, icon: <Instagram size={20} />, label: 'Instagram' },
    { url: settings.facebook_url, icon: <Facebook size={20} />, label: 'Facebook' },
    { url: settings.tiktok_url, icon: <TikTokIcon />, label: 'TikTok' },
    { url: settings.youtube_url, icon: <Youtube size={20} />, label: 'YouTube' },
  ].filter(s => s.url)

  return (
    <footer className="foot">
      <div className="foot-cta">
        <div className="container foot-cta-inner">
          <p className="foot-cta-line display">Got an idea?<br />Let's draw it.</p>
          <Link to="/booking" className="btn btn-gold">Book a session</Link>
        </div>
      </div>

      <div className="container foot-grid">
        <div className="foot-brand">
          <img src="/logo-gold.png" alt="SRJ Inked" width="243" height="175" loading="lazy" />
          {settings.studio_location && <p className="foot-loc">{settings.studio_location}</p>}
          <div className="foot-socials">
            {socials.map(s => (
              <a key={s.label} href={s.url} target="_blank" rel="noreferrer" aria-label={s.label}>{s.icon}</a>
            ))}
          </div>
        </div>

        <nav className="foot-col" aria-label="Footer">
          <p className="foot-head">The studio</p>
          <Link to="/gallery">Work</Link>
          <Link to="/flash">Flash designs</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/booking">Book a session</Link>
          <Link to="/events">Events</Link>
        </nav>

        <nav className="foot-col" aria-label="More">
          <p className="foot-head">More</p>
          <Link to="/blog">Journal</Link>
          <Link to="/videos">Videos</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/aftercare">Aftercare guide</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </div>

      <div className="container foot-base">
        <p>© {new Date().getFullYear()} SRJ Inked. All artwork is original.</p>
        <p>18+ only. Photo ID required.</p>
      </div>
    </footer>
  )
}
