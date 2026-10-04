import React, { useState, useEffect, useRef } from 'react'
import { Upload, Save, Instagram, Facebook, Youtube } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { SETTINGS_DEFAULTS, refreshSettings } from '../lib/useSettings'
import { uploadImage } from '../lib/images'
import { TikTokIcon } from '../components/Footer'

function PhotoField({ label, help, value, onChange, folder, ratio = '4 / 5' }) {
  const ref = useRef()
  const [busy, setBusy] = useState(false)
  const pick = async e => {
    const f = e.target.files?.[0]
    if (!f) return
    setBusy(true)
    try { onChange(await uploadImage(supabase, 'tattoos', folder, f, 2000)) }
    catch (err) { alert('Upload failed: ' + err.message) }
    setBusy(false)
  }
  return (
    <div className="form-group">
      <label>{label}</label>
      {help && <p className="adm-help" style={{ margin: '0 0 .6rem' }}>{help}</p>}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: 160, aspectRatio: ratio, background: 'var(--ink-3)', border: '1px solid var(--line)', overflow: 'hidden' }}>
          {value && <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          <button type="button" className="admin-action-btn" onClick={() => ref.current?.click()} disabled={busy}><Upload size={13} /> {busy ? 'Uploading…' : value ? 'Replace photo' : 'Upload photo'}</button>
          {value && <button type="button" className="admin-action-btn danger" onClick={() => onChange('')}>Remove</button>}
        </div>
        <input ref={ref} type="file" accept="image/*" onChange={pick} className="visually-hidden" tabIndex={-1} />
      </div>
    </div>
  )
}

export default function AdminSettings() {
  const [s, setS] = useState(SETTINGS_DEFAULTS)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('site_settings').select('*').eq('id', 1).maybeSingle().then(({ data }) => {
      if (!data) return
      const clean = {}
      Object.entries(data).forEach(([k, v]) => { if (v !== null) clean[k] = v })
      setS({ ...SETTINGS_DEFAULTS, ...clean })
    })
  }, [])

  const set = (k, v) => { setS(p => ({ ...p, [k]: v })); setSaved(false) }
  const field = (k, label, props = {}) => (
    <div className="form-group">
      <label htmlFor={`set-${k}`}>{label}</label>
      {props.rows
        ? <textarea id={`set-${k}`} rows={props.rows} value={s[k] || ''} onChange={e => set(k, e.target.value)} placeholder={props.placeholder} />
        : <input id={`set-${k}`} type={props.type || 'text'} value={s[k] || ''} onChange={e => set(k, e.target.value)} placeholder={props.placeholder} />}
      {props.help && <p className="adm-help" style={{ margin: '.4rem 0 0' }}>{props.help}</p>}
    </div>
  )

  const save = async () => {
    setSaving(true); setError('')
    const { id, created_at, ...rest } = s
    const { error } = await supabase.from('site_settings').upsert({ id: 1, ...rest, updated_at: new Date().toISOString() })
    if (error) setError(error.message.includes('column') ? 'Saving failed because the database is missing new fields. Run supabase-remodel.sql in Supabase, then save again.' : 'Saving failed: ' + error.message)
    else { setSaved(true); refreshSettings() }
    setSaving(false)
  }

  return (
    <div>
      <div className="admin-form-card">
        <h3>Homepage</h3>
        {field('hero_title', 'Big headline', { placeholder: 'Where your story meets the canvas', help: 'Short works best: 3 to 6 words.' })}
        {field('hero_subtitle', 'Line under the headline', { placeholder: 'Custom tattoos, drawn for you and nobody else.' })}
        <PhotoField label="Hero photo" help="The full-screen photo at the top of the homepage. A landscape shot of you working or a finished piece looks best. Leave empty to use the default." value={s.hero_image_url} onChange={v => set('hero_image_url', v)} folder="settings" ratio="16 / 10" />
      </div>

      <div className="admin-form-card">
        <h3>About you</h3>
        {field('about_text', 'First paragraph', { rows: 3 })}
        {field('about_text_2', 'Second paragraph (optional)', { rows: 2 })}
        <PhotoField label="Studio photo" help="Shows next to the about text." value={s.studio_photo_url} onChange={v => set('studio_photo_url', v)} folder="settings" />
        <div className="admin-form-row">
          {field('years_experience', 'Years tattooing', { placeholder: '2+', help: 'Leave blank to hide.' })}
          {field('tattoos_completed', 'Tattoos done', { placeholder: 'e.g. 150+', help: 'Only fill in if accurate. Leave blank to hide.' })}
        </div>
      </div>

      <div className="admin-form-card">
        <h3>Bookings and deposits</h3>
        <div className="admin-form-row">
          {field('deposit_amount', 'Deposit amount', { placeholder: 'e.g. £30' })}
          {field('deposit_link', 'Deposit payment link', { type: 'url', placeholder: 'https://…', help: 'A Stripe Payment Link, PayPal.me or Monzo.me link. Customers see a Pay deposit button after booking.' })}
        </div>
        {field('deposit_note', 'Deposit policy', { rows: 2 })}
        {field('booking_notice', 'Notice on the booking page (optional)', { rows: 2, placeholder: 'e.g. Books closed 1–14 August while I\'m away.' })}
      </div>

      <div className="admin-form-card">
        <h3>Prices</h3>
        <p className="adm-help">Numbers only. The £ sign is added for you.</p>
        <div className="admin-form-row">
          {field('price_minimum', 'Minimum charge', { type: 'number' })}
          {field('price_under_hour', 'Under an hour', { type: 'number' })}
          {field('price_per_hour', 'Per hour', { type: 'number' })}
          {field('price_half_day', 'Half day (4 hrs)', { type: 'number' })}
          {field('price_full_day', 'Full day (8 hrs)', { type: 'number' })}
        </div>
      </div>

      <div className="admin-form-card">
        <h3>Location and contact</h3>
        <div className="admin-form-row">
          {field('studio_location', 'Town or area', { placeholder: 'e.g. Bristol', help: 'Shown in the footer and on the contact page. Leave blank to hide.' })}
          {field('contact_email', 'Public email (optional)', { type: 'email' })}
        </div>
      </div>

      <div className="admin-form-card">
        <h3>Social links</h3>
        <p className="adm-help">Leave any blank to hide its icon.</p>
        <div className="admin-form-row">
          {field('instagram_url', <><Instagram size={13} /> Instagram</>, { type: 'url' })}
          {field('facebook_url', <><Facebook size={13} /> Facebook</>, { type: 'url' })}
          {field('tiktok_url', <><TikTokIcon size={13} /> TikTok</>, { type: 'url' })}
          {field('youtube_url', <><Youtube size={13} /> YouTube</>, { type: 'url' })}
        </div>
      </div>

      <div className="adm-save-bar">
        <button className="btn btn-gold" onClick={save} disabled={saving}><Save size={16} /> {saving ? 'Saving…' : 'Save settings'}</button>
        {saved && <span className="adm-saved">Saved. The site is updated.</span>}
        {error && <span style={{ color: 'var(--blood)' }}>{error}</span>}
      </div>
    </div>
  )
}
