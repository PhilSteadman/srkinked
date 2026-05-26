import React,{useState,useEffect} from 'react'
import {Youtube,Play} from 'lucide-react'
import './Videos.css'
const YT_KEY=import.meta.env.VITE_YOUTUBE_API_KEY
const YT_CH=import.meta.env.VITE_YOUTUBE_CHANNEL_ID
const DEMO=[
  {id:{videoId:'demo1'},snippet:{title:'Full Sleeve Progress \u2013 Black & Grey Realism',description:'Watch a full sleeve build from outline to finished piece.',publishedAt:'2025-01-10T10:00:00Z',thumbnails:{high:{url:null}}}},
  {id:{videoId:'demo2'},snippet:{title:'How I Design Custom Tattoos',description:'Behind the scenes look at the design process.',publishedAt:'2025-01-03T10:00:00Z',thumbnails:{high:{url:null}}}},
  {id:{videoId:'demo3'},snippet:{title:'Convention Highlights \u2013 Bristol 2024',description:'Clips from the Bristol Tattoo Convention.',publishedAt:'2024-12-15T10:00:00Z',thumbnails:{high:{url:null}}}},
]
export default function Videos(){
  const [videos,setVideos]=useState([])
  const [active,setActive]=useState(null)
  const [loading,setLoading]=useState(true)
  const isDemoId=id=>['demo1','demo2','demo3'].includes(id)
  useEffect(()=>{
    if(!YT_KEY||!YT_CH||YT_CH==='UCxxxxxxx'){setVideos(DEMO);setLoading(false);return}
    fetch(`https://www.googleapis.com/youtube/v3/search?key=${YT_KEY}&channelId=${YT_CH}&part=snippet,id&order=date&maxResults=12&type=video`)
      .then(r=>r.json()).then(d=>{setVideos(d.items?.length?d.items:DEMO);setLoading(false)})
      .catch(()=>{setVideos(DEMO);setLoading(false)})
  },[])
  return(
    <div className="videos-page page-enter">
      <div className="page-hero"><p className="section-eyebrow">Watch</p><h1 className="section-title">Videos & <span>Content</span></h1><div className="gold-line" style={{margin:'1rem auto'}}/><p>Time-lapses, tutorials, convention coverage, and behind-the-scenes content.</p></div>
      <div className="container" style={{paddingTop:'3rem',paddingBottom:'4rem'}}>
        {active&&<div className="yt-featured"><iframe src={`https://www.youtube.com/embed/${active}?autoplay=1&rel=0`} title="Video" allowFullScreen allow="autoplay"/><button className="btn btn-outline" style={{marginTop:'1rem'}} onClick={()=>setActive(null)}>Close</button></div>}
        {loading?<div className="videos-loading"><Youtube size={40} strokeWidth={1} color="var(--gold)"/><p>Loading videos...</p></div>:(
          <div className="videos-grid">
            {videos.map((v,i)=>{
              const vid=v.id?.videoId||v.id
              const thumb=v.snippet?.thumbnails?.high?.url||v.snippet?.thumbnails?.medium?.url
              return(
                <div key={vid||i} className="video-card" onClick={()=>!isDemoId(vid)&&vid&&setActive(vid)}>
                  <div className="video-thumb">
                    {thumb?<img src={thumb} alt={v.snippet?.title}/>:<div className="video-thumb-placeholder"><Youtube size={36} strokeWidth={1}/></div>}
                    <div className="video-play-overlay"><div className="play-btn"><Play size={28} fill="currentColor"/></div></div>
                  </div>
                  <div className="video-info"><h3>{v.snippet?.title}</h3><p className="video-date">{new Date(v.snippet?.publishedAt).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</p>{v.snippet?.description&&<p className="video-desc">{v.snippet.description.slice(0,100)}...</p>}</div>
                </div>
              )
            })}
          </div>
        )}
        {(!YT_KEY||!YT_CH||YT_CH==='UCxxxxxxx')&&<div className="videos-notice"><Youtube size={20} color="var(--gold)"/><p>Connect your YouTube channel by adding <code>VITE_YOUTUBE_API_KEY</code> and <code>VITE_YOUTUBE_CHANNEL_ID</code> to your Netlify environment variables.</p></div>}
      </div>
    </div>
  )
}
