import React,{useState,useEffect} from 'react'
import {supabase} from '../lib/supabase'
import {Plus,Trash2} from 'lucide-react'
const TYPES=['Hourly','Half Day (4hrs)','Full Day (8hrs)','Consultation','Touch-Up']
const QUICK=[
  {label:'Morning \u2013 10am to 2pm',session_type:'Half Day (4hrs)',price_hint:'\u00a3150'},
  {label:'Afternoon \u2013 2pm to 6pm',session_type:'Half Day (4hrs)',price_hint:'\u00a3150'},
  {label:'Full Day \u2013 10am to 6pm',session_type:'Full Day (8hrs)',price_hint:'\u00a3300'},
  {label:'Evening \u2013 6pm to 8pm',session_type:'Hourly',price_hint:'\u00a340/hr'},
  {label:'Walk-In Available',session_type:'Hourly',price_hint:'\u00a340/hr'},
  {label:'Consultation Slot',session_type:'Consultation',price_hint:'Free'},
]
export default function AdminSlots(){
  const [slots,setSlots]=useState([])
  const [form,setForm]=useState({slot_date:'',label:'',session_type:'Hourly',price_hint:''})
  const [viewDate,setViewDate]=useState(()=>new Date().toISOString().slice(0,7))
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const load=()=>{
    setLoading(true)
    const [y,m]=viewDate.split('-')
    supabase.from('booking_slots').select('*,bookings(id,status)').gte('slot_date',`${y}-${m}-01`).lte('slot_date',`${y}-${m}-31`).order('slot_date').order('label')
      .then(({data})=>{setSlots(data||[]);setLoading(false)})
  }
  useEffect(load,[viewDate])
  const add=async e=>{e?.preventDefault();if(!form.slot_date||!form.label)return alert('Date and label required');setSaving(true);await supabase.from('booking_slots').insert({...form,is_available:true});setForm(f=>({...f,label:'',price_hint:''}));setSaving(false);load()}
  const addQuick=async q=>{if(!form.slot_date)return alert('Select a date first');setSaving(true);await supabase.from('booking_slots').insert({slot_date:form.slot_date,...q,is_available:true});setSaving(false);load()}
  const toggle=async(id,cur)=>{await supabase.from('booking_slots').update({is_available:!cur}).eq('id',id);load()}
  const del=async id=>{if(!confirm('Delete slot?'))return;await supabase.from('booking_slots').delete().eq('id',id);load()}
  const grouped=slots.reduce((a,s)=>{if(!a[s.slot_date])a[s.slot_date]=[];a[s.slot_date].push(s);return a},{})
  return(
    <div>
      <div className="admin-form-card">
        <h3>Add Availability</h3>
        <form onSubmit={add}>
          <div className="admin-form-row" style={{marginBottom:'1rem'}}>
            <div className="form-group"><label>Date *</label><input type="date" value={form.slot_date} onChange={e=>setForm(f=>({...f,slot_date:e.target.value}))} min={new Date().toISOString().split('T')[0]} required/></div>
            <div className="form-group"><label>Slot Label *</label><input value={form.label} onChange={e=>setForm(f=>({...f,label:e.target.value}))} placeholder="e.g. Morning 10am\u20132pm"/></div>
            <div className="form-group"><label>Type</label><select value={form.session_type} onChange={e=>setForm(f=>({...f,session_type:e.target.value}))}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
            <div className="form-group"><label>Price Hint</label><input value={form.price_hint} onChange={e=>setForm(f=>({...f,price_hint:e.target.value}))} placeholder="\u00a340/hr"/></div>
          </div>
          <button type="submit" className="btn btn-gold" disabled={saving}><Plus size={14} style={{marginRight:'.5rem'}}/>{saving?'Adding...':'Add Slot'}</button>
        </form>
        {form.slot_date&&<div style={{marginTop:'1.25rem',paddingTop:'1.25rem',borderTop:'1px solid var(--border)'}}>
          <p style={{fontSize:'.7rem',letterSpacing:'.15em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'.75rem',fontWeight:600}}>Quick Add for {form.slot_date}</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:'.5rem'}}>{QUICK.map(q=><button key={q.label} className="admin-action-btn" onClick={()=>addQuick(q)} disabled={saving}>{q.label}</button>)}</div>
        </div>}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'1.5rem'}}>
        <label style={{fontSize:'.7rem',letterSpacing:'.15em',textTransform:'uppercase',color:'var(--muted)',fontWeight:600}}>Viewing:</label>
        <input type="month" value={viewDate} onChange={e=>setViewDate(e.target.value)} style={{width:'auto'}}/>
      </div>
      {loading?<p style={{color:'var(--muted)'}}>Loading...</p>:Object.keys(grouped).length===0?<div className="admin-empty"><p>No slots this month.</p></div>:(
        <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
          {Object.entries(grouped).sort().map(([date,ds])=>(
            <div key={date}>
              <p style={{fontFamily:'var(--font-display)',fontSize:'.75rem',letterSpacing:'.2em',textTransform:'uppercase',color:'var(--gold)',marginBottom:'.5rem',fontWeight:600}}>{new Date(date+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}</p>
              <div style={{display:'flex',flexDirection:'column',gap:'1px',background:'var(--border)'}}>
                {ds.map(s=>{
                  const booked=s.bookings?.some(b=>b.status!=='cancelled')
                  return(<div key={s.id} style={{background:'var(--dark)',padding:'.85rem 1rem',display:'flex',alignItems:'center',gap:'1rem'}}>
                    <div style={{flex:1}}><span style={{fontWeight:600,marginRight:'1rem'}}>{s.label}</span><span style={{fontSize:'.75rem',color:'var(--muted)',marginRight:'.5rem'}}>{s.session_type}</span>{s.price_hint&&<span style={{fontSize:'.75rem',color:'var(--gold)'}}>{s.price_hint}</span>}{booked&&<span style={{marginLeft:'.75rem',fontSize:'.65rem',background:'rgba(39,174,96,.15)',color:'#2ecc71',padding:'.15rem .5rem',fontFamily:'var(--font-display)',letterSpacing:'.1em',fontWeight:600}}>BOOKED</span>}</div>
                    <button className="admin-action-btn" onClick={()=>toggle(s.id,s.is_available)} style={{color:s.is_available?'#2ecc71':'var(--muted)',borderColor:s.is_available?'#2ecc71':'var(--border)'}}>{s.is_available?'Available':'Hidden'}</button>
                    {!booked&&<button className="admin-action-btn danger" onClick={()=>del(s.id)}><Trash2 size={13}/></button>}
                  </div>)
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
