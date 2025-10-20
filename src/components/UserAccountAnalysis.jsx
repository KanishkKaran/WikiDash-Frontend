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

  useEffect(() => {
    const fetchUserAccountData = async () => {
      try {
        // Get detailed user information for all editors
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

  const getAccountAgeColor = (days) => {
    if (days < 30) return 'text-red-600 bg-red-50';
    if (days < 365) return 'text-amber-600 bg-amber-50';
    return 'text-green-600 bg-green-50';
  };

  const getAccountAgeLabel = (days) => {
    if (days < 1) return 'New today';
    if (days < 7) return `${days} days old`;
    if (days < 30) return `${Math.floor(days / 7)} weeks old`;
    if (days < 365) return `${Math.floor(days / 30)} months old`;
    return `${Math.floor(days / 365)} years old`;
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Editor Account Analysis</h3>
        <span className="text-xs text-slate-500">Security & Quality Indicators</span>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-slate-800">{accountData.totalEditors}</div>
          <div className="text-xs text-slate-500">Total Editors</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{accountData.newUsers.length}</div>
          <div className="text-xs text-red-500">New Users (&lt;30 days)</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{accountData.blockedUsers.length}</div>
          <div className="text-xs text-amber-500">Blocked Users</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{accountData.anonymousCount}</div>
          <div className="text-xs text-blue-500">Anonymous Edits</div>
        </div>
      </div>

      {/* New Users Alert */}
      {accountData.newUsers.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h4 className="font-medium text-red-800 mb-2">⚠️ New User Activity Detected</h4>
              <p className="text-sm text-red-700 mb-3">
                {accountData.newUsers.length} recently registered users have edited this article. New accounts may indicate potential sockpuppeting or coordinated editing.
              </p>
              <div className="space-y-2">
                {accountData.newUsers.slice(0, 5).map((user, index) => (
                  <div key={index} className="flex items-center justify-between bg-white rounded p-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      <span className="font-medium text-slate-800">{user.username}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccountAgeColor(user.accountAge)}`}>
                        {getAccountAgeLabel(user.accountAge)}
                      </span>
                      <span className="text-xs text-slate-500">{user.editCount} edits</span>
                    </div>
                  </div>
                ))}
                {accountData.newUsers.length > 5 && (
                  <div className="text-xs text-red-600 text-center">
                    +{accountData.newUsers.length - 5} more new users
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blocked Users Alert */}
      {accountData.blockedUsers.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h4 className="font-medium text-amber-800 mb-2">🚫 Blocked User Edits</h4>
              <p className="text-sm text-amber-700 mb-3">
                {accountData.blockedUsers.length} currently blocked users have edited this article. These edits may require review.
              </p>
              <div className="space-y-2">
                {accountData.blockedUsers.slice(0, 3).map((user, index) => (
                  <div key={index} className="flex items-center justify-between bg-white rounded p-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                      <span className="font-medium text-slate-800">{user.username}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                        Blocked
                      </span>
                      <span className="text-xs text-slate-500">{user.editCount} edits</span>
                    </div>
                  </div>
                ))}
                {accountData.blockedUsers.length > 3 && (
                  <div className="text-xs text-amber-600 text-center">
                    +{accountData.blockedUsers.length - 3} more blocked users
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Age Distribution */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h4 className="font-medium text-slate-800 mb-3">Account Age Distribution</h4>
        <div className="space-y-3">
          {accountData.accountAges.slice(0, 8).map((user, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  user.accountAge < 30 ? 'bg-red-500' : 
                  user.accountAge < 365 ? 'bg-amber-500' : 'bg-green-500'
                }`}></div>
                <span className="font-medium text-slate-700">{user.username}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccountAgeColor(user.accountAge)}`}>
                  {getAccountAgeLabel(user.accountAge)}
                </span>
                <span className="text-xs text-slate-500 w-16 text-right">{user.editCount} edits</span>
              </div>
            </div>
          ))}
        </div>
        
        {accountData.accountAges.length > 8 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
              View all {accountData.accountAges.length} editors →
            </button>
          </div>
        )}
      </div>

      {/* Risk Assessment Summary */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
        <h4 className="font-medium text-indigo-900 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Account Security Assessment
        </h4>
        <div className="text-sm text-indigo-800 space-y-1">
          {accountData.newUsers.length === 0 && accountData.blockedUsers.length === 0 && (
            <div className="flex items-center text-green-700">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              ✅ No high-risk account activity detected
            </div>
          )}
          {accountData.newUsers.length > 0 && (
            <div>• Monitor for potential sockpuppeting from {accountData.newUsers.length} new accounts</div>
          )}
          {accountData.blockedUsers.length > 0 && (
            <div>• Review contributions from {accountData.blockedUsers.length} blocked users</div>
          )}
          {accountData.anonymousCount > accountData.totalEditors * 0.3 && (
            <div>• High anonymous edit ratio ({Math.round(accountData.anonymousCount / accountData.totalEditors * 100)}%) may indicate vandalism risk</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAccountAnalysis;
