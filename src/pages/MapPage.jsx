
import React, { useEffect, useState } from 'react'
import API from '../api'
import { MapContainer, TileLayer, Marker, Tooltip, Polygon, ImageOverlay } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useNavigate } from 'react-router-dom'

const centers = {
  sundarbans: [22.5, 89.0],
  kabini: [12.05, 76.4],
  both: [17.5, 82.5] // Center point between both areas
}

// Area boundaries
const areaBoundaries = {
  sundarbans: [
    [22.5, 88.5], // SW
    [22.5, 89.5], // SE  
    [23.5, 89.5], // NE
    [23.5, 88.5]  // NW
  ],
  kabini: [
    [12.022, 76.316],
    [12.119, 76.345], 
    [12.048, 76.484],
    [11.986, 76.419]
  ]
}

// Generate random markers within area boundaries
const generateRandomMarkers = (boundary, count = 3) => {
  const markers = []
  const [minLat, maxLat] = [Math.min(...boundary.map(p => p[0])), Math.max(...boundary.map(p => p[0]))]
  const [minLon, maxLon] = [Math.min(...boundary.map(p => p[1])), Math.max(...boundary.map(p => p[1]))]
  
  for (let i = 0; i < count; i++) {
    const lat = minLat + Math.random() * (maxLat - minLat)
    const lon = minLon + Math.random() * (maxLon - minLon)
    markers.push({
      id: `random-${i}`,
      lat,
      lon,
      title: `Random Point ${i + 1}`,
      snippet: `NDVI: ${(Math.random() * 0.8 + 0.2).toFixed(2)}`
    })
  }
  return markers
}

