
import React, { useEffect, useState } from 'react'
import API from '../api'
import Accordion from '../components/Accordion'

export default function Insights(){
  const [area, setArea] = useState('sundarbans')
  const [data, setData] = useState({
    ai_report: `ForestWatch AI Analysis for ${area}: Based on recent satellite imagery analysis, this area shows moderate vegetation health with some areas requiring attention. The AI recommends implementing conservation measures to maintain forest density and prevent further degradation.`,
    forecast: {
      "next_6_months": "Vegetation health is expected to remain stable with proper conservation efforts",
      "risk_factors": ["Climate change", "Human activity", "Disease outbreaks"],
      "recommendations": ["Increase monitoring", "Implement reforestation", "Community engagement"]
    }
  })
  
  const items = [
    { title: 'AI Conservation Plan', content: data.ai_report },
    { title: 'Forecast (next 6 months)', content: JSON.stringify(data.forecast, null, 2) }
  ]
  return (
    <div style={{padding:16}}>
      <select value={area} onChange={e=>setArea(e.target.value)}>
        <option value='sundarbans'>Sundarbans</option>
        <option value='kabini'>Kabini</option>
      </select>
      <Accordion items={items} />
    </div>
  )
}
