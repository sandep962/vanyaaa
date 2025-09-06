
import React, { useState } from 'react'
import API from '../api'

export default function Login(){
  const [username, setU] = useState('admin')
  const [password, setP] = useState('admin')
  const [error, setE] = useState('')
  const submit = async (e)=>{
    e.preventDefault(); setE('')
    // Mock authentication - accept admin/admin
    if(username === 'admin' && password === 'admin'){
      localStorage.setItem('token', 'mock-token-12345')
      window.location.href='/'
    } else {
      setE('Invalid')
    }
    // Original API call (commented out for now):
    // try{ const {data} = await API.post('/auth/login',{username,password}); localStorage.setItem('token', data.token); window.location.href='/' }catch(err){ setE('Invalid') }
  }
  return (
    <div style={{display:'grid',placeItems:'center',height:'100%'}}>
      <form onSubmit={submit} style={{display:'grid',gap:8,padding:24,border:'1px solid #ddd',borderRadius:12,width:320}}>
        <h3>ForestWatch Login</h3>
        <input placeholder='Username' value={username} onChange={e=>setU(e.target.value)} />
        <input placeholder='Password' type='password' value={password} onChange={e=>setP(e.target.value)} />
        {error && <div style={{color:'crimson'}}>{error}</div>}
        <button>Sign in</button>
      </form>
    </div>
  )
}
