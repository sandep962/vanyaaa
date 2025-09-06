
import React, { useState } from 'react'
import API from '../api'
import DetectionTable from '../components/DetectionTable'

export default function Upload(){
  const [file, setFile] = useState(null)
  const [coords, setCoords] = useState({lat:'', lon:''})
  const [res, setRes] = useState(null)

  const submit = async (e)=>{
    e.preventDefault()
    const fd = new FormData()
    if(!file) return
    fd.append('file', file)
    fd.append('lat', coords.lat || '0')
    fd.append('lon', coords.lon || '0')
    try{
      const {data} = await API.post('/detect', fd)
      setRes(data)
    }catch(err){
      alert('Detection failed. Check server logs.')
    }
  }

  const alarm = res?.level === 'red'

  return (
    <div style={{padding:16}}>
      <form onSubmit={submit} style={{display:'grid',gap:8, maxWidth:480}}>
        <input type='file' accept="image/*,video/*" onChange={e=>setFile(e.target.files[0])} required />
        <div style={{display:'flex',gap:8}}>
          <input placeholder='Latitude' value={coords.lat} onChange={e=>setCoords({...coords, lat:e.target.value})} />
          <input placeholder='Longitude' value={coords.lon} onChange={e=>setCoords({...coords, lon:e.target.value})} />
        </div>
        <button>Run Detection</button>
      </form>

      {res && (
        <div style={{marginTop:16}}>
          {alarm && <div style={{padding:12, background:'#ffefef', border:'1px solid #f66', borderRadius:8}}>RED ALERT triggered. Ranger notified.</div>}
          <DetectionTable rows={res.results || []} />
        </div>
      )}
    </div>
  )
}
