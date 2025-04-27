import React, { useEffect, useState } from 'react'
import api from '../utils/api'  // Replace axios with api utility
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import dayjs from 'dayjs'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler)

function EditTimelineChart({ title }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('month') // 'week', 'month', 'year', 'all'

  useEffect(() => {
    const fetchEditTimeline = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const res = await api.get(`/api/edit-timeline?title=${encodeURIComponent(title)}`)
        // Handle both formats: direct object or wrapped in "timeline" field
        const timelineData = res.data.timeline || res.data
        setData(timelineData)
      } catch (err) {
        console.error('Error fetching edit timeline:', err)
        setError('Failed to load edit timeline data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchEditTimeline()
  }, [title])

  const filterDataByTimeRange = (data) => {
    if (!data || Object.keys(data).length === 0) return { labels: [], values: [] }
    
    const dates = Object.keys(data).sort()
    
    // Calculate date cutoff based on selected time range
    let cutoffDate = null
    const now = dayjs()
    
    switch (timeRange) {
      case 'week':
        cutoffDate = now.subtract(7, 'day')
        break
      case 'month':
        cutoffDate = now.subtract(30, 'day')
        break
      case 'year':
        cutoffDate = now.subtract(365, 'day')
        break
      default: // 'all'
        cutoffDate = dayjs(dates[0]).subtract(1, 'day') // Include all dates
    }
    
    // Filter dates based on cutoff
    const filteredDates = dates.filter(date => dayjs(date).isAfter(cutoffDate))
    
    // Get corresponding values
    const filteredValues = filteredDates.map(date => data[date])
    
    return { labels: filteredDates, values: filteredValues }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Activity</h2>
        <div className="animate-pulse h-80 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Activity</h2>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Activity</h2>
        <div className="flex flex-col items-center justify-center text-gray-500 py-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <p>No edit activity data available for this article</p>
        </div>
      </div>
    )
  }

  const { labels, values } = filterDataByTimeRange(data)

  // Calculate statistics
  const totalEdits = values.reduce((sum, val) => sum + val, 0)
  const averageEdits = totalEdits / values.length
  const maxEdits = Math.max(...values)
  const peakDay = labels[values.indexOf(maxEdits)]

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Edits',
        data: values,
        fill: true,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: '#F59E0B',
        tension: 0.4,
        pointBackgroundColor: '#F59E0B',
        pointBorderColor: '#FFFFFF',
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#F59E0B',
        pointHoverBorderColor: '#FFFFFF',
        pointHoverBorderWidth: 2
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
          title: (tooltipItems) => {
            const date = new Date(tooltipItems[0].label);
            return date.toLocaleDateString(undefined, {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          },
          label: ctx => `${ctx.raw} edits`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          maxTicksLimit: Math.min(10, labels.length),
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(243, 244, 246, 1)'
        },
        border: {
          dash: [2, 4]
        },
        ticks: {
          precision: 0,
          color: '#6B7280',
          font: {
            size: 11
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Edit Activity</h2>
        <div className="flex space-x-1 text-xs">
          <button 
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 rounded-full ${
              timeRange === 'week' 
                ? 'bg-amber-100 text-amber-700 font-medium' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            7 Days
          </button>
          <button 
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 rounded-full ${
              timeRange === 'month' 
                ? 'bg-amber-100 text-amber-700 font-medium' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            30 Days
          </button>
          <button 
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1 rounded-full ${
              timeRange === 'year' 
                ? 'bg-amber-100 text-amber-700 font-medium' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            1 Year
          </button>
          <button 
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1 rounded-full ${
              timeRange === 'all' 
                ? 'bg-amber-100 text-amber-700 font-medium' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Total Edits</p>
          <p className="text-xl font-bold text-gray-800">
            {totalEdits.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Daily Average</p>
          <p className="text-xl font-bold text-gray-800">
            {averageEdits.toFixed(1)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Peak Day</p>
          <p className="text-xl font-bold text-gray-800">
            {maxEdits}
          </p>
          <p className="text-xs text-gray-500">{new Date(peakDay).toLocaleDateString()}</p>
        </div>
      </div>
      
      <div className="h-72">
        <Line data={chartData} options={options} />
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
        This chart shows the edit frequency over time. Articles with consistent edits are actively maintained,
        while spikes may indicate controversial updates or news events.
      </div>
    </div>
  )
}

export default EditTimelineChart
