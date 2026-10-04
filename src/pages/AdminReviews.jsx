import React, { useEffect, useState } from 'react'
import { Trash2, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'

const EMPTY = { name: '', body: '', tattoo: '', rating: 5 }

export default function AdminReviews() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [busy, setBusy] = useState(false)

  const load = () => supabase.from('reviews').select('*').order('created_at', { ascending: false }).then(({ data }) => setItems(data || []))
  useEffect(() => { load() }, [])

  const add = async e => {
    e.preventDefault(); setBusy(true)
    await supabase.from('reviews').insert({ ...form, rating: Number(form.rating), published: true })
    setForm(EMPTY); setBusy(false); load()
  }
  const toggle = async r => { await supabase.from('reviews').update({ published: !r.published }).eq('id', r.id); load() }
  const del = async r => { if (!confirm(`Delete ${r.name}'s review?`)) return; await supabase.from('reviews').delete().eq('id', r.id); load() }

  return (
    <div>
      <div className="admin-form-card">
        <h3>Add a review</h3>
        <p className="adm-help">Copy in reviews clients have left you on Google, Facebook or by message. Only add real ones, with their permission.</p>
        <form onSubmit={add}>
          <div className="admin-form-row">
            <div className="form-group"><label>Client name</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Jess M." /></div>
            <div className="form-group"><label>Tattoo (optional)</label><input value={form.tattoo} onChange={e => setForm({ ...form, tattoo: e.target.value })} placeholder="e.g. Forearm piece" /></div>
            <div className="form-group"><label>Stars</label>
              <select value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })}>{[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n}</option>)}</select>
            </div>
          </div>
          <div className="form-group"><label>What they said</label><textarea required rows={3} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} /></div>
          <button type="submit" className="btn btn-gold" disabled={busy}>{busy ? 'Saving…' : 'Add review'}</button>
        </form>
      </div>

      {items.length === 0 ? <div className="admin-empty"><p>No reviews yet. The reviews section stays hidden on the site until you add one.</p></div> : (
        <div className="adm-list">
          {items.map(r => (
            <div key={r.id} className="adm-row">
              <div className="adm-row-top">
                <div>
                  <p className="adm-name">{r.name}</p>
                  <p className="adm-meta"><span className="adm-gold">{'★'.repeat(r.rating)}</span>{r.tattoo ? ` · ${r.tattoo}` : ''}</p>
                </div>
                <span className={`status-badge ${r.published ? 'status-confirmed' : 'status-waived'}`}>{r.published ? 'Showing' : 'Hidden'}</span>
              </div>
              <p className="adm-body" style={{ fontStyle: 'italic' }}>{r.body}</p>
              <div className="adm-actions">
                <button className="admin-action-btn" onClick={() => toggle(r)}>{r.published ? <><EyeOff size={13} /> Hide</> : <><Eye size={13} /> Show</>}</button>
                <button className="admin-action-btn danger" onClick={() => del(r)} style={{ marginLeft: 'auto' }}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
