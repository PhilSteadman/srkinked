import React,{useState,useEffect} from 'react'
import {MapPin,Calendar,ExternalLink} from 'lucide-react'
import {supabase} from '../lib/supabase'
import './Events.css'
const DEMO=[
  {id:1,title:'Bristol Tattoo Convention',event_date:'2025-03-15',location:'Ashton Gate, Bristol',description:'SRJ Inked exhibiting all weekend. Walk-in slots available \u2014 come get tattooed live at the show!',booking_link:null},
  {id:2,title:'Guest Spot \u2013 Leeds',event_date:'2025-04-05',location:'Inkwell Studio, Leeds',description:'A weekend guest spot in Leeds. Limited appointments \u2014 message to book.',booking_link:null},
]
function EventCard({event,isPast}){
  const d=new Date(event.event_date+'T12:00:00')
  return(
    <div className={`efc${isPast?' past':''}`}>
      <div className="efc-date"><span className="efc-day">{d.getDate()}</span><span className="efc-month">{d.toLocaleString('en-GB',{month:'short'})}</span><span className="efc-year">{d.getFullYear()}</span></div>
      <div className="efc-body"><h3>{event.title}</h3><p className="efc-loc"><MapPin size={13}/>{event.location}</p><p className="efc-desc">{event.description}</p></div>
      <div className="efc-actions">
        {event.booking_link&&!isPast?<a href={event.booking_link} target="_blank" rel="noreferrer" className="btn btn-gold">Book Spot <ExternalLink size={13}/></a>:<span className={`status-badge ${isPast?'status-pending':'status-confirmed'}`}>{isPast?'Past Event':'Free Entry'}</span>}
      </div>
    </div>
  )
}
export default function Events(){
  const [upcoming,setUpcoming]=useState([])
  const [past,setPast]=useState([])
  useEffect(()=>{
    supabase.from('events').select('*').order('event_date').then(({data})=>{
      const src=data?.length?data:DEMO
      const now=new Date().toISOString().split('T')[0]
      setUpcoming(src.filter(e=>e.event_date>=now))
      setPast(src.filter(e=>e.event_date<now).reverse())
    })
  },[])
  return(
    <div className="events-page page-enter">
      <div className="page-hero"><p className="section-eyebrow">What's On</p><h1 className="section-title">Events & <span>Pop-Ups</span></h1><div className="gold-line" style={{margin:'1rem auto'}}/><p>Conventions, guest spots, and pop-up sessions.</p></div>
      <div className="container" style={{paddingTop:'3rem',paddingBottom:'4rem'}}>
        {upcoming.length>0?(<><p className="events-label">Upcoming</p><div className="events-full-list">{upcoming.map(e=><EventCard key={e.id} event={e}/>)}</div></>):(
          <div className="events-empty"><Calendar size={48} strokeWidth={1} color="var(--gold)"/><h3>No upcoming events right now</h3><p>Follow <strong>@srjinked</strong> on Instagram and Facebook for announcements.</p></div>
        )}
        {past.length>0&&<div style={{marginTop:'4rem'}}><p className="events-label" style={{color:'var(--muted)'}}>Past Events</p><div className="events-full-list">{past.map(e=><EventCard key={e.id} event={e} isPast/>)}</div></div>}
      </div>
    </div>
  )
}
