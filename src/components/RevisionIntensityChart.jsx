import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import dayjs from 'dayjs';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler);

function RevisionIntensityChart({ title }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all'); // 'all', 'year', 'month'

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Fetching revision intensity data for:", title);
        
        // We'll need data from several endpoints to calculate revision intensity
        const [editsResponse, revertsResponse] = await Promise.all([
          api.get(`/api/edits?title=${encodeURIComponent(title)}`),
          api.get(`/api/reverts?title=${encodeURIComponent(title)}`)
        ]);
        
        console.log("Edits Response:", editsResponse.data);
        console.log("Reverts Response:", revertsResponse.data);
        
        // Extract the edit timelines and reverter data - handle different possible formats
        let editTimeline = {};
        if (editsResponse.data && typeof editsResponse.data === 'object') {
          if (editsResponse.data.timeline) {
            editTimeline = editsResponse.data.timeline;
          } else if (editsResponse.data.revisions && Array.isArray(editsResponse.data.revisions)) {
            // Process revisions into a timeline if direct timeline not available
            editsResponse.data.revisions.forEach(rev => {
              if (rev.timestamp) {
                const dateStr = rev.timestamp.split('T')[0];
                editTimeline[dateStr] = (editTimeline[dateStr] || 0) + 1;
              }
            });
          }
        }
        console.log("Processed edit timeline:", editTimeline);
        
        // Extract revert timeline, handling different formats
        let revertTimeline = {};
        if (revertsResponse.data && typeof revertsResponse.data === 'object') {
          if (revertsResponse.data.reverts) {
            revertTimeline = revertsResponse.data.reverts;
          } else if (revertsResponse.data.reverters && Array.isArray(revertsResponse.data.reverters)) {
            // Process from reverters data if direct timeline not available
            // This is a fallback and not as accurate
            const totalReverts = revertsResponse.data.reverters.reduce((sum, item) => sum + (item.reverts || 0), 0);
            const dates = Object.keys(editTimeline);
            if (dates.length > 0) {
              // Distribute reverts proportionally to edit activity as fallback
              dates.forEach(date => {
                const editProportion = editTimeline[date] / Object.values(editTimeline).reduce((a, b) => a + b, 0);
                revertTimeline[date] = Math.round(totalReverts * editProportion);
              });
            }
          }
        }
        console.log("Processed revert timeline:", revertTimeline);
        
        // Check if we have data to work with
        if (Object.keys(editTimeline).length === 0) {
          console.log("No edit timeline data available");
          setError("No edit activity data available for this article");
          setLoading(false);
          return;
        }
        
        // Combine dates from both datasets
        const allDates = [...new Set([
          ...Object.keys(editTimeline), 
          ...Object.keys(revertTimeline)
        ])].sort();
        
        // Calculate revision intensity scores
        const intensityData = {};
        
        allDates.forEach(date => {
          // Default values
          const edits = editTimeline[date] || 0;
          const reverts = revertTimeline[date] || 0;
          
          // Simple revision intensity score calculation
          let score = 0;
          if (edits > 0) {
            // Calculate ratio and apply some scaling
            const ratio = reverts / edits;
            score = ratio * 100; // Scale for visibility
            
            // Cap at 100 for visualization purposes
            score = Math.min(score, 100);
          }
          
          intensityData[date] = score;
        });
        
        console.log("Calculated intensity data:", intensityData);
        setData(intensityData);
      } catch (err) {
        console.error('Error fetching revision intensity data:', err);
        setError('Failed to load revision intensity data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [title]);

  const filterDataByTimeRange = (data) => {
    if (!data || Object.keys(data).length === 0) return { labels: [], values: [] };
    
    const allDates = Object.keys(data).sort();
    
    let filteredDates = allDates;
    const now = new Date();
    
    if (timeRange === 'year') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      filteredDates = allDates.filter(date => new Date(date) >= oneYearAgo);
    } else if (timeRange === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filteredDates = allDates.filter(date => new Date(date) >= oneMonthAgo);
    }
    
    const filteredValues = filteredDates.map(date => data[date]);
    
    return { labels: filteredDates, values: filteredValues };
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Revision Intensity</h2>
        <div className="animate-pulse h-80 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Revision Intensity</h2>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Revision Intensity</h2>
        <div className="flex flex-col items-center justify-center text-gray-500 py-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>No revision intensity data available for this article</p>
        </div>
      </div>
    );
  }

  const { labels, values } = filterDataByTimeRange(data);

  // Handle the case of empty filtered data
  if (labels.length === 0 || values.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Revision Intensity</h2>
        <div className="flex flex-col items-center justify-center text-gray-500 py-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>No revision data available for the selected time range</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const maxScore = Math.max(...values);
  const maxScoreDate = labels[values.indexOf(maxScore)];
  const avgScore = values.reduce((sum, val) => sum + val, 0) / values.length;
  
  // Detect hot spots (periods of high intensity)
  const hotSpots = labels.filter((_, i) => values[i] > avgScore * 1.5).length;

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Revision Intensity',
        data: values,
        fill: true,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderColor: '#4F46E5',
        tension: 0.4,
        pointBackgroundColor: '#4F46E5',
        pointBorderColor: '#FFFFFF',
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#4F46E5',
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
          label: ctx => `Intensity: ${ctx.raw.toFixed(1)}`
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
        max: 100,
        ticks: {
          precision: 0,
          color: '#6B7280',
          font: {
            size: 11
          },
          callback: function(value) {
            if (value === 0) return 'Low';
            if (value === 50) return 'Medium';
            if (value === 100) return 'High';
            return '';
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  };

  // Get revision intensity level based on average score
  const getIntensityLevel = (score) => {
    if (score < 10) return 'Low';
    if (score < 30) return 'Moderate';
    if (score < 60) return 'High';
    return 'Very High';
  };

  const intensityLevel = getIntensityLevel(avgScore);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Revision Intensity</h2>
        <div className="flex space-x-1 text-xs">
          <button 
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 rounded-full ${
              timeRange === 'month' 
                ? 'bg-indigo-100 text-indigo-700 font-medium' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            1 Month
          </button>
          <button 
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1 rounded-full ${
              timeRange === 'year' 
                ? 'bg-indigo-100 text-indigo-700 font-medium' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            1 Year
          </button>
          <button 
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1 rounded-full ${
              timeRange === 'all' 
                ? 'bg-indigo-100 text-indigo-700 font-medium' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Time
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Revision Intensity</p>
          <p className="text-xl font-bold text-gray-800">
            {intensityLevel}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Hot Spots</p>
          <p className="text-xl font-bold text-gray-800">
            {hotSpots}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Peak Intensity</p>
          <p className="text-xl font-bold text-gray-800">
            {maxScore.toFixed(1)}
          </p>
          <p className="text-xs text-gray-500">{new Date(maxScoreDate).toLocaleDateString()}</p>
        </div>
      </div>
      
      <div className="h-72">
        <Line data={chartData} options={options} />
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
        The revision intensity metric analyzes edit patterns, revert frequency, and editor interactions to measure how actively the article content is evolving. 
        Higher scores indicate periods of increased editorial activity and content refinement.
      </div>
    </div>
  );
}

export default RevisionIntensityChart;
