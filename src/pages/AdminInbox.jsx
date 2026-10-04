import React, { useEffect, useState, useCallback } from 'react'
import { Mail, Trash2, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AdminInbox({ onChange }) {
  const [msgs, setMsgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRead, setShowRead] = useState(true)

  const load = useCallback(() => {
    supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setMsgs(data || []); setLoading(false) })
  }, [])
  useEffect(load, [load])

  const mark = async (m, is_read) => { await supabase.from('contact_messages').update({ is_read }).eq('id', m.id); load(); onChange?.() }
  const del = async m => {
    if (!confirm(`Delete the message from ${m.name}?`)) return
    await supabase.from('contact_messages').delete().eq('id', m.id); load(); onChange?.()
  }

  const shown = showRead ? msgs : msgs.filter(m => !m.is_read)

  return (
    <div>
      <p className="adm-help" style={{ margin: '0 0 1rem' }}>Messages from the contact form. They're also emailed to you, so this is your backup copy.</p>
      <div className="adm-toolbar">
        <div className="adm-seg">
          <button className={showRead ? 'is-on' : ''} onClick={() => setShowRead(true)}>All</button>
          <button className={!showRead ? 'is-on' : ''} onClick={() => setShowRead(false)}>Unread</button>
        </div>
      </div>
      {loading ? <p className="adm-meta">Loading…</p> : shown.length === 0 ? (
        <div className="admin-empty"><p>{showRead ? 'No messages yet.' : 'All caught up.'}</p></div>
      ) : (
        <div className="adm-list">
          {shown.map(m => (
            <div key={m.id} className={`adm-row${m.is_read ? '' : ' is-unread'}`}>
              <div className="adm-row-top">
                <div>
                  <p className="adm-name">{m.name}</p>
                  <p className="adm-meta"><a href={`mailto:${m.email}`}>{m.email}</a>{m.subject ? ` · ${m.subject}` : ''}</p>
                </div>
                <p className="adm-meta">{new Date(m.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <p className="adm-body">{m.message}</p>
              <div className="adm-actions">
                <a className="admin-action-btn" href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + (m.subject || 'Your message to SRJ Inked'))}`} onClick={() => !m.is_read && mark(m, true)}>
                  <Mail size={13} /> Reply
                </a>
                <button className="admin-action-btn" onClick={() => mark(m, !m.is_read)}><Check size={13} /> {m.is_read ? 'Mark unread' : 'Mark read'}</button>
                <button className="admin-action-btn danger" onClick={() => del(m)} style={{ marginLeft: 'auto' }}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
