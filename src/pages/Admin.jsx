import React,{useState,useEffect} from 'react'
import {supabase} from '../lib/supabase'
import AdminLogin from './AdminLogin'
import AdminBookings from './AdminBookings'
import AdminSlots from './AdminSlots'
import AdminGallery from './AdminGallery'
import AdminEvents from './AdminEvents'
import AdminPosts from './AdminPosts'
import AdminSettings from './AdminSettings'
import AdminShop from './AdminShop'
import {LayoutDashboard,Calendar,Clock,Image,CalendarDays,BookOpen,Settings,ShoppingBag,LogOut,Menu,X,Check,Ban} from 'lucide-react'
import './Admin.css'

const TABS=[
  {id:'dashboard',label:'Dashboard',icon:<LayoutDashboard size={16}/>},
  {id:'bookings',label:'Bookings',icon:<Calendar size={16}/>},
  {id:'slots',label:'Availability',icon:<Clock size={16}/>},
  {id:'gallery',label:'Gallery',icon:<Image size={16}/>},
  {id:'events',label:'Events',icon:<CalendarDays size={16}/>},
  {id:'posts',label:'Journal',icon:<BookOpen size={16}/>},
  {id:'shop',label:'Shop',icon:<ShoppingBag size={16}/>},
  {id:'settings',label:'Site Settings',icon:<Settings size={16}/>},
]

function Dashboard({stats, pendingBookings, onNavigate, onQuickAction}){
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

      {pendingBookings.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <p className="admin-section-title" style={{ marginBottom: 0 }}>
              Needs Your Attention
            </p>
            <button className="admin-action-btn" onClick={() => onNavigate('bookings')}>View All Bookings</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)' }}>
            {pendingBookings.slice(0, 5).map(b => (
              <div key={b.id} style={{ background: 'var(--dark)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '3px solid var(--gold)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '.2rem' }}>{b.customer_name}</p>
                  <p style={{ fontSize: '.8rem', color: 'var(--gold)' }}>
                    {b.booking_slots?.slot_date} · {b.booking_slots?.label}
                  </p>
                  <p style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: '.15rem' }}>
                    {b.tattoo_style || 'Style not specified'}
                  </p>
                </div>
                <button className="admin-action-btn" onClick={() => onQuickAction(b.id, 'confirmed')} style={{ color: '#2ecc71', borderColor: '#2ecc71', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                  <Check size={13} /> Confirm
                </button>
                <button className="admin-action-btn" onClick={() => onQuickAction(b.id, 'cancelled')} style={{ color: 'var(--red-bright)', borderColor: 'var(--red-bright)', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                  <Ban size={13} /> Decline
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dash-hint">
        <p>Use the sidebar to manage bookings, add available slots, upload gallery images, create events, write journal posts, manage the shop, and update site settings.</p>
      </div>
    </div>
  )
}

export default function Admin(){
  const [session,setSession]=useState(null)
  const [tab,setTab]=useState('dashboard')
  const [stats,setStats]=useState({})
  const [pendingBookings, setPendingBookings] = useState([])
  const [open,setOpen]=useState(false)
  const [checking,setChecking]=useState(true)

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{setSession(session);setChecking(false)})
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,s)=>setSession(s))
    return()=>subscription.unsubscribe()
  },[])

  const loadDashboardData = () => {
    if(!session)return
    Promise.all([
      supabase.from('bookings').select('id',{count:'exact',head:true}).eq('status','pending'),
      supabase.from('bookings').select('id',{count:'exact',head:true}).eq('status','confirmed'),
      supabase.from('gallery').select('id',{count:'exact',head:true}),
      supabase.from('booking_slots').select('id',{count:'exact',head:true}).eq('is_available',true),
      supabase.from('bookings').select('*,booking_slots(slot_date,label)').eq('status','pending').order('created_at',{ascending:false}),
    ]).then(([p,c,g,s,pending])=>{
      setStats({pending:p.count,confirmed:c.count,gallery:g.count,slots:s.count})
      setPendingBookings(pending.data || [])
    })
  }

  useEffect(loadDashboardData,[session,tab])

  const quickAction = async (id, status) => {
    await supabase.from('bookings').update({ status }).eq('id', id)
    loadDashboardData()
  }

  if(checking)return<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--black)'}}><p style={{color:'var(--muted)'}}>Loading...</p></div>
  if(!session)return<AdminLogin/>

  const panels={
    dashboard:<Dashboard stats={stats} pendingBookings={pendingBookings} onNavigate={setTab} onQuickAction={quickAction}/>,
    bookings:<AdminBookings/>,
    slots:<AdminSlots/>,
    gallery:<AdminGallery/>,
    events:<AdminEvents/>,
    posts:<AdminPosts/>,
    shop:<AdminShop/>,
    settings:<AdminSettings/>,
  }

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
