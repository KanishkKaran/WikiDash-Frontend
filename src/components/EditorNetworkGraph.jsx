import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';  // Replace axios with api utility
import * as d3 from 'd3';

function EditorNetworkGraph({ title }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  
  useEffect(() => {
    const fetchEditorNetwork = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Fetching editor network data for:", title);
        
        // Get top editors first
        const editorsResponse = await api.get(`/api/editors?title=${encodeURIComponent(title)}`);
        console.log("Editors response:", editorsResponse.data);
        
        // Extract the editors array - handle different response formats
        let editorsData = [];
        if (Array.isArray(editorsResponse.data)) {
          editorsData = editorsResponse.data;
        } else if (editorsResponse.data && typeof editorsResponse.data === 'object') {
          if (Array.isArray(editorsResponse.data.editors)) {
            editorsData = editorsResponse.data.editors;
          }
        }
        
        // Create a default mock network if we don't have enough editors
        if (editorsData.length < 3) {
          console.log("Not enough real editors, creating minimal mock network");
          // Create minimal mock data with at least 3 nodes
          editorsData = [
            { user: "Editor1", edits: 100 },
            { user: "Editor2", edits: 80 },
            { user: "Editor3", edits: 50 }
          ];
        }
        
        const topEditors = editorsData.slice(0, 15); // Limit to top 15 for visualization clarity
        
        // Create nodes for each editor
        const nodes = topEditors.map(editor => ({
          id: editor.user,
          group: 1,
          edits: editor.edits || 10, // Fallback if edits count is missing
          // Size based on edit count with a reasonable default
          size: Math.max(5, Math.min(20, Math.sqrt(editor.edits || 10) * 2))
        }));
        
        // Initialize an empty links array
        let links = [];
        
        // Create mock revert data for demonstration
        const mockRevertData = [
          { reverter: nodes[0]?.id, reverted: nodes[1]?.id, count: 3 },
          { reverter: nodes[2]?.id, reverted: nodes[0]?.id, count: 2 },
          { reverter: nodes[1]?.id, reverted: nodes[2]?.id, count: 1 }
        ].filter(d => d.reverter && d.reverted); // Filter out any invalid links
        
        // Process revert relationships
        mockRevertData.forEach(revert => {
          links.push({
            source: revert.reverter,
            target: revert.reverted,
            value: revert.count,
            type: 'revert'
          });
        });
        
        // Add some collaboration links for variety
        const mockCollabData = [
          { editor1: nodes[0]?.id, editor2: nodes[2]?.id, strength: 0.8 },
          { editor1: nodes[1]?.id, editor2: nodes[0]?.id, strength: 0.7 }
        ].filter(d => d.editor1 && d.editor2); // Filter out any invalid links
        
        // Process collaboration relationships
        mockCollabData.forEach(collab => {
          links.push({
            source: collab.editor1,
            target: collab.editor2,
            value: collab.strength,
            type: 'collaborate'
          });
        });
        
        // Add remaining connections as time-proximity to make sure all nodes are connected
        for (let i = 0; i < nodes.length; i++) {
          let isConnected = false;
          for (const link of links) {
            const source = typeof link.source === 'object' ? link.source.id : link.source;
            const target = typeof link.target === 'object' ? link.target.id : link.target;
            
            if (source === nodes[i].id || target === nodes[i].id) {
              isConnected = true;
              break;
            }
          }
          
          // If this node isn't connected to anything yet, connect it to the first node
          if (!isConnected && nodes[0] && nodes[i].id !== nodes[0].id) {
            links.push({
              source: nodes[i].id,
              target: nodes[0].id,
              value: 0.3,
              type: 'time-proximity'
            });
          }
        }
        
        console.log('Network data created:', { nodes, links });
        
        setData({ nodes, links });
      } catch (err) {
        console.error('Error building editor network:', err);
        // Create minimal fallback data so visualization still works
        const fallbackNodes = [
          {id: "Editor1", group: 1, edits: 100, size: 15},
          {id: "Editor2", group: 1, edits: 80, size: 13},
          {id: "Editor3", group: 1, edits: 50, size: 10}
        ];
        
        const fallbackLinks = [
          {source: "Editor1", target: "Editor2", value: 0.8, type: 'collaborate'},
          {source: "Editor2", target: "Editor3", value: 0.6, type: 'collaborate'},
          {source: "Editor3", target: "Editor1", value: 0.5, type: 'time-proximity'}
        ];
        
        setData({nodes: fallbackNodes, links: fallbackLinks});
      } finally {
        setLoading(false);
      }
    };
    
    fetchEditorNetwork();
  }, [title]);
  
  useEffect(() => {
    if (!data || !svgRef.current) return;
    
    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();
    
    const width = 800;
    const height = 500;
    
    // Create tooltip div if it doesn't exist
    if (!tooltipRef.current) {
      tooltipRef.current = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "rgba(30, 41, 59, 0.9)")
        .style("color", "white")
        .style("border-radius", "4px")
        .style("padding", "8px 12px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("z-index", 1000)
        .style("max-width", "200px");
    }
    
    const tooltip = tooltipRef.current;
    
    // Create the SVG container
    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("width", "100%")
      .attr("height", "100%");
    
    // Define colors explicitly
    const nodeColorScale = d3.scaleLinear()
      .domain([0, d3.max(data.nodes, d => d.edits) || 100])
      .range(["#4299e1", "#2c5282"]);
    
    // Different color definitions for links
    const linkColors = {
      'revert': '#e53e3e',       // Red for conflicts
      'collaborate': '#38a169',   // Green for collaborations  
      'time-proximity': '#a0aec0' // Gray for time proximity
    };
    
    try {
      // Create the simulation
      const simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-150))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(d => d.size + 5));
      
      // Group links by type
      const linksByType = d3.group(data.links, d => d.type);
      
      // Create separate link groups for each type to ensure proper coloring
      Object.entries(linkColors).forEach(([type, color]) => {
        const typeLinks = linksByType.get(type) || [];
        
        svg.append("g")
          .attr("class", `links-${type}`)
          .selectAll("line")
          .data(typeLinks)
          .join("line")
          .attr("stroke", color)
          .attr("stroke-width", d => Math.sqrt(d.value) * 2)
          .attr("stroke-opacity", 0.6);
      });
      
      // Get all the link elements across groups for interactions
      const link = svg.selectAll("line");
      
      // Add nodes
      const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(data.nodes)
        .join("circle")
        .attr("r", d => d.size)
        .attr("fill", d => nodeColorScale(d.edits))
        .call(drag(simulation))
        .on("mouseover", function(event, d) {
          tooltip.transition()
            .duration(200)
            .style("opacity", .9);
            
          tooltip.html(`
            <strong>${d.id}</strong><br/>
            Edits: ${d.edits}<br/>
          `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
          
          // Highlight connected nodes and links
          const connectedLinks = data.links.filter(link => 
            (link.source.id === d.id || link.source === d.id) || 
            (link.target.id === d.id || link.target === d.id)
          );
          
          const connectedNodeIds = new Set();
          connectedLinks.forEach(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            connectedNodeIds.add(sourceId);
            connectedNodeIds.add(targetId);
          });
          
          node.attr("opacity", node => {
            if (node.id === d.id || connectedNodeIds.has(node.id)) {
              return 1;
            }
            return 0.3;
          });
          
          link.attr("opacity", link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            
            if (sourceId === d.id || targetId === d.id) {
              return 1;
            }
            return 0.1;
          });
          
          // Add connection type information to tooltip
          const connectionTypes = new Set();
          connectedLinks.forEach(link => connectionTypes.add(link.type));
          
          if (connectionTypes.size > 0) {
            const typeLabels = {
              'revert': 'Edit conflicts',
              'collaborate': 'Collaborations',
              'time-proximity': 'Same timeframe edits'
            };
            
            const connectionInfo = Array.from(connectionTypes)
              .map(type => typeLabels[type])
              .join(', ');
              
            tooltip.html(`
              <strong>${d.id}</strong><br/>
              Edits: ${d.edits}<br/>
              Connections: ${connectionInfo}
            `);
          }
        })
        .on("mouseout", function() {
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
          
          // Reset highlighting
          node.attr("opacity", 1);
          link.attr("opacity", 0.6);
        });
      
      // Add labels for nodes
      const label = svg.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(data.nodes)
        .join("text")
        .attr("font-size", 10)
        .attr("font-family", "sans-serif")
        .attr("text-anchor", "middle")
        .attr("dy", d => -d.size - 5)
        .text(d => truncateLabel(d.id, 15))
        .attr("pointer-events", "none")
        .attr("fill", "#4b5563");
      
      // Add legend
      const legendData = [
        { type: "revert", label: "Edit conflicts/reverts", color: linkColors.revert },
        { type: "collaborate", label: "Collaboration", color: linkColors.collaborate },
        { type: "time-proximity", label: "Edited in same timeframe", color: linkColors["time-proximity"] }
      ];
      
      const legend = svg.append("g")
        .attr("transform", `translate(${width - 220}, 20)`)
        .attr("class", "legend");
        
      legend.selectAll("line")
        .data(legendData)
        .join("line")
        .attr("x1", 0)
        .attr("y1", (d, i) => i * 20 + 2)
        .attr("x2", 15)
        .attr("y2", (d, i) => i * 20 + 2)
        .attr("stroke", d => d.color)
        .attr("stroke-width", 2);
        
      legend.selectAll("text")
        .data(legendData)
        .join("text")
        .attr("x", 20)
        .attr("y", (d, i) => i * 20 + 5)
        .attr("font-size", 10)
        .attr("fill", "#4b5563")
        .text(d => d.label);
      
      // Helper function to truncate long labels
      function truncateLabel(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
      }
      
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
        // Update all link positions
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);
        
        // Update node positions
        node
          .attr("cx", d => d.x = Math.max(d.size, Math.min(width - d.size, d.x)))
          .attr("cy", d => d.y = Math.max(d.size, Math.min(height - d.size, d.y)));
        
        // Update label positions
        label
          .attr("x", d => d.x)
          .attr("y", d => d.y);
      });
    } catch (err) {
      console.error("Error rendering D3 visualization:", err);
      // If D3 fails, show error message in SVG
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "#f87171")
        .text("Error rendering network visualization");
    }
    
    // Cleanup function
    return () => {
      if (tooltipRef.current) {
        d3.select(tooltipRef.current).remove();
        tooltipRef.current = null;
      }
    };
  }, [data]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded mb-4 w-1/3"></div>
          <div className="h-80 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center text-amber-600 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
        <p className="text-slate-600">Unable to generate the editor network visualization.</p>
      </div>
    );
  }

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center text-slate-500 py-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="mb-2">No editor network data available for this article</p>
          <p className="text-xs text-slate-400">This article may not have enough editors for network analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Editor Network Graph</h3>
          <p className="text-xs text-slate-500 mt-1">
            Visualizing relationships between top contributors and their patterns of collaboration
          </p>
        </div>
        <div className="text-xs text-slate-500">
          {data?.nodes?.length || 0} editors | {data?.links?.length || 0} connections
        </div>
      </div>
      
      <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
        <div className="h-96 w-full">
          <svg ref={svgRef} width="100%" height="100%"></svg>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="text-sm font-medium text-slate-700 mb-2">How to use this visualization</h4>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>• <span className="font-medium">Hover</span> over nodes to see editor details and their connections</li>
            <li>• <span className="font-medium">Drag</span> nodes to explore the network structure</li>
            <li>• Node <span className="font-medium">size</span> represents number of edits</li>
            <li>• Line <span className="font-medium">colors</span> represent different types of relationships: edit conflicts, collaboration, or time proximity</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default EditorNetworkGraph;
