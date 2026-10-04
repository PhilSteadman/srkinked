import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import Flash from './pages/Flash'
import Booking from './pages/Booking'
import ManageBooking from './pages/ManageBooking'
import Events from './pages/Events'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Videos from './pages/Videos'
import Pricing from './pages/Pricing'
import Contact from './pages/Contact'
import Aftercare from './pages/Aftercare'
import Shop from './pages/Shop'
// Admin is only downloaded when someone visits /admin
const Admin = lazy(() => import('./pages/Admin'))

function Layout({ children }) {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
    </>
  )
}

function NotFound() {
  return (
    <header className="page-hero" style={{ minHeight: '70vh' }}>
      <h1 className="section-title">Page not found</h1>
      <div className="gold-line" />
      <p>That page has moved or never existed.</p>
      <p style={{ marginTop: '1.5rem' }}><Link to="/" className="btn btn-gold">Go to the homepage</Link></p>
    </header>
  )
}

const page = el => <Layout>{el}</Layout>

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<Suspense fallback={<p style={{ padding: '2rem', color: 'var(--ash)' }}>Loading admin…</p>}><Admin /></Suspense>} />
        <Route path="/" element={page(<Home />)} />
        <Route path="/gallery" element={page(<Gallery />)} />
        <Route path="/flash" element={page(<Flash />)} />
        <Route path="/booking" element={page(<Booking />)} />
        <Route path="/booking/manage/:token" element={page(<ManageBooking />)} />
        <Route path="/pricing" element={page(<Pricing />)} />
        <Route path="/events" element={page(<Events />)} />
        <Route path="/blog" element={page(<Blog />)} />
        <Route path="/blog/:slug" element={page(<BlogPost />)} />
        <Route path="/videos" element={page(<Videos />)} />
        <Route path="/aftercare" element={page(<Aftercare />)} />
        <Route path="/shop" element={page(<Shop />)} />
        <Route path="/contact" element={page(<Contact />)} />
        <Route path="*" element={page(<NotFound />)} />
      </Routes>
    </BrowserRouter>
  )
}
