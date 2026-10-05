import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSettings } from '../lib/useSettings'
import { useSEO } from '../lib/useSEO'
import { fmtLong, todayISO } from '../lib/dates'
import './Booking.css'

const STATUS_TEXT = {
  pending: 'Waiting for confirmation',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
}

export default function ManageBooking() {
  const { token } = useParams()
  const { settings } = useSettings()
  const [booking, setBooking] = useState(undefined)
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useSEO({ title: 'Your booking', path: '/booking/manage' })

  const load = () => supabase.rpc('get_booking', { p_token: token }).then(({ data, error }) => setBooking(error ? null : data))
  useEffect(() => { load() }, [token])

  const cancel = async () => {
    setBusy(true); setError('')
    const { data, error } = await supabase.rpc('cancel_booking', { p_token: token })
    if (error || !data) setError('The cancellation did not go through. Message the studio directly and it will be sorted.')
    else await load()
    setBusy(false); setConfirming(false)
  }

  if (booking === undefined) return <div className="manage-page"><header className="page-hero"><p>Loading your booking…</p></header></div>

  if (!booking) return (
    <div className="manage-page page-enter">
      <header className="page-hero">
        <h1 className="section-title">Booking not found</h1>
        <div className="gold-line" />
        <p>This link doesn't match a booking. Check you copied the whole link from your email, or <Link to="/contact" style={{ color: 'var(--gold)' }}>get in touch</Link>.</p>
      </header>
    </div>
  )

  const isPast = booking.slot_date && booking.slot_date < todayISO()
  const canCancel = booking.status !== 'cancelled' && !isPast

  return (
    <div className="manage-page page-enter">
      <header className="page-hero">
        <h1 className="section-title">Your booking</h1>
        <div className="gold-line" />
        <p>Hi {booking.name?.split(' ')[0]}. Here's where things stand.</p>
      </header>
      <div className="container bk-done">
        <dl className="bk-summary">
          <div><dt>Status</dt><dd style={{ color: booking.status === 'cancelled' ? 'var(--blood)' : booking.status === 'confirmed' ? 'var(--ok)' : 'var(--gold)' }}>{STATUS_TEXT[booking.status] || booking.status}</dd></div>
          {booking.slot_date && <div><dt>Date</dt><dd>{fmtLong(booking.slot_date)}</dd></div>}
          {booking.slot_label && <div><dt>Time</dt><dd>{booking.slot_label}</dd></div>}
          <div><dt>Booking fee</dt><dd>{booking.deposit_status === 'paid' ? 'Paid' : booking.deposit_status === 'waived' ? 'Not needed' : 'Not paid yet'}</dd></div>
        </dl>

        {booking.description && (
          <div className="bk-next">
            <h2 className="bk-h">Your idea</h2>
            <p style={{ color: 'var(--ash)', whiteSpace: 'pre-wrap' }}>{booking.description}</p>
          </div>
        )}

        <div className="bk-done-actions">
          {booking.status !== 'cancelled' && booking.deposit_status === 'unpaid' && settings.deposit_link && (
            <a href={settings.deposit_link} target="_blank" rel="noreferrer" className="btn btn-gold">
              Pay booking fee{settings.deposit_amount ? ` (${settings.deposit_amount})` : ''}
            </a>
          )}
          {canCancel && !confirming && <button className="btn btn-outline" onClick={() => setConfirming(true)}>Cancel this booking</button>}
          <Link to="/contact" className="btn btn-ghost">Need to change the date? Get in touch</Link>
        </div>

        {confirming && (
          <div className="bk-notice">
            <p style={{ marginBottom: '1rem' }}>Cancel your booking on {fmtLong(booking.slot_date)}?{booking.deposit_status === 'paid' ? ' Your booking fee is non-refundable, as agreed when you booked.' : ''}</p>
            <div className="bk-done-actions">
              <button className="btn btn-red" onClick={cancel} disabled={busy}>{busy ? 'Cancelling…' : 'Yes, cancel it'}</button>
              <button className="btn btn-outline" onClick={() => setConfirming(false)}>Keep my booking</button>
            </div>
          </div>
        )}
        {error && <p className="form-error" role="alert">{error}</p>}
      </div>
    </div>
  )
}
