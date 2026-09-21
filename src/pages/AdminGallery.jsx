import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Upload, Trash2, Plus, Star } from 'lucide-react'

const STYLES = ['Black & Grey','Realism','Traditional','Neo-Traditional','Fine Line','Japanese','Geometric','Watercolour','Lettering','Other']

export default function AdminGallery() {
  const [items, setItems] = useState([])
  const [style, setStyle] = useState('Black & Grey')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState('')
  const fileRef = useRef()

  const load = () => {
    supabase.from('gallery').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setItems(data || []); setLoading(false) })
  }
  useEffect(load, [])

  const onFiles = e => {
    const selected = Array.from(e.target.files)
    if (!selected.length) return
    setFiles(selected)
    setPreviews(selected.map(f => URL.createObjectURL(f)))
  }

  const upload = async e => {
    e.preventDefault()
    if (!files.length) return alert('Please select at least one image')
    setUploading(true)

    // Multi-upload: each file becomes its own gallery row.
    // Title auto-numbers when uploading more than one at once.
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setProgress(`Uploading ${i + 1} of ${files.length}...`)

      const ext = file.name.split('.').pop()
      const path = `gallery/${Date.now()}-${i}.${ext}`

      const { error: upErr } = await supabase.storage.from('tattoos').upload(path, file, { cacheControl: '3600', upsert: false })
      if (upErr) { console.error('Upload failed for', file.name, upErr.message); continue }

      const { data: { publicUrl } } = supabase.storage.from('tattoos').getPublicUrl(path)

      await supabase.from('gallery').insert({
        title: files.length > 1 ? `${style} ${i + 1}` : (description ? undefined : style),
        style,
        description,
        image_url: publicUrl,
      })
    }

    setProgress('')
    setDescription('')
    setFiles([]); setPreviews([])
    if (fileRef.current) fileRef.current.value = ''
    setUploading(false)
    load()
  }

  const toggleFeatured = async (item) => {
    await supabase.from('gallery').update({ featured: !item.featured }).eq('id', item.id)
    load()
  }

  const del = async (item) => {
    if (!confirm('Delete this image?')) return
    const path = item.image_url?.split('/tattoos/')[1]
    if (path) await supabase.storage.from('tattoos').remove([path])
    await supabase.from('gallery').delete().eq('id', item.id)
    load()
  }

  return (
    <div>
      <div className="admin-form-card">
        <h3>Upload New Tattoos</h3>
        <form onSubmit={upload}>
          <div
            className="upload-drop-zone"
            onClick={() => fileRef.current?.click()}
            style={{ border: '2px dashed var(--border)', padding: '2rem', textAlign: 'center', cursor: 'pointer', marginBottom: '1rem', transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            {previews.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', justifyContent: 'center' }}>
                {previews.map((p, i) => (
                  <img key={i} src={p} alt={`Preview ${i}`} style={{ height: '100px', objectFit: 'cover' }} />
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--muted)' }}>
                <Upload size={32} strokeWidth={1} style={{ margin: '0 auto 0.75rem' }} />
                <p style={{ fontSize: '0.9rem' }}>Click to select image(s)</p>
                <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>JPG, PNG, WebP — select multiple to upload a batch of the same style</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={onFiles} style={{ display: 'none' }} />
          </div>

          <div className="admin-form-row" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label>Style * (applied to all selected images)</label>
              <select value={style} onChange={e => setStyle(e.target.value)}>
                {STYLES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Description (optional, applied to all)</label>
            <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional notes about this piece" />
          </div>

          <button type="submit" className="btn btn-gold" disabled={uploading}>
            <Plus size={14} style={{ marginRight: '0.5rem' }} />
            {uploading ? (progress || 'Uploading...') : `Upload ${files.length > 1 ? `${files.length} Images` : 'to Gallery'}`}
          </button>
        </form>
      </div>

      {loading ? <p style={{ color: 'var(--muted)' }}>Loading gallery...</p> : (
        <>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem', fontWeight: 600 }}>
            {items.length} images · {items.filter(i => i.featured).length} featured
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1px', background: 'var(--border)' }}>
            {items.map(item => (
              <div key={item.id} style={{ background: 'var(--dark)', position: 'relative' }}>
                <div style={{ aspectRatio: '1', overflow: 'hidden', position: 'relative' }}>
                  <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {item.featured && (
                    <span style={{ position: 'absolute', top: '.5rem', left: '.5rem', background: 'var(--gold)', color: 'var(--black)', fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase', padding: '.2rem .5rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                      Featured
                    </span>
                  )}
                </div>
                <div style={{ padding: '0.65rem' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.15rem' }}>{item.title || item.style}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--gold)' }}>{item.style}</p>
                </div>
                <button
                  onClick={() => toggleFeatured(item)}
                  title={item.featured ? 'Unfeature' : 'Feature on home page'}
                  style={{ position: 'absolute', top: '0.5rem', right: '2.5rem', background: 'rgba(0,0,0,0.7)', border: 'none', color: item.featured ? 'var(--gold)' : 'var(--muted)', padding: '0.3rem', cursor: 'pointer' }}
                >
                  <Star size={14} fill={item.featured ? 'var(--gold)' : 'none'} />
                </button>
                <button
                  className="admin-action-btn danger"
                  onClick={() => del(item)}
                  style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.7)', border: 'none', color: 'var(--red-bright)', padding: '0.3rem' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
