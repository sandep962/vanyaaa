
import React, { useState } from 'react'
export default function Accordion({items}){
  const [open, setOpen] = useState(null)
  return (
    <div>
      {items.map((it, i)=> (
        <div key={i} style={{border:'1px solid #eee',borderRadius:12,marginBottom:8}}>
          <button onClick={()=> setOpen(open===i?null:i)} style={{width:'100%',textAlign:'left',padding:12,fontWeight:600}}>{it.title}</button>
          {open===i && <div style={{padding:12,whiteSpace:'pre-wrap'}}>{it.content}</div>}
        </div>
      ))}
    </div>
  )
}
