import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function UserEditProfileChart({ username, title }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUsername, setSelectedUsername] = useState(username);
  const [topEditors, setTopEditors] = useState([]);

  useEffect(() => {
    // Fetch top editors first if no specific username is provided
    const fetchTopEditors = async () => {
      try {
        const response = await api.get(`/api/editors?title=${encodeURIComponent(title)}`);
        const editorsData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.editors || []);
          
        setTopEditors(editorsData.slice(0, 10));
        
        // If no username is provided, use the top editor
        if (!username && editorsData.length > 0) {
          setSelectedUsername(editorsData[0].user);
        }
      } catch (err) {
        console.error('Error fetching top editors:', err);
        setError('Failed to load editor data');
      }
    };
    
    fetchTopEditors();
  }, [title, username]);

  useEffect(() => {
    // Only proceed if we have a selected username
    if (!selectedUsername) {
      setLoading(false);
      return;
    }
    
    const fetchUserEditProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // In a real implementation, we would have an endpoint that returns 
        // all articles edited by a specific user. For this prototype, we'll
        // create mock data based on the current article and username.
        
        // First, get the actual number of edits for this user on current article
        const editorsResponse = await api.get(`/api/editors?title=${encodeURIComponent(title)}`);
        const editorsData = Array.isArray(editorsResponse.data) 
          ? editorsResponse.data 
          : (editorsResponse.data.editors || []);
        
        const currentUserData = editorsData.find(editor => editor.user === selectedUsername);
        const editsOnCurrentArticle = currentUserData ? currentUserData.edits : 0;
        
        // For the prototype, we'll generate mock data for other article contributions
        // In a production environment, you would fetch this from a real API endpoint
        const relatedTopics = [
          "Artificial intelligence",
          "Natural language processing", 
          "Machine learning",
          "Neural networks",
          "Computational linguistics",
          "Transformer models",
          "Deep learning",
          "Reinforcement learning"
        ];
        
        // Generate a realistic distribution of edits across articles
        const totalEditsMock = editsOnCurrentArticle * (2 + Math.random() * 3); // Between 2-5x current article edits
        const otherArticlesData = {};
        
        // Add current article
        otherArticlesData[title] = editsOnCurrentArticle;
        
        // Distribute remaining edits among other topics
        let remainingEdits = totalEditsMock - editsOnCurrentArticle;
        
        // Select a random subset of topics (between 3-6)
        const numTopics = Math.floor(Math.random() * 4) + 3;
        // For deterministic generation for the prototype
        // In a real implementation, you would fetch real data
        const selectedTopics = [...relatedTopics]
          .sort((a, b) => a.localeCompare(b))
          .slice(0, numTopics);
          
        // Distribute remaining edits with a power law distribution (some articles get more attention)
        const weights = [];
        for (let i = 0; i < numTopics; i++) {
          weights.push(1 / (i + 1)); // Decreasing weights
        }
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        
        selectedTopics.forEach((topic, i) => {
          const editsForTopic = Math.round(remainingEdits * (weights[i] / totalWeight));
          otherArticlesData[topic] = editsForTopic;
        });
        
        // Sort by number of edits
        const sortedData = Object.entries(otherArticlesData)
          .sort((a, b) => b[1] - a[1]);
          
        setData({
          articles: sortedData.map(([name]) => name),
          edits: sortedData.map(([, count]) => count),
          total: Object.values(otherArticlesData).reduce((sum, count) => sum + count, 0)
        });
      } catch (err) {
        console.error('Error generating user edit profile:', err);
        setError('Failed to load user edit profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserEditProfile();
  }, [selectedUsername, title]);

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Editor Profile</h2>
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded mb-4 w-1/2"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Editor Profile</h2>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!selectedUsername || topEditors.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Editor Profile</h2>
        <div className="flex flex-col items-center justify-center text-gray-500 py-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p>No editor data available for this article</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Editor Profile</h2>
        <div className="flex flex-col items-center justify-center text-gray-500 py-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No edit profile data available for this editor</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: data.articles,
    datasets: [
      {
        data: data.edits,
        backgroundColor: [
          '#3B82F6', // Blue
          '#10B981', // Green
          '#F59E0B', // Amber
          '#6366F1', // Indigo
          '#EC4899', // Pink
          '#8B5CF6', // Purple
          '#F97316', // Orange
          '#06B6D4', // Cyan
          '#9CA3AF'  // Gray
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 5
      }
    ]
  };

  // Chart options
  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 10,
          font: {
            size: 10,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const percentage = Math.round((ctx.raw / data.total) * 100);
            return `${ctx.label}: ${ctx.raw} edits (${percentage}%)`;
          }
        },
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        padding: 12
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    cutout: '40%'
  };

  // Calculate number of articles edited
  const articleCount = data.articles.length;
  
  // Calculate how diverse the edit profile is
  // Using normalized entropy of edit distribution
  const calculateDiversity = () => {
    const totalEdits = data.edits.reduce((sum, count) => sum + count, 0);
    const probabilities = data.edits.map(count => count / totalEdits);
    const entropy = -probabilities.reduce((sum, p) => sum + (p > 0 ? p * Math.log2(p) : 0), 0);
    // Normalize by max entropy (uniform distribution)
    const maxEntropy = Math.log2(probabilities.length);
    return maxEntropy > 0 ? entropy / maxEntropy : 0;
  };
  
  const diversity = calculateDiversity();
  
  // Convert diversity to a descriptive level
  const getDiversityLevel = (score) => {
    if (score < 0.3) return 'Very Specialized';
    if (score < 0.5) return 'Specialized';
    if (score < 0.7) return 'Balanced';
    if (score < 0.9) return 'Diverse';
    return 'Very Diverse';
  };
  
  const diversityLevel = getDiversityLevel(diversity);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Editor Profile</h2>
          <p className="text-sm text-gray-500 mt-1">Articles edited by this contributor</p>
        </div>
        <div>
          <select 
            value={selectedUsername}
            onChange={(e) => setSelectedUsername(e.target.value)}
            className="text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            {topEditors.map(editor => (
              <option key={editor.user} value={editor.user}>
                {editor.user}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex gap-4 flex-col md:flex-row">
        <div className="md:w-1/3">
          <div className="grid grid-cols-1 gap-4 h-full">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500">Username</p>
              <p className="text-lg font-bold text-gray-800 truncate">
                {selectedUsername}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500">Total Edits</p>
              <p className="text-lg font-bold text-gray-800">
                {data.total.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500">Articles Edited</p>
              <p className="text-lg font-bold text-gray-800">
                {articleCount}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500">Edit Profile</p>
              <p className="text-lg font-bold text-gray-800">
                {diversityLevel}
              </p>
              <div className="mt-2 bg-gray-200 h-2 rounded-full">
                <div 
                  className="bg-indigo-500 h-2 rounded-full" 
                  style={{ width: `${Math.round(diversity * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        <div className="md:w-2/3 bg-white rounded-lg p-4 relative h-80">
          <Pie data={chartData} options={chartOptions} />
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
        This analysis shows the distribution of edits across different Wikipedia articles for this editor.
        {' '}
        {diversityLevel === 'Very Specialized' || diversityLevel === 'Specialized' ? 
          'This editor tends to focus on a narrow range of topics.' : 
          diversityLevel === 'Balanced' ? 
          'This editor contributes to a moderate range of topics.' :
          'This editor contributes to a wide range of different topics.'}
        {' '}
        Note: For this prototype, some data is simulated based on actual editor activity.
      </div>
    </div>
  );
}

export default UserEditProfileChart;
