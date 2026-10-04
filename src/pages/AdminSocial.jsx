import React, { useEffect, useState, useRef } from 'react'
import { Upload, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { uploadImage } from '../lib/images'

export default function AdminSocial() {
  const [items, setItems] = useState([])
  const [file, setFile] = useState(null)
  const [link, setLink] = useState('')
  const [caption, setCaption] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef()

  const load = () => supabase.from('social_posts').select('*').order('created_at', { ascending: false }).then(({ data }) => setItems(data || []))
  useEffect(() => { load() }, [])

  const add = async e => {
    e.preventDefault()
    if (!file) return
    setBusy(true)
    try {
      const url = await uploadImage(supabase, 'tattoos', 'social', file, 1000)
      await supabase.from('social_posts').insert({ image_url: url, link_url: link || null, caption: caption || null })
      setFile(null); setLink(''); setCaption(''); if (fileRef.current) fileRef.current.value = ''
      load()
    } catch (err) { alert('Upload failed: ' + err.message) }
    setBusy(false)
  }
  const del = async it => { if (!confirm('Remove this post from the strip?')) return; await supabase.from('social_posts').delete().eq('id', it.id); load() }

  return (
    <div>
      <div className="admin-form-card">
        <h3>Add to the social strip</h3>
        <p className="adm-help">The homepage shows your 6 newest. Upload the photo and paste the link to the Instagram, TikTok or Facebook post so people can tap through.</p>
        <form onSubmit={add}>
          <button type="button" className="adm-drop" onClick={() => fileRef.current?.click()}>
            {file ? <div className="adm-previews"><img src={URL.createObjectURL(file)} alt="" /></div> : <><Upload size={26} strokeWidth={1.5} style={{ margin: '0 auto .5rem' }} /><p>Choose a photo</p></>}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="visually-hidden" tabIndex={-1} />
          <div className="admin-form-row">
            <div className="form-group"><label>Post link (optional)</label><input type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://www.instagram.com/p/…" /></div>
            <div className="form-group"><label>Short description (optional)</label><input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Used for screen readers" /></div>
          </div>
          <button type="submit" className="btn btn-gold" disabled={!file || busy}>{busy ? 'Uploading…' : 'Add post'}</button>
        </form>
      </div>
      {items.length === 0 ? <div className="admin-empty"><p>Nothing in the strip yet. It stays hidden on the homepage until you add a post.</p></div> : (
        <div className="adm-grid-cards">
          {items.map((it, i) => (
            <div key={it.id} className="adm-card">
              <div className="adm-card-img"><img src={it.image_url} alt={it.caption || ''} loading="lazy" />
                {i < 6 && <div className="adm-card-flags"><span className="status-badge status-confirmed" style={{ background: 'var(--ink)' }}>On homepage</span></div>}
              </div>
              <div className="adm-card-body">
                {it.link_url ? <a href={it.link_url} target="_blank" rel="noreferrer" className="adm-meta" style={{ color: 'var(--gold)', wordBreak: 'break-all' }}>{it.link_url}</a> : <p className="adm-meta">No link</p>}
                <div className="adm-actions" style={{ marginTop: 'auto' }}><button className="admin-action-btn danger" onClick={() => del(it)}><Trash2 size={13} /> Remove</button></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
