import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const RiskAssessmentCard = ({ title }) => {
  const [riskData, setRiskData] = useState({
    editorConcentration: 0,
    vandalismRisk: 0,
    topEditorPercentage: 0,
    topEditorName: '',
    anonEditPercentage: 0,
    loading: true
  });

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        // Fetch editors data
        const editorsResponse = await api.get(`/api/editors?title=${encodeURIComponent(title)}`);
        const editorsArray = Array.isArray(editorsResponse.data) ? 
          editorsResponse.data : (editorsResponse.data.editors || []);

        // Fetch edits data to get total edits and anonymous edits
        const editsResponse = await api.get(`/api/edits?title=${encodeURIComponent(title)}`);
        const totalEdits = editsResponse.data.edit_count || 0;
        const revisions = editsResponse.data.revisions || [];

        // Calculate Editor Concentration
        let topEditorPercentage = 0;
        let topEditorName = '';
        let editorConcentration = 0;

        if (editorsArray.length > 0 && totalEdits > 0) {
          const topEditor = editorsArray[0];
          topEditorName = topEditor.user;
          topEditorPercentage = ((topEditor.edits / totalEdits) * 100).toFixed(1);
          
          // Calculate concentration score (0-100)
          // High concentration = High Risk
          editorConcentration = Math.min(topEditorPercentage * 1.5, 100);
        }

        // Calculate Vandalism Risk
        // Count anonymous (IP) edits
        const anonEdits = revisions.filter(rev => {
          const user = rev.user || '';
          // IP addresses are anonymous editors
          return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(user);
        }).length;

        const anonEditPercentage = totalEdits > 0 ? 
          ((anonEdits / totalEdits) * 100).toFixed(1) : 0;

        // Vandalism Risk Score (0-100)
        // Higher anonymous edit percentage = Higher risk
        const vandalismRisk = Math.min(anonEditPercentage * 2, 100);

        setRiskData({
          editorConcentration: Math.round(editorConcentration),
          vandalismRisk: Math.round(vandalismRisk),
          topEditorPercentage,
          topEditorName,
          anonEditPercentage,
          loading: false
        });

      } catch (error) {
        console.error('Error fetching risk data:', error);
        setRiskData(prev => ({ ...prev, loading: false }));
      }
    };

    if (title) {
      fetchRiskData();
    }
  }, [title]);

  const getRiskColor = (score) => {
    if (score >= 70) return 'bg-red-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getRiskBadgeColor = (score) => {
    if (score >= 70) return 'bg-red-50 text-red-700 border-red-200';
    if (score >= 40) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  const getRiskLabel = (score) => {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Moderate';
    return 'Low Risk';
  };

  if (riskData.loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Content Risk Assessment</h3>
        <span className="text-xs text-slate-500">Based on Wikipedia Policy Guidelines</span>
      </div>

      {/* Editor Concentration Risk */}
      <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 mb-1 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Editor Concentration Risk
            </h4>
            <p className="text-xs text-slate-500 mb-3">NPOV Policy - Diversity of Contributors</p>
            
            {riskData.topEditorName && (
              <div className="bg-slate-50 rounded p-3 mb-3">
                <p className="text-sm text-slate-700">
                  <strong className="text-slate-900">{riskData.topEditorName}</strong> contributed{' '}
                  <strong className="text-indigo-600">{riskData.topEditorPercentage}%</strong> of all edits
                </p>
              </div>
            )}
          </div>
          <span className={`px-3 py-1 text-sm rounded-full font-medium border ${getRiskBadgeColor(riskData.editorConcentration)}`}>
            {riskData.editorConcentration}
          </span>
        </div>
        
        <div className="bg-slate-100 rounded-full h-3 overflow-hidden mb-2">
          <div 
            className={`h-full transition-all duration-500 ${getRiskColor(riskData.editorConcentration)}`}
            style={{ width: `${riskData.editorConcentration}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">{getRiskLabel(riskData.editorConcentration)}</span>
          <span className="text-slate-500">Score: {riskData.editorConcentration}/100</span>
        </div>

        {riskData.editorConcentration >= 70 && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-800">
              <strong>⚠️ High Concentration:</strong> Article may violate NPOV policy. Single editor dominance can introduce bias.
            </p>
          </div>
        )}
        {riskData.editorConcentration >= 40 && riskData.editorConcentration < 70 && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
            <p className="text-sm text-amber-800">
              <strong>⚡ Moderate Concentration:</strong> Consider inviting more editors to improve diversity.
            </p>
          </div>
        )}
      </div>

      {/* Vandalism Risk */}
      <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 mb-1 flex items-center">
              <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Vandalism Risk
            </h4>
            <p className="text-xs text-slate-500 mb-3">Anonymous Edit Patterns</p>
            
            <div className="bg-slate-50 rounded p-3 mb-3">
              <p className="text-sm text-slate-700">
                <strong className="text-red-600">{riskData.anonEditPercentage}%</strong> of edits from{' '}
                <strong className="text-slate-900">anonymous users</strong> (IP addresses)
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 text-sm rounded-full font-medium border ${getRiskBadgeColor(riskData.vandalismRisk)}`}>
            {riskData.vandalismRisk}
          </span>
        </div>
        
        <div className="bg-slate-100 rounded-full h-3 overflow-hidden mb-2">
          <div 
            className={`h-full transition-all duration-500 ${getRiskColor(riskData.vandalismRisk)}`}
            style={{ width: `${riskData.vandalismRisk}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">{getRiskLabel(riskData.vandalismRisk)}</span>
          <span className="text-slate-500">Score: {riskData.vandalismRisk}/100</span>
        </div>

        {riskData.vandalismRisk >= 70 && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-800">
              <strong>🚨 High Vandalism Risk:</strong> Consider semi-protecting this page or increasing monitoring.
            </p>
          </div>
        )}
        {riskData.vandalismRisk >= 40 && riskData.vandalismRisk < 70 && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
            <p className="text-sm text-amber-800">
              <strong>⚠️ Moderate Risk:</strong> Monitor for potential vandalism from anonymous editors.
            </p>
          </div>
        )}
      </div>

      {/* Overall Summary */}
      {(riskData.editorConcentration >= 40 || riskData.vandalismRisk >= 40) && (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-5">
          <h4 className="font-semibold text-indigo-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Recommended Actions
          </h4>
          <ul className="space-y-2 text-sm text-indigo-800">
            {riskData.editorConcentration >= 70 && (
              <li>• <strong>NPOV Review:</strong> Request WikiProject review for potential bias</li>
            )}
            {riskData.editorConcentration >= 40 && riskData.editorConcentration < 70 && (
              <li>• <strong>Encourage Diversity:</strong> Invite more editors from relevant WikiProjects</li>
            )}
            {riskData.vandalismRisk >= 70 && (
              <li>• <strong>Protection Needed:</strong> Consider semi-protection to prevent anonymous vandalism</li>
            )}
            {riskData.vandalismRisk >= 40 && riskData.vandalismRisk < 70 && (
              <li>• <strong>Watchlist:</strong> Add to watchlist for regular monitoring</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RiskAssessmentCard;
