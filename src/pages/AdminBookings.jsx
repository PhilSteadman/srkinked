import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Check, Ban, Trash2, Mail, Phone, ExternalLink } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { fmtLong, fmtShort, todayISO, lastDayOfMonth } from '../lib/dates'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Changes a booking's status and keeps its slot in step:
// cancelling frees a future slot, un-cancelling takes it again.
export async function setBookingStatus(b, status) {
  await supabase.from('bookings').update({ status }).eq('id', b.id)
  if (!b.slot_id) return
  if (status === 'cancelled') {
    await supabase.from('booking_slots').update({ is_available: true }).eq('id', b.slot_id).gte('slot_date', todayISO())
  } else if (b.status === 'cancelled') {
    await supabase.from('booking_slots').update({ is_available: false }).eq('id', b.slot_id)
  }
}

function BookingCard({ b, onChange }) {
  const [notes, setNotes] = useState(b.notes || '')
  const [saved, setSaved] = useState(false)
  const slot = b.booking_slots

  const status = async s => { await setBookingStatus(b, s); onChange() }
  const deposit = async v => { await supabase.from('bookings').update({ deposit_status: v }).eq('id', b.id); onChange() }
  const saveNotes = async () => { await supabase.from('bookings').update({ notes }).eq('id', b.id); setSaved(true); setTimeout(() => setSaved(false), 2000) }
  const del = async () => {
    if (!confirm(`Delete ${b.customer_name}'s booking for good? This can't be undone.`)) return
    if (b.status !== 'cancelled') await setBookingStatus(b, 'cancelled')
    await supabase.from('bookings').delete().eq('id', b.id)
    onChange()
  }

  return (
    <div className={`adm-row${b.status === 'pending' ? ' is-unread' : ''}`}>
      <div className="adm-row-top">
        <div>
          <p className="adm-name">{b.customer_name}</p>
          <p className="adm-meta">
            <span className="adm-gold">{slot ? `${fmtLong(slot.slot_date)}, ${slot.label}` : 'Slot deleted'}</span>
            {slot?.price_hint ? ` · ${slot.price_hint}` : ''}
          </p>
          <p className="adm-meta">
            <a href={`mailto:${b.customer_email}`}><Mail size={12} /> {b.customer_email}</a>
            {b.customer_phone && <> · <a href={`tel:${b.customer_phone}`}><Phone size={12} /> {b.customer_phone}</a></>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
          <span className={`status-badge status-${b.status}`}>{b.status}</span>
          <span className={`status-badge status-${b.deposit_status || 'unpaid'}`}>Fee {b.deposit_status || 'unpaid'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '.8rem', alignItems: 'flex-start' }}>
        {b.reference_image_url && (
          <a href={b.reference_image_url} target="_blank" rel="noreferrer" title="Open reference photo">
            <img src={b.reference_image_url} alt="Reference" className="adm-thumb" />
          </a>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="adm-meta">{[b.tattoo_style, b.flash ? `Flash: ${b.flash.title}` : null].filter(Boolean).join(' · ') || 'No style given'}</p>
          {b.description && <p className="adm-body">{b.description}</p>}
          {b.reference_info && <p className="adm-meta" style={{ marginTop: '.4rem' }}>Links: {b.reference_info}</p>}
          {b.fee_terms_accepted_at && (
            <p className="adm-meta" style={{ marginTop: '.4rem' }} title={b.fee_terms_text || ''}>
              Agreed to booking fee terms on {new Date(b.fee_terms_accepted_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>

      <div className="adm-field-inline">
        <textarea rows={1} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Private notes (only you see these)" />
        <button className="admin-action-btn" onClick={saveNotes}>{saved ? 'Saved' : 'Save'}</button>
      </div>

      <div className="adm-actions">
        {b.status !== 'confirmed' && <button className="admin-action-btn ok" onClick={() => status('confirmed')}><Check size={14} /> Confirm</button>}
        {b.status !== 'cancelled' && <button className="admin-action-btn danger" onClick={() => status('cancelled')}><Ban size={14} /> Cancel</button>}
        {b.status === 'cancelled' && <button className="admin-action-btn" onClick={() => status('pending')}>Restore</button>}
        <label className="adm-check" style={{ marginLeft: '.5rem' }}>
          Booking fee
          <select value={b.deposit_status || 'unpaid'} onChange={e => deposit(e.target.value)}>
            <option value="unpaid">Not paid</option>
            <option value="paid">Paid</option>
            <option value="waived">Not needed</option>
          </select>
        </label>
        {b.manage_token && (
          <a className="admin-action-btn" href={`/booking/manage/${b.manage_token}`} target="_blank" rel="noreferrer" title="The customer's own booking page"><ExternalLink size={13} /> Customer link</a>
        )}
        <button className="admin-action-btn danger" onClick={del} style={{ marginLeft: 'auto' }}><Trash2 size={13} /></button>
      </div>
    </div>
  )
}

export default function AdminBookings({ onChange }) {
  const [view, setView] = useState('calendar')
  const [filter, setFilter] = useState('upcoming')
  const [bookings, setBookings] = useState([])
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const now = new Date()
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const [selDay, setSelDay] = useState(todayISO())

  const load = useCallback(async () => {
    setLoading(true)
    const sel = '*,booking_slots(slot_date,label,price_hint,session_type),flash(title)'
    if (view === 'calendar') {
      const mm = String(ym.m + 1).padStart(2, '0')
      const from = `${ym.y}-${mm}-01`
      const to = `${ym.y}-${mm}-${String(lastDayOfMonth(ym.y, ym.m + 1)).padStart(2, '0')}`
      const [s, b] = await Promise.all([
        supabase.from('booking_slots').select('*').gte('slot_date', from).lte('slot_date', to).order('slot_date'),
        supabase.from('bookings').select(sel.replace('booking_slots(', 'booking_slots!inner(')).gte('booking_slots.slot_date', from).lte('booking_slots.slot_date', to),
      ])
      setSlots(s.data || [])
      setBookings(b.data || [])
    } else {
      let q = supabase.from('bookings').select(sel).order('created_at', { ascending: false })
      if (filter === 'pending' || filter === 'confirmed' || filter === 'cancelled') q = q.eq('status', filter)
      const { data } = await q
      let list = data || []
      if (filter === 'upcoming') list = list.filter(b => b.status !== 'cancelled' && b.booking_slots?.slot_date >= todayISO()).sort((a, c) => a.booking_slots.slot_date.localeCompare(c.booking_slots.slot_date))
      if (filter === 'unpaid') list = list.filter(b => b.status !== 'cancelled' && (b.deposit_status || 'unpaid') === 'unpaid')
      setBookings(list)
    }
    setLoading(false)
  }, [view, filter, ym])

  useEffect(() => { load() }, [load])
  const changed = () => { load(); onChange?.() }

  const toolbar = (
    <div className="adm-toolbar">
      <div className="adm-seg">
        <button className={view === 'calendar' ? 'is-on' : ''} onClick={() => setView('calendar')}>Calendar</button>
        <button className={view === 'list' ? 'is-on' : ''} onClick={() => setView('list')}>List</button>
      </div>
      {view === 'list' && (
        <div className="adm-seg">
          {[['upcoming', 'Upcoming'], ['pending', 'Waiting'], ['unpaid', 'Fee due'], ['confirmed', 'Confirmed'], ['cancelled', 'Cancelled'], ['all', 'All']].map(([k, l]) => (
            <button key={k} className={filter === k ? 'is-on' : ''} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
      )}
    </div>
  )

  if (view === 'list') {
    return (
      <div>
        {toolbar}
        {loading ? <p className="adm-meta">Loading…</p> : bookings.length === 0 ? (
          <div className="admin-empty"><p>No bookings in this view.</p></div>
        ) : (
          <div className="adm-list">{bookings.map(b => <BookingCard key={b.id} b={b} onChange={changed} />)}</div>
        )}
      </div>
    )
  }

  // Calendar view
  const mm = String(ym.m + 1).padStart(2, '0')
  const days = lastDayOfMonth(ym.y, ym.m + 1)
  const offset = (new Date(ym.y, ym.m, 1).getDay() + 6) % 7
  const byDay = {}
  slots.forEach(s => { (byDay[s.slot_date] = byDay[s.slot_date] || { slots: [], bookings: [] }).slots.push(s) })
  bookings.forEach(b => {
    const d = b.booking_slots?.slot_date
    if (d) (byDay[d] = byDay[d] || { slots: [], bookings: [] }).bookings.push(b)
  })
  const move = delta => {
    const d = new Date(ym.y, ym.m + delta, 1)
    setYm({ y: d.getFullYear(), m: d.getMonth() })
    setSelDay(null)
  }
  const dayInfo = selDay ? byDay[selDay] : null
  const activeBookingSlotIds = new Set(bookings.filter(b => b.status !== 'cancelled').map(b => b.slot_id))

  return (
    <div>
      {toolbar}
      <div className="adm-cal-head">
        <button className="admin-action-btn" onClick={() => move(-1)} aria-label="Previous month"><ChevronLeft size={16} /></button>
        <h3>{MONTHS[ym.m]} {ym.y}</h3>
        <button className="admin-action-btn" onClick={() => move(1)} aria-label="Next month"><ChevronRight size={16} /></button>
      </div>
      <div className="adm-cal">
        {DOW.map(d => <div key={d} className="adm-cal-dow">{d}</div>)}
        {Array.from({ length: offset }).map((_, i) => <div key={'b' + i} className="adm-cal-cell is-blank" />)}
        {Array.from({ length: days }, (_, i) => i + 1).map(d => {
          const ds = `${ym.y}-${mm}-${String(d).padStart(2, '0')}`
          const info = byDay[ds]
          return (
            <button key={d} className={`adm-cal-cell${ds === todayISO() ? ' is-today' : ''}${selDay === ds ? ' is-sel' : ''}`} onClick={() => setSelDay(ds)}>
              <span className="adm-cal-num">{d}</span>
              {info?.bookings.filter(b => b.status !== 'cancelled').map(b => (
                <span key={b.id} className={`adm-chip ${b.status}`}>{b.customer_name.split(' ')[0]}</span>
              ))}
              {info?.slots.filter(s => !activeBookingSlotIds.has(s.id)).map(s => (
                <span key={s.id} className={`adm-chip ${s.is_available ? 'open' : 'hidden'}`}>{s.label}</span>
              ))}
            </button>
          )
        })}
      </div>
      <div className="adm-legend">
        <span><i style={{ background: 'rgba(201,168,76,.3)' }} />Waiting</span>
        <span><i style={{ background: 'rgba(63,166,107,.3)' }} />Confirmed</span>
        <span><i style={{ background: 'rgba(201,168,76,.12)', border: '1px solid var(--gold)' }} />Open slot</span>
        <span><i style={{ background: 'var(--ink-3)' }} />Hidden slot</span>
      </div>

      {selDay && (
        <div>
          <p className="admin-section-title">{fmtLong(selDay)}</p>
          {loading ? <p className="adm-meta">Loading…</p> : !dayInfo ? (
            <div className="admin-empty"><p>Nothing on this day. Add slots in Availability.</p></div>
          ) : (
            <>
              {dayInfo.bookings.length > 0 && (
                <div className="adm-list" style={{ marginBottom: '1rem' }}>
                  {dayInfo.bookings.map(b => <BookingCard key={b.id} b={b} onChange={changed} />)}
                </div>
              )}
              {dayInfo.slots.filter(s => !activeBookingSlotIds.has(s.id)).length > 0 && (
                <p className="adm-meta">
                  Unbooked slots: {dayInfo.slots.filter(s => !activeBookingSlotIds.has(s.id)).map(s => `${s.label}${s.is_available ? '' : ' (hidden)'}`).join(', ')}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
