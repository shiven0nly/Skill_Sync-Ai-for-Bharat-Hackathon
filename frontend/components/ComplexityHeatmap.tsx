'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

// Types for complexity data
export interface FileComplexity {
  path: string;
  fileName: string;
  complexityScore: number;
  cognitiveLoad: number;
  cyclomaticComplexity: number;
  dependencyDepth: number;
  loc: number;
  language: string;
}

export interface DirectoryNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  path: string;
  complexity?: FileComplexity;
  children?: DirectoryNode[];
  isExpanded?: boolean;
}

export interface ComplexityHeatmapProps {
  complexityData: FileComplexity[];
  onFileSelect?: (file: FileComplexity) => void;
  selectedFile?: string;
  className?: string;
  maxComplexityThreshold?: number;
}

export const ComplexityHeatmap: React.FC<ComplexityHeatmapProps> = ({
  complexityData,
  onFileSelect,
  selectedFile,
  className = '',
  maxComplexityThreshold = 10,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Convert flat complexity data to tree structure
  const treeData = useMemo(() => {
    const root: DirectoryNode = {
      id: 'root',
      name: 'Project',
      type: 'directory',
      path: '',
      children: [],
      isExpanded: true,
    };

    const nodeMap = new Map<string, DirectoryNode>();
    nodeMap.set('', root);

    // Sort files by path for consistent tree building
    const sortedData = [...complexityData].sort((a, b) => a.path.localeCompare(b.path));

    sortedData.forEach((file) => {
      const pathParts = file.path.split('/').filter(part => part.length > 0);
      let currentPath = '';
      let currentParent = root;

      // Create directory nodes for each path segment
      pathParts.forEach((part, index) => {
        const isLastPart = index === pathParts.length - 1;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!nodeMap.has(currentPath)) {
          const newNode: DirectoryNode = {
            id: currentPath,
            name: part,
            type: isLastPart ? 'file' : 'directory',
            path: currentPath,
            complexity: isLastPart ? file : undefined,
            children: isLastPart ? undefined : [],
            isExpanded: false,
          };

          nodeMap.set(currentPath, newNode);
          currentParent.children!.push(newNode);
        }

        currentParent = nodeMap.get(currentPath)!;
      });
    });

    return root;
  }, [complexityData]);

  // Get complexity color based on score
  const getComplexityColor = (score: number): string => {
    const normalizedScore = Math.min(score / maxComplexityThreshold, 1);
    
    if (normalizedScore >= 0.8) return 'bg-red-500';
    if (normalizedScore >= 0.6) return 'bg-orange-500';
    if (normalizedScore >= 0.4) return 'bg-yellow-500';
    if (normalizedScore >= 0.2) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // Get complexity intensity (opacity)
  const getComplexityIntensity = (score: number): number => {
    const normalizedScore = Math.min(score / maxComplexityThreshold, 1);
    return Math.max(0.3, normalizedScore); // Minimum 30% opacity
  };

  // Handle node click
  const handleNodeClick = (node: DirectoryNode) => {
    if (node.type === 'file' && node.complexity && onFileSelect) {
      onFileSelect(node.complexity);
    } else if (node.type === 'directory') {
      setExpandedNodes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(node.id)) {
          newSet.delete(node.id);
        } else {
          newSet.add(node.id);
        }
        return newSet;
      });
    }
  };

  // Custom node renderer for react-simple-tree
  const renderNode = (node: DirectoryNode, level: number) => {
    const isExpanded = expandedNodes.has(node.id) || node.isExpanded;
    const isSelected = selectedFile === node.path;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <motion.div
        key={node.id}
        className={`flex items-center py-1 px-2 rounded cursor-pointer hover:bg-gray-100 transition-colors duration-150 ${
          isSelected ? 'bg-blue-100 border-l-4 border-blue-500' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => handleNodeClick(node)}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: level * 0.05 }}
      >
        {/* Expand/Collapse Icon */}
        {node.type === 'directory' && hasChildren && (
          <motion.div
            className="mr-2 text-gray-500"
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </motion.div>
        )}

        {/* File/Directory Icon */}
        <div className="mr-2 text-gray-600">
          {node.type === 'directory' ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Node Name */}
        <span className={`flex-1 text-sm ${node.type === 'file' ? 'font-mono' : 'font-medium'}`}>
          {node.name}
        </span>

        {/* Complexity Indicator */}
        {node.type === 'file' && node.complexity && (
          <div className="flex items-center space-x-2 ml-2">
            {/* Complexity Score */}
            <span className="text-xs text-gray-600 font-mono">
              {node.complexity.complexityScore.toFixed(1)}
            </span>
            
            {/* Heat Indicator */}
            <div
              className={`w-3 h-3 rounded-full ${getComplexityColor(node.complexity.complexityScore)}`}
              style={{ 
                opacity: getComplexityIntensity(node.complexity.complexityScore) 
              }}
              title={`Complexity: ${node.complexity.complexityScore.toFixed(2)} | Cognitive Load: ${node.complexity.cognitiveLoad.toFixed(2)}`}
            />
          </div>
        )}
      </motion.div>
    );
  };

  // Recursively render tree nodes
  const renderTree = (nodes: DirectoryNode[], level: number = 0): React.ReactNode[] => {
    return nodes.map(node => {
      const isExpanded = expandedNodes.has(node.id) || node.isExpanded;
      
      return (
        <div key={node.id}>
          {renderNode(node, level)}
          {node.children && isExpanded && (
            <div>
              {renderTree(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            🔥 Complexity Heatmap
          </h3>
          <div className="flex items-center space-x-4 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-500 opacity-60"></div>
              <span>Low</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500 opacity-70"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-red-500 opacity-80"></div>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tree Content */}
      <div className="p-2 max-h-96 overflow-y-auto">
        {treeData.children && treeData.children.length > 0 ? (
          <div>
            {renderTree(treeData.children)}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No complexity data available</p>
          </div>
        )}
      </div>

      {/* Footer with stats */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>{complexityData.length} files analyzed</span>
          <span>
            Avg complexity: {
              complexityData.length > 0 
                ? (complexityData.reduce((sum, file) => sum + file.complexityScore, 0) / complexityData.length).toFixed(1)
                : '0.0'
            }
          </span>
        </div>
      </div>
    </div>
  );
};