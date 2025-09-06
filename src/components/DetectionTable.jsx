
import React from 'react'
export default function DetectionTable({rows}){
  return (
    <table style={{width:'100%',borderCollapse:'collapse'}}>
      <thead>
        <tr><th>Type</th><th>Label</th><th>Conf</th></tr>
      </thead>
      <tbody>
        {rows.map((r,i)=> (
          <tr key={i}><td>{r.kind}</td><td>{r.label}</td><td>{(r.confidence*100).toFixed(1)}%</td></tr>
        ))}
      </tbody>
    </table>
  )
}
