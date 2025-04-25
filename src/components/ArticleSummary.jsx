import React, { useEffect, useState } from 'react'
import axios from 'axios'

function ArticleSummary({ title }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const res = await axios.get(`/api/article?title=${encodeURIComponent(title)}`)
        setSummary(res.data)
      } catch (err) {
        console.error('Error fetching article summary:', err)
        setError('Failed to load article summary')
      } finally {
        setLoading(false)
      }
    }
    
    fetchSummary()
  }, [title])

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded-full w-1/3 mb-6"></div>
          <div className="h-4 bg-slate-200 rounded-full mb-4 w-full"></div>
          <div className="h-4 bg-slate-200 rounded-full mb-4 w-full"></div>
          <div className="h-4 bg-slate-200 rounded-full mb-4 w-full"></div>
          <div className="h-4 bg-slate-200 rounded-full mb-4 w-3/4"></div>
          <div className="mt-8 h-3 bg-slate-200 rounded-full w-32"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center text-amber-600 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-center text-slate-700 mb-3">{error}</h2>
        <p className="text-center text-slate-600">Please try searching for a different Wikipedia article.</p>
      </div>
    )
  }

  if (!summary?.summary) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600">No information available for this article.</p>
      </div>
    )
  }

  const articleUrl = summary.summary.url || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`
  
  // Format date nicely if available
  const createdDate = summary.metadata?.created_at 
    ? new Date(summary.metadata.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{summary.summary.title}</h2>
        <a 
          href={articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium hover:bg-indigo-100 transition-colors group"
        >
          View on Wikipedia
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transform transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </a>
      </div>
      
      <div className="prose max-w-none text-slate-700 leading-relaxed text-lg">
        <p>{summary.summary.summary}</p>
      </div>
      
      {createdDate && (
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center text-sm text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>First created: {createdDate}</span>
        </div>
      )}
    </div>
  )
}

export default ArticleSummary