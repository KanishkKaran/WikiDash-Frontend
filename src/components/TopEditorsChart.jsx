import React, { useEffect, useState } from 'react'
import api from '../utils/api'  // Replace axios with api utility
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

function TopEditorsChart({ title, onSelectEditor }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchEditors = async () => {
      if (!title) return
      
      setLoading(true)
      setError(null)
      
      try {
        console.log("Fetching top editors for:", title);
        const res = await api.get(`/api/editors?title=${encodeURIComponent(title)}`);
        console.log("API response:", res.data);
        
        // Fixed: Properly handle API response and extract editors array
        const editorsData = Array.isArray(res.data) ? 
          res.data : 
          (res.data.editors || []);
        
        console.log("Processed editors data:", editorsData);
        setData(editorsData)
      } catch (err) {
        console.error('Error fetching editors data:', err)
        setError('Failed to load editor data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchEditors()
  }, [title])

  // Handle bar click to select an editor
  const handleBarClick = (event, elements) => {
    if (!elements.length || !data) return;
    const clickedBarIndex = elements[0].index;
    const selectedEditor = data[clickedBarIndex].user;
    
    // Call the parent handler with the selected editor
    if (onSelectEditor && selectedEditor) {
      onSelectEditor(selectedEditor);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Contributors</h2>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Contributors</h2>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Contributors</h2>
        <div className="flex flex-col items-center justify-center text-gray-500 py-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p>No editor data found for this article</p>
        </div>
      </div>
    )
  }

  // Limit to top 7 editors for better visualization
  const topEditors = data.slice(0, 7)
  
  const labels = topEditors.map(d => {
    // Truncate long usernames
    const name = d.user
    return name.length > 15 ? name.substring(0, 12) + '...' : name
  })
  
  const edits = topEditors.map(d => d.edits)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Number of Edits',
        data: edits,
        backgroundColor: '#3B82F6',
        hoverBackgroundColor: '#2563EB',
        borderRadius: 6,
        maxBarThickness: 40
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: ctx => `${ctx.raw} edits (${((ctx.raw / topEditors.reduce((sum, editor) => sum + editor.edits, 0)) * 100).toFixed(1)}%)`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#4B5563',
          font: { size: 12 }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(243, 244, 246, 1)'
        },
        ticks: {
          precision: 0,
          color: '#4B5563',
          font: { size: 12 }
        }
      }
    },
    onClick: handleBarClick
  }

  // Calculate total edits across all editors (not just top 7)
  const totalEdits = data.reduce((sum, editor) => sum + editor.edits, 0)
  
  // Calculate percentage of edits made by top editors
  const topEditorsContribution = (topEditors.reduce((sum, editor) => sum + editor.edits, 0) / totalEdits) * 100
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Top Contributors</h2>
        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
          {data.length} Total Editors
        </span>
      </div>
      
      <div className="h-72">
        <Bar data={chartData} options={options} />
      </div>
      
      <div className="text-center mt-3 mb-2">
        <p className="text-xs text-indigo-600">Click on any bar to see the editor's profile below</p>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          The top {topEditors.length} editors made {topEditorsContribution.toFixed(1)}% of all edits to this article.
          {topEditorsContribution > 80 && ' This high concentration suggests the article is maintained by a small group of dedicated editors.'}
          {topEditorsContribution < 40 && ' This distribution suggests a diverse community of contributors.'}
        </p>
      </div>
    </div>
  )
}

export default TopEditorsChart
