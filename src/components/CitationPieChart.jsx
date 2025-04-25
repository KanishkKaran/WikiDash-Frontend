import React, { useEffect, useState } from 'react';
import api from '../utils/api';  // Replace axios with api utility
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function CitationPieChart({ title }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCitations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await api.get(`/api/citations?title=${encodeURIComponent(title)}`);
        setData(res.data);
      } catch (err) {
        console.error('Error fetching citation data:', err);
        setError('Failed to load citation data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCitations();
  }, [title]);

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Citation Sources</h2>
        <div className="animate-pulse flex justify-center">
          <div className="bg-gray-200 rounded-full h-64 w-64"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Citation Sources</h2>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.domain_breakdown || Object.keys(data.domain_breakdown).length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Citation Sources</h2>
        <div className="flex flex-col items-center justify-center text-gray-500 py-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No citation data available for this article</p>
        </div>
      </div>
    );
  }

  const entries = Object.entries(data.domain_breakdown);
  const sorted = entries.sort((a, b) => b[1] - a[1]);

  // Take top 5 domains, group the rest as "Other"
  const topDomains = sorted.slice(0, 5);
  const otherCount = sorted.slice(5).reduce((sum, [, count]) => sum + count, 0);

  const labels = [...topDomains.map(([domain]) => domain), ...(otherCount > 0 ? ['Other'] : [])];
  const values = [...topDomains.map(([, count]) => count), ...(otherCount > 0 ? [otherCount] : [])];

  // Professional color scheme
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#6366F1', // Indigo
    '#EC4899', // Pink
    '#9CA3AF'  // Gray for "Other"
  ];

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 5
      }
    ]
  };

  const options = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((ctx.raw / total) * 100);
            return `${ctx.label}: ${ctx.raw} (${percentage}%)`;
          }
        },
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        boxPadding: 5
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    cutout: '40%'
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Citation Sources</h2>
        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
          {data.total_refs} Total References
        </span>
      </div>
      
      <div className="relative h-72">
        <Pie data={chartData} options={options} />
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-2">What this shows:</h3>
        <p className="text-xs text-gray-500">
          This chart displays the distribution of citation sources by their top-level domains.
          A diverse range of sources indicates comprehensive research, while a concentration may suggest reliance on specific publishers.
        </p>
      </div>
    </div>
  );
}

export default CitationPieChart;