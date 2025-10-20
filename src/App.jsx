import React, { useState, useEffect, useCallback } from 'react'
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
import UserAccountAnalysis from './components/UserAccountAnalysis'
import api from './utils/api'

// Import page components
import AboutPage from './pages/AboutPage'
import HowToUsePage from './pages/HowToUsePage'
import PrivacyPage from './pages/PrivacyPage'
import UserNetworkPage from './pages/UserNetworkPage'

function Dashboard() {
  const [title, setTitle] = useState('Donald Trump')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [loadingStates, setLoadingStates] = useState({
    article: false,
    edits: false,
    editors: false,
    citations: false,
    reverts: false
  })
  const [metrics, setMetrics] = useState({
    pageviews: 0,
    edits: 0,
    editors: 0,
    citations: 0,
    reverts: 0
  })
  const [dashboardData, setDashboardData] = useState({
    articleData: null,
    editData: null,
    editorsData: null,
    revertsData: null,
    citationsData: null
  })
  const [selectedEditor, setSelectedEditor] = useState('')

  // Helper function to safely make API calls with error handling
  const safeApiCall = async (endpoint, dataKey, fallbackData = null) => {
    try {
      setLoadingStates(prev => ({ ...prev, [dataKey]: true }))
      const response = await api.get(endpoint)
      
      // Check if response contains error
      if (response.data && response.data.error) {
        console.warn(`API warning for ${endpoint}:`, response.data.error)
        return fallbackData
      }
      
      return response.data
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error)
      return fallbackData
    } finally {
      setLoadingStates(prev => ({ ...prev, [dataKey]: false }))
    }
  }

  // Progressive data loading function
  const fetchAllData = useCallback(async (articleTitle) => {
    setLoading(true)
    setError(null)
    
    // Reset dashboard data
    setDashboardData({
      articleData: null,
      editData: null,
      editorsData: null,
      revertsData: null,
      citationsData: null
    })
    
    // Reset metrics
    setMetrics({
      pageviews: 0,
      edits: 0,
      editors: 0,
      citations: 0,
      reverts: 0
    })
    
    console.log("Starting progressive data fetch for:", articleTitle)
    
    try {
      // Phase 1: Fetch essential data (article info + basic metrics)
      console.log("Phase 1: Fetching article summary and basic data...")
      
      const [articleData, editData] = await Promise.all([
        safeApiCall(`/api/article?title=${encodeURIComponent(articleTitle)}`, 'article', {
          title: articleTitle,
          summary: "Unable to load article summary",
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(articleTitle)}`,
          pageviews: []
        }),
        safeApiCall(`/api/edits?title=${encodeURIComponent(articleTitle)}`, 'edits', {
          edit_count: 0,
          revisions: []
        })
      ])
      
      // Update dashboard with Phase 1 data
      setDashboardData(prev => ({
        ...prev,
        articleData,
        editData
      }))
      
      // Calculate basic metrics from Phase 1
      const pageviewsTotal = articleData?.pageviews?.reduce((sum, item) => sum + item.views, 0) || 0
      const editsTotal = editData?.edit_count || 0
      
      setMetrics(prev => ({
        ...prev,
        pageviews: pageviewsTotal,
        edits: editsTotal
      }))
      
      console.log("Phase 1 complete - Basic data loaded")
      
      // Phase 2: Fetch secondary data (editors, citations, reverts)
      console.log("Phase 2: Fetching editors, citations, and reverts...")
      
      const [editorsData, citationsData, revertsData] = await Promise.all([
        safeApiCall(`/api/editors?title=${encodeURIComponent(articleTitle)}`, 'editors', { editors: [] }),
        safeApiCall(`/api/citations?title=${encodeURIComponent(articleTitle)}`, 'citations', { 
          total_refs: 0, 
          domain_breakdown: {} 
        }),
        safeApiCall(`/api/reverters?title=${encodeURIComponent(articleTitle)}`, 'reverts', { reverters: [] })
      ])
      
      // Update dashboard with Phase 2 data
      setDashboardData(prev => ({
        ...prev,
        editorsData,
        citationsData,
        revertsData
      }))
      
      // Process editors data safely
      const editorsArray = Array.isArray(editorsData) ? 
        editorsData : (editorsData?.editors || [])
      
      // Process reverts data safely
      const revertersArray = Array.isArray(revertsData) ? 
        revertsData : (revertsData?.reverters || [])
      
      const totalReverts = revertersArray.reduce((sum, item) => sum + (item.reverts || 0), 0)
      
      // Set selected editor to top editor if available
      if (editorsArray.length > 0) {
        setSelectedEditor(editorsArray[0].user)
      } else {
        setSelectedEditor('')
      }
      
      // Update complete metrics
      setMetrics(prev => ({
        ...prev,
        editors: editorsArray.length || 0,
        citations: citationsData?.total_refs || 0,
        reverts: totalReverts || 0
      }))
      
      console.log("Phase 2 complete - All data loaded successfully")
      
    } catch (err) {
      console.error('Critical error during data fetch:', err)
      setError('Some data could not be loaded. The available information is displayed below.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllData(title)
  }, [title, fetchAllData])

  // Handler to update selected editor
  const handleEditorSelect = (username) => {
    console.log("Editor selected:", username)
    setSelectedEditor(username)
  }

  // Check if we have any data to show
  const hasAnyData = dashboardData.articleData || dashboardData.editData || 
                     dashboardData.editorsData || dashboardData.citationsData

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <SearchBar title={title} onSearch={setTitle} />
        
        {error && (
          <div className="my-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {loading && !hasAnyData ? (
          <div className="flex flex-col items-center justify-center my-20">
            <div className="relative mb-4">
              <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin"></div>
              <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-200 animate-spin" style={{ animationDirection: 'reverse', opacity: 0.6 }}></div>
            </div>
            <p className="text-slate-600 font-medium">Loading Wikipedia data...</p>
            <p className="text-slate-500 text-sm mt-2">This may take a few moments</p>
          </div>
        ) : (
          <>
            {/* Metrics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-5 my-10">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-md shadow-indigo-100 p-6 text-white">
                <p className="text-indigo-100 font-medium mb-2">Page Views</p>
                <p className="text-3xl font-bold">
                  {loadingStates.article ? (
                    <div className="h-8 w-20 bg-indigo-400 rounded animate-pulse"></div>
                  ) : (
                    metrics.pageviews.toLocaleString()
                  )}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-md shadow-emerald-100 p-6 text-white">
                <p className="text-emerald-100 font-medium mb-2">Edits</p>
                <p className="text-3xl font-bold">
                  {loadingStates.edits ? (
                    <div className="h-8 w-16 bg-emerald-400 rounded animate-pulse"></div>
                  ) : (
                    metrics.edits.toLocaleString()
                  )}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-md shadow-amber-100 p-6 text-white">
                <p className="text-amber-100 font-medium mb-2">Contributors</p>
                <p className="text-3xl font-bold">
                  {loadingStates.editors ? (
                    <div className="h-8 w-12 bg-amber-400 rounded animate-pulse"></div>
                  ) : (
                    metrics.editors ? metrics.editors.toLocaleString() : '—'
                  )}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-md shadow-red-100 p-6 text-white">
                <p className="text-red-100 font-medium mb-2">Reverts</p>
                <p className="text-3xl font-bold">
                  {loadingStates.reverts ? (
                    <div className="h-8 w-10 bg-red-400 rounded animate-pulse"></div>
                  ) : (
                    metrics.reverts ? metrics.reverts.toLocaleString() : '—'
                  )}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-md shadow-violet-100 p-6 text-white">
                <p className="text-violet-100 font-medium mb-2">References</p>
                <p className="text-3xl font-bold">
                  {loadingStates.citations ? (
                    <div className="h-8 w-14 bg-violet-400 rounded animate-pulse"></div>
                  ) : (
                    metrics.citations ? metrics.citations.toLocaleString() : '—'
                  )}
                </p>
              </div>
            </div>

            {/* User Account Analysis Widget */}
            <div className="bg-white backdrop-blur-lg bg-opacity-90 shadow-xl rounded-xl overflow-hidden mb-10 border border-slate-100">
              <div className="border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                  Editor Account Security Analysis
                </h2>
                <p className="text-sm text-slate-500 mt-1">Account age and status information for all editors</p>
              </div>
              <UserAccountAnalysis title={title} />
            </div>
            
            {/* Article Summary - Always show if we have article data */}
            {dashboardData.articleData && (
              <div className="bg-white backdrop-blur-lg bg-opacity-90 shadow-xl rounded-xl overflow-hidden mb-10 border border-slate-100">
                <ArticleSummary title={title} />
              </div>
            )}
            
            {/* Charts Grid - Show individual components with their own loading states */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white backdrop-blur-lg bg-opacity-90 shadow-xl rounded-xl overflow-hidden border border-slate-100">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h2 className="text-lg font-semibold text-slate-800">Pageviews Trend</h2>
                </div>
                <PageviewsChart title={title} />
              </div>
              
              <div className="bg-white backdrop-blur-lg bg-opacity-90 shadow-xl rounded-xl overflow-hidden border border-slate-100">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h2 className="text-lg font-semibold text-slate-800">Edit Activity</h2>
                </div>
                <EditTimelineChart title={title} editData={dashboardData.editData?.revisions || []} />
              </div>
              
              <div className="bg-white backdrop-blur-lg bg-opacity-90 shadow-xl rounded-xl overflow-hidden border border-slate-100">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h2 className="text-lg font-semibold text-slate-800">Top Contributors</h2>
                </div>
                <TopEditorsChart title={title} onSelectEditor={handleEditorSelect} />
              </div>
              
              <div className="bg-white backdrop-blur-lg bg-opacity-90 shadow-xl rounded-xl overflow-hidden border border-slate-100">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h2 className="text-lg font-semibold text-slate-800">Revert Activity</h2>
                </div>
                <TopRevertersChart title={title} />
              </div>
              
              <div className="bg-white backdrop-blur-lg bg-opacity-90 shadow-xl rounded-xl overflow-hidden border border-slate-100">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h2 className="text-lg font-semibold text-slate-800">Revision Intensity</h2>
                </div>
                <RevisionIntensityChart title={title} />
              </div>
              
              {/* UserEditProfileChart - Integrated Editor Profile & Risk Assessment */}
              <div className="bg-white backdrop-blur-lg bg-opacity-90 shadow-xl rounded-xl overflow-hidden border border-slate-100">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h2 className="text-lg font-semibold text-slate-800">Editor Profile & Risk Assessment</h2>
                  <p className="text-sm text-slate-500 mt-1">Select an editor to view detailed profile and security analysis</p>
                </div>
                <UserEditProfileChart 
                  username={selectedEditor} 
                  title={title} 
                  selectedEditor={selectedEditor}
                  onEditorSelect={handleEditorSelect}
                  topEditors={dashboardData.editorsData?.editors || dashboardData.editorsData || []}
                />
              </div>
              
              <div className="bg-white backdrop-blur-lg bg-opacity-90 shadow-xl rounded-xl overflow-hidden lg:col-span-2 border border-slate-100">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h2 className="text-lg font-semibold text-slate-800">Editor Network</h2>
                </div>
                <EditorNetworkGraph title={title} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <header className="bg-slate-900 py-4 shadow-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link to="/" className="flex items-center hover:text-indigo-300">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="28" 
                    height="28" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-indigo-400 mr-2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <h1 className="text-2xl font-bold text-white">WikiDash</h1>
                </Link>
              </div>
              
              <div className="hidden md:flex space-x-6 text-slate-300">
                <Link to="/" className="hover:text-white transition-colors">Dashboard</Link>
                <Link to="/user-network" className="hover:text-white transition-colors">User Network</Link>
                <Link to="/about" className="hover:text-white transition-colors">About</Link>
                <Link to="/how-to-use" className="hover:text-white transition-colors">How to Use</Link>
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              </div>
              
              <div className="md:hidden">
                <button className="text-slate-300 hover:text-white focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/user-network" element={<UserNetworkPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-to-use" element={<HowToUsePage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
          </Routes>
        </div>
        
        <footer className="bg-slate-900 text-slate-400 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="text-indigo-400 mr-2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <p className="text-sm">WikiDash</p>
              </div>
              <div className="flex space-x-6">
                <Link to="/about" className="text-sm text-slate-400 hover:text-white transition-colors">About</Link>
                <Link to="/user-network" className="text-sm text-slate-400 hover:text-white transition-colors">User Network</Link>
                <Link to="/how-to-use" className="text-sm text-slate-400 hover:text-white transition-colors">How to Use</Link>
                <Link to="/privacy" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy</Link>
              </div>
              <p className="text-xs mt-4 md:mt-0">Data sourced from Wikipedia API • Created for education and analysis</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
