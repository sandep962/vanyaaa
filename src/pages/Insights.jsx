import React, { useEffect, useState } from 'react'
import API from '../api'
import Accordion from '../components/Accordion'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'

export default function Insights() {
  const [area, setArea] = useState('sundarbans')
  const [timeRange, setTimeRange] = useState('6months')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const insightsData = {
    sundarbans: {
      ai_report: `🌿 ForestWatch AI Analysis for Sundarbans: Moderate vegetation health with 78% NDVI score. Conservation measures recommended for Zone A & C. Recent AI analysis shows 12% improvement in biodiversity index.`,
      forecast: {
        next_6_months: "Vegetation health expected to improve 15% during migration season with proper intervention.",
        risk_factors: ["Climate change (High)", "Human activity (Medium)", "Disease outbreaks (Low)", "Habitat fragmentation (High)"],
        recommendations: ["Daily monitoring in Zone A & C", "Weekly in Zone B & D", "Community engagement", "AI-powered patrol optimization"]
      },
      population_stats: {
        total: 894, elephants: 77, tigers: 19, leopards: 16, birds: 630, others: 152
      },
      trends: [
        { month: 'Jan', elephants: 70, tigers: 18, leopards: 15, birds: 600, others: 140, ndvi: 0.72, temperature: 24, rainfall: 45 },
        { month: 'Feb', elephants: 72, tigers: 19, leopards: 16, birds: 620, others: 145, ndvi: 0.74, temperature: 26, rainfall: 38 },
        { month: 'Mar', elephants: 74, tigers: 19, leopards: 16, birds: 640, others: 150, ndvi: 0.76, temperature: 28, rainfall: 52 },
        { month: 'Apr', elephants: 76, tigers: 19, leopards: 16, birds: 660, others: 152, ndvi: 0.78, temperature: 30, rainfall: 68 },
        { month: 'May', elephants: 77, tigers: 19, leopards: 16, birds: 630, others: 152, ndvi: 0.75, temperature: 32, rainfall: 85 },
        { month: 'Jun', elephants: 78, tigers: 20, leopards: 17, birds: 650, others: 155, ndvi: 0.80, temperature: 31, rainfall: 120 }
      ],
      conservation_status: { green_zones: 2, concern_zones: 1, critical_zones: 0 },
      alerts: [
        { type: 'warning', message: 'Unusual human activity detected in Zone A. NDVI levels dropping 5%.', time: '2 hours ago', priority: 'high' },
        { type: 'info', message: 'Elephant migration pattern detected. 12 individuals moving to Zone B.', time: '4 hours ago', priority: 'medium' },
        { type: 'success', message: 'Conservation efforts in Zone C showing positive results. +8% vegetation growth.', time: '1 day ago', priority: 'low' }
      ],
      ai_insights: {
        biodiversity_score: 78,
        threat_level: 'medium',
        conservation_priority: 'high',
        predicted_growth: 12,
        ai_confidence: 89
      },
      weather_data: {
        current_temp: 28,
        humidity: 75,
        wind_speed: 12,
        air_quality: 'good'
      }
    },
    kabini: {
      ai_report: `🌿 ForestWatch AI Analysis for Kabini: High vegetation health with 92% NDVI score. Excellent wildlife population stability. AI predicts continued growth with current conservation measures.`,
      forecast: {
        next_6_months: "Stable conditions expected with 8% growth in biodiversity. Minimal disruption predicted.",
        risk_factors: ["Poaching (Low)", "Seasonal migration shifts (Medium)", "Tourism impact (Low)"],
        recommendations: ["Maintain current patrols", "Expand green zones", "Educate local communities", "Implement AI monitoring"]
      },
      population_stats: {
        total: 1023, elephants: 120, tigers: 25, leopards: 20, birds: 700, others: 158
      },
      trends: [
        { month: 'Jan', elephants: 110, tigers: 24, leopards: 19, birds: 680, others: 150, ndvi: 0.88, temperature: 22, rainfall: 35 },
        { month: 'Feb', elephants: 115, tigers: 25, leopards: 20, birds: 690, others: 155, ndvi: 0.90, temperature: 24, rainfall: 28 },
        { month: 'Mar', elephants: 118, tigers: 25, leopards: 20, birds: 700, others: 158, ndvi: 0.91, temperature: 26, rainfall: 42 },
        { month: 'Apr', elephants: 120, tigers: 25, leopards: 20, birds: 700, others: 158, ndvi: 0.92, temperature: 28, rainfall: 55 },
        { month: 'May', elephants: 120, tigers: 25, leopards: 20, birds: 700, others: 158, ndvi: 0.90, temperature: 30, rainfall: 72 },
        { month: 'Jun', elephants: 122, tigers: 26, leopards: 21, birds: 710, others: 160, ndvi: 0.94, temperature: 29, rainfall: 95 }
      ],
      conservation_status: { green_zones: 3, concern_zones: 0, critical_zones: 0 },
      alerts: [
        { type: 'success', message: 'No critical alerts. Continue routine monitoring. All systems optimal.', time: '1 hour ago', priority: 'low' },
        { type: 'info', message: 'New tiger cubs spotted in Zone A. Population growth confirmed.', time: '3 hours ago', priority: 'medium' }
      ],
      ai_insights: {
        biodiversity_score: 92,
        threat_level: 'low',
        conservation_priority: 'medium',
        predicted_growth: 8,
        ai_confidence: 95
      },
      weather_data: {
        current_temp: 26,
        humidity: 68,
        wind_speed: 8,
        air_quality: 'excellent'
      }
    }
  }

  const data = insightsData[area]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

  const pieData = [
    { name: 'Elephants', value: data.population_stats.elephants, color: '#FF6B6B' },
    { name: 'Tigers', value: data.population_stats.tigers, color: '#4ECDC4' },
    { name: 'Leopards', value: data.population_stats.leopards, color: '#45B7D1' },
    { name: 'Birds', value: data.population_stats.birds, color: '#96CEB4' },
    { name: 'Others', value: data.population_stats.others, color: '#FFEAA7' }
  ]

  const radarData = [
    { subject: 'Biodiversity', A: data.ai_insights.biodiversity_score, fullMark: 100 },
    { subject: 'Conservation', A: data.conservation_status.green_zones * 30, fullMark: 100 },
    { subject: 'Threat Level', A: data.ai_insights.threat_level === 'low' ? 20 : data.ai_insights.threat_level === 'medium' ? 50 : 80, fullMark: 100 },
    { subject: 'AI Confidence', A: data.ai_insights.ai_confidence, fullMark: 100 },
    { subject: 'Growth Rate', A: data.ai_insights.predicted_growth, fullMark: 100 }
  ]

  const getAlertIcon = (type) => {
    switch(type) {
      case 'warning': return '⚠️'
      case 'error': return '🚨'
      case 'success': return '✅'
      case 'info': return 'ℹ️'
      default: return '📢'
    }
  }

  const getAlertColor = (type) => {
    switch(type) {
      case 'warning': return '#FFF3CD'
      case 'error': return '#F8D7DA'
      case 'success': return '#D4EDDA'
      case 'info': return '#D1ECF1'
      default: return '#E2E3E5'
    }
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#DC3545'
      case 'medium': return '#FFC107'
      case 'low': return '#28A745'
      default: return '#6C757D'
    }
  }

  return (
    <>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}
      </style>
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 60%, #4facfe 100%)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background elements */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          animation: 'float 20s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '-20%',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
          animation: 'float 15s ease-in-out infinite reverse'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          left: '10%',
          width: '80%',
          height: '80%',
          background: 'radial-gradient(circle, rgba(240, 147, 251, 0.1) 0%, transparent 70%)',
          animation: 'float 25s ease-in-out infinite'
        }}></div>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '25px',
          padding: '35px',
          marginBottom: '30px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.3)',
          border: '2px solid rgba(255,255,255,0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Header gradient overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)'
          }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '2.8rem', 
                fontWeight: '800',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 4px 8px rgba(0,0,0,0.1)',
                letterSpacing: '-0.02em'
              }}>
                🌿 ForestWatch AI Insights
              </h1>
              <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '1.1rem' }}>
                Advanced Wildlife Conservation Analytics Dashboard
              </p>
            </div>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <select 
                value={area} 
                onChange={e => setArea(e.target.value)}
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: '2px solid #e0e0e0',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: 'white',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <option value='sundarbans'>🌊 Sundarbans</option>
                <option value='kabini'>🏔️ Kabini</option>
              </select>
              <select 
                value={timeRange} 
                onChange={e => setTimeRange(e.target.value)}
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: '2px solid #e0e0e0',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: 'white',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value='3months'>3 Months</option>
                <option value='6months'>6 Months</option>
                <option value='1year'>1 Year</option>
          </select>
            </div>
          </div>

          {/* AI Status Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '25px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              color: 'white',
              padding: '25px',
              borderRadius: '20px',
              textAlign: 'center',
              boxShadow: '0 15px 35px rgba(102, 126, 234, 0.3)',
              border: '1px solid rgba(255,255,255,0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                borderRadius: '50%'
              }}></div>
              <div style={{ fontSize: '2.5rem', marginBottom: '15px', position: 'relative', zIndex: 1 }}>🧠</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px', position: 'relative', zIndex: 1 }}>AI Confidence</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', position: 'relative', zIndex: 1 }}>{data.ai_insights.ai_confidence}%</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #ff6b6b 100%)',
              color: 'white',
              padding: '25px',
              borderRadius: '20px',
              textAlign: 'center',
              boxShadow: '0 15px 35px rgba(240, 147, 251, 0.3)',
              border: '1px solid rgba(255,255,255,0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                borderRadius: '50%'
              }}></div>
              <div style={{ fontSize: '2.5rem', marginBottom: '15px', position: 'relative', zIndex: 1 }}>🌱</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px', position: 'relative', zIndex: 1 }}>Biodiversity Score</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', position: 'relative', zIndex: 1 }}>{data.ai_insights.biodiversity_score}%</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #43e97b 100%)',
              color: 'white',
              padding: '25px',
              borderRadius: '20px',
              textAlign: 'center',
              boxShadow: '0 15px 35px rgba(79, 172, 254, 0.3)',
              border: '1px solid rgba(255,255,255,0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                borderRadius: '50%'
              }}></div>
              <div style={{ fontSize: '2.5rem', marginBottom: '15px', position: 'relative', zIndex: 1 }}>📈</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px', position: 'relative', zIndex: 1 }}>Predicted Growth</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', position: 'relative', zIndex: 1 }}>+{data.ai_insights.predicted_growth}%</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 50%, #4facfe 100%)',
              color: 'white',
              padding: '25px',
              borderRadius: '20px',
              textAlign: 'center',
              boxShadow: '0 15px 35px rgba(67, 233, 123, 0.3)',
              border: '1px solid rgba(255,255,255,0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                borderRadius: '50%'
              }}></div>
              <div style={{ fontSize: '2.5rem', marginBottom: '15px', position: 'relative', zIndex: 1 }}>🌡️</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px', position: 'relative', zIndex: 1 }}>Current Temp</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', position: 'relative', zIndex: 1 }}>{data.weather_data.current_temp}°C</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
          backdropFilter: 'blur(15px)',
          borderRadius: '20px',
          padding: '15px',
          marginBottom: '30px',
          display: 'flex',
          gap: '15px',
          boxShadow: '0 15px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.2)',
          border: '2px solid rgba(255,255,255,0.3)'
        }}>
          {['overview', 'analytics', 'predictions', 'alerts'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '18px 35px',
                borderRadius: '15px',
                border: 'none',
                background: activeTab === tab ? 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' : 'transparent',
                color: activeTab === tab ? 'white' : '#666',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                textTransform: 'capitalize',
                boxShadow: activeTab === tab ? '0 8px 25px rgba(102, 126, 234, 0.3)' : 'none',
                transform: activeTab === tab ? 'translateY(-2px)' : 'translateY(0)',
                fontSize: '1rem'
              }}
            >
              {tab === 'overview' && '📊 Overview'}
              {tab === 'analytics' && '📈 Analytics'}
              {tab === 'predictions' && '🔮 Predictions'}
              {tab === 'alerts' && '🚨 Alerts'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
            {/* Population Trends Chart */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '25px',
              padding: '35px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.3)',
              border: '2px solid rgba(255,255,255,0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Chart gradient overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)'
              }}></div>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', fontWeight: '700' }}>📊 Wildlife Population Trends</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255,255,255,0.95)',
                      border: 'none',
                      borderRadius: '10px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="elephants" stackId="1" stroke="#FF6B6B" fill="#FF6B6B" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="tigers" stackId="1" stroke="#4ECDC4" fill="#4ECDC4" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="leopards" stackId="1" stroke="#45B7D1" fill="#45B7D1" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="birds" stackId="1" stroke="#96CEB4" fill="#96CEB4" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="others" stackId="1" stroke="#FFEAA7" fill="#FFEAA7" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Population Distribution */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '25px',
              padding: '35px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.3)',
              border: '2px solid rgba(255,255,255,0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Chart gradient overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #f093fb 0%, #f5576c 25%, #ff6b6b 50%, #4facfe 75%, #00f2fe 100%)'
              }}></div>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', fontWeight: '700' }}>🐾 Species Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            {/* NDVI Trends */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              padding: '30px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', fontWeight: '700' }}>🌱 NDVI Health Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
            <Tooltip />
                  <Line type="monotone" dataKey="ndvi" stroke="#00C49F" strokeWidth={3} dot={{ fill: '#00C49F', strokeWidth: 2, r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
            </div>

            {/* AI Performance Radar */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              padding: '30px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', fontWeight: '700' }}>🎯 AI Performance Metrics</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Performance" dataKey="A" stroke="#667eea" fill="#667eea" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'predictions' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 30px 0', fontSize: '1.5rem', fontWeight: '700' }}>🔮 AI Predictions & Forecasts</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '25px',
                borderRadius: '15px'
              }}>
                <h4 style={{ margin: '0 0 15px 0', fontSize: '1.2rem' }}>🌿 Conservation Forecast</h4>
                <p style={{ margin: '0 0 10px 0', opacity: 0.9 }}>{data.forecast.next_6_months}</p>
                <div style={{ marginTop: '15px' }}>
                  <strong>Risk Factors:</strong>
                  <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
                    {data.forecast.risk_factors.map((risk, i) => (
                      <li key={i} style={{ marginBottom: '5px' }}>{risk}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                padding: '25px',
                borderRadius: '15px'
              }}>
                <h4 style={{ margin: '0 0 15px 0', fontSize: '1.2rem' }}>📋 AI Recommendations</h4>
                <ul style={{ margin: '0', paddingLeft: '20px' }}>
                  {data.forecast.recommendations.map((rec, i) => (
                    <li key={i} style={{ marginBottom: '8px' }}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 30px 0', fontSize: '1.5rem', fontWeight: '700' }}>🚨 Real-time Alerts & Notifications</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {data.alerts.map((alert, i) => (
                <div key={i} style={{
                  background: getAlertColor(alert.type),
                  padding: '20px',
                  borderRadius: '15px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}>
                  <div style={{ fontSize: '2rem' }}>{getAlertIcon(alert.type)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', marginBottom: '5px' }}>{alert.message}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>{alert.time}</div>
                  </div>
                  <div style={{
                    background: getPriorityColor(alert.priority),
                    color: 'white',
                    padding: '5px 15px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {alert.priority}
                  </div>
            </div>
          ))}
        </div>
          </div>
        )}

        {/* Conservation Status */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '30px',
          marginTop: '30px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', fontWeight: '700' }}>🗺️ Conservation Status Zones</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: 'white',
              padding: '25px',
              borderRadius: '15px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🟩</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{data.conservation_status.green_zones}</div>
              <div style={{ fontSize: '1rem', opacity: 0.9 }}>Green Zones</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
              color: '#8B4513',
              padding: '25px',
              borderRadius: '15px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🟨</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{data.conservation_status.concern_zones}</div>
              <div style={{ fontSize: '1rem', opacity: 0.9 }}>Concern Zones</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
              color: '#8B0000',
              padding: '25px',
              borderRadius: '15px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🟥</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{data.conservation_status.critical_zones}</div>
              <div style={{ fontSize: '1rem', opacity: 0.9 }}>Critical Zones</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
