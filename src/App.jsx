
import React from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'

export default function App(){
  const nav = useNavigate()
  React.useEffect(()=>{ if(!localStorage.getItem('token')) nav('/login') },[])
  return (
    <div style={{fontFamily:'Inter, system-ui', height:'100vh', display:'grid', gridTemplateRows:'56px 1fr'}}>
      <header style={{display:'flex',gap:16,alignItems:'center',padding:'8px 16px',borderBottom:'1px solid #eee'}}>
        <strong>Vanya</strong>
        <Link to="/">Map</Link>
        <Link to="/ol">OL Map</Link>
        <Link to="/compare">Compare</Link>
        <Link to="/insights">Insights</Link>
        <Link to="/upload">Upload/Live</Link>
        <div style={{marginLeft:'auto'}}>
          <button onClick={()=>{localStorage.clear(); nav('/login')}}>Logout</button>
        </div>
      </header>
      <main><Outlet/></main>
    </div>
  )
}
