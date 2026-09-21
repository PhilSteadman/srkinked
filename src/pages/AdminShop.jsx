import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Upload, Trash2, Plus, Eye, EyeOff } from 'lucide-react'

export default function AdminShop() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ name: '', description: '', price_pence: '', active: false })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const fileRef = useRef()

  const load = () => {
    supabase.from('products').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setProducts(data || []); setLoading(false) })
  }
  useEffect(load, [])

  const onFile = e => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const submit = async e => {
    e.preventDefault()
    setUploading(true)

    let image_url = null
    if (file) {
      const ext = file.name.split('.').pop()
      const path = `products/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('tattoos').upload(path, file, { cacheControl: '3600', upsert: false })
      if (upErr) { alert('Upload failed: ' + upErr.message); setUploading(false); return }
      const { data: { publicUrl } } = supabase.storage.from('tattoos').getPublicUrl(path)
      image_url = publicUrl
    }

    const price_pence = form.price_pence ? Math.round(parseFloat(form.price_pence) * 100) : null

    await supabase.from('products').insert({
      name: form.name,
      description: form.description,
      price_pence,
      image_url,
      active: form.active,
    })

    setForm({ name: '', description: '', price_pence: '', active: false })
    setFile(null); setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
    setUploading(false)
    load()
  }

  const toggleActive = async (id, cur) => {
    await supabase.from('products').update({ active: !cur }).eq('id', id)
    load()
  }

  const del = async item => {
    if (!confirm('Delete this product?')) return
    if (item.image_url) {
      const path = item.image_url.split('/tattoos/')[1]
      if (path) await supabase.storage.from('tattoos').remove([path])
    }
    await supabase.from('products').delete().eq('id', item.id)
    load()
  }

  return (
    <div>
      <div className="admin-form-card">
        <h3>Add Product</h3>
        <form onSubmit={submit}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{ border: '2px dashed var(--border)', padding: '2rem', textAlign: 'center', cursor: 'pointer', marginBottom: '1rem', transition: 'border-color .2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            {preview ? (
              <img src={preview} alt="Preview" style={{ maxHeight: '180px', margin: '0 auto', display: 'block' }} />
            ) : (
              <div style={{ color: 'var(--muted)' }}>
                <Upload size={28} strokeWidth={1} style={{ margin: '0 auto .5rem' }} />
                <p style={{ fontSize: '.85rem' }}>Click to add a product photo (optional)</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
          </div>

          <div className="admin-form-row" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label>Product Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. SRJ Inked Logo Tee" />
            </div>
            <div className="form-group">
              <label>Price (£) — leave blank for "DM to order"</label>
              <input type="number" step="0.01" min="0" value={form.price_pence} onChange={e => setForm(f => ({ ...f, price_pence: e.target.value }))} placeholder="25.00" />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Black cotton tee, gold logo print, sizes S–XXL" />
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button type="submit" className="btn btn-gold" disabled={uploading}>
              <Plus size={14} style={{ marginRight: '.5rem' }} />{uploading ? 'Saving...' : 'Add Product'}
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', textTransform: 'none', letterSpacing: 'normal', fontSize: '.9rem', color: 'var(--white)' }}>
              <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} style={{ width: 'auto' }} />
              Show on site immediately
            </label>
          </div>
        </form>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading products...</p>
      ) : products.length === 0 ? (
        <div className="admin-empty"><p>No products yet. Add one above.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)' }}>
          {products.map(p => (
            <div key={p.id} style={{ background: 'var(--dark)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} style={{ width: '52px', height: '52px', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: '52px', height: '52px', background: 'var(--surface)', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, marginBottom: '.2rem' }}>{p.name}</p>
                <p style={{ fontSize: '.8rem', color: 'var(--gold)' }}>
                  {p.price_pence ? `£${(p.price_pence / 100).toFixed(2)}` : 'DM to order'}
                </p>
              </div>
              <span className={`status-badge ${p.active ? 'status-confirmed' : 'status-pending'}`}>
                {p.active ? 'Live' : 'Hidden'}
              </span>
              <button className="admin-action-btn" onClick={() => toggleActive(p.id, p.active)} title={p.active ? 'Hide' : 'Show'}>
                {p.active ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button className="admin-action-btn danger" onClick={() => del(p)}><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
