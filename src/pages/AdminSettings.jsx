import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Upload, Save, Instagram, Facebook, Youtube } from 'lucide-react'

const DEFAULTS = {
  studio_photo_url: '',
  facebook_url: 'https://www.facebook.com/srjinked',
  instagram_url: 'https://www.instagram.com/srjinked',
  tiktok_url: 'https://www.tiktok.com/@s.r.j.inked',
  youtube_url: '',
  studio_address: 'Bristol, UK',
  contact_email: '',
  about_text: 'Based in Bristol, SRJ Inked specialises in bespoke tattoo art across every style. Every tattoo is designed exclusively for you.',
  about_text_2: 'Exceptional hygiene standards, premium inks, and a welcoming studio environment. Your comfort and confidence are the foundation of every session.',
}

export default function AdminSettings() {
  const [settings, setSettings] = useState(DEFAULTS)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [preview, setPreview] = useState(null)
  const fileRef = useRef()

  useEffect(() => {
    supabase.from('site_settings').select('*').eq('id', 1).single()
      .then(({ data }) => {
        if (data) {
          setSettings({ ...DEFAULTS, ...data })
          if (data.studio_photo_url) setPreview(data.studio_photo_url)
        }
      })
  }, [])

  const handleChange = (key, val) => setSettings(s => ({ ...s, [key]: val }))

  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setUploading(true)

    const ext = file.name.split('.').pop()
    const path = `settings/studio-photo.${ext}`

    // Remove old file first
    await supabase.storage.from('tattoos').remove([path])

    const { error } = await supabase.storage.from('tattoos').upload(path, file, {
      cacheControl: '3600', upsert: true
    })
    if (error) { alert('Upload failed: ' + error.message); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from('tattoos').getPublicUrl(path)
    // Add cache buster so it refreshes
    const urlWithBust = `${publicUrl}?t=${Date.now()}`
    setSettings(s => ({ ...s, studio_photo_url: urlWithBust }))
    setPreview(urlWithBust)
    setUploading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    // Upsert with id=1 (single settings row)
    const { error } = await supabase.from('site_settings').upsert({
      id: 1,
      ...settings,
      updated_at: new Date().toISOString()
    })
    if (error) alert('Save failed: ' + error.message)
    else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    setSaving(false)
  }

  return (
    <div>
      {/* Studio Photo */}
      <div className="admin-form-card">
        <h3>Studio Photo</h3>
        <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
          This appears on the About section of the home page.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Upload zone */}
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: '2px dashed var(--border)', padding: '2rem', textAlign: 'center',
              cursor: 'pointer', transition: 'border-color .2s', background: 'var(--surface)'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <Upload size={28} strokeWidth={1} style={{ margin: '0 auto .75rem', color: 'var(--gold)' }} />
            <p style={{ fontSize: '.85rem', color: 'var(--white)', marginBottom: '.25rem' }}>
              {uploading ? 'Uploading...' : 'Click to upload new photo'}
            </p>
            <p style={{ fontSize: '.75rem', color: 'var(--muted)' }}>JPG, PNG, WebP — recommended 800×1000px</p>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoSelect} style={{ display: 'none' }} />
          </div>

          {/* Preview */}
          <div style={{ aspectRatio: '4/5', background: 'var(--surface)', border: '1px solid var(--border)', overflow: 'hidden', position: 'relative' }}>
            {preview ? (
              <img src={preview} alt="Studio preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '.8rem', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                No photo set
              </div>
            )}
          </div>
        </div>
      </div>

      {/* About Text */}
      <div className="admin-form-card">
        <h3>About Text</h3>
        <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
          The two paragraphs shown in the About section on the home page.
        </p>
        <div className="form-group">
          <label>First paragraph</label>
          <textarea
            rows={3}
            value={settings.about_text}
            onChange={e => handleChange('about_text', e.target.value)}
            placeholder="Based in Bristol..."
          />
        </div>
        <div className="form-group">
          <label>Second paragraph</label>
          <textarea
            rows={3}
            value={settings.about_text_2}
            onChange={e => handleChange('about_text_2', e.target.value)}
            placeholder="Exceptional hygiene standards..."
          />
        </div>
      </div>

      {/* Social Media Links */}
      <div className="admin-form-card">
        <h3>Social Media Links</h3>
        <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
          These appear in the navbar, footer, and contact page. Leave blank to hide.
        </p>

        <div className="admin-form-row">
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <Facebook size={14} color="var(--gold)" /> Facebook URL
            </label>
            <input
              value={settings.facebook_url}
              onChange={e => handleChange('facebook_url', e.target.value)}
              placeholder="https://www.facebook.com/yourpage"
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <Instagram size={14} color="var(--gold)" /> Instagram URL
            </label>
            <input
              value={settings.instagram_url}
              onChange={e => handleChange('instagram_url', e.target.value)}
              placeholder="https://www.instagram.com/yourhandle"
            />
          </div>
        </div>

        <div className="admin-form-row">
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--gold)"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.74a4.85 4.85 0 01-1.01-.05z"/></svg>
              TikTok URL
            </label>
            <input
              value={settings.tiktok_url}
              onChange={e => handleChange('tiktok_url', e.target.value)}
              placeholder="https://www.tiktok.com/@yourhandle"
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <Youtube size={14} color="var(--gold)" /> YouTube URL
            </label>
            <input
              value={settings.youtube_url}
              onChange={e => handleChange('youtube_url', e.target.value)}
              placeholder="https://www.youtube.com/@yourchannel"
            />
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="admin-form-card">
        <h3>Contact Info</h3>
        <div className="admin-form-row">
          <div className="form-group">
            <label>Studio Location (shown on contact page)</label>
            <input
              value={settings.studio_address}
              onChange={e => handleChange('studio_address', e.target.value)}
              placeholder="Bristol, UK"
            />
          </div>
          <div className="form-group">
            <label>Contact Email (optional)</label>
            <input
              type="email"
              value={settings.contact_email}
              onChange={e => handleChange('contact_email', e.target.value)}
              placeholder="studio@srjinked.com"
            />
          </div>
        </div>
      </div>

      {/* Save button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className="btn btn-gold"
          onClick={handleSave}
          disabled={saving || uploading}
          style={{ minWidth: '160px' }}
        >
          <Save size={14} style={{ marginRight: '.5rem' }} />
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
        {saved && (
          <p style={{ color: '#2ecc71', fontSize: '.85rem', fontFamily: 'var(--font-display)', letterSpacing: '.1em' }}>
            ✓ Settings saved
          </p>
        )}
        {uploading && (
          <p style={{ color: 'var(--gold)', fontSize: '.85rem' }}>Uploading photo...</p>
        )}
      </div>
    </div>
  )
}
