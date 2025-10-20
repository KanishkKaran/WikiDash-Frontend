// src/pages/UserNetworkPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import * as d3 from 'd3';

const UserNetworkPage = () => {
  const [username, setUsername] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [networkData, setNetworkData] = useState(null);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  // Fetch user contributions and build network data
  const fetchUserNetwork = async (user) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching user contributions for:", user);
      
      const response = await api.get(`/api/user/${encodeURIComponent(user)}/contributions`);
      console.log("User contributions response:", response.data);
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      const contributions = response.data.contributions || [];
      const totalEdits = response.data.total_edits || 0;
      
      if (contributions.length === 0) {
        throw new Error("No contributions found for this user");
      }
      
      // Set user data
      setUserData({
        username: user,
        totalEdits: totalEdits,
        articlesEdited: contributions.length,
        topArticle: contributions[0]?.title || 'N/A',
        topArticleEdits: contributions[0]?.edits || 0
      });
      
      // Create network data
      const nodes = contributions.slice(0, 50).map((contrib, index) => ({
        id: contrib.title,
        edits: contrib.edits,
        type: 'article',
        size: Math.max(8, Math.min(25, Math.sqrt(contrib.edits) * 3)),
        color: getNodeColor(contrib.edits, contributions),
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(contrib.title.replace(/ /g, '_'))}`
      }));
      
      // Add the user as the central node
      const userNode = {
        id: user,
        edits: totalEdits,
        type: 'user',
        size: 30,
        color: '#6366f1',
        url: `https://en.wikipedia.org/wiki/User:${encodeURIComponent(user)}`
      };
      
      nodes.unshift(userNode);
      
      // Create links from user to articles
      const links = contributions.slice(0, 50).map(contrib => ({
        source: user,
        target: contrib.title,
        value: contrib.edits,
        strength: Math.min(1, contrib.edits / 20) // Normalize link strength
      }));
      
      // Add some article-to-article connections based on edit similarity
      const articleLinks = [];
      for (let i = 0; i < Math.min(contributions.length, 20); i++) {
        for (let j = i + 1; j < Math.min(contributions.length, 20); j++) {
          const article1 = contributions[i];
          const article2 = contributions[j];
          
          // Connect articles with similar edit counts
          const editRatio = Math.min(article1.edits, article2.edits) / Math.max(article1.edits, article2.edits);
          
          if (editRatio > 0.5 && Math.random() > 0.7) { // Add some randomness for visual variety
            articleLinks.push({
              source: article1.title,
              target: article2.title,
              value: editRatio * 10,
              strength: 0.3,
              type: 'related'
            });
          }
        }
      }
      
      links.push(...articleLinks);
      
      setNetworkData({ nodes, links });
      
    } catch (err) {
      console.error('Error fetching user network:', err);
      setError(err.message || 'Failed to fetch user data');
      setUserData(null);
      setNetworkData(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Get node color based on edit count
  const getNodeColor = (edits, allContribs) => {
    const maxEdits = Math.max(...allContribs.map(c => c.edits));
    const ratio = edits / maxEdits;
    
    if (ratio > 0.7) return '#dc2626'; // High activity - red
    if (ratio > 0.4) return '#ea580c'; // Medium-high - orange
    if (ratio > 0.2) return '#ca8a04'; // Medium - yellow
    return '#059669'; // Low - green
  };
  
  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setUsername(searchInput.trim());
      fetchUserNetwork(searchInput.trim());
    }
  };
  
  // D3 visualization effect
  useEffect(() => {
    if (!networkData || !svgRef.current) return;
    
    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();
    
    const containerRect = svgRef.current.parentElement.getBoundingClientRect();
    const width = Math.max(1000, containerRect.width);
    const height = Math.max(700, containerRect.height);
    
    // Create tooltip
    if (!tooltipRef.current) {
      tooltipRef.current = d3.select("body")
        .append("div")
        .attr("class", "user-network-tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "rgba(30, 41, 59, 0.95)")
        .style("color", "white")
        .style("border-radius", "8px")
        .style("padding", "12px 16px")
        .style("font-size", "13px")
        .style("pointer-events", "none")
        .style("z-index", 1000)
        .style("max-width", "300px")
        .style("box-shadow", "0 4px 6px -1px rgba(0, 0, 0, 0.1)");
    }
    
    const tooltip = tooltipRef.current;
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("width", "100%")
      .attr("height", "100%");
    
    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });
    
    svg.call(zoom);
    
    // Create container for zoomable content
    const container = svg.append("g");
    
    // Create simulation
    const simulation = d3.forceSimulation(networkData.nodes)
      .force("link", d3.forceLink(networkData.links).id(d => d.id).distance(d => {
        if (d.type === 'related') return 100;
        return Math.max(50, 150 - (d.value * 5)); // Closer for more edits
      }))
      .force("charge", d3.forceManyBody().strength(d => {
        if (d.type === 'user') return -800;
        return -200;
      }))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(d => d.size + 10));
    
    // Create links
    const link = container.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(networkData.links)
      .join("line")
      .attr("stroke", d => d.type === 'related' ? "#94a3b8" : "#64748b")
      .attr("stroke-width", d => Math.sqrt(d.value) + 1)
      .attr("stroke-opacity", d => d.type === 'related' ? 0.3 : 0.6);
    
    // Create nodes
    const node = container.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(networkData.nodes)
      .join("circle")
      .attr("r", d => d.size)
      .attr("fill", d => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", d => d.type === 'user' ? 3 : 2)
      .style("cursor", "pointer")
      .call(drag(simulation))
      .on("mouseover", function(event, d) {
        // Highlight connected nodes and links
        const connectedNodeIds = new Set();
        
        if (d.type === 'user') {
          // If hovering over user, highlight all articles
          networkData.links.forEach(link => {
            if (link.source.id === d.id || link.source === d.id) {
              const targetId = typeof link.target === 'object' ? link.target.id : link.target;
              connectedNodeIds.add(targetId);
            }
          });
        } else {
          // If hovering over article, highlight user and related articles
          networkData.links.forEach(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            
            if (sourceId === d.id || targetId === d.id) {
              connectedNodeIds.add(sourceId);
              connectedNodeIds.add(targetId);
            }
          });
        }
        
        connectedNodeIds.add(d.id);
        
        // Update node opacity
        node.attr("opacity", node => connectedNodeIds.has(node.id) ? 1 : 0.2);
        
        // Update link opacity
        link.attr("opacity", link => {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          return (sourceId === d.id || targetId === d.id) ? 1 : 0.1;
        });
        
        // Show tooltip
        tooltip.transition()
          .duration(200)
          .style("opacity", .95);
        
        if (d.type === 'user') {
          tooltip.html(`
            <div style="font-weight: bold; margin-bottom: 8px;">${d.id}</div>
            <div>Total Edits: <span style="color: #60a5fa;">${d.edits.toLocaleString()}</span></div>
            <div>Articles Edited: <span style="color: #34d399;">${networkData.nodes.length - 1}</span></div>
            <div style="margin-top: 8px; font-size: 11px; color: #cbd5e1;">Click to view user page</div>
          `);
        } else {
          tooltip.html(`
            <div style="font-weight: bold; margin-bottom: 8px;">${d.id}</div>
            <div>Edits by ${username}: <span style="color: #f87171;">${d.edits}</span></div>
            <div style="margin-top: 8px; font-size: 11px; color: #cbd5e1;">Click to view article</div>
          `);
        }
        
        tooltip
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        // Reset highlighting
        node.attr("opacity", 1);
        link.attr("opacity", d => d.type === 'related' ? 0.3 : 0.6);
        
        // Hide tooltip
        tooltip.transition()
          .duration(300)
          .style("opacity", 0);
      })
      .on("click", function(event, d) {
        // Open Wikipedia page in new tab
        window.open(d.url, '_blank');
      });
    
    // Add labels for important nodes
    const label = container.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(networkData.nodes.filter(d => d.type === 'user' || d.edits > 10))
      .join("text")
      .attr("font-size", d => d.type === 'user' ? 14 : 11)
      .attr("font-weight", d => d.type === 'user' ? 'bold' : 'normal')
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle")
      .attr("dy", d => d.type === 'user' ? 5 : 4)
      .attr("fill", d => d.type === 'user' ? '#1e293b' : '#475569')
      .text(d => {
        if (d.type === 'user') return d.id;
        return d.id.length > 20 ? d.id.substring(0, 17) + '...' : d.id;
      })
      .attr("pointer-events", "none");
    
    // Add legend
    const legend = svg.append("g")
      .attr("transform", "translate(20, 20)")
      .attr("class", "legend");
    
    const legendData = [
      { color: '#6366f1', label: 'User', size: 15 },
      { color: '#dc2626', label: 'High activity article (>70%)', size: 12 },
      { color: '#ea580c', label: 'Medium-high activity (40-70%)', size: 10 },
      { color: '#ca8a04', label: 'Medium activity (20-40%)', size: 8 },
      { color: '#059669', label: 'Low activity (<20%)', size: 6 }
    ];
    
    legend.selectAll("circle")
      .data(legendData)
      .join("circle")
      .attr("cx", 10)
      .attr("cy", (d, i) => i * 25 + 10)
      .attr("r", d => d.size / 2)
      .attr("fill", d => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1);
    
    legend.selectAll("text")
      .data(legendData)
      .join("text")
      .attr("x", 25)
      .attr("y", (d, i) => i * 25 + 15)
      .attr("font-size", 12)
      .attr("fill", "#374151")
      .text(d => d.label);
    
    // Drag behavior
    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
    
    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      
      node
        .attr("cx", d => d.x = Math.max(d.size, Math.min(width - d.size, d.x)))
        .attr("cy", d => d.y = Math.max(d.size, Math.min(height - d.size, d.y)));
      
      label
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });
    
    // Cleanup function
    return () => {
      if (tooltipRef.current) {
        d3.select(tooltipRef.current).remove();
        tooltipRef.current = null;
      }
    };
  }, [networkData, username]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Wikipedia User Network Analysis
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Explore a Wikipedia user's editing network and discover the articles they contribute to. 
            See their editing patterns and the interconnections between their contributions.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-10">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                  Wikipedia Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter Wikipedia username (e.g., Jimmy Wales)"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                  disabled={loading}
                />
              </div>
              <div className="sm:self-end">
                <button
                  type="submit"
                  disabled={loading || !searchInput.trim()}
                  className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Analyzing...' : 'Analyze User'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center my-20">
            <div className="relative mb-4">
              <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin"></div>
            </div>
            <p className="text-slate-600 font-medium">Analyzing user contributions...</p>
            <p className="text-slate-500 text-sm mt-2">This may take a moment</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-10">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* User Stats */}
        {userData && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">User Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {userData.totalEdits.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600">Total Edits</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  {userData.articlesEdited.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600">Articles Edited</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-amber-600 mb-2 truncate" title={userData.topArticle}>
                  {userData.topArticle.length > 15 ? userData.topArticle.substring(0, 15) + '...' : userData.topArticle}
                </div>
                <div className="text-sm text-slate-600">Top Article</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {userData.topArticleEdits}
                </div>
                <div className="text-sm text-slate-600">Edits on Top Article</div>
              </div>
            </div>
          </div>
        )}

        {/* Network Visualization */}
        {networkData && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-slate-200 px-8 py-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Editing Network</h2>
              <p className="text-slate-600">
                Interactive network showing {userData.username}'s contributions across Wikipedia articles. 
                Hover over nodes for details, click to visit articles, and drag to explore relationships.
              </p>
            </div>
            
            <div className="p-8">
              <div className="w-full h-[800px] border border-slate-200 rounded-lg bg-slate-50">
                <svg ref={svgRef} width="100%" height="100%"></svg>
              </div>
              
              <div className="mt-6 bg-slate-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-slate-700 mb-2">How to use this visualization</h3>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>• <span className="font-medium">Hover</span> over nodes to see article details and editing statistics</li>
                  <li>• <span className="font-medium">Click</span> on any node to open the Wikipedia page in a new tab</li>
                  <li>• <span className="font-medium">Drag</span> nodes to explore the network structure</li>
                  <li>• <span className="font-medium">Zoom and pan</span> to navigate the large network</li>
                  <li>• Node <span className="font-medium">size</span> represents number of edits by this user</li>
                  <li>• Node <span className="font-medium">color</span> indicates relative activity level on that article</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!userData && !loading && !error && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Getting Started</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">How to use this tool</h3>
                <ol className="space-y-3 text-slate-600">
                  <li className="flex">
                    <span className="bg-indigo-100 text-indigo-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0">1</span>
                    Enter a Wikipedia username in the search bar above
                  </li>
                  <li className="flex">
                    <span className="bg-indigo-100 text-indigo-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0">2</span>
                    Click "Analyze User" to fetch their contribution data
                  </li>
                  <li className="flex">
                    <span className="bg-indigo-100 text-indigo-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0">3</span>
                    Explore the interactive network visualization of their edits
                  </li>
                  <li className="flex">
                    <span className="bg-indigo-100 text-indigo-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0">4</span>
                    Click on articles to visit them directly on Wikipedia
                  </li>
                </ol>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Example users to try</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {setSearchInput('Jimmy Wales'); fetchUserNetwork('Jimmy Wales');}}
                    className="block w-full text-left px-4 py-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <span className="font-medium">Jimmy Wales</span>
                    <span className="text-slate-500 text-sm ml-2">- Wikipedia co-founder</span>
                  </button>
                  <button
                    onClick={() => {setSearchInput('SandyGeorgia'); fetchUserNetwork('SandyGeorgia');}}
                    className="block w-full text-left px-4 py-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <span className="font-medium">SandyGeorgia</span>
                    <span className="text-slate-500 text-sm ml-2">- Prolific editor</span>
                  </button>
                  <button
                    onClick={() => {setSearchInput('Raul654'); fetchUserNetwork('Raul654');}}
                    className="block w-full text-left px-4 py-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <span className="font-medium">Raul654</span>
                    <span className="text-slate-500 text-sm ml-2">- Featured article coordinator</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserNetworkPage;
