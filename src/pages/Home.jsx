import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown, Image } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useSettings } from '../lib/useSettings'
import { useSEO } from '../lib/useSEO'
import InstagramFeed from '../components/InstagramFeed'
import './Home.css'

const PH = Array.from({length:6},(_,i)=>({id:i+1,style:['Black & Grey','Realism','Traditional','Fine Line','Japanese','Geometric'][i],placeholder:true}))

export default function Home() {
  const [gallery, setGallery] = useState(PH)
  const [events, setEvents] = useState([])
  const { settings } = useSettings()

  useSEO({
    title: null, // uses default site title on home
    description: 'Bristol\'s custom tattoo studio. Book your session online, browse the gallery, and discover bespoke black & grey, realism, traditional and fine line tattoo art.',
    path: '/',
  })

  useEffect(() => {
    // Prefer featured images; fall back to most recent if none are marked featured
    supabase.from('gallery').select('*').eq('featured', true).order('created_at', { ascending: false }).limit(6)
      .then(({ data }) => {
        if (data?.length) {
          setGallery(data)
        } else {
          supabase.from('gallery').select('*').order('created_at', { ascending: false }).limit(6)
            .then(({ data: recent }) => { if (recent?.length) setGallery(recent) })
        }
      })
    supabase.from('events').select('*').gte('event_date', new Date().toISOString().split('T')[0]).order('event_date').limit(3)
      .then(({ data }) => { if (data) setEvents(data) })
  }, [])

  return (
    <div className="home page-enter">
      <section className="hero">
        <div className="hero-bg"><div className="hero-gradient"/><div className="hero-grid"/></div>
        <div className="hero-content">
          <div className="hero-logo-wrap">
            <img src="/logo-gold.png" alt="SRJ Inked" className="hero-logo-img"/>
          </div>
          <p className="hero-tagline">Where Your Story Meets The Canvas</p>
          <p className="hero-sub">Custom tattoos crafted with precision, passion, and artistry. Every piece tells your story.</p>
          <div className="hero-actions">
            <Link to="/booking" className="btn btn-gold">Book Your Session</Link>
            <Link to="/gallery" className="btn btn-outline">View Gallery</Link>
          </div>
        </div>
        <a href="#featured" className="hero-scroll"><ChevronDown size={20}/><span>Scroll</span></a>
      </section>

      <div className="stats-bar">
        {[[settings.tattoos_completed,'Tattoos Completed'],['5\u2605','Customer Rating'],[settings.years_experience,'Years Experience'],['Custom','Every Design']].map(([n,l],i)=>(
          <React.Fragment key={l}>{i>0&&<div className="stat-div"/>}<div className="stat"><span className="stat-num">{n}</span><span className="stat-label">{l}</span></div></React.Fragment>
        ))}
      </div>

      <section id="featured" className="section featured-gallery">
        <div className="container">
          <div className="section-header">
            <div><p className="section-eyebrow">Fresh Ink</p><h2 className="section-title">Recent <span>Work</span></h2><div className="gold-line"/></div>
            <Link to="/gallery" className="btn btn-outline" style={{display:'flex',alignItems:'center',gap:'.5rem',alignSelf:'flex-end',marginBottom:'.5rem'}}>View All <ArrowRight size={14}/></Link>
          </div>
          <div className="gallery-grid">
            {gallery.map((item,i)=>(
              <Link to={item.style ? `/gallery?style=${encodeURIComponent(item.style)}` : '/gallery'} key={item.id||i} className="gallery-card" style={{animationDelay:`${i*.1}s`}}>
                <div className="gallery-img">
                  {item.image_url?<img src={item.image_url} alt={item.title}/>:<div className="gallery-placeholder"><Image size={32} strokeWidth={1}/><span>{item.style}</span></div>}
                  <div className="gallery-overlay"><p className="gallery-style">{item.style}</p><p className="gallery-title">{item.title||item.style}</p></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="about-strip">
        <div className="about-strip-inner">
          <div className="about-text">
            <p className="section-eyebrow">The Artist</p>
            <h2 className="section-title">Crafting Stories <span>In Ink</span></h2>
            <div className="gold-line"/>
            <p>{settings.about_text}</p>
            <p style={{marginTop:'1rem'}}>{settings.about_text_2}</p>
            <div className="about-styles">{['Black & Grey','Realism','Traditional','Fine Line','Japanese','Geometric'].map(s=><span key={s} className="tag">{s}</span>)}</div>
            <Link to="/booking" className="btn btn-gold" style={{marginTop:'2rem'}}>Start Your Journey</Link>
          </div>
          <div className="about-img-wrap">
            <div className="about-img-border"/>
            {settings.studio_photo_url ? (
              <img src={settings.studio_photo_url} alt="Studio" className="about-img-real"/>
            ) : (
              <div className="about-img-placeholder"><span>Upload a studio photo in Admin \u2192 Site Settings</span></div>
            )}
          </div>
        </div>
      </section>

      <section className="section pricing-teaser">
        <div className="container">
          <div style={{textAlign:'center'}}>
            <p className="section-eyebrow">Transparent Rates</p>
            <h2 className="section-title">Session <span>Pricing</span></h2>
            <div className="gold-line" style={{margin:'1rem auto 2rem'}}/>
          </div>
          <div className="pt-cards">
            {[
              {label:'Minimum Charge',price:`£${settings.price_minimum}`},
              {label:'Under An Hour',price:`£${settings.price_under_hour}`},
              {label:'Per Hour (Over 1hr)',price:`£${settings.price_per_hour}/hr`},
              {label:'Half Day (4hrs)',price:`£${settings.price_half_day}`,note:'Weekend only'},
              {label:'Full Day (8hrs)',price:`£${settings.price_full_day}`,note:'Weekend only',featured:true},
            ].map(p=>(
              <div key={p.label} className={`pt-card${p.featured?' featured':''}`}>
                {p.featured&&<div className="pt-badge">Best Value</div>}
                <p className="pt-label">{p.label}</p>
                <p className="pt-price">{p.price}</p>
                {p.note&&<p className="pt-note">{p.note}</p>}
              </div>
            ))}
          </div>
          <div style={{textAlign:'center',marginTop:'2rem'}}><Link to="/pricing" className="btn btn-outline">Full Pricing Details</Link></div>
        </div>
      </section>

      {events.length>0&&(
        <section className="section"><div className="container">
          <div className="section-header">
            <div><p className="section-eyebrow">Upcoming</p><h2 className="section-title">Events & <span>Pop-Ups</span></h2><div className="gold-line"/></div>
            <Link to="/events" className="btn btn-outline">All Events</Link>
          </div>
          <div className="events-list">
            {events.map(e=>(
              <div key={e.id} className="event-card">
                <div className="event-date-box"><span className="event-day">{new Date(e.event_date+'T12:00:00').getDate()}</span><span className="event-month">{new Date(e.event_date+'T12:00:00').toLocaleString('en-GB',{month:'short'})}</span></div>
                <div className="event-info"><h3>{e.title}</h3><p>{e.location}</p></div>
                {e.booking_link&&<a href={e.booking_link} className="btn btn-outline" target="_blank" rel="noreferrer">Book Spot</a>}
              </div>
            ))}
          </div>
        </div></section>
      )}

      <InstagramFeed />

      <section className="cta-banner">
        <div className="cta-inner">
          <img src="/logo-gold.png" alt="SRJ Inked" className="cta-logo"/>
          <h2>Ready to wear your story?</h2>
          <p>Book a consultation and let's bring your vision to life.</p>
          <Link to="/booking" className="btn btn-gold">Book Now</Link>
        </div>
      </section>
    </div>
  )
}
