import React, { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import './Navbar.css'

const links = [
  { to: '/gallery', label: 'Work' },
  { to: '/flash', label: 'Flash' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/blog', label: 'Journal' },
  { to: '/events', label: 'Events' },
  { to: '/shop', label: 'Shop' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const overHero = loc.pathname === '/' && !scrolled

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [loc.pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = e => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <>
      <header className={`nav ${overHero ? 'nav--clear' : 'nav--solid'}`}>
        <div className="nav-inner">
          <Link to="/" className="nav-logo" aria-label="SRJ Inked home">
            <img src="/logo-gold.png" alt="" width="243" height="175" />
          </Link>
          <nav className="nav-links" aria-label="Main">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => isActive ? 'is-active' : ''}>{l.label}</NavLink>
            ))}
          </nav>
          <Link to="/booking" className="btn btn-gold nav-cta">Book a session</Link>
          <button className="nav-toggle" onClick={() => setOpen(o => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </header>

      <div className={`nav-sheet ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <nav aria-label="Mobile">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'is-active' : ''} tabIndex={open ? 0 : -1}>Home</NavLink>
          {links.map(l => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => isActive ? 'is-active' : ''} tabIndex={open ? 0 : -1}>{l.label}</NavLink>
          ))}
          <NavLink to="/aftercare" tabIndex={open ? 0 : -1}>Aftercare</NavLink>
        </nav>
        <Link to="/booking" className="btn btn-gold nav-sheet-cta" tabIndex={open ? 0 : -1}>Book a session</Link>
      </div>
    </>
  )
}
