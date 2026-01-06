import React, { useEffect, useState } from 'react';

import { KnowledgeGraph } from '../KnowledgeGraph';
import { useKnowledgeGraphStore } from '../stores/knowledgeGraphStore';
import { loadAiRegulationPolicyDemo, getGraphSummary, validateGraph, clearSeedData } from '../utils/seedData';
import './KnowledgeGraphDemo.css';

/**
 * Knowledge Graph Demo Component
 * Complete demonstration of the Knowledge Graph system with AI Regulation Policy data
 */
export const KnowledgeGraphDemo: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [validationResults, setValidationResults] = useState<{ isValid: boolean; issues: string[] } | null>(null);
  const [lastLoadTime, setLastLoadTime] = useState<string | null>(null);

  const { nodes, layout, setLayout } = useKnowledgeGraphStore();

  /**
   * Load the AI Regulation Policy seed data
   */
  const loadDemoData = async () => {
    setIsLoading(true);
    try {
      // Clear any existing data
      clearSeedData();

      // Load seed data
      loadAiRegulationPolicyDemo();

      // Update timestamp
      setLastLoadTime(new Date().toLocaleTimeString());

      // Get validation results
      const validation = validateGraph();
      setValidationResults(validation);

      // Show stats
      setShowStats(true);

      console.log('✅ Demo data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading demo data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear all data
   */
  const clearData = () => {
    clearSeedData();
    setShowStats(false);
    setValidationResults(null);
    setLastLoadTime(null);
    console.log('🗑️  All data cleared');
  };

  /**
   * Get current graph statistics
   */
  const currentStats = getGraphSummary();

  /**
   * Handle layout type change
   */
  const handleLayoutChange = (newLayout: 'grid' | 'force' | 'hierarchical') => {
    setLayout(newLayout);
  };

  useEffect(() => {
    // Auto-load demo data on component mount
    loadDemoData();
  }, []);

  return (
    <div className="knowledge-graph-demo">
      {/* Controls Panel */}
      <div className="controls-panel">
        <div className="controls-header">
          <h2>Knowledge Graph Demo</h2>
          <div className="controls-actions">
            <button
              onClick={loadDemoData}
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? 'Loading...' : 'Load AI Regulation Policy Demo'}
            </button>
            <button
              onClick={clearData}
              disabled={isLoading}
              className="btn btn-secondary"
            >
              Clear Data
            </button>
          </div>
        </div>

        {/* Layout Controls */}
        <div className="layout-controls">
          <label className="layout-label">Layout:</label>
          <div className="layout-options">
            <button
              onClick={() => handleLayoutChange('grid')}
              className={`layout-btn ${layout === 'grid' ? 'active' : ''}`}
            >
              Grid
            </button>
            <button
              onClick={() => handleLayoutChange('force')}
              className={`layout-btn ${layout === 'force' ? 'active' : ''}`}
            >
              Force
            </button>
            <button
              onClick={() => handleLayoutChange('hierarchical')}
              className={`layout-btn ${layout === 'hierarchical' ? 'active' : ''}`}
            >
              Hierarchical
            </button>
          </div>
        </div>

        {/* Statistics Panel */}
        {showStats && (
          <div className="stats-panel">
            <h3>Graph Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Nodes:</span>
                <span className="stat-value">{currentStats.nodeCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Edges:</span>
                <span className="stat-value">{currentStats.edgeCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Columns:</span>
                <span className="stat-value">{currentStats.columnCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Last Load:</span>
                <span className="stat-value">{lastLoadTime || 'Never'}</span>
              </div>
            </div>

            {/* Node Type Breakdown */}
            <div className="node-types">
              <h4>Node Types:</h4>
              <div className="node-types-list">
                {Object.entries(currentStats.nodeTypes).map(([type, count]) => (
                  <div key={type} className="node-type-item">
                    <span className="node-type-name">{type}:</span>
                    <span className="node-type-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Validation Results */}
            {validationResults && (
              <div className={`validation-results ${validationResults.isValid ? 'valid' : 'invalid'}`}>
                <h4>Validation:</h4>
                {validationResults.isValid ? (
                  <span className="valid-badge">✅ Valid</span>
                ) : (
                  <div className="validation-issues">
                    <span className="invalid-badge">⚠️ Issues Found:</span>
                    <ul>
                      {validationResults.issues.map((issue, index) => (
                        <li key={index} className="validation-issue">{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Visualization */}
      <div className="visualization-container">
        <div className="visualization-header">
          <h1>AI Regulation Policy Knowledge Graph</h1>
          <p>
            Demonstrating hierarchical grid layout with causal chains from AI foundations through
            regulations to business impacts and strategic opportunities.
          </p>
        </div>

        {/* Knowledge Graph Visualization */}
        <div className="knowledge-graph-wrapper">
          {nodes.length > 0 ? (
            <KnowledgeGraph />
          ) : (
            <div className="empty-state">
              <div className="empty-content">
                <div className="empty-icon">🕸️</div>
                <h3>No Graph Data</h3>
                <p>Click "Load AI Regulation Policy Demo" above to populate the knowledge graph.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
