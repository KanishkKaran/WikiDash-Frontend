import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function UserEditProfileChart({ username, title, selectedEditor, onEditorSelect, topEditors = [] }) {
  const [data, setData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUsername, setCurrentUsername] = useState(username || selectedEditor);
  const [availableEditors, setAvailableEditors] = useState(topEditors);

  useEffect(() => {
    // Fetch top editors if not provided
    const fetchTopEditors = async () => {
      if (!topEditors || topEditors.length === 0) {
        try {
          console.log("Fetching top editors for:", title);
          const response = await api.get(`/api/editors?title=${encodeURIComponent(title)}`);
          console.log("Top editors response:", response.data);
          
          const editorsData = Array.isArray(response.data) 
            ? response.data 
            : (response.data.editors || []);
            
          setAvailableEditors(editorsData.slice(0, 10));
          
          // If no username is provided, use the top editor
          if (!currentUsername && editorsData.length > 0) {
            setCurrentUsername(editorsData[0].user);
            if (onEditorSelect) {
              onEditorSelect(editorsData[0].user);
            }
          }
        } catch (err) {
          console.error('Error fetching top editors:', err);
          setError('Failed to load editor data');
        }
      } else {
        setAvailableEditors(topEditors);
      }
    };
    
    fetchTopEditors();
  }, [title, topEditors, currentUsername, onEditorSelect]);

  // Update current username when props change
  useEffect(() => {
    if (username || selectedEditor) {
      setCurrentUsername(username || selectedEditor);
    }
  }, [username, selectedEditor]);

  useEffect(() => {
    // Only proceed if we have a selected username
    if (!currentUsername) {
      setLoading(false);
      return;
    }
    
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Fetching profile for user:", currentUsername);
        
        // Fetch both contributions and risk assessment
        const [userContribsResponse, riskResponse] = await Promise.all([
          api.get(`/api/user/${encodeURIComponent(currentUsername)}/contributions`),
          api.get(`/api/user/${encodeURIComponent(currentUsername)}/risk-assessment?title=${encodeURIComponent(title)}`)
        ]);
        
        console.log("User contributions:", userContribsResponse.data);
        console.log("Risk assessment:", riskResponse.data);
        
        // Process contributions data
        if (!userContribsResponse.data || !Array.isArray(userContribsResponse.data.contributions)) {
          throw new Error('Invalid response format from API');
        }
        
        const contributions = userContribsResponse.data.contributions;
        const sortedContributions = [...contributions].sort((a, b) => b.edits - a.edits);
        const topContributions = sortedContributions.slice(0, 8);
        
        if (sortedContributions.length > 8) {
          const otherEdits = sortedContributions.slice(8).reduce((sum, article) => sum + article.edits, 0);
          if (otherEdits > 0) {
            topContributions.push({ title: "Other articles", edits: otherEdits });
          }
        }
        
        const totalEdits = userContribsResponse.data.total_edits || 
                          sortedContributions.reduce((sum, article) => sum + article.edits, 0);
        
        setData({
          articles: topContributions.map(article => article.title),
          edits: topContributions.map(article => article.edits),
          total: totalEdits,
          articleCount: sortedContributions.length
        });

        // Set risk assessment data
        setRiskData(riskResponse.data);
        
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please ensure the API is configured correctly.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUsername, title]);

  const handleEditorChange = (selectedUser) => {
    setCurrentUsername(selectedUser);
    if (onEditorSelect) {
      onEditorSelect(selectedUser);
    }
  };

  const getRiskLevel = (risk) => {
    if (risk >= 70) return { level: 'High', color: 'text-red-600 bg-red-50' };
    if (risk >= 40) return { level: 'Medium', color: 'text-amber-600 bg-amber-50' };
    return { level: 'Low', color: 'text-green-600 bg-green-50' };
  };

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

  if (!currentUsername || availableEditors.length === 0) {
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
  const getColorForTopic = (topic) => {
    const topicLower = topic.toLowerCase();
    if (topicLower.includes('artificial intelligence') || topicLower.includes('ai')) return '#3B82F6';
    if (topicLower.includes('machine learning')) return '#EC4899';
    if (topicLower.includes('deep learning')) return '#6366F1';
    if (topicLower.includes('natural language') || topicLower.includes('nlp')) return '#8B5CF6';
    if (topicLower.includes('computational linguistics')) return '#F59E0B';
    if (topicLower.includes('india') || topicLower.includes('pakistan')) return '#10B981';
    if (topicLower.includes('other')) return '#9CA3AF';
    
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

  // Calculate diversity
  const calculateDiversity = () => {
    const totalEdits = data.edits.reduce((sum, count) => sum + count, 0);
    const probabilities = data.edits.map(count => count / totalEdits);
    const entropy = -probabilities.reduce((sum, p) => sum + (p > 0 ? p * Math.log2(p) : 0), 0);
    const maxEntropy = Math.log2(probabilities.length);
    return maxEntropy > 0 ? entropy / maxEntropy : 0;
  };
  
  const diversity = calculateDiversity();
  
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
            value={currentUsername}
            onChange={(e) => handleEditorChange(e.target.value)}
            className="text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            {availableEditors.map(editor => (
              <option key={editor.user || editor.username} value={editor.user || editor.username}>
                {editor.user || editor.username}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex gap-4 flex-col lg:flex-row">
        <div className="lg:w-1/3">
          <div className="grid grid-cols-1 gap-4 h-full">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500">Username</p>
              <p className="text-lg font-bold text-gray-800 truncate">
                {currentUsername}
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

            {/* Risk Assessment Section */}
            {riskData && (
              <>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500">Account Age</p>
                  <p className="text-lg font-bold text-gray-800">
                    {riskData.accountAge || 'Unknown'}
                  </p>
                  {riskData.registrationDate && riskData.registrationDate !== 'Unknown' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Created {riskData.registrationDate}
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500">Risk Level</p>
                  <div className="flex items-center mt-1">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getRiskLevel(riskData.overallRisk).color}`}>
                      {getRiskLevel(riskData.overallRisk).level} Risk
                    </span>
                    <span className="ml-2 text-sm text-gray-600">
                      ({riskData.overallRisk}/100)
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg p-4 relative h-80 mb-4">
            <Pie data={chartData} options={chartOptions} />
          </div>

          {/* Risk Assessment Details */}
          {riskData && riskData.alerts && riskData.alerts.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h4 className="font-medium text-slate-800 mb-2">Security Alerts</h4>
              <div className="space-y-1">
                {riskData.alerts.map((alert, index) => (
                  <div key={index} className="text-sm text-slate-600">
                    • {alert}
                  </div>
                ))}
              </div>
            </div>
          )}
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
