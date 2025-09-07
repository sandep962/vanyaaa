import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import API from '../api'

export default function Compare(){
  const location = useLocation()
  const [images, setImages] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get area and marker info from navigation state
        const { area, marker } = location.state || { area: 'sundarbans', marker: { title: 'Random Point 1' } }
        
        console.log('Fetching images for:', area, marker.title);
        
        // Fetch images from backend
        const response = await API.get(`/ndvi-images/${area}/${encodeURIComponent(marker.title)}`)
        
        if (response.data.success) {
          setImages(response.data.data)
          
          // Extract filenames from URLs for analysis
          const image1Filename = response.data.data.image1_url.split('/').pop();
          const image2Filename = response.data.data.image2_url.split('/').pop();
          
          console.log('Extracted filenames:', image1Filename, image2Filename);
          
          // Analyze vegetation with LLM - send filenames instead of URLs
          const analysisResponse = await API.post('/analyze-vegetation', {
            image1_filename: image1Filename,
            image2_filename: image2Filename,
            area: area,
            pointer_name: marker.title
          })
          
          if (analysisResponse.data.success) {
            setAnalysis(analysisResponse.data.data)
          }
        } else {
          setError('Images not found for this location')
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load images and analysis: ' + (err.response?.data?.error || err.message))
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [location.state])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '16px' }}>Loading images and analysis...</div>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3 style={{ color: '#e74c3c' }}>Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    )
  }

  if (!images) {
    return <div>No data available</div>
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Inter, system-ui' }}>
      <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>
        Vegetation Analysis - {images.pointer_name}
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div style={{ border: '2px solid #ecf0f1', borderRadius: '12px', padding: '16px', backgroundColor: '#f8f9fa' }}>
          <h3 style={{ color: '#27ae60', marginBottom: '12px' }}>Before Image</h3>
          <img 
            alt="Before" 
            style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd' }} 
            src={images.image1_url} 
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I="middle" dy=".3em">Image Not Found</text></svg>'
            }}
          />
        </div>
        
        <div style={{ border: '2px solid #ecf0f1', borderRadius: '12px', padding: '16px', backgroundColor: '#f8f9fa' }}>
          <h3 style={{ color: '#e74c3c', marginBottom: '12px' }}>After Image</h3>
          <img 
            alt="After" 
            style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd' }} 
            src={images.image2_url}
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSI gaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I="middle" dy=".3em">Image Not Found</text></svg>'
            }}
          />
        </div>
      </div>

      {analysis && (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #ddd', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '16px' }}>AI Vegetation Analysis</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#e8f5e8', padding: '12px', borderRadius: '8px' }}>
              <h4 style={{ color: '#27ae60', margin: '0 0 8px 0' }}>Vegetation Scores</h4>
              <p style={{ margin: '4px 0' }}>Before: <strong>{(analysis.vegetation_score_image1*100).toFixed(1)}%</strong></p>
              <p style={{ margin: '4px 0' }}>After: <strong>{(analysis.vegetation_score_image2*100).toFixed(1)}%</strong></p>
              <p style={{ margin: '4px 0', color: analysis.vegetation_loss > 20 ? '#e74c3c' : '#f39c12' }}>
                Loss: <strong>{analysis.vegetation_loss.toFixed(1)}%</strong>
              </p>
            </div>
            
            <div style={{ backgroundColor: '#f0f8ff', padding: '12px', borderRadius: '8px' }}>
              <h4 style={{ color: '#3498db', margin: '0 0 8px 0' }}>Analysis Confidence</h4>
              <p style={{ margin: '4px 0' }}>Confidence: <strong>{(analysis.confidence_score*100).toFixed(1)}%</strong></p>
              <div style={{ width: '100%', backgroundColor: '#ecf0f1', borderRadius: '4px', height: '8px', marginTop: '8px' }}>
                <div style={{ width: `${analysis.confidence_score * 100}%`, backgroundColor: '#3498db', height: '100%', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#2c3e50', marginBottom: '8px' }}>Analysis Summary</h4>
            <p style={{ lineHeight: '1.6', color: '#34495e' }}>{analysis.analysis_summary}</p>
          </div>

          <div>
            <h4 style={{ color: '#2c3e50', marginBottom: '8px' }}>Recommendations</h4>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6', color: '#34495e' }}>
              {analysis.recommendations.map((rec, index) => (
                <li key={index} style={{ marginBottom: '4px' }}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}