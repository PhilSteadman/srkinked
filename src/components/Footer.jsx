import React from 'react'
import { Link } from 'react-router-dom'
import { Instagram, Facebook } from 'lucide-react'
import './Footer.css'

const nav=[['/',`Home`],['/gallery','Gallery'],['/booking','Book Now'],['/events','Events'],['/blog','Journal'],['/pricing','Pricing'],['/videos','Videos'],['/contact','Contact']]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Link to="/" className="footer-logo-link">
            <img src="/logo-gold.png" alt="SRJ Inked" className="footer-logo-img"/>
          </Link>
          <p className="footer-tagline">Where Your Story Meets The Canvas</p>
          <div className="footer-socials">
            <a href="https://www.facebook.com/srjinked" target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={20}/></a>
            <a href="https://www.instagram.com/srjinked" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={20}/></a>
            <a href="https://www.tiktok.com/@s.r.j.inked" target="_blank" rel="noreferrer" aria-label="TikTok">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.74a4.85 4.85 0 01-1.01-.05z"/></svg>
            </a>
          </div>
        </div>
        <div className="footer-nav">
          <h4>Navigate</h4>
          {nav.map(([to,l])=><Link key={to} to={to}>{l}</Link>)}
        </div>
        <div className="footer-nav">
          <h4>Info</h4>
          <Link to="/pricing">Pricing</Link>
          <Link to="/contact">Aftercare Guide</Link>
          <Link to="/contact">FAQ</Link>
        </div>
        <div className="footer-contact">
          <h4>Get In Touch</h4>
          <p>DMs open on Instagram & Facebook</p>
          <p style={{marginTop:'.5rem'}}>@srjinked</p>
          <Link to="/booking" className="btn btn-gold" style={{marginTop:'1.5rem',display:'inline-block'}}>Book a Session</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} SRJ Inked. All rights reserved.</p>
        <p>All artwork is original and the property of SRJ Inked.</p>
      </div>
    </footer>
  )
}
