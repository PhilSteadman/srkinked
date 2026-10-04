import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { fmtShort, todayISO } from '../lib/dates'
import AdminLogin from './AdminLogin'
import AdminBookings, { setBookingStatus } from './AdminBookings'
import AdminSlots from './AdminSlots'
import AdminCustomers from './AdminCustomers'
import AdminInbox from './AdminInbox'
import AdminGallery from './AdminGallery'
import AdminFlash from './AdminFlash'
import AdminReviews from './AdminReviews'
import AdminFaqs from './AdminFaqs'
import AdminSocial from './AdminSocial'
import AdminEvents from './AdminEvents'
import AdminPosts from './AdminPosts'
import AdminShop from './AdminShop'
import AdminSettings from './AdminSettings'
import {
  LayoutDashboard, Calendar, Clock, Users, Inbox, Image, Sparkles, Star, HelpCircle,
  Instagram, CalendarDays, BookOpen, ShoppingBag, Settings, LogOut, Menu, X, Check, Ban, ExternalLink,
} from 'lucide-react'
import './Admin.css'

const GROUPS = [
  { label: null, tabs: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  { label: 'Bookings', tabs: [
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'slots', label: 'Availability', icon: Clock },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'inbox', label: 'Messages', icon: Inbox },
  ] },
  { label: 'Your work', tabs: [
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'flash', label: 'Flash', icon: Sparkles },
    { id: 'social', label: 'Social strip', icon: Instagram },
  ] },
  { label: 'Content', tabs: [
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    { id: 'posts', label: 'Journal', icon: BookOpen },
    { id: 'events', label: 'Events', icon: CalendarDays },
    { id: 'shop', label: 'Shop', icon: ShoppingBag },
  ] },
  { label: 'Site', tabs: [{ id: 'settings', label: 'Site settings', icon: Settings }] },
]
const ALL_TABS = GROUPS.flatMap(g => g.tabs)

