import React, { useEffect, useState } from "react";
import api from "../utils/api";  // Replace axios with api utility
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function TopRevertersChart({ title }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReverters = async () => {
      if (!title) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const res = await api.get(`/api/reverters?title=${encodeURIComponent(title)}`);
        setData(res.data);
      } catch (err) {
        console.error('Error fetching revert data:', err);
        setError('Failed to load revert activity data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReverters();
  }, [title]);

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Revert Activity</h2>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-3/4"></div>
          <div className="h-56 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Revert Activity</h2>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Revert Activity</h2>
        <div className="flex flex-col items-center justify-center text-gray-500 py-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          <p>No revert activity detected for this article</p>
          <p className="text-xs mt-2">Reverts occur when edits are undone or reversed</p>
        </div>
      </div>
    );
  }

  // Limit to top 8 editors with most reverts
  const topReverters = data.slice(0, 8);
  
  const chartData = {
    labels: topReverters.map((d) => {
      // Truncate long usernames
      const name = d.user;
      return name.length > 20 ? name.substring(0, 17) + '...' : name;
    }),
    datasets: [
      {
        label: "Reverts",
        data: topReverters.map((d) => d.reverts),
        backgroundColor: "#ef4444",
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "#fca5a5",
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: {
          weight: 'bold'
        },
        callbacks: {
          label: (context) => `${context.raw} reverts made`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          precision: 0
        }
      },
      y: {
        grid: {
          display: false
        }
      }
    }
  };

  const totalReverts = topReverters.reduce((total, editor) => total + editor.reverts, 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Revert Activity</h2>
        <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full">
          {totalReverts} Total Reverts
        </span>
      </div>
      
      <div className="h-72">
        <Bar data={chartData} options={chartOptions} />
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-2">What are reverts?</h3>
        <p className="text-xs text-gray-500">
          Reverts are edits that undo previous changes. A high number of reverts can indicate 
          content disputes or vandalism protection. This chart shows which editors performed the most reverts.
        </p>
      </div>
    </div>
  );
}

export default TopRevertersChart;