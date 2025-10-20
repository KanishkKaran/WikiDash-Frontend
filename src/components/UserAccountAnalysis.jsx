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

  useEffect(() => {
    const fetchUserAccountData = async () => {
      try {
        const response = await api.get(`/api/user-account-analysis?title=${encodeURIComponent(title)}`);
        setAccountData(response.data);
        
        // Debug: Log the response to check for placeholder data
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
      return userEdits[username]; // Already fetched
    }
    
    setLoadingUsers(prev => ({ ...prev, [username]: true }));
    
    try {
      // Debug: Log the exact API call being made
      const apiUrl = `/api/user/${encodeURIComponent(username)}/article-edits?title=${encodeURIComponent(title)}`;
      console.log(`\nFetching edits for user: ${username}`);
      console.log(`API URL: ${window.location.origin}${apiUrl}`);
      console.log(`Username Parameter: "${username}"`);
      console.log(`Article Parameter: "${title}"`);
      
      const response = await api.get(apiUrl);
      
      // Debug: Check if API is returning user-specific data
      console.log(`API Response for ${username}:`);
      console.log(`Status: ${response.status}`);
      console.log(`Request URL: ${response.config?.url}`);
      console.log(`Response Headers:`, response.headers);
      console.log(`Full Response Data:`, JSON.stringify(response.data, null, 2));
      
      // CRITICAL: Check if the API is actually using the username parameter
      if (response.data) {
        console.log(`\nResponse Analysis for ${username}:`);
        console.log(`Response contains username field:`, !!response.data.username);
        console.log(`Response username value:`, response.data.username);
        console.log(`Does response username match request:`, response.data.username === username);
        console.log(`Response contains edits:`, !!response.data.edits);
        console.log(`Number of edits:`, response.data.edits?.length || 0);
        
        // Log first few edit details to identify if they're user-specific
        if (response.data.edits && response.data.edits.length > 0) {
          console.log(`First edit details:`, {
            revid: response.data.edits[0].revid,
            timestamp: response.data.edits[0].timestamp,
            comment: response.data.edits[0].comment,
            size_change: response.data.edits[0].size_change
          });
        }
      }
      
      // Critical check: Does the response actually contain this username?
      if (response.data && response.data.username && response.data.username !== username) {
        console.error(`API Error: Requested username "${username}" but received username "${response.data.username}"`);
        console.error(`This indicates the API is not respecting the username parameter`);
      }
      
      if (response.data && response.data.edits) {
        // Generate a unique signature for this edit set
        const editSignature = response.data.edits.map(edit => `${edit.revid}-${edit.timestamp}`).join('|');
        
        console.log(`\nDuplicate Check for ${username}:`);
        console.log(`Edit signature for ${username}: ${editSignature.substring(0, 100)}...`);
        
        // Check against all existing users
        const duplicateUsers = [];
        Object.entries(userEdits).forEach(([existingUser, existingData]) => {
          if (existingData.edits && existingData.edits.length > 0) {
            const existingSignature = existingData.edits.map(edit => `${edit.revid}-${edit.timestamp}`).join('|');
            if (editSignature === existingSignature && editSignature !== '') {
              duplicateUsers.push(existingUser);
            }
          }
        });
        
        if (duplicateUsers.length > 0) {
          console.error(`Duplicate Edits Detected: ${username} has identical edits to: ${duplicateUsers.join(', ')}`);
          console.error(`This confirms the API issue - same data returned for different users`);
          console.error(`Backend endpoint is not filtering by username correctly`);
        } else {
          console.log(`Verified: ${username} has unique edit data`);
        }
        
        const editData = {
          username: username,
          edits: response.data.edits || [],
          totalEdits: response.data.totalEdits || 0,
          lastEdit: response.data.lastEdit || null,
          accountCreated: response.data.accountCreated || null,
          fetchedAt: new Date().toISOString(),
          apiUrl: apiUrl,
          editSignature: editSignature,
          responseUsername: response.data.username || 'not provided'
        };
        
        console.log(`Stored Data for ${username}:`);
        console.log(`Stored username: ${editData.username}`);
        console.log(`Total edits: ${editData.totalEdits}`);
        console.log(`Edits array length: ${editData.edits.length}`);
        console.log(`Signature: ${editData.editSignature.substring(0, 50)}...`);
        
        setUserEdits(prev => ({
          ...prev,
          [username]: editData
        }));
        
        setLoadingUsers(prev => ({ ...prev, [username]: false }));
        return editData;
      } else {
        console.warn(`No edits data in response for ${username}:`, response.data);
      }
    } catch (error) {
      console.error(`Error for ${username}:`, error);
      
      if (error.response) {
        console.log(`Error status: ${error.response.status}`);
        console.log(`Error data:`, error.response.data);
        console.log(`Error URL:`, error.response.config?.url);
      }
      
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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleUserClick = async (username) => {
    if (expandedUsers[username]) {
      // Collapse
      setExpandedUsers(prev => ({
        ...prev,
        [username]: false
      }));
    } else {
      // Expand and fetch edits
      setExpandedUsers(prev => ({
        ...prev,
        [username]: true
      }));
      await fetchUserEdits(username);
    }
  };

  // Real edit content renderer - shows actual API data
  const DiffRenderer = ({ edit, editIndex, title }) => {
    // Debug: Log what we actually have from the API
    console.log(`Edit data for ${editIndex}:`, edit);

    const renderDiffLine = (line, type) => {
      const getLineStyle = (type) => {
        switch (type) {
          case 'added':
            return 'bg-green-50 border-l-4 border-green-400';
          case 'removed':
            return 'bg-red-50 border-l-4 border-red-400';
          default:
            return 'bg-gray-50 border-l-4 border-gray-300';
        }
      };

      const getTextStyle = (type) => {
        switch (type) {
          case 'added':
            return 'text-green-800';
          case 'removed':
            return 'text-red-800';
          default:
            return 'text-gray-700';
        }
      };

      const getPrefix = (type) => {
        switch (type) {
          case 'added':
            return '+';
          case 'removed':
            return '−';
          default:
            return ' ';
        }
      };

      return (
        <div className={`${getLineStyle(type)} px-3 py-2 font-mono text-sm leading-relaxed`}>
          <span className={`${getTextStyle(type)} select-none mr-3 font-bold w-4 inline-block`}>
            {getPrefix(type)}
          </span>
          <span className={getTextStyle(type)} style={{ wordBreak: 'break-word' }}>
            {line}
          </span>
        </div>
      );
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
        {/* Edit Header */}
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900">
                {edit.revid ? `Revision ${edit.revid}` : `Edit #${editIndex + 1}`}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {formatTimestamp(edit.timestamp)}
              </div>
            </div>
            <div className="text-right">
              {edit.size_change && (
                <div className={`text-sm font-medium ${edit.size_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {edit.size_change > 0 ? '+' : ''}{edit.size_change.toLocaleString()} bytes
                </div>
              )}
            </div>
          </div>
          {edit.comment && (
            <div className="text-sm text-gray-700 mt-2 italic">
              "{edit.comment}"
            </div>
          )}
        </div>

        {/* Show actual edit content based on what we have */}
        <div className="bg-white">
          {/* First, try structured diff content */}
          {edit.diff_content && edit.diff_content.length > 0 ? (
            <div>
              {edit.diff_content.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  {section.context_before && section.context_before.map((line, lineIndex) => (
                    <div key={`before-${lineIndex}`}>
                      {renderDiffLine(line, 'context')}
                    </div>
                  ))}
                  
                  {section.removed && section.removed.map((line, lineIndex) => (
                    <div key={`removed-${lineIndex}`}>
                      {renderDiffLine(line, 'removed')}
                    </div>
                  ))}
                  
                  {section.added && section.added.map((line, lineIndex) => (
                    <div key={`added-${lineIndex}`}>
                      {renderDiffLine(line, 'added')}
                    </div>
                  ))}
                  
                  {section.context_after && section.context_after.map((line, lineIndex) => (
                    <div key={`after-${lineIndex}`}>
                      {renderDiffLine(line, 'context')}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : 
          /* Try legacy format with separate arrays */
          (edit.unchanged || edit.deletions || edit.additions) ? (
            <div>
              {edit.unchanged && edit.unchanged.map((line, index) => (
                <div key={`unchanged-${index}`}>
                  {renderDiffLine(line, 'context')}
                </div>
              ))}
              
              {edit.deletions && edit.deletions.map((line, index) => (
                <div key={`deletion-${index}`}>
                  {renderDiffLine(line, 'removed')}
                </div>
              ))}
              
              {edit.additions && edit.additions.map((line, index) => (
                <div key={`addition-${index}`}>
                  {renderDiffLine(line, 'added')}
                </div>
              ))}
            </div>
          ) : 
          /* Try raw diff text if available */
          edit.diff ? (
            <div className="p-4">
              <div className="text-xs font-medium text-gray-700 mb-2">Raw Diff:</div>
              <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto font-mono whitespace-pre-wrap">
                {edit.diff}
              </pre>
            </div>
          ) : 
          /* Try any text content available */
          edit.text || edit.content ? (
            <div className="p-4">
              <div className="text-xs font-medium text-gray-700 mb-2">Edit Content:</div>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
                <div className="text-sm text-blue-800 font-mono whitespace-pre-wrap">
                  {edit.text || edit.content}
                </div>
              </div>
            </div>
          ) :
          /* Show all available edit properties */
          (
            <div className="p-4">
              <div className="text-sm font-medium text-gray-700 mb-3">Available Edit Data:</div>
              <div className="bg-gray-50 rounded p-3">
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {Object.entries(edit).map(([key, value]) => (
                    key !== 'timestamp' && key !== 'comment' && key !== 'revid' && key !== 'size_change' && (
                      <div key={key} className="flex">
                        <span className="font-medium text-gray-600 w-24 flex-shrink-0">{key}:</span>
                        <span className="text-gray-800 break-words">
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              </div>
              
              {/* Raw object dump for debugging */}
              <details className="mt-3">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                  Show raw edit object
                </summary>
                <pre className="mt-2 bg-yellow-50 p-2 rounded text-xs overflow-x-auto">
                  {JSON.stringify(edit, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
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
      {/* Debug Panel - Enhanced to show duplicate detection */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm font-medium text-yellow-800 mb-2">Debug Information and Duplicate Detection:</div>
          <div className="text-xs text-yellow-700 space-y-1">
            <div>Total Users Loaded: {accountData.newUsers.length + accountData.blockedUsers.length}</div>
            <div>User Edits Cached: {Object.keys(userEdits).length}</div>
            <div>API Title: {title}</div>
            
            {/* Check for duplicate edits across users */}
            {Object.keys(userEdits).length > 1 && (
              <div className="mt-3 p-2 bg-yellow-100 rounded">
                <div className="font-medium text-yellow-800 mb-1">Duplicate Edit Analysis:</div>
                {(() => {
                  const signatures = {};
                  const duplicates = [];
                  
                  Object.entries(userEdits).forEach(([username, data]) => {
                    if (data.edits && data.edits.length > 0) {
                      const signature = JSON.stringify(data.edits.map(edit => ({
                        revid: edit.revid,
                        timestamp: edit.timestamp,
                        size_change: edit.size_change
                      })));
                      
                      if (signatures[signature]) {
                        duplicates.push(`${username} has identical edits to ${signatures[signature]}`);
                      } else {
                        signatures[signature] = username;
                      }
                    }
                  });
                  
                  return duplicates.length > 0 ? (
                    <div className="space-y-1">
                      <div className="text-red-600 font-medium">DUPLICATES FOUND:</div>
                      {duplicates.map((duplicate, idx) => (
                        <div key={idx} className="text-red-700 text-xs">{duplicate}</div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-green-600">No duplicate edits detected</div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

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
              {/* Show only first 10 users, with option to show more */}
              <div className="space-y-2">
                {accountData.newUsers.slice(0, 10).map((user, index) => (
                <div key={`new-user-${index}-${user.username}`} className="bg-white rounded border border-red-200">
                  <button
                    onClick={() => handleUserClick(user.username)}
                    className="w-full p-3 text-left hover:bg-red-25 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium text-red-800">{user.username}</span>
                        <span className="text-xs text-red-600">Created {formatCreationDate(user.accountAge)}</span>
                      </div>
                      <div className="flex items-center">
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
                            {userEdits[user.username].lastEdit && (
                              <div className="col-span-2">
                                <div className="text-red-600 font-medium">Last Edit:</div>
                                <div className="text-red-800">{formatTimestamp(userEdits[user.username].lastEdit)}</div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm font-medium text-red-800 mb-3">Recent Edits:</div>
                        
                        {/* Improved Edit Diffs */}
                        {userEdits[user.username].edits && userEdits[user.username].edits.length > 0 ? (
                          userEdits[user.username].edits.map((edit, editIndex) => (
                            <DiffRenderer 
                              key={`edit-${editIndex}`}
                              edit={edit} 
                              editIndex={editIndex} 
                              title={title} 
                            />
                          ))
                        ) : (
                          <div className="bg-white rounded-lg border border-red-200 p-6 text-center">
                            <div className="text-red-600 text-sm">
                              {userEdits[user.username].error 
                                ? "Failed to load edit details - API error" 
                                : "No detailed edit information available"}
                            </div>
                            <div className="text-red-500 text-xs mt-1">
                              Check API response or user permissions
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
              
              {/* Show more button for account ages */}
              {accountData.accountAges.length > 12 && (
                <div className="mt-4 text-center">
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200 transition-colors">
                    Show {accountData.accountAges.length - 12} more editors...
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Blocked Users - Similar improvements */}
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
                <div key={`blocked-user-${index}-${user.username}`} className="bg-white rounded border border-slate-200">
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
                      <div className="flex items-center">
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
                        
                        <div className="text-sm font-medium text-slate-800 mb-3">Recent Edits:</div>
                        
                        {userEdits[user.username].edits && userEdits[user.username].edits.length > 0 ? (
                          userEdits[user.username].edits.map((edit, editIndex) => (
                            <DiffRenderer 
                              key={`blocked-edit-${editIndex}`}
                              edit={edit} 
                              editIndex={editIndex} 
                              title={title} 
                            />
                          ))
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
              <div key={`age-user-${index}-${user.username}`} className="bg-slate-50 rounded p-3">
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
