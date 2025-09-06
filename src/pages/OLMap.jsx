
import React, { useEffect, useRef, useState } from 'react'
import API from '../api'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import { fromLonLat } from 'ol/proj'

export default function OLMap(){
  const el = useRef(null)
  const mapRef = useRef(null)
  const [area, setArea] = useState('sundarbans')
  const centers = { sundarbans: [89.1833, 21.9497], kabini: [76.27, 12.0] }

  useEffect(()=>{ (async()=>{
    // Use static satellite imagery
    const tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    if(mapRef.current){ 
      mapRef.current.getLayers().item(0).getSource().setUrl(tileUrl); 
      return 
    }
    mapRef.current = new Map({
      target: el.current,
      layers: [ new TileLayer({ source: new XYZ({ url: tileUrl }) }) ],
      view: new View({ center: fromLonLat(centers[area]), zoom: 8 })
    })
  })() },[])

  useEffect(()=>{ (async()=>{
    // Use static satellite imagery
    const tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    mapRef.current.getView().setCenter(fromLonLat(centers[area]))
    mapRef.current.getLayers().item(0).getSource().setUrl(tileUrl)
  })() },[area])

  return (
    <div style={{height:'100%'}}>
      <div style={{display:'flex',gap:8,padding:8}}>
        <select value={area} onChange={e=>setArea(e.target.value)}>
          <option value='sundarbans'>Sundarbans</option>
          <option value='kabini'>Kabini</option>
        </select>
      </div>
      <div ref={el} style={{height:'calc(100% - 48px)'}} />
    </div>
  )
}
