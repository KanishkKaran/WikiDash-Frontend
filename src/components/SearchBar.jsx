import React, { useState, useEffect } from 'react'

function SearchBar({ title, onSearch }) {
  const [input, setInput] = useState(title)
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setInput(title)
  }, [title])

  const extractTitle = (input) => {
    try {
      // Try to parse as URL first
      const url = new URL(input)
      if (url.hostname.includes('wikipedia.org')) {
        const parts = url.pathname.split('/')
        return decodeURIComponent(parts[parts.length - 1].replace(/_/g, ' '))
      }
    } catch {
      // Not a valid URL, treat as title
    }
    return input.trim()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const extracted = extractTitle(input)
    if (extracted && extracted !== title) {
      setIsLoading(true)
      // Simulate loading state for smoother UX
      setTimeout(() => {
        onSearch(extracted)
        setIsLoading(false)
      }, 300)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Paste Wikipedia URL..."
            aria-label="Search Wikipedia articles"
            className={`w-full px-12 py-4 border ${
              isFocused ? 'border-indigo-500 ring-4 ring-indigo-100' : 'border-slate-200'
            } rounded-full bg-white shadow-lg focus:outline-none transition-all duration-200 text-slate-700`}
          />
          {input && (
            <button
              type="button"
              onClick={() => setInput('')}
              className="absolute inset-y-0 right-24 flex items-center text-slate-400 hover:text-slate-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`absolute right-2 inset-y-1.5 px-6 rounded-full transition-all duration-200 ${
              isLoading || !input.trim() 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg hover:shadow-indigo-200'
            }`}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>
      <div className="mt-3 text-xs text-slate-400 text-center">
        Paste hyperlinks for eg: DonaldTrump, Artificial intelligence, Climate Change
      </div>
    </div>
  )
}

export default SearchBar
