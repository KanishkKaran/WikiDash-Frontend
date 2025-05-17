import React from 'react';

const AboutPage = () => {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">About WikiDash</h1>
          
          <div className="prose max-w-none">
            <div className="mb-10">
              <p className="text-lg text-slate-700 leading-relaxed">
                WikiDash is an interactive analytics dashboard that visualizes Wikipedia article data, 
                providing insights into page popularity, edit history, contributor networks, and content evolution over time.
              </p>
            </div>
            
            <div className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">Our Mission</h2>
              <p className="text-slate-700 mb-4">
                WikiDash was created to make Wikipedia's wealth of metadata accessible and meaningful to everyone. 
                Our mission is to promote understanding of how collaborative knowledge is created, maintained, and 
                evolves on the world's largest encyclopedia.
              </p>
              <p className="text-slate-700">
                By providing visual analytics on Wikipedia's edit history, contributor networks, and content patterns, 
                we aim to support educators, researchers, journalists, and curious readers in exploring the stories behind 
                the articles.
              </p>
            </div>
            
            <div className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">What WikiDash Offers</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-100">
                  <div className="flex items-center mb-4">
                    <div className="bg-indigo-100 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="ml-3 text-xl font-medium text-indigo-800">Comprehensive Analytics</h3>
                  </div>
                  <p className="text-slate-700">
                    Multiple data visualizations provide a complete picture of an article's history, 
                    popularity, and development patterns.
                  </p>
                </div>
                
                <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-100">
                  <div className="flex items-center mb-4">
                    <div className="bg-emerald-100 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="ml-3 text-xl font-medium text-emerald-800">Editor Insights</h3>
                  </div>
                  <p className="text-slate-700">
                    Discover who contributes to Wikipedia articles, their editing patterns, 
                    and how they collaborate or conflict with other editors.
                  </p>
                </div>
                
                <div className="bg-amber-50 rounded-lg p-6 border border-amber-100">
                  <div className="flex items-center mb-4">
                    <div className="bg-amber-100 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="ml-3 text-xl font-medium text-amber-800">Controversy Detection</h3>
                  </div>
                  <p className="text-slate-700">
                    Identify contentious topics through revert patterns, edit intensity, 
                    and contributor interactions, revealing editorial disputes.
                  </p>
                </div>
                
                <div className="bg-violet-50 rounded-lg p-6 border border-violet-100">
                  <div className="flex items-center mb-4">
                    <div className="bg-violet-100 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="ml-3 text-xl font-medium text-violet-800">Citation Analysis</h3>
                  </div>
                  <p className="text-slate-700">
                    Evaluate the strength of an article's sources with citation metrics and 
                    breakdowns of reference types.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">How Wikipedia Works</h2>
              <p className="text-slate-700 mb-4">
                Wikipedia is the world's largest collaborative knowledge project, with millions of articles in hundreds of languages, 
                all created and maintained by volunteers. Anyone can edit most articles, and all changes are tracked in a detailed edit history.
              </p>
              
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 mt-6">
                <h3 className="text-xl font-medium text-slate-800 mb-3">Key Wikipedia Concepts</h3>
                <ul className="space-y-3">
                  <li className="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <span className="font-medium text-slate-900">Edits:</span>
                      <span className="text-slate-700"> Changes made to an article by contributors. Each edit is saved with a timestamp, username, and edit summary.</span>
                    </div>
                  </li>
                  <li className="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <span className="font-medium text-slate-900">Reverts:</span>
                      <span className="text-slate-700"> Edits that undo previous changes, often to fix errors or remove vandalism.</span>
                    </div>
                  </li>
                  <li className="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <span className="font-medium text-slate-900">Registered vs. Anonymous Editors:</span>
                      <span className="text-slate-700"> Contributors can have registered accounts with usernames or edit anonymously with their IP addresses shown.</span>
                    </div>
                  </li>
                  <li className="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <span className="font-medium text-slate-900">References:</span>
                      <span className="text-slate-700"> Citations that support article content, providing verification and credibility.</span>
                    </div>
                  </li>
                  <li className="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <span className="font-medium text-slate-900">Pageviews:</span>
                      <span className="text-slate-700"> The number of times an article has been viewed, indicating its popularity and reach.</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">Who Can Benefit from WikiDash?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Educators & Students</h3>
                  <ul className="space-y-2 text-slate-700 text-sm">
                    <li>• Evaluate article reliability for research</li>
                    <li>• Study collaborative writing processes</li>
                    <li>• Analyze information evolution in digital spaces</li>
                    <li>• Develop digital literacy skills</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Researchers & Academics</h3>
                  <ul className="space-y-2 text-slate-700 text-sm">
                    <li>• Track topics of evolving scholarly interest</li>
                    <li>• Analyze community dynamics and online collaboration</li>
                    <li>• Study information dissemination patterns</li>
                    <li>• Identify content disputes and resolution patterns</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Journalists & Content Creators</h3>
                  <ul className="space-y-2 text-slate-700 text-sm">
                    <li>• Discover emerging trends and topics</li>
                    <li>• Trace public interest patterns over time</li>
                    <li>• Evaluate information controversy levels</li>
                    <li>• Find expert contributors in specific fields</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Wiki Enthusiasts & Curious Readers</h3>
                  <ul className="space-y-2 text-slate-700 text-sm">
                    <li>• Explore the behind-the-scenes development of articles</li>
                    <li>• Understand how information evolves over time</li>
                    <li>• Discover active community members</li>
                    <li>• Identify potential bias or disputed content</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100 mb-10">
              <h2 className="text-2xl font-semibold text-indigo-900 mb-4">Our Commitment to Transparency</h2>
              <p className="text-slate-800 mb-4">
                WikiDash is an educational tool designed to highlight the collaborative nature of Wikipedia. 
                We believe in making the hidden layers of digital knowledge creation visible to everyone.
              </p>
              <p className="text-slate-800">
                All data presented on WikiDash comes directly from Wikipedia's public APIs and is 
                updated regularly. We do not modify, filter, or bias the presentation of this data.
              </p>
            </div>
            
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">Get Started Now</h2>
              <p className="text-slate-700 mb-6">
                Ready to explore the stories behind Wikipedia articles? Simply paste a Wikipedia article URL
                in the search bar on our home page and start your journey into collaborative knowledge creation.
              </p>
              
              <div className="flex justify-center">
                <a href="/" className="inline-block px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
                  Go to WikiDash Home
                </a>
              </div>
            </div>
            
            <div className="pt-8 mt-8 border-t border-slate-200">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">Contact Us</h2>
              <p className="text-slate-700">
                Have questions, suggestions, or feedback about WikiDash? We'd love to hear from you!
                Contact our team at <a href="mailto:info@wiki-dash.com" className="text-indigo-600 hover:text-indigo-800">info@wiki-dash.com</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AboutPage;
