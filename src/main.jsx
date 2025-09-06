
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App'
import Login from './pages/Login'
import MapPage from './pages/MapPage'
import Compare from './pages/Compare'
import Insights from './pages/Insights'
import Upload from './pages/Upload'
import OLMap from './pages/OLMap'

createRoot(document.getElementById('root')).render(
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<App />}> 
        <Route index element={<MapPage />} />
        <Route path="ol" element={<OLMap />} />
        <Route path="compare" element={<Compare />} />
        <Route path="insights" element={<Insights />} />
        <Route path="upload" element={<Upload />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </BrowserRouter>
)
