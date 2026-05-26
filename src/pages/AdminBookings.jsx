import React,{useState,useEffect} from 'react'
import {supabase} from '../lib/supabase'
const FILTERS=['pending','confirmed','cancelled','all']
export default function AdminBookings(){
  const [bookings,setBookings]=useState([])
  const [filter,setFilter]=useState('pending')
  const [loading,setLoading]=useState(true)
  const [notes,setNotes]=useState({})
  const load=()=>{
    setLoading(true)
    let q=supabase.from('bookings').select('*,booking_slots(slot_date,label,session_type)').order('created_at',{ascending:false})
    if(filter!=='all')q=q.eq('status',filter)
    q.then(({data})=>{setBookings(data||[]);setLoading(false)})
  }
  useEffect(load,[filter])
  const update=async(id,status)=>{await supabase.from('bookings').update({status}).eq('id',id);load()}
  const saveNote=async id=>{await supabase.from('bookings').update({notes:notes[id]}).eq('id',id);alert('Notes saved')}
  const del=async id=>{if(!confirm('Delete?'))return;await supabase.from('bookings').delete().eq('id',id);load()}
  return(
    <div>
      <div style={{display:'flex',gap:'.5rem',marginBottom:'1.5rem',flexWrap:'wrap'}}>
        {FILTERS.map(f=><button key={f} onClick={()=>setFilter(f)} style={{background:filter===f?'var(--gold)':'none',border:'1px solid var(--border)',color:filter===f?'var(--black)':'var(--muted)',fontFamily:'var(--font-display)',fontSize:'.7rem',letterSpacing:'.15em',textTransform:'uppercase',padding:'.4rem 1rem',cursor:'pointer',fontWeight:600}}>{f}</button>)}
      </div>
      {loading?<p style={{color:'var(--muted)'}}>Loading...</p>:bookings.length===0?<div className="admin-empty"><p>No {filter} bookings.</p></div>:(
        <div style={{display:'flex',flexDirection:'column',gap:'1px',background:'var(--border)'}}>
          {bookings.map(b=>(
            <div key={b.id} style={{background:'var(--dark)',padding:'1.5rem'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:'1.5rem',alignItems:'start'}}>
                <div>
                  <p style={{fontFamily:'var(--font-display)',fontWeight:600,marginBottom:'.25rem'}}>{b.customer_name}</p>
                  <p style={{fontSize:'.82rem',color:'var(--muted)'}}>{b.customer_email}</p>
                  <p style={{fontSize:'.82rem',color:'var(--muted)'}}>{b.customer_phone}</p>
                </div>
                <div>
                  <p style={{fontSize:'.8rem',color:'var(--gold)',marginBottom:'.25rem'}}>{b.booking_slots?.slot_date} \u00b7 {b.booking_slots?.label}</p>
                  <p style={{fontSize:'.82rem',color:'var(--muted)'}}><strong style={{color:'var(--white)'}}>Style:</strong> {b.tattoo_style||'\u2014'}</p>
                  <p style={{fontSize:'.82rem',color:'var(--muted)',marginTop:'.25rem'}}>{b.description?.slice(0,100)}{b.description?.length>100?'...':''}</p>
                </div>
                <div>
                  <span style={{display:'inline-block',padding:'.2rem .65rem',fontSize:'.65rem',letterSpacing:'.1em',textTransform:'uppercase',fontWeight:600,fontFamily:'var(--font-display)',background:b.status==='confirmed'?'rgba(39,174,96,.15)':b.status==='cancelled'?'rgba(192,57,43,.15)':'rgba(201,168,76,.15)',color:b.status==='confirmed'?'#2ecc71':b.status==='cancelled'?'var(--red-bright)':'var(--gold)'}}>{b.status}</span>
                  <p style={{fontSize:'.75rem',color:'var(--muted)',marginTop:'.5rem'}}>{new Date(b.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</p>
                  <textarea placeholder="Admin notes..." rows={2} value={notes[b.id]??b.notes??''} onChange={e=>setNotes(n=>({...n,[b.id]:e.target.value}))} style={{marginTop:'.5rem',fontSize:'.8rem',resize:'vertical'}}/>
                  <button className="admin-action-btn" style={{marginTop:'.25rem',width:'100%'}} onClick={()=>saveNote(b.id)}>Save Notes</button>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'.4rem'}}>
                  {b.status!=='confirmed'&&<button className="admin-action-btn" onClick={()=>update(b.id,'confirmed')} style={{color:'#2ecc71',borderColor:'#2ecc71'}}>Confirm</button>}
                  {b.status!=='cancelled'&&<button className="admin-action-btn" onClick={()=>update(b.id,'cancelled')} style={{color:'var(--red-bright)',borderColor:'var(--red-bright)'}}>Cancel</button>}
                  <button className="admin-action-btn danger" onClick={()=>del(b.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
