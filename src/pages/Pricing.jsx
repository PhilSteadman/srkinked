import React from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../lib/useSettings'
import { useSEO } from '../lib/useSEO'
import FaqList from '../components/FaqList'
import Reviews from '../components/Reviews'
import './Pricing.css'

export default function Pricing() {
  const { settings: s } = useSettings()

  useSEO({
    title: 'Pricing',
    description: `Tattoo prices at SRJ Inked: minimum £${s.price_minimum}, £${s.price_per_hour} an hour, half and full day sessions available.`,
    path: '/pricing',
  })

  const rows = [
    { name: 'Minimum charge', price: `£${s.price_minimum}`, note: 'Small pieces and touch-ups.' },
    { name: 'Under an hour', price: `£${s.price_under_hour}`, note: 'Small to medium pieces done in one short sitting.' },
    { name: 'Hourly', price: `£${s.price_per_hour}`, unit: 'per hour', note: 'Anything over an hour. Sleeves, back pieces and bigger custom work.' },
    { name: 'Half day', price: `£${s.price_half_day}`, unit: '4 hours', note: 'Weekends only. Good for pushing bigger projects along.', weekend: true },
    { name: 'Full day', price: `£${s.price_full_day}`, unit: '8 hours', note: 'Weekends only. The best value per hour for large work.', weekend: true },
  ]

  return (
    <div className="pricing-page page-enter">
      <header className="page-hero">
        <h1 className="section-title">Pricing</h1>
        <div className="gold-line" />
        <p>No hidden extras. You'll always get a quote before any ink goes in.</p>
      </header>

      <div className="container price-body">
        <ul className="price-list">
          {rows.map(r => (
            <li key={r.name} className="price-row">
              <div className="price-name">
                <h2>{r.name}</h2>
                <p>{r.note}</p>
              </div>
              <div className="price-figure">
                <span className="display">{r.price}</span>
                {r.unit && <span className="price-unit">{r.unit}</span>}
                {r.weekend && <span className="price-weekend">Weekends</span>}
              </div>
            </li>
          ))}
        </ul>

        {s.deposit_amount && (
          <p className="price-deposit">
            A <strong>{s.deposit_amount}</strong> non-refundable booking fee secures any session. It comes off the final price on the day.
          </p>
        )}

        <div className="price-cta">
          <Link to="/booking" className="btn btn-gold">Book a session</Link>
          <Link to="/flash" className="btn btn-outline">See flash designs</Link>
        </div>

        <FaqList />
      </div>

      <Reviews limit={3} />
    </div>
  )
}