export default function MapPage(){
  const [area, setArea] = useState('both')
  const [tile, setTile] = useState('')
  const [markers, setMarkers] = useState([])
  const [sundarbansMarkers, setSundarbansMarkers] = useState([])
  const [kabiniMarkers, setKabiniMarkers] = useState([])
  const nav = useNavigate()

  useEffect(()=>{ (async()=>{
    try{
      // Generate random markers for both areas
      const sundarbansRandomMarkers = generateRandomMarkers(areaBoundaries.sundarbans)
      const kabiniRandomMarkers = generateRandomMarkers(areaBoundaries.kabini)
      setSundarbansMarkers(sundarbansRandomMarkers)
      setKabiniMarkers(kabiniRandomMarkers)
      
      // We're using static map tiles, no API calls needed
      setTile('')
      setMarkers([])
    }catch(e){ console.error(e) }
  })() },[area])

  // NDVI color mapping function
  const getNDVIColor = (ndvi) => {
    if (ndvi < 0.1) return '#8B4513' // Brown - water/barren
    if (ndvi < 0.2) return '#D2B48C' // Tan - sparse vegetation
    if (ndvi < 0.3) return '#9ACD32' // Yellow-green - grasslands
    if (ndvi < 0.4) return '#32CD32' // Lime green - shrublands
    if (ndvi < 0.5) return '#228B22' // Forest green - dense vegetation
    if (ndvi < 0.6) return '#006400' // Dark green - very dense vegetation
    return '#004400' // Very dark green - extremely dense vegetation
  }

  return (
    <div style={{height:'100%'}}>
      <div style={{display:'flex',gap:8,padding:8,alignItems:'center'}}>
        <select value={area} onChange={e=>setArea(e.target.value)}>
          <option value='both'>Both Areas</option>
          <option value='sundarbans'>Sundarbans Only</option>
          <option value='kabini'>Kabini Only</option>
        </select>
        <div style={{fontSize:'12px',color:'#666'}}>
          NDVI Legend: 
          <span style={{color:'#8B4513'}}>●</span> Water/Barren 
          <span style={{color:'#D2B48C'}}>●</span> Sparse 
          <span style={{color:'#9ACD32'}}>●</span> Grass 
          <span style={{color:'#32CD32'}}>●</span> Shrub 
          <span style={{color:'#228B22'}}>●</span> Forest 
          <span style={{color:'#006400'}}>●</span> Dense 
          <span style={{color:'#004400'}}>●</span> Very Dense
        </div>
      </div>
      <MapContainer center={centers[area]} zoom={area === 'both' ? 6 : 10} style={{height:'calc(100% - 48px)'}}>
        {tile && <TileLayer url={tile} attribution='© Google Earth Engine / Sentinel-2'/>}
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution='Esri World Imagery' />
        
        {/* Sundarbans boundary and NDVI overlay */}
        {(area === 'both' || area === 'sundarbans') && (
          <>
            <Polygon
              positions={areaBoundaries.sundarbans}
              pathOptions={{
                color: '#FF0000',
                weight: 3,
                opacity: 0.8,
                fillColor: '#FF0000',
                fillOpacity: 0.1
              }}
            />
            {/* NDVI Color-coded overlay for Sundarbans */}
            {areaBoundaries.sundarbans.map((point, index) => {
              const nextPoint = areaBoundaries.sundarbans[(index + 1) % areaBoundaries.sundarbans.length]
              const ndviValue = 0.3 + Math.random() * 0.4 // Random NDVI between 0.3-0.7
              return (
                <Polygon
                  key={`sundarbans-ndvi-${index}`}
                  positions={[
                    point,
                    nextPoint,
                    [point[0] + (nextPoint[0] - point[0]) / 2, point[1] + (nextPoint[1] - point[1]) / 2]
                  ]}
                  pathOptions={{
                    color: 'transparent',
                    fillColor: getNDVIColor(ndviValue),
                    fillOpacity: 0.6
                  }}
                />
              )
            })}
            {/* Sundarbans random markers */}
            {sundarbansMarkers.map(m=> (
              <Marker 
                key={`sundarbans-${m.id}`} 
                position={[m.lat, m.lon]} 
                eventHandlers={{ click: ()=> nav('/compare', { state: { area: 'sundarbans', marker: m } }) }}
              >
                <Tooltip>
                  <div>
                    <strong>Sundarbans - {m.title}</strong><br/>
                    {m.snippet}<br/>
                    <span style={{color: getNDVIColor(parseFloat(m.snippet.split(': ')[1]))}}>
                      ● Vegetation Health
                    </span>
                  </div>
                </Tooltip>
              </Marker>
            ))}
          </>
        )}
        
        {/* Kabini boundary and NDVI overlay */}
        {(area === 'both' || area === 'kabini') && (
          <>
            <Polygon
              positions={areaBoundaries.kabini}
              pathOptions={{
                color: '#0000FF',
                weight: 3,
                opacity: 0.8,
                fillColor: '#0000FF',
                fillOpacity: 0.1
              }}
            />
            {/* NDVI Color-coded overlay for Kabini */}
            {areaBoundaries.kabini.map((point, index) => {
              const nextPoint = areaBoundaries.kabini[(index + 1) % areaBoundaries.kabini.length]
              const ndviValue = 0.2 + Math.random() * 0.5 // Random NDVI between 0.2-0.7
              return (
                <Polygon
                  key={`kabini-ndvi-${index}`}
                  positions={[
                    point,
                    nextPoint,
                    [point[0] + (nextPoint[0] - point[0]) / 2, point[1] + (nextPoint[1] - point[1]) / 2]
                  ]}
                  pathOptions={{
                    color: 'transparent',
                    fillColor: getNDVIColor(ndviValue),
                    fillOpacity: 0.6
                  }}
                />
              )
            })}
            {/* Kabini random markers */}
            {kabiniMarkers.map(m=> (
              <Marker 
                key={`kabini-${m.id}`} 
                position={[m.lat, m.lon]} 
                eventHandlers={{ click: ()=> nav('/compare', { state: { area: 'kabini', marker: m } }) }}
              >
                <Tooltip>
                  <div>
                    <strong>Kabini - {m.title}</strong><br/>
                    {m.snippet}<br/>
                    <span style={{color: getNDVIColor(parseFloat(m.snippet.split(': ')[1]))}}>
                      ● Vegetation Health
                    </span>
                  </div>
                </Tooltip>
              </Marker>
            ))}
          </>
        )}
        
        {/* Original API markers */}
        {markers.map(m=> (
          <Marker key={m.id} position={[m.lat, m.lon]} eventHandlers={{ click: ()=> nav('/compare') }}>
            <Tooltip>{m.title}: {m.snippet}</Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
