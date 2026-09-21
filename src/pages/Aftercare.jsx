import React from 'react'
import { Link } from 'react-router-dom'
import { Droplet, Sun, Ban, Clock, CheckCircle } from 'lucide-react'
import { useSEO } from '../lib/useSEO'
import './Aftercare.css'

const STAGES = [
  { day: 'Days 1–3', title: 'Fresh & Tender', desc: 'Feels like sunburn. Some redness, swelling, and slight oozing is completely normal. Keep the wrap on as instructed (usually 2–4 hours, or up to 24hrs for second-skin film).' },
  { day: 'Days 4–7', title: 'Peeling Begins', desc: 'The surface starts to flake and peel — like sunburn peeling. Do NOT pick, scratch, or pull at it. Let it come away naturally.' },
  { day: 'Days 8–14', title: 'Surface Heals', desc: 'The top layer of skin is mostly healed and looks normal. Colours may appear slightly cloudy — this is temporary as deeper layers continue healing.' },
  { day: 'Weeks 3–4', title: 'Fully Settled', desc: 'Deeper healing completes. The tattoo should look sharp, vibrant and fully settled into the skin.' },
]

const DOS = [
  'Wash gently with lukewarm water and fragrance-free soap',
  'Pat dry with a clean paper towel — never rub',
  'Apply a thin layer of unscented moisturiser 2–3 times a day',
  'Wear loose, breathable clothing over the area',
  'Keep it clean and let it breathe once initial wrap is removed',
]

const DONTS = [
  'Do not submerge in water — no baths, swimming, or hot tubs for 2 weeks',
  'Do not pick, scratch, or peel the skin',
  'Do not expose to direct sunlight or sunbeds while healing',
  'Do not use scented lotions, alcohol-based products, or petroleum jelly',
  'Do not exercise heavily or sweat excessively for the first few days',
]

export default function Aftercare() {
  useSEO({
    title: 'Aftercare Guide',
    description: 'Complete tattoo aftercare guide from SRJ Inked — healing stages, dos and don\'ts, and long-term care tips to keep your tattoo looking sharp for years.',
    path: '/aftercare',
  })

  return (
    <div className="aftercare-page page-enter">
      <div className="page-hero">
        <p className="section-eyebrow">Take Care Of It</p>
        <h1 className="section-title">Aftercare <span>Guide</span></h1>
        <div className="gold-line" style={{ margin: '1rem auto' }} />
        <p>Proper aftercare is the difference between a tattoo that ages beautifully and one that doesn't. Follow this guide closely.</p>
      </div>

      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '2rem' }}>

        {/* First 24 hours */}
        <div className="ac-intro">
          <Clock size={32} strokeWidth={1} color="var(--gold)" />
          <div>
            <h3>The First 24 Hours</h3>
            <p>Your artist will wrap your tattoo in cling film or a second-skin bandage. Leave this on for at least 2–4 hours (or up to 24 hours for second-skin film). When you remove it, gently wash the area with lukewarm water and fragrance-free soap, then pat dry.</p>
          </div>
        </div>

        {/* Healing stages timeline */}
        <h2 className="section-title" style={{ marginTop: '4rem', marginBottom: '.5rem' }}>Healing <span>Timeline</span></h2>
        <div className="gold-line" />
        <div className="ac-timeline">
          {STAGES.map((s, i) => (
            <div key={s.day} className="ac-stage">
              <div className="ac-stage-num">{i + 1}</div>
              <div className="ac-stage-body">
                <p className="ac-stage-day">{s.day}</p>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Dos and Don'ts */}
        <div className="ac-grid">
          <div className="ac-card ac-dos">
            <div className="ac-card-head">
              <CheckCircle size={22} />
              <h3>Do</h3>
            </div>
            <ul>
              {DOS.map(d => <li key={d}>{d}</li>)}
            </ul>
          </div>
          <div className="ac-card ac-donts">
            <div className="ac-card-head">
              <Ban size={22} />
              <h3>Don't</h3>
            </div>
            <ul>
              {DONTS.map(d => <li key={d}>{d}</li>)}
            </ul>
          </div>
        </div>

        {/* Long term care */}
        <div className="ac-longterm">
          <Sun size={32} strokeWidth={1} color="var(--gold)" />
          <div>
            <h3>Long-Term Care</h3>
            <p>Once fully healed, always apply SPF 50 sunscreen when your tattoo is exposed to sunlight. UV exposure is the single biggest enemy of tattoo longevity — it fades colour and softens linework faster than anything else. A well cared-for tattoo, protected from the sun, will stay sharp and vibrant for decades.</p>
          </div>
        </div>

        <div className="ac-warning">
          <Droplet size={20} color="var(--red-bright)" />
          <p>
            <strong>Signs of infection</strong> — excessive redness spreading beyond the tattoo, warmth, pus, fever, or worsening pain after day 3 — are not normal healing. Contact a doctor or pharmacist promptly if you notice these.
          </p>
        </div>

        <div className="ac-cta">
          <h3>Questions about your healing?</h3>
          <p>Get in touch and SRJ will help talk you through it.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            <Link to="/contact" className="btn btn-gold">Get In Touch</Link>
            <Link to="/booking" className="btn btn-outline">Book Your Next Session</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
