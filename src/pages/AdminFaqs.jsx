import React, { useEffect, useState } from 'react'
import { Trash2, ArrowUp, ArrowDown, Pencil } from 'lucide-react'
import { supabase } from '../lib/supabase'

function Row({ f, first, last, onMove, onChange }) {
  const [edit, setEdit] = useState(false)
  const [q, setQ] = useState(f.question)
  const [a, setA] = useState(f.answer)
  const save = async () => { await supabase.from('faqs').update({ question: q, answer: a }).eq('id', f.id); setEdit(false); onChange() }
  const del = async () => { if (!confirm('Delete this question?')) return; await supabase.from('faqs').delete().eq('id', f.id); onChange() }

  return (
    <div className="adm-row">
      {edit ? (
        <>
          <div className="form-group"><label>Question</label><input value={q} onChange={e => setQ(e.target.value)} /></div>
          <div className="form-group"><label>Answer</label><textarea rows={3} value={a} onChange={e => setA(e.target.value)} /></div>
          <div className="adm-actions"><button className="admin-action-btn ok" onClick={save}>Save</button><button className="admin-action-btn" onClick={() => setEdit(false)}>Cancel</button></div>
        </>
      ) : (
        <>
          <p style={{ fontWeight: 500, fontSize: '1.1rem' }}>{f.question}</p>
          <p className="adm-body" style={{ color: 'var(--ash)' }}>{f.answer}</p>
          <div className="adm-actions">
            <button className="admin-action-btn" disabled={first} onClick={() => onMove(-1)} aria-label="Move up"><ArrowUp size={13} /></button>
            <button className="admin-action-btn" disabled={last} onClick={() => onMove(1)} aria-label="Move down"><ArrowDown size={13} /></button>
            <button className="admin-action-btn" onClick={() => setEdit(true)}><Pencil size={13} /> Edit</button>
            <button className="admin-action-btn danger" onClick={del} style={{ marginLeft: 'auto' }}><Trash2 size={13} /></button>
          </div>
        </>
      )}
    </div>
  )
}

export default function AdminFaqs() {
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [a, setA] = useState('')

  const load = () => supabase.from('faqs').select('*').order('sort_order').order('created_at').then(({ data }) => setItems(data || []))
  useEffect(() => { load() }, [])

  const add = async e => {
    e.preventDefault()
    const next = items.length ? Math.max(...items.map(i => i.sort_order || 0)) + 1 : 1
    await supabase.from('faqs').insert({ question: q, answer: a, sort_order: next })
    setQ(''); setA(''); load()
  }

  const move = async (i, dir) => {
    const list = [...items]
    const j = i + dir
    ;[list[i], list[j]] = [list[j], list[i]]
    await Promise.all(list.map((f, idx) => supabase.from('faqs').update({ sort_order: idx + 1 }).eq('id', f.id)))
    load()
  }

  return (
    <div>
      <div className="admin-form-card">
        <h3>Add a question</h3>
        <p className="adm-help">These show on the Pricing page in the order below.</p>
        <form onSubmit={add}>
          <div className="form-group"><label>Question</label><input required value={q} onChange={e => setQ(e.target.value)} /></div>
          <div className="form-group"><label>Answer</label><textarea required rows={3} value={a} onChange={e => setA(e.target.value)} /></div>
          <button type="submit" className="btn btn-gold">Add question</button>
        </form>
      </div>
      {items.length === 0 ? <div className="admin-empty"><p>No questions yet.</p></div> : (
        <div className="adm-list">
          {items.map((f, i) => <Row key={f.id} f={f} first={i === 0} last={i === items.length - 1} onMove={d => move(i, d)} onChange={load} />)}
        </div>
      )}
    </div>
  )
}
