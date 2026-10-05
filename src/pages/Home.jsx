import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSettings } from '../lib/useSettings'
import { useSEO } from '../lib/useSEO'
import { fmtShort, todayISO } from '../lib/dates'
import Reviews from '../components/Reviews'
import SocialStrip from '../components/SocialStrip'
import './Home.css'

export default function Home() {
  const { settings } = useSettings()
  const [work, setWork] = useState([])
  const [flash, setFlash] = useState([])
  const [posts, setPosts] = useState([])
  const [events, setEvents] = useState([])
  const [nextSlot, setNextSlot] = useState(undefined)

  useSEO({ title: null, path: '/' })

  useEffect(() => {
    // Featured pieces first, then the newest, so the spotlight always has something
    supabase.from('gallery').select('*').order('featured', { ascending: false }).order('created_at', { ascending: false }).limit(6)
      .then(({ data }) => setWork(data || []))
    supabase.from('flash').select('*').eq('available', true).order('created_at', { ascending: false }).limit(4)
      .then(({ data }) => setFlash(data || []))
    supabase.from('posts').select('id,title,slug,cover_image_url,created_at').eq('published', true).order('created_at', { ascending: false }).limit(3)
      .then(({ data }) => setPosts(data || []))
    supabase.from('events').select('*').gte('event_date', todayISO()).order('event_date').limit(3)
      .then(({ data }) => setEvents(data || []))
    supabase.from('booking_slots').select('slot_date,label').eq('is_available', true).gte('slot_date', todayISO()).order('slot_date').limit(1)
      .then(({ data }) => setNextSlot(data?.[0] || null))
  }, [])

  const heroImg = settings.hero_image_url || '/hero.jpg'
  const [spotlight, ...rest] = work
  const stats = [
    settings.years_experience && { n: settings.years_experience, l: 'years tattooing' },
    settings.tattoos_completed && { n: settings.tattoos_completed, l: 'tattoos done' },
  ].filter(Boolean)

  return (
    <div className="home">
      {/* ---------- Hero ---------- */}
      <section className="hero" aria-labelledby="hero-title">
        <img className="hero-bg" src={heroImg} alt="" fetchpriority="high" />
        <div className="hero-shade" />
        <div className="hero-content container">
          <h1 id="hero-title" className="hero-title display">{settings.hero_title}</h1>
          <p className="hero-sub">{settings.hero_subtitle}</p>
          <div className="hero-actions">
            <Link to="/booking" className="btn btn-gold">Book a session</Link>
            <Link to="/gallery" className="btn btn-outline">See the work</Link>
          </div>
          {nextSlot !== undefined && (
            <p className="hero-next">
              {nextSlot
                ? <>Next opening: <Link to="/booking">{fmtShort(nextSlot.slot_date)}, {nextSlot.label}</Link></>
                : <>Fully booked right now. <Link to="/contact">Ask about the next dates</Link></>}
            </p>
          )}
        </div>
      </section>

      {/* ---------- Spotlight ---------- */}
      {spotlight && (
        <section className="section spotlight" aria-labelledby="spot-title">
          <div className="container spotlight-grid">
            <Link to={`/gallery?style=${encodeURIComponent(spotlight.style || '')}`} className="spotlight-img">
              <img src={spotlight.image_url} alt={spotlight.title || spotlight.style} loading="lazy" decoding="async" />
            </Link>
            <div className="spotlight-copy">
              <p className="section-eyebrow">{spotlight.healed ? 'Healed piece' : 'Latest piece'}</p>
              <h2 id="spot-title" className="section-title">{spotlight.title || spotlight.style}</h2>
              {spotlight.description && <p className="spotlight-desc">{spotlight.description}</p>}
              {spotlight.style && <span className="tag">{spotlight.style}</span>}
              <Link to="/gallery" className="btn btn-ghost spotlight-more">See all the work</Link>
            </div>
          </div>
        </section>
      )}

      {/* ---------- Recent work ---------- */}
      {rest.length > 0 && (
        <section className="section work" aria-labelledby="work-title">
          <div className="container">
            <div className="section-head">
              <h2 id="work-title" className="section-title">Recent work</h2>
              <Link to="/gallery" className="btn btn-outline">Full gallery</Link>
            </div>
            <div className="work-grid">
              {rest.map(item => (
                <Link key={item.id} to={`/gallery?style=${encodeURIComponent(item.style || '')}`} className="work-tile">
                  <img src={item.image_url} alt={item.title || item.style} loading="lazy" decoding="async" />
                  <span className="work-cap">{item.title || item.style}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Flash sheet ---------- */}
      {flash.length > 0 && (
        <section className="flash-sheet" aria-labelledby="flash-title">
          <div className="container">
            <div className="section-head">
              <div>
                <h2 id="flash-title" className="flash-title display">Flash</h2>
                <p className="flash-lede">Ready-drawn designs. Pick one, book it, done.</p>
              </div>
              <Link to="/flash" className="btn flash-btn">All flash designs</Link>
            </div>
            <div className="flash-row">
              {flash.map(f => (
                <Link key={f.id} to={`/booking?flash=${f.id}`} className="flash-card">
                  <div className="flash-card-img">
                    {f.image_url && <img src={f.image_url} alt={f.title} loading="lazy" decoding="async" />}
                  </div>
                  <div className="flash-card-meta">
                    <span className="flash-card-name">{f.title}</span>
                    {f.price && <span className="flash-card-price">{f.price}</span>}
                  </div>
                  {f.size && <span className="flash-card-size">{f.size}</span>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- How booking works ---------- */}
      <section className="section how" aria-labelledby="how-title">
        <div className="container">
          <h2 id="how-title" className="section-title">How booking works</h2>
          <div className="gold-line" />
          <ol className="how-steps">
            <li>
              <h3>Pick a slot</h3>
              <p>Choose a date and time from the live calendar.</p>
            </li>
            <li>
              <h3>Tell me the idea</h3>
              <p>Placement, size, style, and any reference photos you have.</p>
            </li>
            <li>
              <h3>Pay the booking fee</h3>
              <p>{settings.deposit_amount ? `A ${settings.deposit_amount} non-refundable booking fee secures your slot and comes off the final price.` : 'A non-refundable booking fee secures your slot and comes off the final price.'}</p>
            </li>
            <li>
              <h3>Get tattooed</h3>
              <p>Bring photo ID, eat beforehand, and wear something comfy.</p>
            </li>
          </ol>
          <Link to="/booking" className="btn btn-gold">Start booking</Link>
        </div>
      </section>

      {/* ---------- About ---------- */}
      <section className="section about" aria-labelledby="about-title">
        <div className={`container about-grid${settings.studio_photo_url ? ' has-img' : ''}`}>
          <div className="about-copy">
            <h2 id="about-title" className="section-title">The artist</h2>
            <div className="gold-line" />
            <p>{settings.about_text}</p>
            {settings.about_text_2 && <p>{settings.about_text_2}</p>}
            {stats.length > 0 && (
              <dl className="about-stats">
                {stats.map(s => (
                  <div key={s.l}><dt>{s.l}</dt><dd className="display">{s.n}</dd></div>
                ))}
              </dl>
            )}
            <Link to="/pricing" className="btn btn-ghost">Prices and FAQs</Link>
          </div>
          {settings.studio_photo_url && (
            <div className="about-img">
              <img src={settings.studio_photo_url} alt="The studio" loading="lazy" decoding="async" />
            </div>
          )}
        </div>
      </section>

      <Reviews limit={3} />

      {/* ---------- Journal ---------- */}
      {posts.length > 0 && (
        <section className="section journal" aria-labelledby="journal-title">
          <div className="container">
            <div className="section-head">
              <h2 id="journal-title" className="section-title">From the journal</h2>
              <Link to="/blog" className="btn btn-outline">All posts</Link>
            </div>
            <div className="journal-grid">
              {posts.map(p => (
                <Link key={p.id} to={`/blog/${p.slug}`} className="journal-card">
                  {p.cover_image_url && <img src={p.cover_image_url} alt="" loading="lazy" decoding="async" />}
                  <span className="journal-date">{new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <h3>{p.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Events ---------- */}
      {events.length > 0 && (
        <section className="section events-mini" aria-labelledby="events-title">
          <div className="container">
            <div className="section-head">
              <h2 id="events-title" className="section-title">Where to find me</h2>
              <Link to="/events" className="btn btn-outline">All events</Link>
            </div>
            <ul className="events-mini-list">
              {events.map(e => (
                <li key={e.id}>
                  <span className="display events-mini-date">{fmtShort(e.event_date)}</span>
                  <span className="events-mini-title">{e.title}</span>
                  <span className="events-mini-loc">{e.location}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <SocialStrip />
    </div>
  )
}
