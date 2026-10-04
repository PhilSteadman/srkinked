import React, { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Check, CalendarPlus, ImagePlus, X } from 'lucide-react'
import emailjs from '@emailjs/browser'
import { supabase } from '../lib/supabase'
import { useSettings } from '../lib/useSettings'
import { useSEO } from '../lib/useSEO'
import { uploadImage } from '../lib/images'
import { fmtLong, todayISO, lastDayOfMonth, buildICS } from '../lib/dates'
import './Booking.css'

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || ''
const EMAILJS_BOOKING_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_BOOKING_TEMPLATE_ID || ''
const EMAILJS_CUSTOMER_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_CUSTOMER_TEMPLATE_ID || ''
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const STYLES = ['Black & Grey', 'Realism', 'Fine Line', 'Traditional', 'Neo-Traditional', 'Japanese', 'Geometric', 'Lettering', 'Watercolour', 'Cover-up', 'Not sure yet']
const EMPTY = { name: '', email: '', phone: '', style: '', description: '', reference: '', age: false }

export default function Booking() {
  const { settings } = useSettings()
  const [params] = useSearchParams()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [slots, setSlots] = useState({})
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [selDate, setSelDate] = useState(null)
  const [selSlot, setSelSlot] = useState(null)
  const [flash, setFlash] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [refFile, setRefFile] = useState(null)
  const [refPreview, setRefPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)
  const [reload, setReload] = useState(0)
  const detailsRef = useRef(null)
  const slotsRef = useRef(null)
  const fileRef = useRef(null)

  useSEO({ title: 'Book a session', description: 'Pick a date and time, tell me your idea, and secure your tattoo session with SRJ Inked.', path: '/booking' })

  // Flash design chosen from the flash page
  useEffect(() => {
    const id = params.get('flash')
    if (!id) return
    supabase.from('flash').select('*').eq('id', id).maybeSingle().then(({ data }) => {
      if (data && data.available) {
        setFlash(data)
        setForm(f => ({ ...f, description: f.description || `Flash design: ${data.title}${data.size ? ` (${data.size})` : ''}` }))
      }
    })
  }, [params])

  // Available slots for the month on screen
  useEffect(() => {
    setLoadingSlots(true)
    const mm = String(month + 1).padStart(2, '0')
    const from = `${year}-${mm}-01`
    const to = `${year}-${mm}-${String(lastDayOfMonth(year, month + 1)).padStart(2, '0')}`
    supabase.from('booking_slots').select('*').gte('slot_date', from).lte('slot_date', to).eq('is_available', true).order('slot_date')
      .then(({ data }) => {
        const map = {}
        ;(data || []).forEach(s => { (map[s.slot_date] = map[s.slot_date] || []).push(s) })
        setSlots(map)
        setLoadingSlots(false)
      })
  }, [year, month, reload])

  // If this month has nothing left, jump to the first month that does (once, on first load)
  const jumped = useRef(false)
  useEffect(() => {
    if (jumped.current || loadingSlots) return
    jumped.current = true
    const anyFuture = Object.keys(slots).some(d => d >= todayISO())
    if (anyFuture) return
    supabase.from('booking_slots').select('slot_date').eq('is_available', true).gte('slot_date', todayISO()).order('slot_date').limit(1)
      .then(({ data }) => {
        if (data?.[0]) {
          const d = new Date(data[0].slot_date + 'T12:00:00')
          setYear(d.getFullYear()); setMonth(d.getMonth())
        }
      })
  }, [loadingSlots, slots])

  const changeMonth = delta => {
    const d = new Date(year, month + delta, 1)
    setYear(d.getFullYear()); setMonth(d.getMonth())
    setSelDate(null); setSelSlot(null)
  }
  const isPastMonth = year < today.getFullYear() || (year === today.getFullYear() && month <= today.getMonth())

  const pickDate = ds => {
    setSelDate(ds); setSelSlot(null); setError('')
    setTimeout(() => slotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }
  const pickSlot = slot => {
    setSelSlot(slot); setError('')
    setTimeout(() => detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const onRefFile = e => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) { setError('Reference photos need to be an image (JPG, PNG or WebP).'); return }
    setRefFile(f)
    setRefPreview(URL.createObjectURL(f))
  }
  const clearRef = () => { setRefFile(null); setRefPreview(null); if (fileRef.current) fileRef.current.value = '' }

  const submit = async e => {
    e.preventDefault()
    if (!form.age) { setError('Tick the box to confirm you are 18 or over.'); return }
    setSubmitting(true); setError('')

    let referenceImageUrl = null
    if (refFile) {
      try { referenceImageUrl = await uploadImage(supabase, 'references', 'bookings', refFile, 1600) }
      catch { /* booking still goes through; the written reference is kept */ }
    }

    const { data, error: rpcError } = await supabase.rpc('book_slot', {
      p_slot_id: selSlot.id,
      p_name: form.name.trim(),
      p_email: form.email.trim(),
      p_phone: form.phone.trim(),
      p_style: form.style || null,
      p_description: form.description.trim(),
      p_reference: form.reference.trim() || null,
      p_reference_image_url: referenceImageUrl,
      p_age_confirmed: form.age,
      p_flash_id: flash?.id || null,
    })

    if (rpcError) {
      const msg = rpcError.message || ''
      setError(msg.includes('taken') || msg.includes('18')
        ? msg
        : 'The booking did not go through. Check your connection and try again, or message on Instagram.')
      if (msg.includes('taken')) { setSelSlot(null); setReload(r => r + 1) }
      setSubmitting(false)
      return
    }

    const token = Array.isArray(data) ? data[0]?.out_token : data?.out_token
    const manageLink = token ? `${window.location.origin}/booking/manage/${token}` : ''

    const emailParams = {
      from_name: form.name,
      from_email: form.email,
      reply_to: form.email,
      to_email: form.email,
      phone: form.phone,
      tattoo_style: form.style || 'Not specified',
      description: form.description,
      reference: form.reference || 'None provided',
      reference_image_url: referenceImageUrl || 'No photo uploaded',
      flash_title: flash?.title || 'None',
      booking_date: fmtLong(selDate),
      booking_slot: selSlot.label,
      price_hint: selSlot.price_hint || '',
      session_type: selSlot.session_type || '',
      deposit_amount: settings.deposit_amount || 'to be confirmed',
      deposit_link: settings.deposit_link || '',
      manage_link: manageLink,
    }

    // Emails are best-effort: the booking is already saved, so a failed email never blocks the customer
    if (EMAILJS_SERVICE_ID && EMAILJS_PUBLIC_KEY) {
      if (EMAILJS_BOOKING_TEMPLATE_ID) {
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_BOOKING_TEMPLATE_ID, emailParams, EMAILJS_PUBLIC_KEY).catch(err => console.warn('Studio email failed', err))
      }
      if (EMAILJS_CUSTOMER_TEMPLATE_ID) {
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_CUSTOMER_TEMPLATE_ID, emailParams, EMAILJS_PUBLIC_KEY).catch(err => console.warn('Customer email failed', err))
      }
    }

    setDone({ date: selDate, slot: selSlot, name: form.name, email: form.email, manageLink })
    setSubmitting(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ---------- Confirmation screen ----------
  if (done) {
    const ics = buildICS({
      date: done.date,
      label: done.slot.label,
      title: 'Tattoo appointment, SRJ Inked',
      description: `${done.slot.label}. Bring photo ID.${done.manageLink ? ` Manage your booking: ${done.manageLink}` : ''}`,
    })
    return (
      <div className="booking-page page-enter">
        <header className="page-hero">
          <h1 className="section-title">Request sent</h1>
          <div className="gold-line" />
          <p>Thanks {done.name.split(' ')[0]}. Your slot is held while it's confirmed.</p>
        </header>
        <div className="container bk-done">
          <dl className="bk-summary">
            <div><dt>Date</dt><dd>{fmtLong(done.date)}</dd></div>
            <div><dt>Time</dt><dd>{done.slot.label}</dd></div>
            {done.slot.price_hint && <div><dt>Price guide</dt><dd>{done.slot.price_hint}</dd></div>}
          </dl>

          <div className="bk-next">
            <h2 className="bk-h">What happens next</h2>
            <ol>
              <li>{settings.deposit_link
                ? <>Pay your {settings.deposit_amount || ''} deposit to lock the slot in.</>
                : <>You'll be contacted about the deposit to lock the slot in.</>}
              </li>
              <li>You'll get a confirmation once the deposit is in.</li>
              <li>Bring photo ID on the day.</li>
            </ol>
            {settings.deposit_note && <p className="bk-small">{settings.deposit_note}</p>}
          </div>

          <div className="bk-done-actions">
            {settings.deposit_link && (
              <a href={settings.deposit_link} target="_blank" rel="noreferrer" className="btn btn-gold">
                Pay deposit{settings.deposit_amount ? ` (${settings.deposit_amount})` : ''}
              </a>
            )}
            <a href={ics} download="srj-inked-appointment.ics" className="btn btn-outline"><CalendarPlus size={18} /> Add to calendar</a>
          </div>

          {done.manageLink && (
            <p className="bk-small">
              Need to cancel? Use <Link to={done.manageLink.replace(window.location.origin, '')}>your booking page</Link>. It's also in your confirmation email to {done.email}.
            </p>
          )}
        </div>
      </div>
    )
  }

  // ---------- Booking flow ----------
  const mm = String(month + 1).padStart(2, '0')
  const daysInMonth = lastDayOfMonth(year, month + 1)
  const offset = (new Date(year, month, 1).getDay() + 6) % 7 // Monday-first grid
  const todayStr = todayISO()
  const hasAny = Object.keys(slots).some(d => d >= todayStr)

  return (
    <div className="booking-page page-enter">
      <header className="page-hero">
        <h1 className="section-title">Book a session</h1>
        <div className="gold-line" />
        <p>Pick a date, choose a time, then tell me about the tattoo. It takes about two minutes.</p>
      </header>

      <div className="container bk-body">
        {settings.booking_notice && <p className="bk-notice">{settings.booking_notice}</p>}

        {flash && (
          <div className="bk-flash">
            {flash.image_url && <img src={flash.image_url} alt="" />}
            <div>
              <p className="bk-flash-label">Booking flash design</p>
              <p className="bk-flash-name">{flash.title}</p>
              <p className="bk-small">{[flash.size, flash.price].filter(Boolean).join(', ')}</p>
            </div>
            <button className="bk-flash-x" onClick={() => setFlash(null)} aria-label="Remove flash design"><X size={18} /></button>
          </div>
        )}

        {/* Step 1 */}
        <section className="bk-step" aria-labelledby="s1">
          <h2 id="s1" className="bk-h"><span className="bk-num">1</span> Pick a date</h2>
          <div className="cal">
            <div className="cal-top">
              <button onClick={() => changeMonth(-1)} disabled={isPastMonth} aria-label="Previous month"><ChevronLeft size={22} /></button>
              <p className="cal-month display" aria-live="polite">{MONTHS[month]} {year}</p>
              <button onClick={() => changeMonth(1)} aria-label="Next month"><ChevronRight size={22} /></button>
            </div>
            <div className="cal-grid" role="grid">
              {DAYS.map(d => <span key={d} className="cal-dow" aria-hidden="true">{d}</span>)}
              {Array.from({ length: offset }).map((_, i) => <span key={'e' + i} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                const ds = `${year}-${mm}-${String(d).padStart(2, '0')}`
                const open = !!slots[ds] && ds >= todayStr
                return (
                  <button
                    key={d}
                    className={`cal-day${open ? ' is-open' : ''}${selDate === ds ? ' is-sel' : ''}`}
                    disabled={!open}
                    onClick={() => pickDate(ds)}
                    aria-label={`${fmtLong(ds)}${open ? `, ${slots[ds].length} slot${slots[ds].length > 1 ? 's' : ''} free` : ', no slots'}`}
                    aria-pressed={selDate === ds}
                  >{d}</button>
                )
              })}
            </div>
            {!loadingSlots && !hasAny && (
              <p className="cal-empty">No open slots this month. Try the next month, or <Link to="/contact">ask about dates</Link>.</p>
            )}
          </div>
        </section>

        {/* Step 2 */}
        {selDate && (
          <section className="bk-step" aria-labelledby="s2" ref={slotsRef}>
            <h2 id="s2" className="bk-h"><span className="bk-num">2</span> Choose a time</h2>
            <p className="bk-date">{fmtLong(selDate)}</p>
            <div className="slot-list">
              {(slots[selDate] || []).map(s => (
                <button key={s.id} className={`slot${selSlot?.id === s.id ? ' is-sel' : ''}`} onClick={() => pickSlot(s)} aria-pressed={selSlot?.id === s.id}>
                  <span className="slot-time">{s.label}</span>
                  <span className="slot-type">{s.session_type}</span>
                  {s.price_hint && <span className="slot-price">{s.price_hint}</span>}
                  {selSlot?.id === s.id && <Check size={20} className="slot-check" />}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Step 3 */}
        {selSlot && (
          <section className="bk-step" aria-labelledby="s3" ref={detailsRef}>
            <h2 id="s3" className="bk-h"><span className="bk-num">3</span> Your details</h2>
            <form onSubmit={submit} className="bk-form" noValidate={false}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bk-name">Full name</label>
                  <input id="bk-name" required autoComplete="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label htmlFor="bk-phone">Phone</label>
                  <input id="bk-phone" required type="tel" autoComplete="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="bk-email">Email</label>
                <input id="bk-email" required type="email" autoComplete="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label htmlFor="bk-style">Style</label>
                <select id="bk-style" value={form.style} onChange={e => setForm(f => ({ ...f, style: e.target.value }))}>
                  <option value="">Choose a style (optional)</option>
                  {STYLES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="bk-desc">Tell me about the tattoo</label>
                <textarea id="bk-desc" required rows={5} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What it is, where it goes, roughly how big, and anything it means to you." />
              </div>

              <div className="form-group">
                <span className="bk-label">Reference photo (optional)</span>
                {refPreview ? (
                  <div className="ref-preview">
                    <img src={refPreview} alt="Your reference" />
                    <button type="button" className="btn btn-outline" onClick={clearRef}>Remove photo</button>
                  </div>
                ) : (
                  <button type="button" className="ref-drop" onClick={() => fileRef.current?.click()}>
                    <ImagePlus size={22} /> Add a reference photo
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onRefFile} className="visually-hidden" tabIndex={-1} />
              </div>

              <div className="form-group">
                <label htmlFor="bk-ref">Links to inspiration (optional)</label>
                <input id="bk-ref" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} placeholder="Instagram post, Pinterest board" />
              </div>

              <label className="bk-check">
                <input type="checkbox" checked={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.checked }))} />
                <span>I'm 18 or over and will bring photo ID.</span>
              </label>

              <div className="bk-recap">
                <span>{fmtLong(selDate)}</span>
                <span>{selSlot.label}{selSlot.price_hint ? `, ${selSlot.price_hint}` : ''}</span>
              </div>

              {settings.deposit_note && <p className="bk-small">{settings.deposit_note}</p>}
              {error && <p className="form-error" role="alert">{error}</p>}

              <button type="submit" className="btn btn-gold bk-submit" disabled={submitting}>
                {submitting ? 'Sending request…' : 'Send booking request'}
              </button>
            </form>
          </section>
        )}
        {error && !selSlot && <p className="form-error" role="alert">{error}</p>}
      </div>
    </div>
  )
}
