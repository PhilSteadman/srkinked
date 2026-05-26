import React,{useState,useEffect} from 'react'
import {supabase} from '../lib/supabase'
import AdminLogin from './AdminLogin'
import AdminBookings from './AdminBookings'
import AdminSlots from './AdminSlots'
import AdminGallery from './AdminGallery'
import AdminEvents from './AdminEvents'
import AdminPosts from './AdminPosts'
import {LayoutDashboard,Calendar,Clock,Image,CalendarDays,BookOpen,LogOut,Menu,X} from 'lucide-react'
import './Admin.css'

const TABS=[
  {id:'dashboard',label:'Dashboard',icon:<LayoutDashboard size={16}/>},
  {id:'bookings',label:'Bookings',icon:<Calendar size={16}/>},
  {id:'slots',label:'Availability',icon:<Clock size={16}/>},
  {id:'gallery',label:'Gallery',icon:<Image size={16}/>},
  {id:'events',label:'Events',icon:<CalendarDays size={16}/>},
  {id:'posts',label:'Journal',icon:<BookOpen size={16}/>},
]

function Dashboard({stats}){
  return(
    <div>
      <p className="admin-section-title">Dashboard</p>
      <div className="dash-stats">
        {[{label:'Pending Bookings',value:stats.pending??'\u2014',accent:true},{label:'Confirmed This Month',value:stats.confirmed??'\u2014'},{label:'Gallery Images',value:stats.gallery??'\u2014'},{label:'Open Slots',value:stats.slots??'\u2014'}].map(s=>(
          <div key={s.label} className={`dash-stat${s.accent?' accent':''}`}>
            <p className="ds-value">{s.value}</p>
            <p className="ds-label">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="dash-hint"><p>Use the sidebar to manage bookings, add available slots, upload gallery images, create events, and write journal posts.</p></div>
    </div>
  )
}

export default function Admin(){
  const [session,setSession]=useState(null)
  const [tab,setTab]=useState('dashboard')
  const [stats,setStats]=useState({})
  const [open,setOpen]=useState(false)
  const [checking,setChecking]=useState(true)

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{setSession(session);setChecking(false)})
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,s)=>setSession(s))
    return()=>subscription.unsubscribe()
  },[])

  useEffect(()=>{
    if(!session)return
    Promise.all([
      supabase.from('bookings').select('id',{count:'exact',head:true}).eq('status','pending'),
      supabase.from('bookings').select('id',{count:'exact',head:true}).eq('status','confirmed'),
      supabase.from('gallery').select('id',{count:'exact',head:true}),
      supabase.from('booking_slots').select('id',{count:'exact',head:true}).eq('is_available',true),
    ]).then(([p,c,g,s])=>setStats({pending:p.count,confirmed:c.count,gallery:g.count,slots:s.count}))
  },[session,tab])

  if(checking)return<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--black)'}}><p style={{color:'var(--muted)'}}>Loading...</p></div>
  if(!session)return<AdminLogin/>

  const panels={dashboard:<Dashboard stats={stats}/>,bookings:<AdminBookings/>,slots:<AdminSlots/>,gallery:<AdminGallery/>,events:<AdminEvents/>,posts:<AdminPosts/>}

  return(
    <div className="admin-layout">
      <div className={`admin-sidebar${open?' open':''}`}>
        <div className="admin-logo">
          <img src="/logo-gold.png" alt="SRJ Inked" style={{height:'44px',width:'auto',marginBottom:'.25rem'}}/>
          <span style={{fontFamily:'var(--font-display)',fontSize:'.55rem',letterSpacing:'.4em',color:'var(--gold)',fontWeight:600}}>ADMIN PANEL</span>
        </div>
        <nav className="admin-nav">
          {TABS.map(t=>(
            <button key={t.id} className={`admin-nav-btn${tab===t.id?' active':''}`} onClick={()=>{setTab(t.id);setOpen(false)}}>
              {t.icon}<span>{t.label}</span>
              {t.id==='bookings'&&stats.pending>0&&<span className="nav-badge">{stats.pending}</span>}
            </button>
          ))}
        </nav>
        <button className="admin-signout" onClick={()=>supabase.auth.signOut()}><LogOut size={16}/><span>Sign Out</span></button>
      </div>
      <div className="admin-main">
        <div className="admin-topbar">
          <button className="admin-hamburger" onClick={()=>setOpen(!open)}>{open?<X size={20}/>:<Menu size={20}/>}</button>
          <h1 className="admin-page-title">{TABS.find(t=>t.id===tab)?.label}</h1>
          <p className="admin-user">{session.user.email}</p>
        </div>
        <div className="admin-content">{panels[tab]}</div>
      </div>
    </div>
  )
}
