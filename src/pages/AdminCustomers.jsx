import React, { useEffect, useState } from 'react'
import { Mail, Phone, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { fmtShort } from '../lib/dates'

export default function AdminCustomers() {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)

  useEffect(() => {
    supabase.from('bookings').select('*,booking_slots(slot_date,label)').order('created_at', { ascending: false })
      .then(({ data }) => {
        const map = new Map()
        ;(data || []).forEach(b => {
          const key = (b.customer_email || '').toLowerCase().trim() || b.id
          if (!map.has(key)) map.set(key, { key, name: b.customer_name, email: b.customer_email, phone: b.customer_phone, bookings: [] })
          map.get(key).bookings.push(b)
        })
        const list = [...map.values()].map(p => {
          const dates = p.bookings.map(b => b.booking_slots?.slot_date).filter(Boolean).sort()
          return {
            ...p,
            sessions: p.bookings.filter(b => b.status === 'confirmed').length,
            last: dates[dates.length - 1] || null,
          }
        }).sort((a, b) => (b.last || '').localeCompare(a.last || ''))
        setPeople(list)
        setLoading(false)
      })
  }, [])

  const term = q.toLowerCase().trim()
  const shown = term ? people.filter(p => [p.name, p.email, p.phone].some(v => (v || '').toLowerCase().includes(term))) : people

  return (
    <div>
      <p className="adm-help" style={{ margin: '0 0 1rem' }}>Everyone who has booked, grouped by email address.</p>
      <div className="adm-toolbar">
        <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, email or phone" style={{ maxWidth: 420 }} />
        <span className="adm-meta">{shown.length} customer{shown.length === 1 ? '' : 's'}</span>
      </div>
      {loading ? <p className="adm-meta">Loading…</p> : shown.length === 0 ? (
        <div className="admin-empty"><p>{people.length ? 'No one matches that search.' : 'Customers appear here after their first booking.'}</p></div>
      ) : (
        <div className="adm-list">
          {shown.map(p => (
            <div key={p.key} className="adm-row">
              <div className="adm-row-top">
                <div>
                  <p className="adm-name">{p.name}</p>
                  <p className="adm-meta">
                    <a href={`mailto:${p.email}`}><Mail size={12} /> {p.email}</a>
                    {p.phone && <> · <a href={`tel:${p.phone}`}><Phone size={12} /> {p.phone}</a></>}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="adm-meta">{p.bookings.length} request{p.bookings.length === 1 ? '' : 's'} · {p.sessions} confirmed</p>
                  {p.last && <p className="adm-meta">Latest: <span className="adm-gold">{fmtShort(p.last)}</span></p>}
                </div>
              </div>
              <div className="adm-actions">
                <button className="admin-action-btn" onClick={() => setOpen(open === p.key ? null : p.key)}>
                  {open === p.key ? <ChevronUp size={14} /> : <ChevronDown size={14} />} History
                </button>
              </div>
              {open === p.key && (
                <ul style={{ listStyle: 'none', marginTop: '.8rem', borderTop: '1px solid var(--line)' }}>
                  {p.bookings.map(b => (
                    <li key={b.id} style={{ padding: '.6rem 0', borderBottom: '1px solid var(--line)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'baseline' }}>
                      <span className="adm-gold">{b.booking_slots ? `${fmtShort(b.booking_slots.slot_date)}, ${b.booking_slots.label}` : 'Slot deleted'}</span>
                      <span className={`status-badge status-${b.status}`}>{b.status}</span>
                      <span className="adm-meta" style={{ flex: 1 }}>{b.tattoo_style || ''} {b.description ? `· ${b.description.slice(0, 90)}${b.description.length > 90 ? '…' : ''}` : ''}</span>
                      {b.notes && <span className="adm-meta" style={{ width: '100%' }}>Your notes: {b.notes}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
