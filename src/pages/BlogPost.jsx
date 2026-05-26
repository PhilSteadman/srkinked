import React,{useState,useEffect} from 'react'
import {Link,useParams} from 'react-router-dom'
import {ArrowLeft} from 'lucide-react'
import {supabase} from '../lib/supabase'
const DEMO={'black-grey-realism':{title:'Why Black & Grey Realism is Having a Moment',created_at:'2025-01-15',tags:['Style','Realism'],content:`Black and grey tattooing has been around for decades, but right now it's experiencing a genuine renaissance.\n\n## What Makes It Special\n\nUnlike colour work, black and grey relies entirely on the artist's ability to manipulate light, shadow, and negative space. There's nowhere to hide.\n\n## Why It Ages Better\n\nColour tattoos can fade and shift over time. Black and grey, done well with quality inks, retains its integrity for decades.\n\n## Is It Right for You?\n\nBlack and grey suits almost any subject: portraits, wildlife, sacred geometry, memorial pieces. If you want a large, meaningful piece built to last, it's worth serious consideration.`},'aftercare-guide':{title:'Aftercare: The Most Important Part of Getting a Tattoo',created_at:'2025-01-08',tags:['Guide','Aftercare'],content:`You've just sat through hours in the chair. Now what?\n\n## The First 24 Hours\n\nLeave the wrap on for 2\u20134 hours (24 hours for second-skin film). Remove gently, wash with lukewarm water and fragrance-free soap.\n\n## The First Two Weeks\n\n**Do:** Keep it moisturised with unscented lotion. Wear loose clothing. Let it breathe.\n\n**Don't:** Submerge in water. Pick peeling skin. Expose to direct sunlight.\n\n## Long-Term Care\n\nAlways apply SPF 50 when the tattoo is in the sun. UV is the single biggest enemy of tattoo longevity.`}}
export default function BlogPost(){
  const {slug}=useParams()
  const [post,setPost]=useState(null)
  const [loading,setLoading]=useState(true)
  useEffect(()=>{supabase.from('posts').select('*').eq('slug',slug).eq('published',true).single().then(({data})=>{setPost(data||DEMO[slug]||null);setLoading(false)})},[slug])
  if(loading)return<div className="post-page" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}><p style={{color:'var(--muted)'}}>Loading...</p></div>
  if(!post)return<div className="post-page" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',gap:'1rem'}}><p style={{color:'var(--muted)'}}>Post not found.</p><Link to="/blog" className="btn btn-outline">\u2190 Back to Journal</Link></div>
  const render=text=>text.split('\n').map((line,i)=>{
    if(line.startsWith('## '))return<h2 key={i}>{line.slice(3)}</h2>
    if(line.startsWith('### '))return<h3 key={i}>{line.slice(4)}</h3>
    if(!line.trim())return null
    const parts=line.split(/(\*\*[^*]+\*\*)/)
    return<p key={i}>{parts.map((p,j)=>p.startsWith('**')&&p.endsWith('**')?<strong key={j}>{p.slice(2,-2)}</strong>:p)}</p>
  })
  return(
    <div className="post-page page-enter">
      <div className="post-hero">
        <div style={{display:'flex',justifyContent:'center',gap:'.4rem',marginBottom:'1rem'}}>{(post.tags||[]).map(t=><span key={t} className="tag">{t}</span>)}</div>
        <h1>{post.title}</h1>
        <div className="post-meta"><span>{new Date(post.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</span><span>\u00b7</span><span>SRJ Inked</span></div>
      </div>
      {post.cover_image_url&&<img src={post.cover_image_url} alt={post.title} className="post-cover"/>}
      <div className="post-content">{render(post.content||'')}</div>
      <div style={{maxWidth:'760px',margin:'0 auto 4rem',padding:'0 2rem',borderTop:'1px solid var(--border)',paddingTop:'2rem'}}>
        <Link to="/blog" className="btn btn-outline"><ArrowLeft size={14} style={{marginRight:'.5rem'}}/> Back to Journal</Link>
      </div>
    </div>
  )
}
