import React, { useState, useEffect, useRef } from 'react'
import { Upload, Trash2, Star, Pencil } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { uploadImage } from '../lib/images'

const STYLES = ['Black & Grey', 'Realism', 'Fine Line', 'Traditional', 'Neo-Traditional', 'Japanese', 'Geometric', 'Lettering', 'Watercolour', 'Cover-up', 'Other']

function Tile({ item, onChange }) {
  const [editing, setEditing] = useState(false)
  const [f, setF] = useState({ title: item.title || '', style: item.style || 'Other', description: item.description || '' })

  const toggle = async key => { await supabase.from('gallery').update({ [key]: !item[key] }).eq('id', item.id); onChange() }
  const save = async () => { await supabase.from('gallery').update(f).eq('id', item.id); setEditing(false); onChange() }
  const del = async () => {
    if (!confirm('Delete this photo from the gallery?')) return
    const path = item.image_url?.split('/tattoos/')[1]?.split('?')[0]
    if (path) await supabase.storage.from('tattoos').remove([path])
    await supabase.from('gallery').delete().eq('id', item.id)
    onChange()
  }

  return (
    <div className="adm-card">
      <div className="adm-card-img">
        <img src={item.image_url} alt={item.title || item.style} loading="lazy" />
        <div className="adm-card-flags">
          {item.featured && <span className="status-badge status-pending" style={{ background: 'var(--gold)', color: 'var(--ink)' }}>Featured</span>}
          {item.healed && <span className="status-badge status-confirmed" style={{ background: 'var(--ink)' }}>Healed</span>}
        </div>
      </div>
      <div className="adm-card-body">
        {editing ? (
          <>
            <input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} placeholder="Title" />
            <select value={f.style} onChange={e => setF({ ...f, style: e.target.value })}>{STYLES.map(s => <option key={s}>{s}</option>)}</select>
            <textarea rows={2} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} placeholder="The story behind it (shows on the homepage spotlight)" />
            <div className="adm-actions" style={{ marginTop: 0 }}>
              <button className="admin-action-btn ok" onClick={save}>Save</button>
              <button className="admin-action-btn" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <p style={{ fontWeight: 500 }}>{item.title || item.style}</p>
            <p className="adm-meta">{item.style}</p>
            <div className="adm-actions" style={{ marginTop: 'auto' }}>
              <button className="admin-action-btn" onClick={() => toggle('featured')} title="Featured photos lead the homepage">
                <Star size={13} fill={item.featured ? 'currentColor' : 'none'} /> {item.featured ? 'Unfeature' : 'Feature'}
              </button>
              <button className="admin-action-btn" onClick={() => toggle('healed')}>{item.healed ? 'Not healed' : 'Healed'}</button>
              <button className="admin-action-btn" onClick={() => setEditing(true)} aria-label="Edit"><Pencil size={13} /></button>
              <button className="admin-action-btn danger" onClick={del} aria-label="Delete"><Trash2 size={13} /></button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function AdminGallery() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [files, setFiles] = useState([])
  const [style, setStyle] = useState('Black & Grey')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [healed, setHealed] = useState(false)
  const [busy, setBusy] = useState('')
  const fileRef = useRef()

  const load = () => supabase.from('gallery').select('*').order('created_at', { ascending: false }).then(({ data }) => { setItems(data || []); setLoading(false) })
  useEffect(() => { load() }, [])

  const upload = async e => {
    e.preventDefault()
    if (!files.length) return
    let failed = 0
    for (let i = 0; i < files.length; i++) {
      setBusy(`Uploading ${i + 1} of ${files.length}…`)
      try {
        const url = await uploadImage(supabase, 'tattoos', 'gallery', files[i], 1800)
        await supabase.from('gallery').insert({
          image_url: url,
          style,
          healed,
          title: title ? (files.length > 1 ? `${title} ${i + 1}` : title) : null,
          description: description || null,
        })
      } catch { failed++ }
    }
    setBusy(failed ? `${failed} photo${failed > 1 ? 's' : ''} failed to upload. Try them again.` : '')
    setFiles([]); setTitle(''); setDescription(''); setHealed(false)
    if (fileRef.current) fileRef.current.value = ''
    load()
  }

  return (
    <div>
      <div className="admin-form-card">
        <h3>Add photos</h3>
        <p className="adm-help">Photos are shrunk automatically before upload, so phone photos are fine. Pick several at once if they share a style.</p>
        <form onSubmit={upload}>
          <button type="button" className="adm-drop" onClick={() => fileRef.current?.click()}>
            {files.length ? (
              <div className="adm-previews">{files.map((f, i) => <img key={i} src={URL.createObjectURL(f)} alt="" />)}</div>
            ) : (<><Upload size={28} strokeWidth={1.5} style={{ margin: '0 auto .5rem' }} /><p>Choose photos</p></>)}
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={e => setFiles(Array.from(e.target.files || []))} className="visually-hidden" tabIndex={-1} />
          <div className="admin-form-row">
            <div className="form-group"><label>Style</label><select value={style} onChange={e => setStyle(e.target.value)}>{STYLES.map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Title (optional)</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Stairway forearm" /></div>
          </div>
          <div className="form-group"><label>Story (optional)</label><textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="What it means, how long it took, healed or fresh" /></div>
          <label className="adm-check" style={{ marginBottom: '1rem' }}><input type="checkbox" checked={healed} onChange={e => setHealed(e.target.checked)} /> These are healed photos</label>
          <div className="adm-actions">
            <button type="submit" className="btn btn-gold" disabled={!files.length || busy.startsWith('Uploading')}>
              {busy.startsWith('Uploading') ? busy : `Upload ${files.length > 1 ? `${files.length} photos` : 'photo'}`}
            </button>
            {busy && !busy.startsWith('Uploading') && <span className="adm-meta" style={{ color: 'var(--blood)' }}>{busy}</span>}
          </div>
        </form>
      </div>

      <p className="admin-section-title">{items.length} photos · {items.filter(i => i.featured).length} featured · {items.filter(i => i.healed).length} healed</p>
      {loading ? <p className="adm-meta">Loading…</p> : items.length === 0 ? (
        <div className="admin-empty"><p>No photos yet. Add your first above.</p></div>
      ) : (
        <div className="adm-grid-cards">{items.map(it => <Tile key={it.id} item={it} onChange={load} />)}</div>
      )}
    </div>
  )
}
