import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const UserAccountAnalysis = ({ title }) => {
  const [accountData, setAccountData] = useState({
    newUsers: [],
    blockedUsers: [],
    accountAges: [],
    anonymousCount: 0,
    totalEditors: 0,
    loading: true
  });
  const [expandedSections, setExpandedSections] = useState({
    newUsers: false,
    blockedUsers: false,
    accountAges: false
  });
  const [userEdits, setUserEdits] = useState({});

  useEffect(() => {
    const fetchUserAccountData = async () => {
      try {
        const response = await api.get(`/api/user-account-analysis?title=${encodeURIComponent(title)}`);
        setAccountData(response.data);
      } catch (error) {
        console.error('Error fetching user account data:', error);
        setAccountData(prev => ({ ...prev, loading: false }));
      }
    };

    if (title) {
      fetchUserAccountData();
    }
  }, [title]);

  const fetchUserEdits = async (username) => {
    if (userEdits[username]) return; // Already fetched
    
    try {
      // Fetch user's recent edits on this specific article
      const response = await api.get(`/api/user/${encodeURIComponent(username)}/contributions`);
      if (response.data && response.data.contributions) {
        // Find edits for the current article
        const articleEdits = response.data.contributions.find(
          contrib => contrib.title === title
        );
        setUserEdits(prev => ({
          ...prev,
          [username]: articleEdits || { title, edits: 0, recent_edits: [] }
        }));
      }
    } catch (error) {
      console.error(`Error fetching edits for ${username}:`, error);
    }
  };

  const formatCreationDate = (days) => {
    if (days < 1) return 'Today';
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getAccountAgeLabel = (days) => {
    if (days < 1) return 'Created today';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleUserClick = async (username) => {
    await fetchUserEdits(username);
  };

  if (accountData.loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-slate-800">{accountData.totalEditors}</div>
          <div className="text-xs text-slate-500">Total Editors</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center border border-red-100">
          <div className="text-2xl font-bold text-red-600">{accountData.newUsers.length}</div>
          <div className="text-xs text-red-500">New Users (&lt;30 days)</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-slate-600">{accountData.blockedUsers.length}</div>
          <div className="text-xs text-slate-500">Blocked Users</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-slate-600">{accountData.anonymousCount}</div>
          <div className="text-xs text-slate-500">Anonymous Edits</div>
        </div>
      </div>

      {/* New Users - Suspicious */}
      {accountData.newUsers.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg">
          <button
            onClick={() => toggleSection('newUsers')}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-red-100 transition-colors"
          >
            <div>
              <h4 className="font-medium text-red-800">New User Activity</h4>
              <p className="text-sm text-red-600">{accountData.newUsers.length} recently registered users</p>
            </div>
            <svg 
              className={`w-5 h-5 text-red-600 transform transition-transform ${expandedSections.newUsers ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.newUsers && (
            <div className="px-4 pb-4 space-y-2">
              {accountData.newUsers.map((user, index) => (
                <div key={index} className="bg-white rounded border border-red-200">
                  <button
                    onClick={() => handleUserClick(user.username)}
                    className="w-full p-3 text-left hover:bg-red-25 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium text-red-800">{user.username}</span>
                        <span className="text-xs text-red-600">Created {formatCreationDate(user.accountAge)}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-red-700">{user.editCount} edits</div>
                        <div className="text-xs text-red-500">{getAccountAgeLabel(user.accountAge)}</div>
                      </div>
                    </div>
                  </button>
                  
                  {userEdits[user.username] && (
                    <div className="px-3 pb-3 border-t border-red-100">
                      <div className="text-xs text-red-600 mt-2">
                        Recent edits on this article: {userEdits[user.username].edits || user.editCount}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Blocked Users */}
      {accountData.blockedUsers.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg">
          <button
            onClick={() => toggleSection('blockedUsers')}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-100 transition-colors"
          >
            <div>
              <h4 className="font-medium text-slate-800">Blocked User Edits</h4>
              <p className="text-sm text-slate-600">{accountData.blockedUsers.length} currently blocked users</p>
            </div>
            <svg 
              className={`w-5 h-5 text-slate-600 transform transition-transform ${expandedSections.blockedUsers ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.blockedUsers && (
            <div className="px-4 pb-4 space-y-2">
              {accountData.blockedUsers.map((user, index) => (
                <div key={index} className="bg-white rounded border border-slate-200">
                  <button
                    onClick={() => handleUserClick(user.username)}
                    className="w-full p-3 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-medium text-slate-800">{user.username}</span>
                        <span className="ml-2 px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs">
                          Blocked
                        </span>
                      </div>
                      <span className="text-sm text-slate-600">{user.editCount} edits</span>
                    </div>
                  </button>
                  
                  {userEdits[user.username] && (
                    <div className="px-3 pb-3 border-t border-slate-100">
                      <div className="text-xs text-slate-600 mt-2">
                        Recent edits on this article: {userEdits[user.username].edits || user.editCount}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Account Age Distribution */}
      <div className="bg-white border border-slate-200 rounded-lg">
        <button
          onClick={() => toggleSection('accountAges')}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div>
            <h4 className="font-medium text-slate-800">Account Age Distribution</h4>
            <p className="text-sm text-slate-600">All editors sorted by account age</p>
          </div>
          <svg 
            className={`w-5 h-5 text-slate-600 transform transition-transform ${expandedSections.accountAges ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {expandedSections.accountAges && (
          <div className="px-4 pb-4 space-y-2">
            {accountData.accountAges.slice(0, 8).map((user, index) => (
              <div key={index} className="bg-slate-50 rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-700">{user.username}</span>
                    <span className="text-xs text-slate-500">Created {formatCreationDate(user.accountAge)}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-600">{getAccountAgeLabel(user.accountAge)}</div>
                    <div className="text-xs text-slate-500">{user.editCount} edits</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {(accountData.newUsers.length === 0 && accountData.blockedUsers.length === 0) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-green-700 font-medium">No security concerns detected</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccountAnalysis;
