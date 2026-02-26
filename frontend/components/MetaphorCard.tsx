'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface CodeSnippet {
  id: string;
  code: string;
  language: string;
  fileName: string;
  startLine: number;
  endLine: number;
  complexityScore: number;
}

export interface MetaphorExplanation {
  title: string;
  description: string;
  analogy: string;
  keyPoints: string[];
}

export interface MetaphorCardProps {
  snippet: CodeSnippet;
  metaphor: MetaphorExplanation;
  userSkillLevel?: number; // 1-10 scale from design document
  className?: string;
  onExpand?: (snippetId: string) => void;
  isExpanded?: boolean;
}

export const MetaphorCard: React.FC<MetaphorCardProps> = ({
  snippet,
  metaphor,
  userSkillLevel = 5,
  className = '',
  onExpand,
  isExpanded = false,
}) => {
  // Calculate complexity color based on score
  const getComplexityColor = (score: number): string => {
    if (score >= 8) return 'bg-red-100 border-red-300 text-red-800';
    if (score >= 6) return 'bg-orange-100 border-orange-300 text-orange-800';
    if (score >= 4) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return 'bg-green-100 border-green-300 text-green-800';
  };

  // Adjust explanation depth based on user skill level
  const getExplanationDepth = (): 'basic' | 'intermediate' | 'advanced' => {
    if (userSkillLevel <= 3) return 'basic';
    if (userSkillLevel <= 7) return 'intermediate';
    return 'advanced';
  };

  const handleCardClick = () => {
    if (onExpand) {
      onExpand(snippet.id);
    }
  };

  const complexityColorClass = getComplexityColor(snippet.complexityScore);
  const explanationDepth = getExplanationDepth();

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 ${className}`}
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {metaphor.title}
          </h3>
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${complexityColorClass}`}>
            Complexity: {snippet.complexityScore.toFixed(1)}
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 space-x-2">
          <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
            {snippet.language}
          </span>
          <span>•</span>
          <span className="truncate">{snippet.fileName}</span>
          <span>•</span>
          <span>Lines {snippet.startLine}-{snippet.endLine}</span>
        </div>
      </div>

      {/* Metaphor Explanation */}
      <div className="p-4">
        <div className="mb-3">
          <p className="text-gray-700 leading-relaxed">
            {metaphor.description}
          </p>
        </div>

        {/* Analogy Section */}
        <div className="mb-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <div className="flex items-start space-x-2">
            <div className="text-blue-500 mt-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800 mb-1">Think of it like this:</p>
              <p className="text-sm text-blue-700 italic">
                {metaphor.analogy}
              </p>
            </div>
          </div>
        </div>

        {/* Key Points */}
        {explanationDepth !== 'basic' && metaphor.keyPoints.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Key Concepts:</h4>
            <ul className="space-y-1">
              {metaphor.keyPoints.slice(0, explanationDepth === 'intermediate' ? 3 : 5).map((point, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Code Preview */}
        <motion.div
          className="mt-3"
          initial={false}
          animate={{ height: isExpanded ? 'auto' : '60px' }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-gray-900 rounded-md overflow-hidden">
            <div className="px-3 py-2 bg-gray-800 text-xs text-gray-300 font-mono">
              {snippet.fileName}
            </div>
            <pre className={`p-3 text-sm text-gray-100 font-mono overflow-hidden ${!isExpanded ? 'line-clamp-3' : ''}`}>
              <code>{snippet.code}</code>
            </pre>
          </div>
        </motion.div>

        {/* Expand/Collapse Indicator */}
        <div className="mt-2 text-center">
          <motion.div
            className="inline-flex items-center text-xs text-gray-500 hover:text-gray-700"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="ml-1">{isExpanded ? 'Show less' : 'Show more'}</span>
          </motion.div>
        </div>
      </div>

      {/* Skill Level Indicator (for debugging/development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Skill Level: {userSkillLevel}/10 • Depth: {explanationDepth}
          </div>
        </div>
      )}
    </motion.div>
  );
};