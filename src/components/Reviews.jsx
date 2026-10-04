import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import './Reviews.css'

export default function Reviews({ limit = 6, title = 'What clients say' }) {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    supabase.from('reviews').select('*').eq('published', true).order('created_at', { ascending: false }).limit(limit)
      .then(({ data }) => setReviews(data || []))
  }, [limit])

  if (!reviews.length) return null

  return (
    <section className="section reviews" aria-labelledby="reviews-title">
      <div className="container">
        <h2 id="reviews-title" className="section-title">{title}</h2>
        <div className="gold-line" />
        <div className="reviews-grid">
          {reviews.map(r => (
            <figure key={r.id} className="review">
              <div className="review-stars" aria-label={`${r.rating} out of 5`}>
                {'★'.repeat(r.rating || 5)}<span>{'★'.repeat(5 - (r.rating || 5))}</span>
              </div>
              <blockquote>{r.body}</blockquote>
              <figcaption>
                <strong>{r.name}</strong>
                {r.tattoo && <span>{r.tattoo}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
