import React,{useState,useEffect} from 'react'
import {Link} from 'react-router-dom'
import {BookOpen,ArrowRight} from 'lucide-react'
import {supabase} from '../lib/supabase'
import './Blog.css'
const DEMO=[
  {id:1,title:'Why Black & Grey Realism is Having a Moment',slug:'black-grey-realism',created_at:'2025-01-15',tags:['Style','Realism'],content:'Black and grey tattooing has been around for decades, but right now it\'s experiencing a genuine renaissance\u2014and for good reason.'},
  {id:2,title:'Aftercare: The Most Important Part of Getting a Tattoo',slug:'aftercare-guide',created_at:'2025-01-08',tags:['Guide','Aftercare'],content:'You\'ve just sat through hours in the chair. The design is exactly what you wanted. Now what?'},
  {id:3,title:'How to Choose the Right Placement for Your Tattoo',slug:'tattoo-placement',created_at:'2024-12-20',tags:['Guide','Advice'],content:'Placement is one of the most underrated decisions in getting a tattoo\u2014and one of the hardest to reverse.'},
]
export default function Blog(){
  const [posts,setPosts]=useState([])
  const [tag,setTag]=useState('All')
  useEffect(()=>{supabase.from('posts').select('*').eq('published',true).order('created_at',{ascending:false}).then(({data})=>{setPosts(data?.length?data:DEMO)})},[])
  const allTags=['All',...new Set(posts.flatMap(p=>p.tags||[]))]
  const filtered=tag==='All'?posts:posts.filter(p=>(p.tags||[]).includes(tag))
  return(
    <div className="blog-page page-enter">
      <div className="page-hero"><p className="section-eyebrow">From The Studio</p><h1 className="section-title">The <span>Journal</span></h1><div className="gold-line" style={{margin:'1rem auto'}}/><p>Tattoo guides, style breakdowns, studio stories, and artist insights.</p></div>
      <div className="container" style={{paddingTop:'3rem',paddingBottom:'4rem'}}>
        <div className="filter-bar">{allTags.map(t=><button key={t} className={`filter-btn ${tag===t?'active':''}`} onClick={()=>setTag(t)}>{t}</button>)}</div>
        {filtered.length>0?(
          <div className="blog-grid">
            {filtered.map((post,i)=>(
              <Link key={post.id} to={`/blog/${post.slug}`} className="blog-card" style={{animationDelay:`${i*.08}s`}}>
                <div className="blog-img">{post.cover_image_url?<img src={post.cover_image_url} alt={post.title}/>:<div className="blog-img-placeholder"><BookOpen size={28} strokeWidth={1}/></div>}</div>
                <div className="blog-body">
                  <div className="blog-tags">{(post.tags||[]).map(t=><span key={t} className="tag">{t}</span>)}</div>
                  <h3>{post.title}</h3>
                  <p className="blog-excerpt">{post.content?.slice(0,120)}...</p>
                  <div className="blog-footer">
                    <span className="blog-date">{new Date(post.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</span>
                    <span className="blog-read">Read <ArrowRight size={12}/></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ):<div className="gallery-empty"><p>No posts yet. Check back soon.</p></div>}
      </div>
    </div>
  )
}
