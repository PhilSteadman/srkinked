import React,{useState,useEffect} from 'react'
import {ChevronLeft,ChevronRight,Clock,Check} from 'lucide-react'
import {supabase} from '../lib/supabase'
import './Booking.css'
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
export default function Booking(){
  const today=new Date()
  const [year,setYear]=useState(today.getFullYear())
  const [month,setMonth]=useState(today.getMonth())
  const [selDate,setSelDate]=useState(null)
  const [slots,setSlots]=useState({})
  const [selSlot,setSelSlot]=useState(null)
  const [step,setStep]=useState(1)
  const [form,setForm]=useState({name:'',email:'',phone:'',style:'',description:'',reference:''})
  const [loading,setLoading]=useState(false)
  const [done,setDone]=useState(false)
  const dim=new Date(year,month+1,0).getDate()
  const fd=new Date(year,month,1).getDay()
  const ds=d=>`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
  useEffect(()=>{
    const from=`${year}-${String(month+1).padStart(2,'0')}-01`,to=`${year}-${String(month+1).padStart(2,'0')}-${dim}`
    supabase.from('booking_slots').select('*').gte('slot_date',from).lte('slot_date',to).eq('is_available',true)
      .then(({data})=>{if(data){const m={};data.forEach(s=>{if(!m[s.slot_date])m[s.slot_date]=[];m[s.slot_date].push(s)});setSlots(m)}})
  },[year,month])
  const prev=()=>{if(month===0){setMonth(11);setYear(y=>y-1)}else setMonth(m=>m-1);setSelDate(null);setSelSlot(null)}
  const next=()=>{if(month===11){setMonth(0);setYear(y=>y+1)}else setMonth(m=>m+1);setSelDate(null);setSelSlot(null)}
  const submit=async e=>{
    e.preventDefault();setLoading(true)
    const {error}=await supabase.from('bookings').insert({slot_id:selSlot.id,customer_name:form.name,customer_email:form.email,customer_phone:form.phone,tattoo_style:form.style,description:form.description,reference_info:form.reference,status:'pending'})
    if(!error){await supabase.from('booking_slots').update({is_available:false}).eq('id',selSlot.id);setDone(true);setStep(4)}
    setLoading(false)
  }
  if(done) return(
    <div className="booking-page page-enter"><div className="booking-success">
      <div className="success-icon"><Check size={40}/></div>
      <h2>Booking Request Sent!</h2>
      <p>Thanks {form.name}! SRJ will be in touch to confirm your session.</p>
      <div className="success-details"><p><strong>Date:</strong> {selDate}</p><p><strong>Slot:</strong> {selSlot?.label}</p><p><strong>Style:</strong> {form.style||'Not specified'}</p></div>
      <button className="btn btn-gold" onClick={()=>{setStep(1);setDone(false);setSelDate(null);setSelSlot(null)}}>Book Another</button>
    </div></div>
  )
  return(
    <div className="booking-page page-enter">
      <div className="page-hero"><h1 className="section-title">Book Your <span>Session</span></h1><div className="gold-line" style={{margin:'1rem auto'}}/><p>Choose a date, pick a slot, fill in your details.</p></div>
      <div className="container booking-wrap">
        <div className="booking-steps">
          {['Choose Date','Choose Time','Your Details'].map((s,i)=>(
            <React.Fragment key={s}>
              <div className={`bstep${step>i?' done':''}${step===i+1?' active':''}`}><div className="bstep-num">{step>i+1?<Check size={14}/>:i+1}</div><span>{s}</span></div>
              {i<2&&<div className={`bstep-line${step>i+1?' done':''}`}/>}
            </React.Fragment>
          ))}
        </div>
        <div className="booking-body">
          <div className="booking-calendar">
            <div className="cal-header"><button onClick={prev}><ChevronLeft size={20}/></button><h3>{MONTHS[month]} {year}</h3><button onClick={next}><ChevronRight size={20}/></button></div>
            <div className="cal-days-header">{DAYS.map(d=><span key={d}>{d}</span>)}</div>
            <div className="cal-grid">
              {Array.from({length:fd}).map((_,i)=><div key={`e${i}`} className="cal-empty"/>)}
              {Array.from({length:dim},(_,i)=>i+1).map(d=>{
                const s=ds(d),has=!!slots[s],past=new Date(s)<new Date(today.toDateString()),sel=selDate===s
                return(<button key={d} className={`cal-day${has&&!past?' available':''}${past?' past':''}${sel?' selected':''}`} onClick={()=>{if(!past&&has){setSelDate(s);setSelSlot(null);setStep(2)}}} disabled={!has||past}>{d}{has&&!past&&<span className="cal-dot"/>}</button>)
              })}
            </div>
            <div className="cal-legend"><span><span className="leg-dot available"/>Available</span><span><span className="leg-dot selected"/>Selected</span></div>
            <div className="cal-note"><p>No slots? Contact SRJ via social media to request a date.</p></div>
          </div>
          <div className="booking-right">
            {step===1&&<div className="booking-prompt"><Clock size={40} strokeWidth={1} color="var(--gold)"/><h3>Select a Date</h3><p>Choose a highlighted date to see available time slots.</p></div>}
            {step>=2&&selDate&&(
              <div className="slot-panel">
                <h3>Available on {new Date(selDate+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}</h3>
                <div className="slots-list">
                  {slots[selDate]?.map(slot=>(
                    <button key={slot.id} className={`slot-btn${selSlot?.id===slot.id?' selected':''}`} onClick={()=>{setSelSlot(slot);setStep(3)}}>
                      <Clock size={14}/><span>{slot.label}</span>
                      <span className="slot-type">{slot.session_type}</span>
                      {slot.price_hint&&<span style={{fontSize:'.8rem',color:'var(--gold)'}}>{slot.price_hint}</span>}
                      {selSlot?.id===slot.id&&<Check size={14}/>}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {step>=3&&selSlot&&(
              <form onSubmit={submit} className="booking-form">
                <h3>Your Details</h3>
                <div className="booking-selection-summary">
                  <p>{new Date(selDate+'T12:00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'long',year:'numeric'})}</p>
                  <p>{selSlot.label}{selSlot.price_hint&&` \u00b7 ${selSlot.price_hint}`}</p>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Full Name *</label><input required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Your name"/></div>
                  <div className="form-group"><label>Phone *</label><input required value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="07xxx..."/></div>
                </div>
                <div className="form-group"><label>Email *</label><input type="email" required value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="you@email.com"/></div>
                <div className="form-group"><label>Style</label><select value={form.style} onChange={e=>setForm(f=>({...f,style:e.target.value}))}><option value="">Select...</option>{['Black & Grey','Realism','Traditional','Neo-Traditional','Fine Line','Geometric','Japanese','Watercolour','Lettering','Other'].map(s=><option key={s}>{s}</option>)}</select></div>
                <div className="form-group"><label>Describe Your Tattoo *</label><textarea required rows={4} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Idea, placement, size, meaning..."/></div>
                <div className="form-group"><label>Reference / Inspiration</label><input value={form.reference} onChange={e=>setForm(f=>({...f,reference:e.target.value}))} placeholder="Instagram link, Pinterest board..."/></div>
                <div className="form-note"><p>This is a booking <em>request</em>. SRJ will confirm and arrange a deposit.</p></div>
                <button type="submit" className="btn btn-gold" disabled={loading} style={{width:'100%'}}>{loading?'Sending...':'Request Booking'}</button>
                <button type="button" className="btn btn-outline" style={{width:'100%',marginTop:'.5rem'}} onClick={()=>setStep(2)}>\u2190 Back to Slots</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
