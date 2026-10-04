import React,{useState,useEffect} from 'react'
import {Link,useParams} from 'react-router-dom'
import {ArrowLeft} from 'lucide-react'
import {supabase} from '../lib/supabase'
import {useSEO} from '../lib/useSEO'
export default function BlogPost(){
  const {slug}=useParams()
  const [post,setPost]=useState(null)
  const [loading,setLoading]=useState(true)
  useEffect(()=>{supabase.from('posts').select('*').eq('slug',slug).eq('published',true).single().then(({data})=>{setPost(data||null);setLoading(false)})},[slug])
  useSEO({ title: post?.title || 'Journal', description: post?.content?.slice(0,155) || 'SRJ Inked tattoo journal.', path: `/blog/${slug}` })

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
