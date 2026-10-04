import React, { useEffect, useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import './FaqList.css'

export default function FaqList({ title = 'Questions people ask' }) {
  const [faqs, setFaqs] = useState([])
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    supabase.from('faqs').select('*').order('sort_order').order('created_at')
      .then(({ data }) => setFaqs(data || []))
  }, [])

  if (!faqs.length) return null

  return (
    <section className="faq" aria-labelledby="faq-title">
      <h2 id="faq-title" className="section-title">{title}</h2>
      <div className="gold-line" />
      <div className="faq-list">
        {faqs.map(f => {
          const open = openId === f.id
          return (
            <div key={f.id} className={`faq-row ${open ? 'is-open' : ''}`}>
              <button className="faq-q" aria-expanded={open} onClick={() => setOpenId(open ? null : f.id)}>
                <span>{f.question}</span>
                {open ? <Minus size={20} /> : <Plus size={20} />}
              </button>
              {open && <p className="faq-a">{f.answer}</p>}
            </div>
          )
        })}
      </div>
    </section>
  )
}
