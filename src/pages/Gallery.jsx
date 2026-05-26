import React,{useState,useEffect} from 'react'
import {Image} from 'lucide-react'
import {supabase} from '../lib/supabase'
import './Gallery.css'
const STYLES=['All','Black & Grey','Realism','Traditional','Fine Line','Japanese','Geometric','Lettering','Watercolour']
const PH=Array.from({length:12},(_,i)=>({id:i+1,title:`Tattoo ${i+1}`,style:STYLES[1+(i%(STYLES.length-1))],placeholder:true}))
export default function Gallery(){
  const [items,setItems]=useState(PH)
  const [filter,setFilter]=useState('All')
  const [lb,setLb]=useState(null)
  useEffect(()=>{supabase.from('gallery').select('*').order('created_at',{ascending:false}).then(({data})=>{if(data?.length)setItems(data)})},[])
  const filtered=filter==='All'?items:items.filter(i=>i.style===filter)
  return(
    <div className="gallery-page page-enter">
      <div className="page-hero"><p className="section-eyebrow">Portfolio</p><h1 className="section-title">The <span>Gallery</span></h1><div className="gold-line" style={{margin:'1rem auto'}}/><p>Every piece is original. Every tattoo tells a story.</p></div>
      <div className="container" style={{paddingTop:'3rem',paddingBottom:'4rem'}}>
        <div className="filter-bar">{STYLES.map(s=><button key={s} className={`filter-btn ${filter===s?'active':''}`} onClick={()=>setFilter(s)}>{s}</button>)}</div>
        <div className="gallery-masonry">
          {filtered.map((item,i)=>(
            <div key={item.id} className="gm-card" style={{animationDelay:`${i*.05}s`}} onClick={()=>item.image_url&&setLb(item)}>
              {item.image_url?<img src={item.image_url} alt={item.title}/>:<div className="gm-placeholder"><Image size={28} strokeWidth={1}/><span>{item.style}</span></div>}
              <div className="gm-overlay"><span className="tag">{item.style}</span><p>{item.title}</p></div>
            </div>
          ))}
        </div>
        {filtered.length===0&&<div className="gallery-empty"><p>No pieces in this style yet.</p></div>}
      </div>
      {lb&&<div className="lightbox" onClick={()=>setLb(null)}><div className="lightbox-inner" onClick={e=>e.stopPropagation()}><button className="lb-close" onClick={()=>setLb(null)}>&#x2715;</button><img src={lb.image_url} alt={lb.title}/><div className="lb-info"><span className="tag">{lb.style}</span><h3>{lb.title}</h3>{lb.description&&<p>{lb.description}</p>}</div></div></div>}
    </div>
  )
}
