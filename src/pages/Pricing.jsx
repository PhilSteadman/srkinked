import React from 'react'
import { Link } from 'react-router-dom'
import { Check, Info } from 'lucide-react'
import { useSettings } from '../lib/useSettings'
import { useSEO } from '../lib/useSEO'
import './Pricing.css'

const FAQ = [
  { q: 'Do I need to pay a deposit?', a: 'Yes — a small deposit is required to secure your booking. This is deducted from the final cost on the day. Deposits are non-refundable if you cancel within 48 hours.' },
  { q: 'Can I bring my own design?', a: 'Absolutely. You can bring reference images, sketches, or describe your vision. SRJ will refine and adapt any concept to work as a tattoo.' },
  { q: 'What styles do you specialise in?', a: 'Black & grey realism, traditional, neo-traditional, fine line, geometric, Japanese, and lettering. If you\'re unsure what style fits your idea, get in touch — SRJ will advise.' },
  { q: 'What should I do before my appointment?', a: 'Eat a good meal beforehand, stay hydrated, wear comfortable clothing that allows easy access to the area being tattooed, and avoid alcohol for 24 hours before your session.' },
  { q: 'Do you do touch-ups?', a: 'Free touch-ups are offered within 3 months of your original tattoo if needed due to natural healing. Touch-ups after this period are charged at the minimum rate.' },
  { q: 'How do I book a consultation?', a: 'Message via Instagram or Facebook (@srjinked), or use the online booking form to request a time.' },
]

export default function Pricing() {
  const { settings } = useSettings()

  useSEO({
    title: 'Pricing',
    description: `Transparent tattoo pricing from SRJ Inked, Bristol. Minimum charge £${settings.price_minimum}, hourly rate £${settings.price_per_hour}, half and full day sessions available.`,
    path: '/pricing',
  })

  const TIERS = [
    { label: 'Minimum Charge', price: `£${settings.price_minimum}`, desc: 'For very small pieces or touch-ups. The minimum charge for any sitting.', features: ['Any small design', 'Walk-ins welcome (subject to availability)', 'Consultation included'] },
    { label: 'Under An Hour', price: `£${settings.price_under_hour}`, desc: 'Ideal for small-to-medium pieces that can be completed in a single short session.', features: ['Small to medium designs', 'Single session', 'Aftercare advice included'] },
    { label: 'Per Hour', price: `£${settings.price_per_hour}`, sub: 'per hour (over 1hr)', desc: 'Larger custom work billed by the hour. Great for sleeves, back pieces, and complex designs.', features: ['Any size or style', 'Custom design consultation', 'Progress photos', 'Aftercare pack'], featured: true },
    { label: 'Half Day Session', price: `£${settings.price_half_day}`, sub: '4 hours · Weekend only', desc: 'Four uninterrupted hours to progress large-scale work. Weekends only.', features: ['4 hours of tattooing', 'Larger pieces & sleeves', 'Lunch break included', 'Weekend appointments', 'Best for ongoing projects'], note: 'Weekend Only' },
    { label: 'Full Day Session', price: `£${settings.price_full_day}`, sub: '8 hours · Weekend only', desc: 'A full day dedicated entirely to your tattoo. Maximum progress in one marathon session.', features: ['8 hours of tattooing', 'Full sleeves / back pieces', 'Multiple breaks scheduled', 'Weekend appointments', 'Best value per hour', 'Snacks & drinks provided'], note: 'Weekend Only', featured: true },
  ]

  return (
    <div className="pricing-page page-enter">
      <div className="page-hero">
        <p className="section-eyebrow">Transparent Rates</p>
        <h1 className="section-title">Session <span>Pricing</span></h1>
        <div className="gold-line" style={{ margin: '1rem auto' }} />
        <p>Straightforward pricing. No hidden fees. Every quote confirmed before work begins.</p>
      </div>

      <div className="container" style={{ paddingTop: '4rem', paddingBottom: '2rem' }}>
        <div className="pricing-grid">
          {TIERS.map(t => (
            <div key={t.label} className={`price-card ${t.featured ? 'featured' : ''}`}>
              {t.featured && <div className="price-badge">Most Popular</div>}
              {t.note && !t.featured && <div className="price-note-tag">{t.note}</div>}
              <p className="price-label">{t.label}</p>
              <p className="price-amount">{t.price}</p>
              {t.sub && <p className="price-sub">{t.sub}</p>}
              <p className="price-desc">{t.desc}</p>
              <ul className="price-features">
                {t.features.map(f => <li key={f}><Check size={12} />{f}</li>)}
              </ul>
              <Link to="/booking" className={`btn ${t.featured ? 'btn-gold' : 'btn-outline'}`} style={{ marginTop: 'auto', width: '100%', textAlign: 'center' }}>
                Book This
              </Link>
            </div>
          ))}
        </div>

        <div className="pricing-info-bar">
          <div className="pib-item"><Info size={16} color="var(--gold)" /><p>Prices are subject to change. Always confirmed before work begins.</p></div>
          <div className="pib-item"><Info size={16} color="var(--gold)" /><p>Half day and full day sessions are <strong>weekend only</strong> and must be booked in advance.</p></div>
          <div className="pib-item"><Info size={16} color="var(--gold)" /><p>Final quote agreed <strong>before work begins</strong>. No surprises.</p></div>
        </div>

        <div className="pricing-faq">
          <h2 className="section-title">Common <span>Questions</span></h2>
          <div className="gold-line" />
          <div className="faq-grid">
            {FAQ.map(f => (
              <div key={f.q} className="faq-item">
                <h4>{f.q}</h4>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pricing-cta">
          <h3>Ready to get started?</h3>
          <p>Book your session online or reach out on social media to discuss your idea first.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
            <Link to="/booking" className="btn btn-gold">Book Online</Link>
            <Link to="/contact" className="btn btn-outline">Get In Touch</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
