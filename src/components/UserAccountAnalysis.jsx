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
  
  // State for managing pagination and edit details
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
          meaningfulEdits: response.data.meaningfulEdits || response.data.edits?.length || 0,
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
        meaningfulEdits: 0,
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

  // Filter meaningful edits function
  const filterMeaningfulEdits = (edits) => {
    if (!edits || !Array.isArray(edits)) return [];
    
    return edits.filter(edit => {
      // Filter out clearly non-content edits
      const comment = (edit.comment || '').toLowerCase();
      const trivialKeywords = [
        'typo', 'spelling', 'grammar', 'format', 'style', 'category',
        'template', 'infobox', 'stub', 'redirect', 'disambiguation',
        'wikify', 'cleanup', 'copyedit'
      ];
      
      const sizeChange = Math.abs(edit.size_change || 0);
      
      // If it's a small change with trivial keywords, likely not content
      if (sizeChange < 20 && trivialKeywords.some(keyword => comment.includes(keyword))) {
        return false;
      }
      
      // If it has actual content additions/deletions, include it
      if ((edit.additions && edit.additions.length > 0) || 
          (edit.deletions && edit.deletions.length > 0)) {
        return true;
      }
      
      // Include substantial size changes
      return sizeChange > 50;
    });
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

  // Enhanced Content-Focused Edit Renderer
  const CompactEditRenderer = ({ edit, editIndex, username, title }) => {
    const detailKey = `${username}-${editIndex}`;
    const isExpanded = expandedEditDetails[detailKey];

    // Determine if this edit has meaningful content changes
    const hasContentChanges = (edit.additions && edit.additions.length > 0) || 
                             (edit.deletions && edit.deletions.length > 0);
    
    // Classify edit type based on size change and comment
    const getEditType = () => {
      const comment = edit.comment || '';
      const sizeChange = edit.size_change || 0;
      
      if (Math.abs(sizeChange) > 1000) return { type: 'major', color: 'purple' };
      if (sizeChange > 100) return { type: 'addition', color: 'green' };
      if (sizeChange < -100) return { type: 'removal', color: 'red' };
      if (comment.toLowerCase().includes('revert')) return { type: 'revert', color: 'orange' };
      return { type: 'minor', color: 'gray' };
    };

    const editType = getEditType();

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
                {/* Edit Type Badge */}
                <div className={`text-xs font-medium px-2 py-1 rounded flex-shrink-0 ${
                  editType.color === 'green' ? 'bg-green-100 text-green-700' :
                  editType.color === 'red' ? 'bg-red-100 text-red-700' :
                  editType.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                  editType.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {editType.type}
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
              
              {/* Show content preview instead of just comment */}
              {hasContentChanges ? (
                <div className="text-xs text-gray-700">
                  {edit.additions && edit.additions.length > 0 && (
                    <span className="text-green-600">
                      Added: "{truncateText(edit.additions[0], 60)}"
                    </span>
                  )}
                  {edit.deletions && edit.deletions.length > 0 && (
                    <span className="text-red-600 ml-2">
                      Removed: "{truncateText(edit.deletions[0], 60)}"
                    </span>
                  )}
                </div>
              ) : edit.comment ? (
                <div className="text-xs text-gray-600 truncate" title={edit.comment}>
                  "{truncateText(edit.comment, 80)}"
                </div>
              ) : (
                <div className="text-xs text-gray-400">No detailed changes available</div>
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
                    <span className="text-gray-600">Content Change:</span>
                    <span className={`ml-2 font-medium ${
                      edit.size_change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {edit.size_change ? `${edit.size_change > 0 ? '+' : ''}${edit.size_change} bytes` : 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-1 md:col-span-2 break-words">
                    <span className="text-gray-600">Edit Summary:</span>
                    <span className="ml-2 break-words">{edit.comment || 'No edit summary provided'}</span>
                  </div>
                </div>
              </div>

              {/* Content Changes - Focus on actual text changes */}
              {hasContentChanges ? (
                <div className="bg-white rounded border">
                  <div className="p-3 border-b bg-gray-50">
                    <div className="text-xs font-medium text-gray-700">Article Content Changes:</div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {/* Show context first if available */}
                    {edit.unchanged && edit.unchanged.map((line, index) => (
                      <div key={`unchanged-${index}`} className="px-3 py-2 text-sm text-gray-600 border-l-2 border-gray-300 break-words bg-gray-50">
                        <span className="text-gray-400 mr-2">Context:</span>
                        <span className="break-words">{line}</span>
                      </div>
                    ))}
                    
                    {/* Show deletions (what was removed) */}
                    {edit.deletions && edit.deletions.map((line, index) => (
                      <div key={`deletion-${index}`} className="px-3 py-2 text-sm bg-red-50 text-red-800 border-l-4 border-red-400 break-words">
                        <span className="text-red-600 mr-2 font-medium">Removed:</span>
                        <span className="break-words">{line}</span>
                      </div>
                    ))}
                    
                    {/* Show additions (what was added) */}
                    {edit.additions && edit.additions.map((line, index) => (
                      <div key={`addition-${index}`} className="px-3 py-2 text-sm bg-green-50 text-green-800 border-l-4 border-green-400 break-words">
                        <span className="text-green-600 mr-2 font-medium">Added:</span>
                        <span className="break-words">{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <div className="text-sm text-yellow-700">
                    <div className="font-medium mb-1">Content Details Unavailable</div>
                    <div className="text-xs">This edit may have been:</div>
                    <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                      <li>A formatting or style change</li>
                      <li>A template or metadata update</li>
                      <li>A minor correction without substantial content change</li>
                      <li>An administrative action (categorization, etc.)</li>
                    </ul>
                    {edit.comment && (
                      <div className="mt-2 p-2 bg-yellow-100 rounded text-xs">
                        <strong>Edit comment:</strong> {edit.comment}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Content Change Statistics */}
              {hasContentChanges && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="text-xs font-medium text-blue-800 mb-2">Content Analysis:</div>
                  <div className="grid grid-cols-2 gap-3 text-xs text-blue-700">
                    <div>
                      <span className="font-medium">Text Added:</span>
                      <span className="ml-1">{edit.additions ? edit.additions.length : 0} sections</span>
                    </div>
                    <div>
                      <span className="font-medium">Text Removed:</span>
                      <span className="ml-1">{edit.deletions ? edit.deletions.length : 0} sections</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-blue-600">
                    This edit represents a <strong>{editType.type}</strong> change to the article content.
                  </div>
                </div>
              )}

              {/* Technical Details (Collapsible) */}
              <details className="bg-gray-100 rounded border">
                <summary className="p-2 cursor-pointer text-xs font-medium text-gray-600 hover:bg-gray-200">
                  Technical Details (Developer Info)
                </summary>
                <div className="px-3 pb-3 border-t bg-gray-50">
                  <pre className="text-xs overflow-x-auto font-mono mt-2 p-2 bg-white rounded border whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                    {JSON.stringify({
                      revid: edit.revid,
                      timestamp: edit.timestamp,
                      size_change: edit.size_change,
                      comment: edit.comment,
                      content_summary: {
                        additions_count: edit.additions?.length || 0,
                        deletions_count: edit.deletions?.length || 0,
                        has_meaningful_changes: hasContentChanges
                      }
                    }, null, 2)}
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
              <p className="text-sm text-red-600">{accountData.newUsers.length} recently registered users with article edits</p>
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
                            <div className="text-sm font-medium text-red-700">{user.editCount} article edits</div>
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
                                <div className="text-red-600 font-medium">Article Edits:</div>
                                <div className="text-red-800">{userEdits[user.username].meaningfulEdits || 0} meaningful content changes</div>
                              </div>
                              <div>
                                <div className="text-red-600 font-medium">Account Age:</div>
                                <div className="text-red-800">{getAccountAgeLabel(user.accountAge)}</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Content Edits Section */}
                          {userEdits[user.username].edits && filterMeaningfulEdits(userEdits[user.username].edits).length > 0 ? (
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <div className="text-sm font-medium text-red-800">
                                  Content Edits ({filterMeaningfulEdits(userEdits[user.username].edits).length} meaningful changes)
                                </div>
                                {filterMeaningfulEdits(userEdits[user.username].edits).length > 3 && (
                                  <button
                                    onClick={() => toggleShowAllEdits(user.username)}
                                    className="text-xs text-red-600 hover:text-red-800 font-medium flex-shrink-0"
                                  >
                                    {showAllEdits[user.username] 
                                      ? 'Show Less' 
                                      : `Show All ${filterMeaningfulEdits(userEdits[user.username].edits).length} Edits`
                                    }
                                  </button>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                {(showAllEdits[user.username] 
                                  ? filterMeaningfulEdits(userEdits[user.username].edits)
                                  : filterMeaningfulEdits(userEdits[user.username].edits).slice(0, 3)
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
                                  : "No meaningful content changes found for this user"}
                              </div>
                              <div className="text-xs text-red-500 mt-1">
                                This user may have only made minor formatting or administrative edits
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
                          Loading content analysis for {user.username}...
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              
                {/* Show More Controls */}
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

      {/* Blocked Users */}
      {accountData.blockedUsers.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg">
          <button
            onClick={() => toggleSection('blockedUsers')}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-100 transition-colors"
          >
            <div>
              <h4 className="font-medium text-slate-800">Blocked User Edits</h4>
              <p className="text-sm text-slate-600">{accountData.blockedUsers.length} currently blocked users with article edits</p>
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
                          <span className="text-sm text-slate-600 mr-2">{user.editCount} article edits</span>
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
                                <div className="text-slate-600 font-medium">Article Edits:</div>
                                <div className="text-slate-800">{userEdits[user.username].meaningfulEdits || 0} meaningful content changes</div>
                              </div>
                              <div>
                                <div className="text-slate-600 font-medium">Status:</div>
                                <div className="text-red-600 font-medium">Currently Blocked</div>
                              </div>
                            </div>
                          </div>
                          
                          {userEdits[user.username].edits && filterMeaningfulEdits(userEdits[user.username].edits).length > 0 ? (
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <div className="text-sm font-medium text-slate-800">
                                  Content Edits ({filterMeaningfulEdits(userEdits[user.username].edits).length} meaningful changes)
                                </div>
                                {filterMeaningfulEdits(userEdits[user.username].edits).length > 3 && (
                                  <button
                                    onClick={() => toggleShowAllEdits(user.username)}
                                    className="text-xs text-slate-600 hover:text-slate-800 font-medium flex-shrink-0"
                                  >
                                    {showAllEdits[user.username] 
                                      ? 'Show Less' 
                                      : `Show All ${filterMeaningfulEdits(userEdits[user.username].edits).length} Edits`
                                    }
                                  </button>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                {(showAllEdits[user.username] 
                                  ? filterMeaningfulEdits(userEdits[user.username].edits)
                                  : filterMeaningfulEdits(userEdits[user.username].edits).slice(0, 3)
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
                                  : "No meaningful content changes found for this user"}
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
                          Loading content analysis for {user.username}...
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
                      <div className="text-xs text-slate-500">{user.editCount} article edits</div>
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

      {/* Content Analysis Insights */}
      {(accountData.newUsers.length > 0 || accountData.blockedUsers.length > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <div className="text-sm text-blue-800 font-medium mb-2">Security Analysis Summary</div>
              <div className="text-xs text-blue-700 space-y-1">
                {accountData.newUsers.length > 0 && (
                  <div>• <strong>{accountData.newUsers.length} new users</strong> have made content edits to this article recently</div>
                )}
                {accountData.blockedUsers.length > 0 && (
                  <div>• <strong>{accountData.blockedUsers.length} blocked users</strong> have historical content edits on this article</div>
                )}
                <div>• Content analysis focuses on meaningful article text changes, excluding minor formatting and administrative edits</div>
                <div>• Review expanded user details to see specific content modifications and assess edit quality</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary - No Issues */}
      {(accountData.newUsers.length === 0 && accountData.blockedUsers.length === 0) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <span className="text-sm text-green-700 font-medium">No security concerns detected</span>
              <p className="text-xs text-green-600 mt-1">All editors appear to have established accounts with normal editing patterns</p>
            </div>
          </div>
        </div>
      )}

      {/* Data Quality Notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-4 h-4 text-gray-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xs text-gray-600">
            <div className="font-medium text-gray-700 mb-1">Data Quality Information</div>
            <div className="space-y-1">
              <div>• Analysis includes only main article namespace edits (excludes talk pages, user pages, etc.)</div>
              <div>• Content changes are filtered to show meaningful text additions and removals</div>
              <div>• Minor edits like typo fixes, formatting, and administrative changes are excluded</div>
              <div>• User account data is sourced from Wikipedia's public API and user registration records</div>
              <div>• Click on any user to see detailed content analysis and edit history</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Notice */}
      {(accountData.newUsers.length > 20 || accountData.blockedUsers.length > 20) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-4 h-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="text-xs text-amber-700">
              <div className="font-medium mb-1">Performance Notice</div>
              <div>This article has a large number of flagged users. Content analysis may take longer to load. Use "Show More" controls to manage data loading efficiently.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccountAnalysis;
