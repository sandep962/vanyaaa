import React, { useEffect, useRef, useState } from 'react'
import API from '../api'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import { fromLonLat } from 'ol/proj'
import { Polygon } from 'ol/geom'
import { Style, Fill, Stroke } from 'ol/style'
import Feature from 'ol/Feature'

export default function OLMap() {
  const el = useRef(null)
  const mapRef = useRef(null)
  const [area, setArea] = useState('sundarbans')
  const [showFalseColor, setShowFalseColor] = useState(true)
  const [falseColorData, setFalseColorData] = useState([])

  const centers = {
    sundarbans: [89.1833, 21.9497],
    kabini: [76.27, 12.0]
  }

  // Region boundaries
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

  // False Color B8, B4, B3 (NIR, Red, Green) mapping function
  const getFalseColor = (b8, b4, b3) => {
    const nir = Math.min(b8 / 3000, 1)
    const red = Math.min(b4 / 3000, 1)
    const green = Math.min(b3 / 3000, 1)

    const r = Math.floor(nir * 255)
    const g = Math.floor(red * 255)
    const b = Math.floor(green * 255)

    return `rgba(${r}, ${g}, ${b}, 0.7)`
  }

  // Generate false color data for regions
  const generateFalseColorData = () => {
    const data = []

    // Sundarbans
    const sundarbansData = []
    for (let i = 0; i < 4; i++) {
      const b8 = 800 + Math.random() * 1200
      const b4 = 400 + Math.random() * 600
      const b3 = 300 + Math.random() * 500

      sundarbansData.push({
        id: `sundarbans-${i}`,
        region: 'sundarbans',
        b8,
        b4,
        b3,
        color: getFalseColor(b8, b4, b3),
        coordinates: areaBoundaries.sundarbans[i]
      })
    }
    data.push(...sundarbansData)

    // Kabini
    const kabiniData = []
    for (let i = 0; i < 4; i++) {
      const b8 = 600 + Math.random() * 1000
      const b4 = 500 + Math.random() * 800
      const b3 = 400 + Math.random() * 700

      kabiniData.push({
        id: `kabini-${i}`,
        region: 'kabini',
        b8,
        b4,
        b3,
        color: getFalseColor(b8, b4, b3),
        coordinates: areaBoundaries.kabini[i]
      })
    }
    data.push(...kabiniData)

    return data
  }

  // Create polygons
  const createGeometricalPolygons = (falseColorData) => {
    const features = []

    const regionData = {
      sundarbans: falseColorData.filter(item => item.region === 'sundarbans'),
      kabini: falseColorData.filter(item => item.region === 'kabini')
    }

    Object.keys(regionData).forEach(region => {
      const regionPoints = regionData[region]
      if (regionPoints.length === 0) return

      const coords = areaBoundaries[region].map(coord =>
        fromLonLat([coord[1], coord[0]])
      )

      const polygon = new Polygon([coords])

      const avgB8 = regionPoints.reduce((sum, p) => sum + p.b8, 0) / regionPoints.length
      const avgB4 = regionPoints.reduce((sum, p) => sum + p.b4, 0) / regionPoints.length
      const avgB3 = regionPoints.reduce((sum, p) => sum + p.b3, 0) / regionPoints.length

      const feature = new Feature({
        geometry: polygon,
        region,
        b8: avgB8,
        b4: avgB4,
        b3: avgB3,
        color: getFalseColor(avgB8, avgB4, avgB3)
      })

      features.push(feature)
    })

    return features
  }

  // Create false color layer
  const createFalseColorLayer = (falseColorData) => {
    const features = createGeometricalPolygons(falseColorData)
    const source = new VectorSource({ features })

    const layer = new VectorLayer({
      source,
      style: (feature) => {
        const color = feature.get('color')
        const region = feature.get('region')

        return new Style({
          fill: new Fill({ color }),
          stroke: new Stroke({
            color: region === 'sundarbans'
              ? 'rgba(0, 100, 0, 0.9)'
              : 'rgba(139, 69, 19, 0.9)',
            width: 3
          })
        })
      }
    })

    return layer
  }

  // Initialize map
  useEffect(() => {
    const falseColorData = generateFalseColorData()
    setFalseColorData(falseColorData)

    const tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"

    if (mapRef.current) {
      mapRef.current.getLayers().item(0).getSource().setUrl(tileUrl)
      return
    }

    const layers = [new TileLayer({ source: new XYZ({ url: tileUrl }) })]

    if (showFalseColor) {
      const falseColorLayer = createFalseColorLayer(falseColorData)
      layers.push(falseColorLayer)
    }

    mapRef.current = new Map({
      target: el.current,
      layers,
      view: new View({
        center: fromLonLat(centers[area]),
        zoom: 8
      })
    })
  }, [])

  // Update on state change
  useEffect(() => {
    if (!mapRef.current) return

    mapRef.current.getView().setCenter(fromLonLat(centers[area]))

    const tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    mapRef.current.getLayers().item(0).getSource().setUrl(tileUrl)

    const existingLayers = mapRef.current.getLayers()
    const falseColorLayerIndex = existingLayers.getLength() - 1

    if (showFalseColor) {
      const falseColorLayer = createFalseColorLayer(falseColorData)

      if (falseColorLayerIndex > 0) {
        mapRef.current.removeLayer(existingLayers.item(falseColorLayerIndex))
      }

      mapRef.current.addLayer(falseColorLayer)
    } else {
      if (falseColorLayerIndex > 0) {
        mapRef.current.removeLayer(existingLayers.item(falseColorLayerIndex))
      }
    }
  }, [area, showFalseColor, falseColorData])

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: 12,
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: '8px',
        margin: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0
      }}>
        <select
          value={area}
          onChange={e => setArea(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px'
          }}
        >
          <option value='sundarbans'>🌿 Sundarbans</option>
          <option value='kabini'>🌳 Kabini</option>
        </select>

        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '14px',
          cursor: 'pointer'
        }}>
          <input
            type="checkbox"
            checked={showFalseColor}
            onChange={e => setShowFalseColor(e.target.checked)}
          />
          🛰 Show False Color (B8-B4-B3)
        </label>
      </div>

      {/* Legend */}
      {showFalseColor && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          backgroundColor: 'rgba(255,255,255,0.95)',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          zIndex: 1000,
          minWidth: '250px'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>
            False Color Composite (B8-B4-B3)
          </h4>
          <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
            <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
              Band Assignment:
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                backgroundColor: 'rgba(255, 0, 0, 0.7)',
                marginRight: '8px',
                borderRadius: '2px'
              }}></div>
              <span>Red = NIR (B8)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                backgroundColor: 'rgba(0, 255, 0, 0.7)',
                marginRight: '8px',
                borderRadius: '2px'
              }}></div>
              <span>Green = Red (B4)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                backgroundColor: 'rgba(0, 0, 255, 0.7)',
                marginRight: '8px',
                borderRadius: '2px'
              }}></div>
              <span>Blue = Green (B3)</span>
            </div>
            <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
              Interpretation:
            </div>
            <div style={{ fontSize: '11px', lineHeight: '1.3' }}>
              <div>• <strong>Bright Red:</strong> Healthy vegetation</div>
              <div>• <strong>Pink/Magenta:</strong> Urban areas</div>
              <div>• <strong>Blue/Cyan:</strong> Water bodies</div>
              <div>• <strong>Dark Red:</strong> Dense forests</div>
              <div>• <strong>Yellow/Orange:</strong> Bare soil/agriculture</div>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div ref={el} style={{ height: '100%' }} />
    </div>
  )
}
