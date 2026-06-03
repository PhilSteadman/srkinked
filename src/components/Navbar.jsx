import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import './Navbar.css'

const links = [
  {to:'/',label:'Home'},{to:'/gallery',label:'Gallery'},{to:'/booking',label:'Book Now'},
  {to:'/events',label:'Events'},{to:'/blog',label:'Journal'},{to:'/pricing',label:'Pricing'},
  {to:'/videos',label:'Videos'},{to:'/contact',label:'Contact'},
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const loc = useLocation()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setOpen(false)
  }, [loc])

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">
            <img src="/logo-gold.png" alt="SRJ Inked" className="navbar-logo-img"/>
          </Link>
          <ul className="navbar-links">
            {links.map(l => (
              <li key={l.to}>
                <Link to={l.to} className={loc.pathname === l.to ? 'active' : ''}>{l.label}</Link>
              </li>
            ))}
          </ul>
          <Link to="/booking" className="btn btn-gold navbar-cta">Book Now</Link>
          <button
            className="navbar-hamburger"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={24}/> : <Menu size={24}/>}
          </button>
        </div>
      </nav>

      {/* Mobile menu rendered outside nav so it can't affect navbar layout */}
      <div className={`mobile-menu ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="mobile-logo-wrap">
          <img src="/logo-gold.png" alt="SRJ Inked" className="mobile-logo-img"/>
        </div>
        {links.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={loc.pathname === l.to ? 'active' : ''}
            onClick={() => setOpen(false)}
          >
            {l.label}
          </Link>
        ))}
        <Link
          to="/booking"
          className="btn btn-gold"
          style={{marginTop:'1rem', textAlign:'center'}}
          onClick={() => setOpen(false)}
        >
          Book Now
        </Link>
      </div>

      {/* Backdrop — tap outside to close */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position:'fixed', inset:0, zIndex:998,
            background:'rgba(0,0,0,0.5)',
            backdropFilter:'blur(2px)',
          }}
          aria-hidden="true"
        />
      )}
    </>
  )
}
