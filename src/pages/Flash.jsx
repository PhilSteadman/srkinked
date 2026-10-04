import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSEO } from '../lib/useSEO'
import './Home.css'
import './Flash.css'

export default function Flash() {
  const [flash, setFlash] = useState([])
  const [loading, setLoading] = useState(true)

  useSEO({ title: 'Flash designs', description: 'Ready-drawn tattoo designs from SRJ Inked. Pick one and book it straight away.', path: '/flash' })

  useEffect(() => {
    supabase.from('flash').select('*').order('available', { ascending: false }).order('created_at', { ascending: false })
      .then(({ data }) => { setFlash(data || []); setLoading(false) })
  }, [])

  return (
    <div className="flash-page page-enter">
      <div className="flash-sheet flash-page-sheet">
        <div className="container">
          <h1 className="flash-title display">Flash</h1>
          <p className="flash-lede">Ready-drawn designs. Each one can be tattooed as shown, and most can be resized. Pick one, book a slot, and it's yours.</p>

          {loading ? (
            <p className="flash-note">Loading designs…</p>
          ) : flash.length === 0 ? (
            <p className="flash-note">No flash up right now. New sheets drop on Instagram first.</p>
          ) : (
            <div className="flash-row flash-row--page">
              {flash.map(f => {
                const inner = (
                  <>
                    <div className="flash-card-img">
                      {f.image_url && <img src={f.image_url} alt={f.title} loading="lazy" decoding="async" />}
                      {!f.available && <span className="flash-claimed">Claimed</span>}
                    </div>
                    <div className="flash-card-meta">
                      <span className="flash-card-name">{f.title}</span>
                      {f.price && <span className="flash-card-price">{f.price}</span>}
                    </div>
                    {f.size && <span className="flash-card-size">{f.size}</span>}
                    {f.notes && <span className="flash-card-size">{f.notes}</span>}
                    {f.available && <span className="flash-card-book">Book this design</span>}
                  </>
                )
                return f.available
                  ? <Link key={f.id} to={`/booking?flash=${f.id}`} className="flash-card">{inner}</Link>
                  : <div key={f.id} className="flash-card is-claimed" aria-label={`${f.title}, already claimed`}>{inner}</div>
              })}
            </div>
          )}

          <p className="flash-note">Want a twist on one of these? Book it and mention the change in your booking notes.</p>
        </div>
      </div>
    </div>
  )
}