function Dashboard({ data, go, reload }) {
  const { pending = [], unpaid = [], unread = 0, upcoming = [], openSlots = 0 } = data
  const act = async (b, status) => { await setBookingStatus(b, status); reload() }

  return (
    <div>
      <div className="dash-stats">
        <button className="dash-stat accent" onClick={() => go('bookings')} style={{ textAlign: 'left', border: 'none', cursor: 'pointer', color: 'inherit' }}>
          <p className="ds-value">{pending.length}</p><p className="ds-label">Waiting for you</p>
        </button>
        <button className="dash-stat" onClick={() => go('bookings')} style={{ textAlign: 'left', border: 'none', cursor: 'pointer', color: 'inherit' }}>
          <p className="ds-value">{unpaid.length}</p><p className="ds-label">Deposits not paid</p>
        </button>
        <button className="dash-stat" onClick={() => go('inbox')} style={{ textAlign: 'left', border: 'none', cursor: 'pointer', color: 'inherit' }}>
          <p className="ds-value">{unread}</p><p className="ds-label">Unread messages</p>
        </button>
        <button className="dash-stat" onClick={() => go('slots')} style={{ textAlign: 'left', border: 'none', cursor: 'pointer', color: 'inherit' }}>
          <p className="ds-value">{openSlots}</p><p className="ds-label">Open slots ahead</p>
        </button>
      </div>

      <p className="admin-section-title">New booking requests</p>
      {pending.length === 0 ? (
        <div className="admin-empty" style={{ marginBottom: '2rem' }}><p>Nothing waiting. New requests show up here.</p></div>
      ) : (
        <div className="adm-list" style={{ marginBottom: '2rem' }}>
          {pending.slice(0, 6).map(b => (
            <div key={b.id} className="adm-row is-unread">
              <div className="adm-row-top">
                <div>
                  <p className="adm-name">{b.customer_name}</p>
                  <p className="adm-meta"><span className="adm-gold">{b.booking_slots ? `${fmtShort(b.booking_slots.slot_date)}, ${b.booking_slots.label}` : 'Slot removed'}</span> · {b.tattoo_style || 'Style not given'}</p>
                </div>
                <div className="adm-actions" style={{ marginTop: 0 }}>
                  <button className="admin-action-btn ok" onClick={() => act(b, 'confirmed')}><Check size={14} /> Confirm</button>
                  <button className="admin-action-btn danger" onClick={() => act(b, 'cancelled')}><Ban size={14} /> Decline</button>
                </div>
              </div>
              {b.description && <p className="adm-body" style={{ color: 'var(--ash)' }}>{b.description.slice(0, 220)}{b.description.length > 220 ? '…' : ''}</p>}
            </div>
          ))}
        </div>
      )}

      <p className="admin-section-title">Coming up</p>
      {upcoming.length === 0 ? (
        <div className="admin-empty"><p>No confirmed appointments yet.</p></div>
      ) : (
        <div className="adm-list">
          {upcoming.map(b => (
            <div key={b.id} className="adm-row">
              <div className="adm-row-top">
                <div>
                  <p className="adm-name">{b.customer_name}</p>
                  <p className="adm-meta"><span className="adm-gold">{fmtShort(b.booking_slots.slot_date)}, {b.booking_slots.label}</span> · {b.customer_phone}</p>
                </div>
                <span className={`status-badge status-${b.deposit_status || 'unpaid'}`}>Deposit {b.deposit_status === 'paid' ? 'paid' : b.deposit_status === 'waived' ? 'waived' : 'unpaid'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Admin() {
  const [session, setSession] = useState(null)
  const [checking, setChecking] = useState(true)
  const [tab, setTab] = useState('dashboard')
  const [open, setOpen] = useState(false)
  const [dash, setDash] = useState({})

  useEffect(() => {
    document.title = 'Admin — SRJ Inked'
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setChecking(false) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const loadDash = useCallback(() => {
    if (!session) return
    const today = todayISO()
    Promise.all([
      supabase.from('bookings').select('*,booking_slots(slot_date,label)').eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('bookings').select('*,booking_slots!inner(slot_date,label)').eq('status', 'confirmed').gte('booking_slots.slot_date', today),
      supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
      supabase.from('booking_slots').select('id', { count: 'exact', head: true }).eq('is_available', true).gte('slot_date', today),
    ]).then(([pending, confirmed, unread, slots]) => {
      const upcoming = (confirmed.data || []).sort((a, b) => a.booking_slots.slot_date.localeCompare(b.booking_slots.slot_date))
      const unpaid = [...(pending.data || []), ...upcoming].filter(b => (b.deposit_status || 'unpaid') === 'unpaid')
      setDash({ pending: pending.data || [], upcoming: upcoming.slice(0, 8), unpaid, unread: unread.count || 0, openSlots: slots.count || 0 })
    })
  }, [session])

  useEffect(() => { loadDash() }, [loadDash, tab])

  if (checking) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}><p style={{ color: 'var(--ash)' }}>Loading…</p></div>
  if (!session) return <AdminLogin />

  const go = id => { setTab(id); setOpen(false); window.scrollTo(0, 0) }
  const badge = id => id === 'bookings' ? dash.pending?.length : id === 'inbox' ? dash.unread : 0

  const panels = {
    dashboard: <Dashboard data={dash} go={go} reload={loadDash} />,
    bookings: <AdminBookings onChange={loadDash} />,
    slots: <AdminSlots />,
    customers: <AdminCustomers />,
    inbox: <AdminInbox onChange={loadDash} />,
    gallery: <AdminGallery />,
    flash: <AdminFlash />,
    social: <AdminSocial />,
    reviews: <AdminReviews />,
    faqs: <AdminFaqs />,
    posts: <AdminPosts />,
    events: <AdminEvents />,
    shop: <AdminShop />,
    settings: <AdminSettings />,
  }

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar${open ? ' open' : ''}`}>
        <div className="admin-logo">
          <img src="/logo-gold.png" alt="SRJ Inked" style={{ height: '44px', width: 'auto' }} />
        </div>
        <nav className="admin-nav">
          {GROUPS.map((g, i) => (
            <React.Fragment key={i}>
              {g.label && <p className="admin-nav-group">{g.label}</p>}
              {g.tabs.map(t => {
                const Icon = t.icon
                const n = badge(t.id)
                return (
                  <button key={t.id} className={`admin-nav-btn${tab === t.id ? ' active' : ''}`} onClick={() => go(t.id)}>
                    <Icon size={16} /><span>{t.label}</span>{n > 0 && <span className="nav-badge">{n}</span>}
                  </button>
                )
              })}
            </React.Fragment>
          ))}
        </nav>
        <a className="admin-signout" href="/" target="_blank" rel="noreferrer" style={{ borderTop: '1px solid var(--line)' }}><ExternalLink size={16} /><span>View site</span></a>
        <button className="admin-signout" onClick={() => supabase.auth.signOut()}><LogOut size={16} /><span>Sign out</span></button>
      </aside>
      <div className="admin-main">
        <div className="admin-topbar">
          <button className="admin-hamburger" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X size={20} /> : <Menu size={20} />}</button>
          <h1 className="admin-page-title">{ALL_TABS.find(t => t.id === tab)?.label}</h1>
          <p className="admin-user">{session.user.email}</p>
        </div>
        <div className="admin-content">{panels[tab]}</div>
      </div>
    </div>
  )
}
