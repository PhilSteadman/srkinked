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
  useEffect(()=>{const fn=()=>setScrolled(window.scrollY>60);window.addEventListener('scroll',fn);return()=>window.removeEventListener('scroll',fn)},[])
  useEffect(()=>setOpen(false),[loc])
  return (
    <nav className={`navbar ${scrolled?'scrolled':''}`}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo"><span className="logo-srj">SRJ</span><span className="logo-inked">INKED</span></Link>
        <ul className="navbar-links">{links.map(l=><li key={l.to}><Link to={l.to} className={loc.pathname===l.to?'active':''}>{l.label}</Link></li>)}</ul>
        <Link to="/booking" className="btn btn-gold navbar-cta">Book Now</Link>
        <button className="navbar-hamburger" onClick={()=>setOpen(!open)}>{open?<X size={24}/>:<Menu size={24}/>}</button>
      </div>
      <div className={`mobile-menu ${open?'open':''}`}>
        {links.map(l=><Link key={l.to} to={l.to} className={loc.pathname===l.to?'active':''}>{l.label}</Link>)}
        <Link to="/booking" className="btn btn-gold" style={{marginTop:'1rem'}}>Book Now</Link>
      </div>
    </nav>
  )
}
