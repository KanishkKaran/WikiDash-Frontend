import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import SearchBar from './components/SearchBar'
import ArticleSummary from './components/ArticleSummary'
import TopEditorsChart from './components/TopEditorsChart'
import PageviewsChart from './components/PageviewsChart'
import EditTimelineChart from './components/EditTimelineChart'
import EditorNetworkGraph from './components/EditorNetworkGraph'
import TopRevertersChart from './components/TopRevertersChart'
import RevisionIntensityChart from './components/RevisionIntensityChart'
import UserEditProfileChart from './components/UserEditProfileChart'
import api from './utils/api'  // Replace axios with api utility

// Import page components
import AboutPage from './pages/AboutPage'
import HowToUsePage from './pages/HowToUsePage'
import PrivacyPage from './pages/PrivacyPage'

function Dashboard() {
  const [title, setTitle] = useState('ChatGPT')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [metrics, setMetrics] = useState({
    pageviews: 0,
    edits: 0,
    editors: 0,
    citations: 0,
    reverts: 0
  })
  const [editData, setEditData] = useState([])
  const [selectedEditor, setSelectedEditor] = useState('')

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Fetch article summary + pageviews
        const articleData = await api.get(`/api/article?title=${encodeURIComponent(title)}`)
        console.log("Article data:", articleData.data);
        
        // Fetch edit count and timeline data
        const editsData = await api.get(`/api/edits?title=${encodeURIComponent(title)}`)
        console.log("Edits data:", editsData.data);
        
        // Store revision data for timeline
        if (editsData.data && editsData.data.revisions) {
          setEditData(editsData.data.revisions)
        }
        
        // Fetch editors
        const editorsData = await api.get(`/api/editors?title=${encodeURIComponent(title)}`)
        console.log("Editors data:", editorsData.data);
        const editorsArray = Array.isArray(editorsData.data) ? editorsData.data : (editorsData.data.editors || [])
        
        // Fetch reverts data
        const revertsData = await api.get(`/api/reverters?title=${encodeURIComponent(title)}`)
        console.log("Reverters data:", revertsData.data);
        const revertersArray = Array.isArray(revertsData.data) ? 
          revertsData.data : (revertsData.data.reverters || [])
        
        // Calculate total reverts
        const totalReverts = revertersArray.reduce((sum, item) => sum + (item.reverts || 0), 0)
        
        // Set selected editor to top editor if available
        if (editorsArray.length > 0) {
          setSelectedEditor(editorsArray[0].user)
        } else {
          setSelectedEditor('')
        }
        
        // Fetch citations
        const citationsData = await api.get(`/api/citations?title=${encodeURIComponent(title)}`)
        console.log("Citations data:", citationsData.data);
        
        // Update metrics with all the data
        setMetrics({
          pageviews: articleData.data.pageviews?.reduce((sum, item) => sum + item.views, 0) || 0,
          edits: editsData.data.edit_count || 0,
          editors: editorsArray.length || 0,
          citations: citationsData.data.total_refs || 0,
          reverts: totalReverts || 0
        })
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchAllData()
  }, [title])

  // Handler to update selected editor
  const handleEditorSelect = (username) => {
    console.log("Editor selected:", username);
    setSelectedEditor(username);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <SearchBar title={title} onSearch={setTitle} />
        
        {error && (
          <div className="my-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p>{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center my-20">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin"></div>
              <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-200 animate-spin" style={{ animationDirection: 'reverse', opacity: 0.6 }}></div>
            </div>
          </div>
        ) : (
          <>
            {/* Metrics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-5 my-10">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-md shadow-indigo-100 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 font-medium mb-1 text-sm">Page Views</p>
                    <p className="text-2xl font-bold">{metrics.pageviews.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-md shadow-emerald-100 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 font-medium mb-1 text-sm">Edits</p>
                    <p className="text-2xl font-bold">{metrics.edits.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-md shadow-amber-100 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 font-medium mb-1 text-sm">Contributors</p>
                    <p className="text-2xl font-bold">
                      {metrics.editors ? metrics.editors.toLocaleString() : '—'}
                    </p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm flex items-center justify-center">
                    <svg x
