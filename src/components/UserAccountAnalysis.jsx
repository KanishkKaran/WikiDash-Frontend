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
  const [expandedUsers, setExpandedUsers] = useState({});
  const [loadingUsers, setLoadingUsers] = useState({});
  
  // New state for managing pagination and edit details
  const [showMoreStates, setShowMoreStates] = useState({
    newUsers: 10,
    blockedUsers: 10,
    accountAges: 8
  });
  const [expandedEditDetails, setExpandedEditDetails] = useState({});
  const [showAllEdits, setShowAllEdits] = useState({});

  useEffect(() => {
    const fetchUserAccountData = async () => {
      try {
        const response = await api.get(`/api/user-account-analysis?title=${encodeURIComponent(title)}`);
        setAccountData(response.data);
        
        console.log('User Account Data Response:', response.data);
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
    if (userEdits[username]) {
      console.log(`Already cached edits for ${username}`);
      return userEdits[username];
    }
    
    setLoadingUsers(prev => ({ ...prev, [username]: true }));
    
    try {
      const apiUrl = `/api/user/${encodeURIComponent(username)}/article-edits?title=${encodeURIComponent(title)}`;
      console.log(`\nFetching edits for user: ${username}`);
      
      const response = await api.get(apiUrl);
      
      if (response.data && response.data.edits) {
        const editData = {
          username: username,
          edits: response.data.edits || [],
          totalEdits: response.data.totalEdits || 0,
          lastEdit: response.data.lastEdit || null,
          accountCreated: response.data.accountCreated || null,
          fetchedAt: new Date().toISOString()
        };
        
        setUserEdits(prev => ({
          ...prev,
          [username]: editData
        }));
        
        setLoadingUsers(prev => ({ ...prev, [username]: false }));
        return editData;
      }
    } catch (error) {
      console.error(`Error for ${username}:`, error);
      
      const emptyEditData = {
        username: username,
        totalEdits: 0,
        edits: [],
        error: true,
        errorDetails: error.message,
        fetchedAt: new Date().toISOString()
      };
      setUserEdits(prev => ({
        ...prev,
        [username]: emptyEditData
      }));
      setLoadingUsers(prev => ({ ...prev, [username]: false }));
      return emptyEditData;
    }
    return null;
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

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  // Helper function to truncate long text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Helper function to truncate username
  const truncateUsername = (username, maxLength = 20) => {
    if (!username) return '';
    if (username.length <= maxLength) return username;
    return username.substring(0, maxLength) + '...';
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleUserClick = async (username) => {
    if (expandedUsers[username]) {
      setExpandedUsers(prev => ({
        ...prev,
        [username]: false
      }));
    } else {
      setExpandedUsers(prev => ({
        ...prev,
        [username]: true
      }));
      await fetchUserEdits(username);
    }
  };

  // Handle show more functionality
  const handleShowMore = (section) => {
    setShowMoreStates(prev => ({
      ...prev,
      [section]: prev[section] + 10
    }));
  };

  const handleShowAll = (section) => {
    const maxCount = {
      newUsers: accountData.newUsers.length,
      blockedUsers: accountData.blockedUsers.length,
      accountAges: accountData.accountAges.length
    };
    
    setShowMoreStates(prev => ({
      ...prev,
      [section]: maxCount[section]
    }));
  };

  // Toggle edit details visibility
  const toggleEditDetails = (username, editIndex) => {
    const key = `${username}-${editIndex}`;
    setExpandedEditDetails(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Toggle show all edits for a user
  const toggleShowAllEdits = (username) => {
    setShowAllEdits(prev => ({
      ...prev,
      [username]: !prev[username]
    }));
  };

  // Compact Edit Renderer - shows basic info with expandable details
  const CompactEditRenderer = ({ edit, editIndex, username, title }) => {
    const detailKey = `${username}-${editIndex}`;
    const isExpanded = expandedEditDetails[detailKey];

    return (
      <div className="bg-white rounded border border-gray-200 mb-2 overflow-hidden">
        {/* Compact Edit Header - Always Visible */}
        <button
          onClick={() => toggleEditDetails(username, editIndex)}
          className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-3">
              <div className="flex items-center gap-3 mb-1">
                <div className="text-sm font-medium text-gray-900 flex-shrink-0">
                  Rev {edit.revid || `#${editIndex + 1}`}
                </div>
                <div className="text-xs text-gray-500 flex-shrink-0">
                  {formatTimestamp(edit.timestamp)}
                </div>
                {edit.size_change && (
                  <div className={`text-xs font-medium px-2 py-1 rounded flex-shrink-0 ${
                    edit.size_change > 0 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {edit.size_change > 0 ? '+' : ''}{edit.size_change} bytes
                  </div>
                )}
              </div>
              {edit.comment && (
                <div className="text-xs text-gray-600 truncate" title={edit.comment}>
                  "{truncateText(edit.comment, 80)}"
                </div>
              )}
            </div>
            <svg 
              className={`w-4 h-4 text-gray-500 transform transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Expandable Edit Details */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
            <div className="mt-3 space-y-3">
              {/* Edit Summary */}
              <div className="bg-white rounded p-3 border">
                <div className="text-xs font-medium text-gray-700 mb-2">Edit Summary:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="break-words">
                    <span className="text-gray-600">Revision ID:</span>
                    <span className="ml-2 font-mono">{edit.revid || 'N/A'}</span>
                  </div>
                  <div className="break-words">
                    <span className="text-gray-600">Size Change:</span>
                    <span className={`ml-2 font-medium ${
                      edit.size_change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {edit.size_change ? `${edit.size_change > 0 ? '+' : ''}${edit.size_change} bytes` : 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-1 md:col-span-2 break-words">
                    <span className="text-gray-600">Comment:</span>
                    <span className="ml-2 break-words">{edit.comment || 'No edit summary'}</span>
                  </div>
                </div>
              </div>

              {/* Diff Content */}
              {(edit.additions || edit.deletions || edit.unchanged) ? (
                <div className="bg-white rounded border">
                  <div className="p-3 border-b bg-gray-50">
                    <div className="text-xs font-medium text-gray-700">Content Changes:</div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {edit.unchanged && edit.unchanged.map((line, index) => (
                      <div key={`unchanged-${index}`} className="px-3 py-1 text-xs font-mono text-gray-600 border-l-2 border-gray-300 break-words">
                        <span className="text-gray-400 mr-2"> </span>
                        <span className="break-all">{line}</span>
                      </div>
                    ))}
                    
                    {edit.deletions && edit.deletions.map((line, index) => (
                      <div key={`deletion-${index}`} className="px-3 py-1 text-xs font-mono bg-red-50 text-red-800 border-l-2 border-red-400 break-words">
                        <span className="text-red-600 mr-2">−</span>
                        <span className="break-all">{line}</span>
                      </div>
                    ))}
                    
                    {edit.additions && edit.additions.map((line, index) => (
                      <div key={`addition-${index}`} className="px-3 py-1 text-xs font-mono bg-green-50 text-green-800 border-l-2 border-green-400 break-words">
                        <span className="text-green-600 mr-2">+</span>
                        <span className="break-all">{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <div className="text-xs text-yellow-700">
                    <div className="font-medium mb-1">No diff data available</div>
                    <div>This edit may not have detailed change information from the API.</div>
                  </div>
                </div>
              )}

              {/* Raw Edit Data (Collapsible) */}
              <details className="bg-white rounded border">
                <summary className="p-3 cursor-pointer text-xs font-medium text-gray-700 hover:bg-gray-50">
                  Raw Edit Data
                </summary>
                <div className="px-3 pb-3 border-t bg-gray-50">
                  <pre className="text-xs overflow-x-auto font-mono mt-2 p-2 bg-white rounded border whitespace-pre-wrap break-words">
                    {JSON.stringify(edit, null, 2)}
                  </pre>
                </div>
              </details>
            </div>
          </div>
        )}
      </div>
    );
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
            <div className="px-4 pb-4">
              <div className="space-y-2">
                {accountData.newUsers.slice(0, showMoreStates.newUsers).map((user, index) => (
                  <div key={`new-user-${index}-${user.username}`} className="bg-white rounded border border-red-200 overflow-hidden">
                    <button
                      onClick={() => handleUserClick(user.username)}
                      className="w-full p-3 text-left hover:bg-red-25 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col flex-1 min-w-0 pr-3">
                          <span className="font-medium text-red-800 truncate" title={user.username}>
                            {truncateUsername(user.username)}
                          </span>
                          <span className="text-xs text-red-600">Created {formatCreationDate(user.accountAge)}</span>
                        </div>
                        <div className="flex items-center flex-shrink-0">
                          <div className="text-right mr-2">
                            <div className="text-sm font-medium text-red-700">{user.editCount} edits</div>
                            <div className="text-xs text-red-500">{getAccountAgeLabel(user.accountAge)}</div>
                          </div>
                          <svg 
                            className={`w-4 h-4 text-red-600 transform transition-transform ${expandedUsers[user.username] ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                    
                    {expandedUsers[user.username] && userEdits[user.username] && (
                      <div className="px-4 pb-4 border-t border-red-100 bg-red-25">
                        <div className="mt-4 space-y-4">
                          {/* User Summary */}
                          <div className="bg-white rounded-lg border border-red-200 p-4">
                            <div className="text-sm font-medium text-red-800 mb-3">User Summary:</div>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <div className="text-red-600 font-medium">Total Edits:</div>
                                <div className="text-red-800">{userEdits[user.username].totalEdits || 0}</div>
                              </div>
                              <div>
                                <div className="text-red-600 font-medium">Account Age:</div>
                                <div className="text-red-800">{getAccountAgeLabel(user.accountAge)}</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Edits Section with Improved Organization */}
                          {userEdits[user.username].edits && userEdits[user.username].edits.length > 0 ? (
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <div className="text-sm font-medium text-red-800">
                                  Recent Edits ({userEdits[user.username].edits.length} total)
                                </div>
                                {userEdits[user.username].edits.length > 3 && (
                                  <button
                                    onClick={() => toggleShowAllEdits(user.username)}
                                    className="text-xs text-red-600 hover:text-red-800 font-medium flex-shrink-0"
                                  >
                                    {showAllEdits[user.username] 
                                      ? 'Show Less' 
                                      : `Show All ${userEdits[user.username].edits.length} Edits`
                                    }
                                  </button>
                                )}
                              </div>
                              
                              {/* Show first 3 edits or all if expanded */}
                              <div className="space-y-2">
                                {(showAllEdits[user.username] 
                                  ? userEdits[user.username].edits 
                                  : userEdits[user.username].edits.slice(0, 3)
                                ).map((edit, editIndex) => (
                                  <CompactEditRenderer 
                                    key={`edit-${editIndex}`}
                                    edit={edit} 
                                    editIndex={editIndex} 
                                    username={user.username}
                                    title={title} 
                                  />
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-white rounded-lg border border-red-200 p-6 text-center">
                              <div className="text-red-600 text-sm">
                                {userEdits[user.username].error 
                                  ? "Failed to load edit details - API error" 
                                  : "No detailed edit information available"}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {expandedUsers[user.username] && loadingUsers[user.username] && (
                      <div className="px-3 pb-3 border-t border-red-100">
                        <div className="text-xs text-red-600 mt-2 flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                          Loading edit details for {user.username}...
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              
                {/* Show More Controls - FIXED */}
                {showMoreStates.newUsers < accountData.newUsers.length && (
                  <div className="mt-4 text-center space-y-2">
                    <button 
                      onClick={() => handleShowMore('newUsers')}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors mr-2"
                    >
                      Show {Math.min(10, accountData.newUsers.length - showMoreStates.newUsers)} More Users
                    </button>
                    <button 
                      onClick={() => handleShowAll('newUsers')}
                      className="px-4 py-2 bg-red-200 text-red-800 rounded-lg text-sm hover:bg-red-300 transition-colors"
                    >
                      Show All {accountData.newUsers.length - showMoreStates.newUsers} Remaining Users
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Blocked Users - Similar structure with overflow fixes */}
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
            <div className="px-4 pb-4">
              <div className="space-y-2">
                {accountData.blockedUsers.slice(0, showMoreStates.blockedUsers).map((user, index) => (
                  <div key={`blocked-user-${index}-${user.username}`} className="bg-white rounded border border-slate-200 overflow-hidden">
                    <button
                      onClick={() => handleUserClick(user.username)}
                      className="w-full p-3 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0 pr-3">
                          <span className="font-medium text-slate-800 truncate" title={user.username}>
                            {truncateUsername(user.username)}
                          </span>
                          <span className="ml-2 px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs flex-shrink-0">
                            Blocked
                          </span>
                        </div>
                        <div className="flex items-center flex-shrink-0">
                          <span className="text-sm text-slate-600 mr-2">{user.editCount} edits</span>
                          <svg 
                            className={`w-4 h-4 text-slate-600 transform transition-transform ${expandedUsers[user.username] ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                    
                    {expandedUsers[user.username] && userEdits[user.username] && (
                      <div className="px-4 pb-4 border-t border-slate-100 bg-slate-25">
                        <div className="mt-4 space-y-4">
                          <div className="bg-white rounded-lg border border-slate-200 p-4">
                            <div className="text-sm font-medium text-slate-800 mb-3">User Summary:</div>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <div className="text-slate-600 font-medium">Total Edits:</div>
                                <div className="text-slate-800">{userEdits[user.username].totalEdits || 0}</div>
                              </div>
                              <div>
                                <div className="text-slate-600 font-medium">Status:</div>
                                <div className="text-red-600 font-medium">Currently Blocked</div>
                              </div>
                            </div>
                          </div>
                          
                          {userEdits[user.username].edits && userEdits[user.username].edits.length > 0 ? (
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <div className="text-sm font-medium text-slate-800">
                                  Recent Edits ({userEdits[user.username].edits.length} total)
                                </div>
                                {userEdits[user.username].edits.length > 3 && (
                                  <button
                                    onClick={() => toggleShowAllEdits(user.username)}
                                    className="text-xs text-slate-600 hover:text-slate-800 font-medium flex-shrink-0"
                                  >
                                    {showAllEdits[user.username] 
                                      ? 'Show Less' 
                                      : `Show All ${userEdits[user.username].edits.length} Edits`
                                    }
                                  </button>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                {(showAllEdits[user.username] 
                                  ? userEdits[user.username].edits 
                                  : userEdits[user.username].edits.slice(0, 3)
                                ).map((edit, editIndex) => (
                                  <CompactEditRenderer 
                                    key={`blocked-edit-${editIndex}`}
                                    edit={edit} 
                                    editIndex={editIndex} 
                                    username={user.username}
                                    title={title} 
                                  />
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
                              <div className="text-slate-600 text-sm">
                                {userEdits[user.username].error 
                                  ? "Failed to load edit details - API error" 
                                  : "No detailed edit information available"}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {expandedUsers[user.username] && loadingUsers[user.username] && (
                      <div className="px-3 pb-3 border-t border-slate-100">
                        <div className="text-xs text-slate-600 mt-2 flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2"></div>
                          Loading edit details for {user.username}...
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              
                {/* Show More Controls for Blocked Users */}
                {showMoreStates.blockedUsers < accountData.blockedUsers.length && (
                  <div className="mt-4 text-center space-y-2">
                    <button 
                      onClick={() => handleShowMore('blockedUsers')}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200 transition-colors mr-2"
                    >
                      Show {Math.min(10, accountData.blockedUsers.length - showMoreStates.blockedUsers)} More Users
                    </button>
                    <button 
                      onClick={() => handleShowAll('blockedUsers')}
                      className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg text-sm hover:bg-slate-300 transition-colors"
                    >
                      Show All {accountData.blockedUsers.length - showMoreStates.blockedUsers} Remaining Users
                    </button>
                  </div>
                )}
              </div>
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
          <div className="px-4 pb-4">
            <div className="space-y-2">
              {accountData.accountAges.slice(0, showMoreStates.accountAges).map((user, index) => (
                <div key={`age-user-${index}-${user.username}`} className="bg-slate-50 rounded p-3 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col flex-1 min-w-0 pr-3">
                      <span className="font-medium text-slate-700 truncate" title={user.username}>
                        {truncateUsername(user.username)}
                      </span>
                      <span className="text-xs text-slate-500">Created {formatCreationDate(user.accountAge)}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm text-slate-600">{getAccountAgeLabel(user.accountAge)}</div>
                      <div className="text-xs text-slate-500">{user.editCount} edits</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Show More Controls for Account Ages */}
            {showMoreStates.accountAges < accountData.accountAges.length && (
              <div className="mt-4 text-center space-y-2">
                <button 
                  onClick={() => handleShowMore('accountAges')}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200 transition-colors mr-2"
                >
                  Show {Math.min(10, accountData.accountAges.length - showMoreStates.accountAges)} More Editors
                </button>
                <button 
                  onClick={() => handleShowAll('accountAges')}
                  className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg text-sm hover:bg-slate-300 transition-colors"
                >
                  Show All {accountData.accountAges.length - showMoreStates.accountAges} Remaining Editors
                </button>
              </div>
            )}
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
