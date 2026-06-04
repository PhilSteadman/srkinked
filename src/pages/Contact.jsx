import React, { useState } from 'react'
import { Instagram, Facebook, Youtube, Send, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useSettings } from '../lib/useSettings'
import './Contact.css'

const TikTokIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.74a4.85 4.85 0 01-1.01-.05z"/>
  </svg>
)

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { settings } = useSettings()

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    await supabase.from('contact_messages').insert(form)
    setSent(true)
    setLoading(false)
  }

  const socials = [
    { url: settings.instagram_url, icon: <Instagram size={22}/>, platform: 'Instagram', handle: settings.instagram_url?.split('/').pop() || '@srjinked' },
    { url: settings.facebook_url, icon: <Facebook size={22}/>, platform: 'Facebook', handle: 'S.R.J Inked' },
    { url: settings.tiktok_url, icon: <TikTokIcon/>, platform: 'TikTok', handle: settings.tiktok_url?.split('/').pop() || '@s.r.j.inked' },
    { url: settings.youtube_url, icon: <Youtube size={22}/>, platform: 'YouTube', handle: 'SRJ Inked' },
  ].filter(s => s.url)

  return (
    <div className="contact-page page-enter">
      <div className="page-hero">
        <p className="section-eyebrow">Reach Out</p>
        <h1 className="section-title">Get In <span>Touch</span></h1>
        <div className="gold-line" style={{ margin: '1rem auto' }} />
        <p>Questions, ideas, or just want to chat about a piece? Drop a message.</p>
      </div>
      <div className="container contact-wrap">
        <div className="contact-info">
          <h2 className="section-title" style={{ fontSize: '1.8rem' }}>Let's Talk <span>Ink</span></h2>
          <div className="gold-line" />
          <p className="contact-blurb">The best way to discuss your idea is via social media or the form. SRJ responds within 24–48 hours.</p>

          <div className="contact-socials">
            {socials.map(s => (
              <a key={s.platform} href={s.url} target="_blank" rel="noreferrer" className="social-link">
                <div className="social-icon">{s.icon}</div>
                <div>
                  <p className="social-platform">{s.platform}</p>
                  <p className="social-handle">{s.handle}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="contact-note">
            <p><strong>{settings.studio_address}</strong></p>
            <p>Exact studio location shared on booking confirmation.</p>
            {settings.contact_email && (
              <p style={{ marginTop: '.5rem' }}>
                <a href={`mailto:${settings.contact_email}`} style={{ color: 'var(--gold)' }}>{settings.contact_email}</a>
              </p>
            )}
          </div>
        </div>

        <div className="contact-form-wrap">
          {sent ? (
            <div className="contact-success">
              <CheckCircle size={48} strokeWidth={1} color="var(--gold)" />
              <h3>Message Sent!</h3>
              <p>Thanks {form.name}! SRJ will be in touch within 24–48 hours.</p>
              <button className="btn btn-outline" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}>
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="contact-form">
              <h3>Send a Message</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@email.com" />
                </div>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                  <option value="">Select a topic...</option>
                  {['Booking Enquiry', 'Design Consultation', 'Pricing Question', 'Events / Guest Spots', 'Other'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea required rows={6} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Tell me about your idea, or ask whatever you need..." />
              </div>
              <button type="submit" className="btn btn-gold" disabled={loading} style={{ width: '100%' }}>
                <Send size={14} style={{ marginRight: '.5rem' }} />
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
