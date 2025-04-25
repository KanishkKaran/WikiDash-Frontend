import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler)

function PageviewsChart({ title }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('all') // 'all', 'month', 'week'
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    peak: { date: '', count: 0 }
  })

  useEffect(() => {
    const fetchPageviews = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const res = await axios.get(`/api/article?title=${encodeURIComponent(title)}`)
        if (res.data.pageviews && res.data.pageviews.length > 0) {
          setData(res.data.pageviews)
          
          // Calculate statistics
          const viewCounts = res.data.pageviews.map(d => d.views)
          const total = viewCounts.reduce((a, b) => a + b, 0)
          const average = Math.round(total / viewCounts.length)
          const peakIndex = viewCounts.indexOf(Math.max(...viewCounts))
          
          setStats({
            total,
            average,
            peak: {
              date: res.data.pageviews[peakIndex].date,
              count: res.data.pageviews[peakIndex].views
            }
          })
        } else {
          setData([])
        }
      } catch (err) {
        console.error('Error fetching pageviews:', err)
        setError('Failed to load pageview data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchPageviews()
  }, [title])

  const filterDataByTimeRange = (data) => {
    if (!data || !data.length) return []
    
    if (timeRange === 'all') return data
    
    const now = new Date()
    const daysToShow = timeRange === 'week' ? 7 : 30
    const cutoff = new Date(now.setDate(now.getDate() - daysToShow))
    
    return data.filter(item => new Date(item.date) >= cutoff)
  }

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Pageviews Over Time</h2>
        <div className="animate-pulse h-80 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Pageviews Over Time</h2>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Pageviews Over Time</h2>
        <div className="flex flex-col items-center justify-center text-gray-500 py-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>No pageview data available for this article</p>
        </div>
      </div>
    )
  }

  const filteredData = filterDataByTimeRange(data)
  const labels = filteredData.map(d => d.date)
  const views = filteredData.map(d => d.views)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Daily Pageviews',
        data: views,
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3B82F6',
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#FFFFFF',
        pointRadius: (ctx) => {
          // Show points only for highest and lowest values, or if there are few data points
          const count = ctx.chart.data.labels.length;
          if (count <= 10) return 3;
          
          const value = ctx.raw;
          const dataArr = ctx.chart.data.datasets[0].data;
          const max = Math.max(...dataArr);
          const min = Math.min(...dataArr);
          
          return value === max || value === min ? 4 : 0;
        },
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#3B82F6',
        pointHoverBorderColor: '#FFFFFF',
        pointHoverBorderWidth: 2
      }
    ]
  };

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
          label: ctx => `${ctx.raw.toLocaleString()} pageviews`
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
          callback: function(val, index) {
            // Show fewer x-axis labels for readability
            const labelCount = this.getLabelForValue(val).length;
            return index % Math.ceil(labelCount / 15) === 0 ? this.getLabelForValue(val) : '';
          },
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
          color: '#6B7280',
          font: {
            size: 11
          },
          callback: function(val) {
            return val >= 1000 ? `${(val/1000).toFixed(1)}k` : val;
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
        <h2 className="text-lg font-semibold text-gray-800">Pageviews</h2>
        <div className="flex space-x-1 text-xs">
          <button 
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 rounded-full ${
              timeRange === 'week' 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            7 Days
          </button>
          <button 
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 rounded-full ${
              timeRange === 'month' 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            30 Days
          </button>
          <button 
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1 rounded-full ${
              timeRange === 'all' 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Total Views</p>
          <p className="text-xl font-bold text-gray-800">
            {stats.total.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Daily Average</p>
          <p className="text-xl font-bold text-gray-800">
            {stats.average.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Peak Day</p>
          <p className="text-xl font-bold text-gray-800">
            {stats.peak.count.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">{new Date(stats.peak.date).toLocaleDateString()}</p>
        </div>
      </div>
      
      <div className="h-72">
        <Line data={chartData} options={options} />
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
        This chart shows the daily pageview count for the article. Higher values indicate increased reader interest.
      </div>
    </div>
  )
}

export default PageviewsChart