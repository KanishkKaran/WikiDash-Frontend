<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>About WikiDash - Wikipedia Analytics Dashboard</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
  </head>
  <body class="bg-slate-50 text-slate-800">
    <header class="bg-slate-900 py-4 shadow-md">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="28" 
              height="28" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              class="text-indigo-400 mr-2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <a href="/" class="text-2xl font-bold text-white">WikiDash</a>
          </div>
          <nav>
            <ul class="flex space-x-6 text-sm text-slate-300">
              <li><a href="/" class="hover:text-white">Home</a></li>
              <li><a href="/about" class="text-indigo-300 font-medium">About</a></li>
              <li><a href="/how-to-use" class="hover:text-white">How to Use</a></li>
              <li><a href="/privacy" class="hover:text-white">Privacy</a></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="bg-white shadow-md rounded-xl overflow-hidden">
        <div class="p-8">
          <h1 class="text-3xl font-bold text-slate-900 mb-6">About WikiDash</h1>
          
          <div class="prose max-w-none">
            <div class="mb-10">
              <p class="text-lg text-slate-700 leading-relaxed">
                WikiDash is an interactive analytics dashboard that visualizes Wikipedia article data, 
                providing insights into page popularity, edit history, contributor networks, and content evolution over time.
              </p>
            </div>
            
            <div class="mb-10">
              <h2 class="text-2xl font-semibold text-slate-800 mb-4">Our Mission</h2>
              <p class="text-slate-700 mb-4">
                WikiDash was created to make Wikipedia's wealth of metadata accessible and meaningful to everyone. 
                Our mission is to promote understanding of how collaborative knowledge is created, maintained, and 
                evolves on the world's largest encyclopedia.
              </p>
              <p class="text-slate-700">
                By providing visual analytics on Wikipedia's edit history, contributor networks, and content patterns, 
                we aim to support educators, researchers, journalists, and curious readers in exploring the stories behind 
                the articles.
              </p>
            </div>
            
            <div class="mb-10">
              <h2 class="text-2xl font-semibold text-slate-800 mb-4">What WikiDash Offers</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div class="bg-indigo-50 rounded-lg p-6 border border-indigo-100">
                  <div class="flex items-center mb-4">
                    <div class="bg-indigo-100 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 class="ml-3 text-xl font-medium text-indigo-800">Comprehensive Analytics</h3>
                  </div>
                  <p class="text-slate-700">
                    Multiple data visualizations provide a complete picture of an article's history, 
                    popularity, and development patterns.
                  </p>
                </div>
                
                <div class="bg-emerald-50 rounded-lg p-6 border border-emerald-100">
                  <div class="flex items-center mb-4">
                    <div class="bg-emerald-100 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 class="ml-3 text-xl font-medium text-emerald-800">Editor Insights</h3>
                  </div>
                  <p class="text-slate-700">
                    Discover who contributes to Wikipedia articles, their editing patterns, 
                    and how they collaborate or conflict with other editors.
                  </p>
                </div>
                
                <div class="bg-amber-50 rounded-lg p-6 border border-amber-100">
                  <div class="flex items-center mb-4">
                    <div class="bg-amber-100 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 class="ml-3 text-xl font-medium text-amber-800">Controversy Detection</h3>
                  </div>
                  <p class="text-slate-700">
                    Identify contentious topics through revert patterns, edit intensity, 
                    and contributor interactions, revealing editorial disputes.
                  </p>
                </div>
                
                <div class="bg-violet-50 rounded-lg p-6 border border-violet-100">
                  <div class="flex items-center mb-4">
                    <div class="bg-violet-100 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 class="ml-3 text-xl font-medium text-violet-800">Citation Analysis</h3>
                  </div>
                  <p class="text-slate-700">
                    Evaluate the strength of an article's sources with citation metrics and 
                    breakdowns of reference types.
                  </p>
                </div>
              </div>
            </div>
            
            <div class="mb-10">
              <h2 class="text-2xl font-semibold text-slate-800 mb-4">How Wikipedia Works</h2>
              <p class="text-slate-700 mb-4">
                Wikipedia is the world's largest collaborative knowledge project, with millions of articles in hundreds of languages, 
                all created and maintained by volunteers. Anyone can edit most articles, and all changes are tracked in a detailed edit history.
              </p>
              
              <div class="bg-slate-50 rounded-lg p-6 border border-slate-200 mt-6">
                <h3 class="text-xl font-medium text-slate-800 mb-3">Key Wikipedia Concepts</h3>
                <ul class="space-y-3">
                  <li class="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <span class="font-medium text-slate-900">Edits:</span>
                      <span class="text-slate-700"> Changes made to an article by contributors. Each edit is saved with a timestamp, username, and edit summary.</span>
                    </div>
                  </li>
                  <li class="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <span class="font-medium text-slate-900">Reverts:</span>
                      <span class="text-slate-700"> Edits that undo previous changes, often to fix errors or remove vandalism.</span>
                    </div>
                  </li>
                  <li class="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <span class="font-medium text-slate-900">Registered vs. Anonymous Editors:</span>
                      <span class="text-slate-700"> Contributors can have registered accounts with usernames or edit anonymously with their IP addresses shown.</span>
                    </div>
                  </li>
                  <li class="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <span class="font-medium text-slate-900">References:</span>
                      <span class="text-slate-700"> Citations that support article content, providing verification and credibility.</span>
                    </div>
                  </li>
                  <li class="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <span class="font-medium text-slate-900">Pageviews:</span>
                      <span class="text-slate-700"> The number of times an article has been viewed, indicating its popularity and reach.</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            <div class="mb-10">
              <h2 class="text-2xl font-semibold text-slate-800 mb-4">Who Can Benefit from WikiDash?</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div class="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                  <h3 class="text-lg font-semibold text-slate-800 mb-3">Educators & Students</h3>
                  <ul class="space-y-2 text-slate-700 text-sm">
                    <li>• Evaluate article reliability for research</li>
                    <li>• Study collaborative writing processes</li>
                    <li>• Analyze information evolution in digital spaces</li>
                    <li>• Develop digital literacy skills</li>
                  </ul>
                </div>
                
                <div class="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                  <h3 class="text-lg font-semibold text-slate-800 mb-3">Researchers & Academics</h3>
                  <ul class="space-y-2 text-slate-700 text-sm">
                    <li>• Track topics of evolving scholarly interest</li>
                    <li>• Analyze community dynamics and online collaboration</li>
                    <li>• Study information dissemination patterns</li>
                    <li>• Identify content disputes and resolution patterns</li>
                  </ul>
                </div>
                
                <div class="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                  <h3 class="text-lg font-semibold text-slate-800 mb-3">Journalists & Content Creators</h3>
                  <ul class="space-y-2 text-slate-700 text-sm">
                    <li>• Discover emerging trends and topics</li>
                    <li>• Trace public interest patterns over time</li>
                    <li>• Evaluate information controversy levels</li>
                    <li>• Find expert contributors in specific fields</li>
                  </ul>
                </div>
                
                <div class="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                  <h3 class="text-lg font-semibold text-slate-800 mb-3">Wiki Enthusiasts & Curious Readers</h3>
                  <ul class="space-y-2 text-slate-700 text-sm">
                    <li>• Explore the behind-the-scenes development of articles</li>
                    <li>• Understand how information evolves over time</li>
                    <li>• Discover active community members</li>
                    <li>• Identify potential bias or disputed content</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div class="mb-10">
              <h2 class="text-2xl font-semibold text-slate-800 mb-4">How WikiDash Works</h2>
              <p class="text-slate-700 mb-6">
                WikiDash pulls data from Wikipedia's public APIs to generate interactive visualizations.
                Here's what happens behind the scenes:
              </p>
              
              <div class="relative">
                <div class="absolute left-5 inset-y-0 w-0.5 bg-indigo-100"></div>
                
                <div class="relative pl-10 pb-8">
                  <div class="absolute left-4 -top-1 h-8 w-8 rounded-full bg-indigo-500 text-white flex items-center justify-center">1</div>
                  <h3 class="text-lg font-medium text-slate-800 mb-2">Data Retrieval</h3>
                  <p class="text-slate-700">
                    When you search for an article, WikiDash connects to Wikipedia's API to retrieve 
                    article content, edit history, pageview statistics, and contributor information.
                  </p>
                </div>
                
                <div class="relative pl-10 pb-8">
                  <div class="absolute left-4 -top-1 h-8 w-8 rounded-full bg-indigo-500 text-white flex items-center justify-center">2</div>
                  <h3 class="text-lg font-medium text-slate-800 mb-2">Data Processing</h3>
                  <p class="text-slate-700">
                    Our backend analyzes the raw data to extract patterns, identify relationships 
                    between editors, calculate activity metrics, and organize information for visualization.
                  </p>
                </div>
                
                <div class="relative pl-10 pb-8">
                  <div class="absolute left-4 -top-1 h-8 w-8 rounded-full bg-indigo-500 text-white flex items-center justify-center">3</div>
                  <h3 class="text-lg font-medium text-slate-800 mb-2">Interactive Visualization</h3>
                  <p class="text-slate-700">
                    The processed data is transformed into interactive charts and graphs that 
                    allow you to explore different aspects of the article's development and community.
                  </p>
                </div>
                
                <div class="relative pl-10">
                  <div class="absolute left-4 -top-1 h-8 w-8 rounded-full bg-indigo-500 text-white flex items-center justify-center">4</div>
                  <h3 class="text-lg font-medium text-slate-800 mb-2">Real-time Interaction</h3>
                  <p class="text-slate-700">
                    You can interact with the visualizations to filter time periods, select specific 
                    editors, explore network connections, and discover insights about Wikipedia's content creation process.
                  </p>
                </div>
              </div>
            </div>
            
            <div class="bg-indigo-50 rounded-xl p-6 border border-indigo-100 mb-10">
              <h2 class="text-2xl font-semibold text-indigo-900 mb-4">Our Commitment to Transparency</h2>
              <p class="text-slate-800 mb-4">
                WikiDash is an educational tool designed to highlight the collaborative nature of Wikipedia. 
                We believe in making the hidden layers of digital knowledge creation visible to everyone.
              </p>
              <p class="text-slate-800">
                All data presented on WikiDash comes directly from Wikipedia's public APIs and is 
                updated regularly. We do not modify, filter, or bias the presentation of this data.
              </p>
            </div>
            
            <div class="mb-6">
              <h2 class="text-2xl font-semibold text-slate-800 mb-4">Get Started Now</h2>
              <p class="text-slate-700 mb-6">
                Ready to explore the stories behind Wikipedia articles? Simply paste a Wikipedia article URL
                in the search bar on our home page and start your journey into collaborative knowledge creation.
              </p>
              
              <div class="flex justify-center">
                <a href="/" class="inline-block px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
                  Go to WikiDash Home
                </a>
              </div>
            </div>
            
            <div class="pt-8 mt-8 border-t border-slate-200">
              <h2 class="text-2xl font-semibold text-slate-800 mb-4">Contact Us</h2>
              <p class="text-slate-700">
                Have questions, suggestions, or feedback about WikiDash? We'd love to hear from you!
                Contact our team at <a href="mailto:info@wiki-dash.com" class="text-indigo-600 hover:text-indigo-800">info@wiki-dash.com</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <footer class="bg-slate-900 text-slate-400 py-8 mt-16">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="flex items-center mb-4 md:mb-0">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              class="text-indigo-400 mr-2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <p class="text-sm">WikiDash</p>
          </div>
          <p class="text-xs">Data sourced from Wikipedia API • Created for education and analysis</p>
        </div>
      </div>
    </footer>
  </body>
</html>
