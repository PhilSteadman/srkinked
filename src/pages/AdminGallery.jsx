import React,{useState,useEffect,useRef} from 'react'
import {supabase} from '../lib/supabase'
import {Upload,Trash2,Plus} from 'lucide-react'
const STYLES=['Black & Grey','Realism','Traditional','Neo-Traditional','Fine Line','Japanese','Geometric','Watercolour','Lettering','Other']
export default function AdminGallery(){
  const [items,setItems]=useState([])
  const [form,setForm]=useState({title:'',style:'Black & Grey',description:''})
  const [file,setFile]=useState(null)
  const [preview,setPreview]=useState(null)
  const [uploading,setUploading]=useState(false)
  const [loading,setLoading]=useState(true)
  const ref=useRef()
  const load=()=>{supabase.from('gallery').select('*').order('created_at',{ascending:false}).then(({data})=>{setItems(data||[]);setLoading(false)})}
  useEffect(load,[])
  const onFile=e=>{const f=e.target.files[0];if(!f)return;setFile(f);setPreview(URL.createObjectURL(f))}
  const upload=async e=>{
    e.preventDefault();if(!file)return alert('Select an image');setUploading(true)
    const ext=file.name.split('.').pop()
    const path=`gallery/${Date.now()}.${ext}`
    const {error}=await supabase.storage.from('tattoos').upload(path,file,{cacheControl:'3600',upsert:false})
    if(error){alert('Upload failed: '+error.message);setUploading(false);return}
    const {data:{publicUrl}}=supabase.storage.from('tattoos').getPublicUrl(path)
    await supabase.from('gallery').insert({...form,image_url:publicUrl})
    setForm({title:'',style:'Black & Grey',description:''});setFile(null);setPreview(null)
    if(ref.current)ref.current.value='';setUploading(false);load()
  }
  const del=async item=>{
    if(!confirm('Delete?'))return
    const path=item.image_url?.split('/tattoos/')[1]
    if(path)await supabase.storage.from('tattoos').remove([path])
    await supabase.from('gallery').delete().eq('id',item.id);load()
  }
  return(
    <div>
      <div className="admin-form-card">
        <h3>Upload New Tattoo</h3>
        <form onSubmit={upload}>
          <div onClick={()=>ref.current?.click()} style={{border:'2px dashed var(--border)',padding:'2rem',textAlign:'center',cursor:'pointer',marginBottom:'1rem',transition:'border-color .2s'}} onMouseEnter={e=>e.currentTarget.style.borderColor='var(--gold)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
            {preview?<img src={preview} alt="Preview" style={{maxHeight:'200px',margin:'0 auto'}}/>:<div style={{color:'var(--muted)'}}><Upload size={32} strokeWidth={1} style={{margin:'0 auto .75rem'}}/><p>Click to select image</p><p style={{fontSize:'.75rem',marginTop:'.25rem'}}>JPG, PNG, WebP</p></div>}
            <input ref={ref} type="file" accept="image/*" onChange={onFile} style={{display:'none'}}/>
          </div>
          <div className="admin-form-row" style={{marginBottom:'1rem'}}>
            <div className="form-group"><label>Title</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Black & Grey Sleeve"/></div>
            <div className="form-group"><label>Style</label><select value={form.style} onChange={e=>setForm(f=>({...f,style:e.target.value}))}>{STYLES.map(s=><option key={s}>{s}</option>)}</select></div>
          </div>
          <div className="form-group" style={{marginBottom:'1rem'}}><label>Description</label><textarea rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Optional notes"/></div>
          <button type="submit" className="btn btn-gold" disabled={uploading}><Plus size={14} style={{marginRight:'.5rem'}}/>{uploading?'Uploading...':'Upload to Gallery'}</button>
        </form>
      </div>
      {loading?<p style={{color:'var(--muted)'}}>Loading...</p>:(
        <><p style={{fontSize:'.7rem',letterSpacing:'.15em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'1rem',fontWeight:600}}>{items.length} images</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:'1px',background:'var(--border)'}}>
          {items.map(item=>(
            <div key={item.id} style={{background:'var(--dark)',position:'relative'}}>
              <div style={{aspectRatio:'1',overflow:'hidden'}}><img src={item.image_url} alt={item.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>
              <div style={{padding:'.65rem'}}><p style={{fontSize:'.82rem',fontWeight:600,marginBottom:'.15rem'}}>{item.title||'Untitled'}</p><p style={{fontSize:'.7rem',color:'var(--gold)'}}>{item.style}</p></div>
              <button className="admin-action-btn danger" onClick={()=>del(item)} style={{position:'absolute',top:'.5rem',right:'.5rem',background:'rgba(0,0,0,.7)',border:'none',color:'var(--red-bright)',padding:'.3rem'}}><Trash2 size={14}/></button>
            </div>
          ))}
        </div></>
      )}
    </div>
  )
}
