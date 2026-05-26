import React,{useState,useEffect} from 'react'
import {supabase} from '../lib/supabase'
import {Plus,Trash2} from 'lucide-react'
export default function AdminEvents(){
  const [events,setEvents]=useState([])
  const [form,setForm]=useState({title:'',event_date:'',location:'',description:'',booking_link:''})
  const [saving,setSaving]=useState(false)
  const [loading,setLoading]=useState(true)
  const load=()=>{supabase.from('events').select('*').order('event_date').then(({data})=>{setEvents(data||[]);setLoading(false)})}
  useEffect(load,[])
  const save=async e=>{e.preventDefault();setSaving(true);await supabase.from('events').insert(form);setForm({title:'',event_date:'',location:'',description:'',booking_link:''});setSaving(false);load()}
  const del=async id=>{if(!confirm('Delete?'))return;await supabase.from('events').delete().eq('id',id);load()}
  return(
    <div>
      <div className="admin-form-card">
        <h3>Add Event</h3>
        <form onSubmit={save}>
          <div className="admin-form-row" style={{marginBottom:'1rem'}}>
            <div className="form-group"><label>Title *</label><input required value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Bristol Tattoo Convention"/></div>
            <div className="form-group"><label>Date *</label><input type="date" required value={form.event_date} onChange={e=>setForm(f=>({...f,event_date:e.target.value}))}/></div>
            <div className="form-group"><label>Location</label><input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} placeholder="Venue, City"/></div>
          </div>
          <div className="form-group" style={{marginBottom:'1rem'}}><label>Description</label><textarea rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Details..."/></div>
          <div className="form-group" style={{marginBottom:'1rem'}}><label>Booking Link (optional)</label><input type="url" value={form.booking_link} onChange={e=>setForm(f=>({...f,booking_link:e.target.value}))} placeholder="https://..."/></div>
          <button type="submit" className="btn btn-gold" disabled={saving}><Plus size={14} style={{marginRight:'.5rem'}}/>{saving?'Saving...':'Add Event'}</button>
        </form>
      </div>
      {loading?<p style={{color:'var(--muted)'}}>Loading...</p>:events.length===0?<div className="admin-empty"><p>No events yet.</p></div>:(
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Date</th><th>Event</th><th>Location</th><th>Link</th><th></th></tr></thead>
            <tbody>{events.map(ev=>(
              <tr key={ev.id}>
                <td style={{color:'var(--gold)',whiteSpace:'nowrap'}}>{new Date(ev.event_date+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</td>
                <td><strong>{ev.title}</strong>{ev.description&&<p style={{fontSize:'.8rem',color:'var(--muted)',marginTop:'.2rem'}}>{ev.description.slice(0,80)}...</p>}</td>
                <td style={{color:'var(--muted)',fontSize:'.85rem'}}>{ev.location||'\u2014'}</td>
                <td>{ev.booking_link?<a href={ev.booking_link} target="_blank" rel="noreferrer" style={{color:'var(--gold)',fontSize:'.8rem'}}>Link \u2197</a>:'\u2014'}</td>
                <td><button className="admin-action-btn danger" onClick={()=>del(ev.id)}><Trash2 size={13}/></button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}
