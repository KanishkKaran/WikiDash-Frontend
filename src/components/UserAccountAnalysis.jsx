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

  const getAccountAgeLabel = (days) => {
    if (days < 1) return 'Created today';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
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
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-slate-600">{accountData.newUsers.length}</div>
          <div className="text-xs text-slate-500">New Users (&lt;30 days)</div>
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

      {/* New Users */}
      {accountData.newUsers.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h4 className="font-medium text-slate-800 mb-3">New User Activity</h4>
          <p className="text-sm text-slate-600 mb-3">
            {accountData.newUsers.length} recently registered users have edited this article.
          </p>
          <div className="space-y-2">
            {accountData.newUsers.slice(0, 5).map((user, index) => (
              <div key={index} className="flex items-center justify-between bg-white rounded p-3">
                <div className="flex flex-col">
                  <span className="font-medium text-slate-800">{user.username}</span>
                  <span className="text-xs text-slate-500">Created {formatCreationDate(user.accountAge)}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-700">{user.editCount} edits</div>
                  <div className="text-xs text-slate-500">{getAccountAgeLabel(user.accountAge)}</div>
                </div>
              </div>
            ))}
            {accountData.newUsers.length > 5 && (
              <div className="text-xs text-slate-500 text-center pt-2">
                +{accountData.newUsers.length - 5} more new users
              </div>
            )}
          </div>
        </div>
      )}

      {/* Blocked Users */}
      {accountData.blockedUsers.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h4 className="font-medium text-slate-800 mb-3">Blocked User Edits</h4>
          <p className="text-sm text-slate-600 mb-3">
            {accountData.blockedUsers.length} currently blocked users have edited this article.
          </p>
          <div className="space-y-2">
            {accountData.blockedUsers.slice(0, 3).map((user, index) => (
              <div key={index} className="flex items-center justify-between bg-white rounded p-3">
                <div className="flex items-center">
                  <span className="font-medium text-slate-800">{user.username}</span>
                  <span className="ml-2 px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs">
                    Blocked
                  </span>
                </div>
                <span className="text-sm text-slate-600">{user.editCount} edits</span>
              </div>
            ))}
            {accountData.blockedUsers.length > 3 && (
              <div className="text-xs text-slate-500 text-center pt-2">
                +{accountData.blockedUsers.length - 3} more blocked users
              </div>
            )}
          </div>
        </div>
      )}

      {/* Account Age Distribution */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h4 className="font-medium text-slate-800 mb-3">Account Age Distribution</h4>
        <div className="space-y-3">
          {accountData.accountAges.slice(0, 8).map((user, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-medium text-slate-700">{user.username}</span>
                <span className="text-xs text-slate-500">Created {formatCreationDate(user.accountAge)}</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-600">{getAccountAgeLabel(user.accountAge)}</div>
                <div className="text-xs text-slate-500">{user.editCount} edits</div>
              </div>
            </div>
          ))}
        </div>
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
