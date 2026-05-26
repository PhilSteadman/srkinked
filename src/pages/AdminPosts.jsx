import React,{useState,useEffect} from 'react'
import {supabase} from '../lib/supabase'
import {Plus,Trash2,Eye,EyeOff} from 'lucide-react'
export default function AdminPosts(){
  const [posts,setPosts]=useState([])
  const [form,setForm]=useState({title:'',slug:'',content:'',cover_image_url:'',tags:'',published:false})
  const [saving,setSaving]=useState(false)
  const [loading,setLoading]=useState(true)
  const [editing,setEditing]=useState(null)
  const load=()=>{supabase.from('posts').select('*').order('created_at',{ascending:false}).then(({data})=>{setPosts(data||[]);setLoading(false)})}
  useEffect(load,[])
  const slugify=t=>t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
  const save=async e=>{
    e.preventDefault();setSaving(true)
    const payload={...form,tags:form.tags?form.tags.split(',').map(t=>t.trim()):[]}
    if(editing)await supabase.from('posts').update(payload).eq('id',editing)
    else await supabase.from('posts').insert(payload)
    setForm({title:'',slug:'',content:'',cover_image_url:'',tags:'',published:false});setEditing(null);setSaving(false);load()
  }
  const startEdit=p=>{setEditing(p.id);setForm({...p,tags:(p.tags||[]).join(', ')});window.scrollTo({top:0,behavior:'smooth'})}
  const togglePub=async(id,cur)=>{await supabase.from('posts').update({published:!cur}).eq('id',id);load()}
  const del=async id=>{if(!confirm('Delete?'))return;await supabase.from('posts').delete().eq('id',id);load()}
  return(
    <div>
      <div className="admin-form-card">
        <h3>{editing?'Edit Post':'New Post'}</h3>
        <form onSubmit={save}>
          <div className="admin-form-row" style={{marginBottom:'1rem'}}>
            <div className="form-group"><label>Title *</label><input required value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value,slug:editing?f.slug:slugify(e.target.value)}))} placeholder="Post title"/></div>
            <div className="form-group"><label>Slug *</label><input required value={form.slug} onChange={e=>setForm(f=>({...f,slug:e.target.value}))} placeholder="url-slug"/></div>
            <div className="form-group"><label>Tags (comma separated)</label><input value={form.tags} onChange={e=>setForm(f=>({...f,tags:e.target.value}))} placeholder="Guide, Style, Aftercare"/></div>
          </div>
          <div className="form-group" style={{marginBottom:'1rem'}}><label>Cover Image URL</label><input value={form.cover_image_url} onChange={e=>setForm(f=>({...f,cover_image_url:e.target.value}))} placeholder="https://..."/></div>
          <div className="form-group" style={{marginBottom:'1rem'}}>
            <label>Content (## headings, **bold**)</label>
            <textarea rows={14} value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} placeholder={"Write your post here...\n\n## Use ## for headings\n**Bold text** for emphasis"} style={{fontFamily:'monospace',fontSize:'.85rem'}}/>
          </div>
          <div style={{display:'flex',gap:'1rem',alignItems:'center',flexWrap:'wrap'}}>
            <button type="submit" className="btn btn-gold" disabled={saving}><Plus size={14} style={{marginRight:'.5rem'}}/>{saving?'Saving...':editing?'Save Changes':'Create Post'}</button>
            <label style={{display:'flex',alignItems:'center',gap:'.5rem',cursor:'pointer',textTransform:'none',letterSpacing:'normal',fontSize:'.9rem',color:'var(--white)'}}>
              <input type="checkbox" checked={form.published} onChange={e=>setForm(f=>({...f,published:e.target.checked}))} style={{width:'auto'}}/>
              Publish immediately
            </label>
            {editing&&<button type="button" className="btn btn-outline" onClick={()=>{setEditing(null);setForm({title:'',slug:'',content:'',cover_image_url:'',tags:'',published:false})}}>Cancel</button>}
          </div>
        </form>
      </div>
      {loading?<p style={{color:'var(--muted)'}}>Loading...</p>:posts.length===0?<div className="admin-empty"><p>No posts yet.</p></div>:(
        <div style={{display:'flex',flexDirection:'column',gap:'1px',background:'var(--border)'}}>
          {posts.map(p=>(
            <div key={p.id} style={{background:'var(--dark)',padding:'1rem 1.5rem',display:'flex',alignItems:'center',gap:'1.5rem'}}>
              <div style={{flex:1}}>
                <p style={{fontWeight:600,marginBottom:'.2rem'}}>{p.title}</p>
                <p style={{fontSize:'.78rem',color:'var(--muted)'}}>/{p.slug} \u00b7 {new Date(p.created_at).toLocaleDateString('en-GB')}</p>
                {(p.tags||[]).length>0&&<div style={{display:'flex',gap:'.35rem',marginTop:'.4rem',flexWrap:'wrap'}}>{p.tags.map(t=><span key={t} className="tag" style={{fontSize:'.6rem'}}>{t}</span>)}</div>}
              </div>
              <span style={{display:'inline-block',padding:'.2rem .65rem',fontSize:'.65rem',letterSpacing:'.1em',textTransform:'uppercase',fontWeight:600,fontFamily:'var(--font-display)',background:p.published?'rgba(39,174,96,.15)':'rgba(201,168,76,.15)',color:p.published?'#2ecc71':'var(--gold)'}}>{p.published?'Published':'Draft'}</span>
              <button className="admin-action-btn" onClick={()=>togglePub(p.id,p.published)} title={p.published?'Unpublish':'Publish'}>{p.published?<EyeOff size={14}/>:<Eye size={14}/>}</button>
              <button className="admin-action-btn" onClick={()=>startEdit(p)}>Edit</button>
              <button className="admin-action-btn danger" onClick={()=>del(p.id)}><Trash2 size={13}/></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
