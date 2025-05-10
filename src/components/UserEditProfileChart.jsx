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
        console.log("Fetching top editors for:", title);
        const response = await api.get(`/api/editors?title=${encodeURIComponent(title)}`);
        console.log("Top editors response:", response.data);
        
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
        console.log("Fetching profile for user:", selectedUsername);
        
        // Fetch the actual editor's contributions from the API
        // This endpoint should return all articles edited by this user with edit counts
        const userContribsResponse = await api.get(`/api/user/${encodeURIComponent(selectedUsername)}/contributions`);
        console.log("User contributions:", userContribsResponse.data);
        
        // Process the real data from the API
        if (!userContribsResponse.data || !Array.isArray(userContribsResponse.data.contributions)) {
          throw new Error('Invalid response format from API');
        }
        
        const contributions = userContribsResponse.data.contributions;
        
        // Sort contributions by edit count (descending)
        const sortedContributions = [...contributions].sort((a, b) => b.edits - a.edits);
        
        // Take top 8 articles for better visualization (if more exist)
        const topContributions = sortedContributions.slice(0, 8);
        
        // If we have more than 8 articles, create an "Other" category for the rest
        if (sortedContributions.length > 8) {
          const otherEdits = sortedContributions.slice(8).reduce((sum, article) => sum + article.edits, 0);
          if (otherEdits > 0) {
            topContributions.push({ title: "Other articles", edits: otherEdits });
          }
        }
        
        // Calculate total edits across all articles
        const totalEdits = sortedContributions.reduce((sum, article) => sum + article.edits, 0);
        
        setData({
          articles: topContributions.map(article => article.title),
          edits: topContributions.map(article => article.edits),
          total: totalEdits,
          articleCount: sortedContributions.length
        });
        
      } catch (err) {
        console.error('Error fetching user edit profile:', err);
        setError('Failed to load user edit profile. Please ensure the API is configured correctly.');
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

  // Prepare chart data with real colors that map consistently to categories
  // This ensures similar topics always get the same color
  const getColorForTopic = (topic) => {
    const topicLower = topic.toLowerCase();
    if (topicLower.includes('artificial intelligence') || topicLower.includes('ai')) return '#3B82F6';
    if (topicLower.includes('machine learning')) return '#EC4899';
    if (topicLower.includes('deep learning')) return '#6366F1';
    if (topicLower.includes('natural language') || topicLower.includes('nlp')) return '#8B5CF6';
    if (topicLower.includes('computational linguistics')) return '#F59E0B';
    if (topicLower.includes('india') || topicLower.includes('pakistan')) return '#10B981';
    if (topicLower.includes('other')) return '#9CA3AF';
    
    // Generate deterministic color based on string hash
    const hash = topic.split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 4096, 0);
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  const chartData = {
    labels: data.articles,
    datasets: [
      {
        data: data.edits,
        backgroundColor: data.articles.map(getColorForTopic),
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
                {data.articleCount || data.articles.length}
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
        This analysis shows the actual distribution of edits across different Wikipedia articles for this editor.
        {' '}
        {diversityLevel === 'Very Specialized' || diversityLevel === 'Specialized' ? 
          'This editor tends to focus on a narrow range of topics.' : 
          diversityLevel === 'Balanced' ? 
          'This editor contributes to a moderate range of topics.' :
          'This editor contributes to a wide range of different topics.'}
      </div>
    </div>
  );
}

export default UserEditProfileChart;
