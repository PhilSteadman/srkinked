import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import Booking from './pages/Booking'
import Events from './pages/Events'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Videos from './pages/Videos'
import Pricing from './pages/Pricing'
import Contact from './pages/Contact'
import Admin from './pages/Admin'

function Layout({ children }) {
  return <><Navbar/><main>{children}</main><Footer/></>
}
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<Admin/>}/>
        <Route path="/" element={<Layout><Home/></Layout>}/>
        <Route path="/gallery" element={<Layout><Gallery/></Layout>}/>
        <Route path="/booking" element={<Layout><Booking/></Layout>}/>
        <Route path="/events" element={<Layout><Events/></Layout>}/>
        <Route path="/blog" element={<Layout><Blog/></Layout>}/>
        <Route path="/blog/:slug" element={<Layout><BlogPost/></Layout>}/>
        <Route path="/videos" element={<Layout><Videos/></Layout>}/>
        <Route path="/pricing" element={<Layout><Pricing/></Layout>}/>
        <Route path="/contact" element={<Layout><Contact/></Layout>}/>
        <Route path="*" element={<Layout><div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'1rem',paddingTop:'100px'}}><h1 style={{fontFamily:'var(--font-hero)',fontSize:'8rem',color:'var(--gold)',lineHeight:1}}>404</h1><p style={{color:'var(--muted)'}}>Page not found.</p><a href="/" className="btn btn-outline">Go Home</a></div></Layout>}/>
      </Routes>
    </BrowserRouter>
  )
}
