import React, { useState, useEffect, useRef } from 'react'
import { Upload, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { uploadImage } from '../lib/images'

const EMPTY = { title: '', price: '', size: '', notes: '' }

export default function AdminFlash() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const fileRef = useRef()

  const load = () => supabase.from('flash').select('*').order('created_at', { ascending: false }).then(({ data }) => setItems(data || []))
  useEffect(() => { load() }, [])

  const add = async e => {
    e.preventDefault()
    setBusy(true); setErr('')
    try {
      const image_url = file ? await uploadImage(supabase, 'tattoos', 'flash', file, 1400) : null
      const { error } = await supabase.from('flash').insert({ ...form, image_url, available: true })
      if (error) throw error
      setForm(EMPTY); setFile(null); if (fileRef.current) fileRef.current.value = ''
      load()
    } catch (e2) { setErr('Could not save the design: ' + (e2.message || 'unknown error')) }
    setBusy(false)
  }
  const toggle = async it => { await supabase.from('flash').update({ available: !it.available }).eq('id', it.id); load() }
  const del = async it => { if (!confirm(`Delete "${it.title}"?`)) return; await supabase.from('flash').delete().eq('id', it.id); load() }

  return (
    <div>
      <div className="admin-form-card">
        <h3>Add a flash design</h3>
        <p className="adm-help">Designs show on the Flash page and the homepage. Customers can book one straight from its card. Mark it claimed once it's been tattooed.</p>
        <form onSubmit={add}>
          <button type="button" className="adm-drop" onClick={() => fileRef.current?.click()}>
            {file ? <div className="adm-previews"><img src={URL.createObjectURL(file)} alt="" /></div> : <><Upload size={26} strokeWidth={1.5} style={{ margin: '0 auto .5rem' }} /><p>Choose the design image</p></>}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="visually-hidden" tabIndex={-1} />
          <div className="admin-form-row">
            <div className="form-group"><label>Name</label><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Dagger and rose" /></div>
            <div className="form-group"><label>Price</label><input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="e.g. £80" /></div>
            <div className="form-group"><label>Size</label><input value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} placeholder="e.g. Palm size, about 8cm" /></div>
          </div>
          <div className="form-group"><label>Notes (optional)</label><input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="e.g. Can be done in colour" /></div>
          {err && <p className="form-error">{err}</p>}
          <button type="submit" className="btn btn-gold" disabled={busy}>{busy ? 'Saving…' : 'Add design'}</button>
        </form>
      </div>

      {items.length === 0 ? <div className="admin-empty"><p>No flash designs yet.</p></div> : (
        <div className="adm-grid-cards">
          {items.map(it => (
            <div key={it.id} className="adm-card">
              <div className="adm-card-img contain">{it.image_url && <img src={it.image_url} alt={it.title} loading="lazy" />}</div>
              <div className="adm-card-body">
                <p style={{ fontWeight: 500 }}>{it.title}</p>
                <p className="adm-meta">{[it.price, it.size].filter(Boolean).join(' · ')}</p>
                <div className="adm-actions" style={{ marginTop: 'auto' }}>
                  <span className={`status-badge ${it.available ? 'status-confirmed' : 'status-waived'}`}>{it.available ? 'Available' : 'Claimed'}</span>
                  <button className="admin-action-btn" onClick={() => toggle(it)}>{it.available ? 'Mark claimed' : 'Make available'}</button>
                  <button className="admin-action-btn danger" onClick={() => del(it)} aria-label="Delete"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
