import React from 'react';

const HowToUsePage = () => {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">How to Use WikiDash</h1>
        
        <div className="prose max-w-none">
          <p className="text-lg text-slate-700 mb-8">
            Welcome to WikiDash! This guide will help you make the most of our Wikipedia analytics dashboard. Whether you're a researcher, student, educator, or curious wiki enthusiast, our tool provides valuable insights into Wikipedia article activity.
          </p>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Getting Started</h2>
            
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 mb-8 border border-indigo-100">
              <h3 className="text-xl font-medium text-indigo-800 mb-4">Searching for Articles</h3>
              <ol className="list-decimal pl-6 space-y-3">
                <li className="text-slate-700">
                  <span className="font-medium">Paste a Wikipedia URL:</span> The search bar is designed specifically for Wikipedia article URLs. Copy the full URL from your browser when viewing a Wikipedia page (e.g., "https://en.wikipedia.org/wiki/ChatGPT").
                </li>
                <li className="text-slate-700">
                  <span className="font-medium">Submit your search:</span> Click the "Search" button or press Enter to load the article's analytics dashboard.
                </li>
              </ol>
              <div className="mt-4 text-sm text-indigo-600">
                <p>💡 <span className="font-semibold">Important note:</span> The search function currently only works with Wikipedia URLs, not article titles or keywords. Make sure to copy the complete URL from Wikipedia.</p>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Understanding the Dashboard</h2>
            
            <div className="mb-8">
              <h3 className="text-xl font-medium text-slate-800 mb-4">1. Metrics Overview</h3>
              <p className="mb-4">At the top of your results, you'll see five key metrics:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-500">
                  <h4 className="font-semibold text-indigo-700">Page Views</h4>
                  <p className="text-sm text-slate-600">The total number of views the article has received in the analyzed period.</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 border-l-4 border-emerald-500">
                  <h4 className="font-semibold text-emerald-700">Edits</h4>
                  <p className="text-sm text-slate-600">The total number of edits made to the article.</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-500">
                  <h4 className="font-semibold text-amber-700">Contributors</h4>
                  <p className="text-sm text-slate-600">The number of unique editors who have modified the article.</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                  <h4 className="font-semibold text-red-700">Reverts</h4>
                  <p className="text-sm text-slate-600">Edits that undo previous changes, often indicating content disputes or vandalism cleanup.</p>
                </div>
                <div className="bg-violet-50 rounded-lg p-4 border-l-4 border-violet-500">
                  <h4 className="font-semibold text-violet-700">References</h4>
                  <p className="text-sm text-slate-600">The number of citations in the article, reflecting its research foundation.</p>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-xl font-medium text-slate-800 mb-4">2. Article Summary</h3>
              <p className="mb-4">
                Below the metrics, you'll find a summary of the article content directly from Wikipedia, along with a link to the full article.
              </p>
            </div>
            
            <div className="mb-8">
              <h3 className="text-xl font-medium text-slate-800 mb-4">3. Interactive Data Visualizations</h3>
              <p className="mb-4">The dashboard includes multiple interactive charts:</p>
              
              <div className="space-y-4 mb-4">
                <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-2">Pageviews Trend</h4>
                  <p className="text-sm text-slate-600 mb-2">Shows how article popularity changes over time. Look for spikes that might correspond to news events or public interest.</p>
                  <p className="text-xs text-slate-500 italic">Use the time filters (7 Days, 30 Days, All) to adjust the view period.</p>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-2">Edit Activity</h4>
                  <p className="text-sm text-slate-600 mb-2">Visualizes when edits occurred over time, showing how actively the content is maintained.</p>
                  <p className="text-xs text-slate-500 italic">Higher peaks indicate periods of intense editing activity.</p>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-2">Top Contributors</h4>
                  <p className="text-sm text-slate-600 mb-2">Shows which editors have made the most changes to the article.</p>
                  <p className="text-xs text-slate-500 italic">Click on any editor's bar to view their detailed profile below.</p>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-2">Revert Activity</h4>
                  <p className="text-sm text-slate-600 mb-2">Identifies editors who frequently revert changes, which can indicate content disputes or vandalism management.</p>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-2">Revision Intensity</h4>
                  <p className="text-sm text-slate-600 mb-2">Measures the level of editorial activity and potential controversy over time.</p>
                  <p className="text-xs text-slate-500 italic">Higher intensity scores might indicate periods of content disputes or significant updates.</p>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-2">Editor Profile</h4>
                  <p className="text-sm text-slate-600 mb-2">Shows the distribution of a selected editor's contributions across different articles.</p>
                  <p className="text-xs text-slate-500 italic">Use the dropdown to select different editors and explore their editing patterns.</p>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-2">Editor Network</h4>
                  <p className="text-sm text-slate-600 mb-2">An interactive visualization showing relationships between editors who work on the article.</p>
                  <p className="text-xs text-slate-500 italic">Hover over nodes to see connections and drag nodes to explore the network structure.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Advanced Usage Tips</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg p-5 shadow-md border border-slate-100">
                <div className="flex items-start mb-3">
                  <div className="bg-indigo-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-800">Compare Articles</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Open multiple browser tabs with different articles to compare their analytics side by side. This is useful for research and tracking related topics.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-5 shadow-md border border-slate-100">
                <div className="flex items-start mb-3">
                  <div className="bg-indigo-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-800">Track Over Time</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Return periodically to the same article to see how metrics change, especially after major news events related to the topic.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-5 shadow-md border border-slate-100">
                <div className="flex items-start mb-3">
                  <div className="bg-indigo-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-800">Identify Controversy</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Look for high revert counts and high revision intensity as indicators of contentious topics or editorial disputes.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-5 shadow-md border border-slate-100">
                <div className="flex items-start mb-3">
                  <div className="bg-indigo-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-800">Explore Editor Networks</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Use the editor network visualization to understand collaboration patterns and identify key community members who maintain content.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Troubleshooting</h2>
            
            <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
              <h3 className="text-lg font-medium text-amber-800 mb-4">Common Issues and Solutions</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-800">Invalid URL Format</h4>
                  <p className="text-sm text-slate-600">
                    Make sure to copy the complete Wikipedia URL. The URL should begin with "https://en.wikipedia.org/wiki/" followed by the article name. If you're copying from a Wikipedia page, use the URL from your browser's address bar.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-800">Missing Data</h4>
                  <p className="text-sm text-slate-600">
                    For very new articles or extremely obscure topics, some visualizations may show limited data. Try searching for more established articles if you encounter this issue.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-800">Loading Time</h4>
                  <p className="text-sm text-slate-600">
                    Articles with extensive edit histories might take longer to load. Please be patient as we gather and process the data from Wikipedia's API.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-800">Browser Compatibility</h4>
                  <p className="text-sm text-slate-600">
                    WikiDash works best on modern browsers. If you experience display issues, try updating your browser to the latest version.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">Need More Help?</h2>
            <p className="text-slate-700 mb-4">
              If you have questions, suggestions, or encounter issues not covered in this guide, please contact us at support@wiki-dash.com.
            </p>
            <p className="text-slate-700">
              We're continually improving WikiDash based on user feedback to make Wikipedia analytics more accessible and useful for everyone.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HowToUsePage;
