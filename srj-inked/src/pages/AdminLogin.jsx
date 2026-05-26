import React,{useState} from 'react'
import {supabase} from '../lib/supabase'
export default function AdminLogin(){
  const [email,setEmail]=useState('')
  const [pw,setPw]=useState('')
  const [err,setErr]=useState('')
  const [loading,setLoading]=useState(false)
  const submit=async e=>{e.preventDefault();setLoading(true);setErr('');const {error}=await supabase.auth.signInWithPassword({email,password:pw});if(error)setErr(error.message);setLoading(false)}
  return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--black)',padding:'2rem'}}>
      <div style={{background:'var(--dark)',border:'1px solid var(--border)',padding:'3rem',width:'100%',maxWidth:'420px'}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:'2rem'}}>
          <span style={{fontFamily:'var(--font-hero)',fontSize:'3rem',letterSpacing:'.2em'}}>SRJ</span>
          <span style={{fontFamily:'var(--font-display)',fontSize:'.6rem',letterSpacing:'.5em',color:'var(--gold)',fontWeight:600}}>INKED \u00b7 ADMIN</span>
        </div>
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          <div className="form-group"><label>Email</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@email.com" autoComplete="username"/></div>
          <div className="form-group"><label>Password</label><input type="password" required value={pw} onChange={e=>setPw(e.target.value)} placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" autoComplete="current-password"/></div>
          {err&&<p style={{background:'rgba(192,57,43,.1)',border:'1px solid rgba(192,57,43,.3)',color:'var(--red-bright)',padding:'.65rem 1rem',fontSize:'.85rem'}}>{err}</p>}
          <button type="submit" className="btn btn-gold" disabled={loading} style={{width:'100%'}}>{loading?'Signing in...':'Sign In'}</button>
        </form>
      </div>
    </div>
  )
}
