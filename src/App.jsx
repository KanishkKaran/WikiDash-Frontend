import React, { useState, useEffect } from 'react'
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

function App() {
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
        
        // Fetch edit count and timeline data
        const editsData = await api.get(`/api/edits?title=${encodeURIComponent(title)}`)
        
        // Store revision data for timeline
        if (editsData.data && editsData.data.revisions) {
          setEditData(editsData.data.revisions)
        }
        
        // Fetch editors
        const editorsData = await api.get(`/api/editors?title=${encodeURIComponent(title)}`)
        const editorsArray = Array.isArray(editorsData.data) ? editorsData.data : (editorsData.data.editors || [])
        
        // Fetch reverts data
        const revertsData = await api.get(`/api/reverters?title=${encodeURIComponent(title)}`)
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
    setSelectedEditor(username);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="bg-slate-900 py-4 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
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
            </div>
            <span className="text-sm text-slate-300">Visualizing Wikipedia Analytics</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <SearchBar title={title} onSearch={setTitle} />
        
        {error && (
          <div className="my-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p>{error}</p>
          </div>
        )
}

export default App}
        
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
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-indigo-100 font-medium mb-1">Page Views</p>
                    <p className="text-3xl font-bold">{metrics.pageviews.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-md shadow-emerald-100 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-emerald-100 font-medium mb-1">Edits</p>
                    <p className="text-3xl font-bold">{metrics.edits.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-md shadow-amber-100 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-amber-100 font-medium mb-1">Contributors</p>
                    <p className="text-3xl font-bold">
                      {metrics.editors ? metrics.editors.toLocaleString() : '—'}
                    </p>
                  </div>
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-md shadow-red-100 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-red-100 font-medium mb-1">Reverts</p>
                    <p className="text-3xl font-bold">
                      {metrics.reverts ? metrics.reverts.toLocaleString() : '—'}
                    </p>
                  </div>
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-md shadow-violet-100 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-violet-100 font-medium mb-1">References</p>
                    <p className="text-3xl font-bold">
                      {metrics.citations ? metrics.citations.toLocaleString() : '—'}
                    </p>
                  </div>
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white backdrop-blur-lg bg-opacity-90 shadow-xl rounded-xl overflow-hidden mb-10 border border-slate-100">
              <ArticleSummary title={title} />
            </div>
            
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
                <EditTimelineChart title={title} editData={editData} />
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
              
              {/* New Revision Intensity Chart */}
              <div className="bg-white backdrop-blur-lg bg-opacity-90 shadow-xl rounded-xl overflow-hidden border border-slate-100">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h2 className="text-lg font-semibold text-slate-800">Revision Intensity</h2>
                </div>
                <RevisionIntensityChart title={title} />
              </div>
              
              {/* New User Edit Profile Chart */}
              <div className="bg-white backdrop-blur-lg bg-opacity-90 shadow-xl rounded-xl overflow-hidden border border-slate-100">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h2 className="text-lg font-semibold text-slate-800">Editor Profile</h2>
                </div>
                <UserEditProfileChart username={selectedEditor} title={title} />
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
      
      <footer className="bg-slate-900 text-slate-400 py-8 mt-16">
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
            <p className="text-xs">Data sourced from Wikipedia API • Created for education and analysis</p>
          </div>
        </div>
      </footer>
    </div>
  )
