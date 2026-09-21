import React, { useState, useEffect } from 'react'
import { ShoppingBag, MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useSettings } from '../lib/useSettings'
import { useSEO } from '../lib/useSEO'
import './Shop.css'

export default function Shop() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { settings } = useSettings()

  useSEO({
    title: 'Shop',
    description: 'SRJ Inked merchandise — apparel and accessories. Message via Instagram or Facebook to order.',
    path: '/shop',
  })

  useEffect(() => {
    supabase.from('products').select('*').eq('active', true).order('created_at', { ascending: false })
      .then(({ data }) => { setProducts(data || []); setLoading(false) })
  }, [])

  return (
    <div className="shop-page page-enter">
      <div className="page-hero">
        <p className="section-eyebrow">Merchandise</p>
        <h1 className="section-title">The <span>Shop</span></h1>
        <div className="gold-line" style={{ margin: '1rem auto' }} />
        <p>Wear the studio. Limited drops and one-off pieces.</p>
      </div>

      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
        {loading ? (
          <p style={{ color: 'var(--muted)', textAlign: 'center' }}>Loading...</p>
        ) : products.length === 0 ? (
          <div className="shop-empty">
            <ShoppingBag size={48} strokeWidth={1} color="var(--gold)" />
            <h3>Shop Coming Soon</h3>
            <p>Merchandise is on the way. Follow <strong>@srjinked</strong> for launch announcements, or get in touch to register interest.</p>
            <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="btn btn-gold" style={{ marginTop: '1.5rem' }}>
              <MessageCircle size={14} style={{ marginRight: '.5rem' }} />
              Message on Instagram
            </a>
          </div>
        ) : (
          <div className="shop-grid">
            {products.map(p => (
              <div key={p.id} className="shop-card">
                <div className="shop-img">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} />
                  ) : (
                    <div className="shop-img-placeholder"><ShoppingBag size={32} strokeWidth={1} /></div>
                  )}
                </div>
                <div className="shop-body">
                  <h3>{p.name}</h3>
                  {p.description && <p className="shop-desc">{p.description}</p>}
                  <div className="shop-footer">
                    {p.price_pence ? (
                      <p className="shop-price">£{(p.price_pence / 100).toFixed(2)}</p>
                    ) : (
                      <p className="shop-price shop-price-dm">DM to order</p>
                    )}
                    <a
                      href={settings.instagram_url}
                      target="_blank" rel="noreferrer"
                      className="btn btn-outline"
                      style={{ fontSize: '.65rem', padding: '.5rem 1.25rem' }}
                    >
                      Enquire
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
