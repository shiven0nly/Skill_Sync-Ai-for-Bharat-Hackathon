'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SplitPaneLayoutProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  initialSplitPosition?: number; // Percentage (0-100)
  minPaneWidth?: number; // Minimum width in pixels
  className?: string;
  enableSynchronizedScrolling?: boolean;
}

export const SplitPaneLayout: React.FC<SplitPaneLayoutProps> = ({
  leftContent,
  rightContent,
  initialSplitPosition = 50,
  minPaneWidth = 200,
  className = '',
  enableSynchronizedScrolling = true,
}) => {
  const [splitPosition, setSplitPosition] = useState(initialSplitPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isScrollSyncing, setIsScrollSyncing] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number>(0);
  const dragStartSplit = useRef<number>(0);

  // Synchronized scrolling handler
  const handleScroll = useCallback((source: 'left' | 'right') => {
    if (!enableSynchronizedScrolling || isScrollSyncing) return;

    setIsScrollSyncing(true);
    
    const sourcePane = source === 'left' ? leftPaneRef.current : rightPaneRef.current;
    const targetPane = source === 'left' ? rightPaneRef.current : leftPaneRef.current;
    
    if (sourcePane && targetPane) {
      const scrollPercentage = sourcePane.scrollTop / (sourcePane.scrollHeight - sourcePane.clientHeight);
      const targetScrollTop = scrollPercentage * (targetPane.scrollHeight - targetPane.clientHeight);
      
      targetPane.scrollTop = targetScrollTop;
    }
    
    // Reset sync flag after a brief delay to prevent infinite loops
    setTimeout(() => setIsScrollSyncing(false), 10);
  }, [enableSynchronizedScrolling, isScrollSyncing]);

  // Mouse event handlers for resizing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartSplit.current = splitPosition;
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [splitPosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStartX.current;
    const deltaPercentage = (deltaX / containerRect.width) * 100;
    const newSplitPosition = dragStartSplit.current + deltaPercentage;

    // Calculate minimum percentages based on minPaneWidth
    const minLeftPercentage = (minPaneWidth / containerRect.width) * 100;
    const minRightPercentage = 100 - ((minPaneWidth / containerRect.width) * 100);

    // Constrain the split position
    const constrainedPosition = Math.max(
      minLeftPercentage,
      Math.min(minRightPercentage, newSplitPosition)
    );

    setSplitPosition(constrainedPosition);
  }, [isDragging, minPaneWidth]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div 
      ref={containerRef}
      className={`flex h-full w-full relative ${className}`}
    >
      {/* Left Pane */}
      <motion.div
        ref={leftPaneRef}
        className="overflow-auto bg-gray-50 border-r border-gray-200"
        style={{ width: `${splitPosition}%` }}
        onScroll={() => handleScroll('left')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-4">
          {leftContent}
        </div>
      </motion.div>

      {/* Resizer */}
      <div
        className={`w-1 bg-gray-300 cursor-col-resize hover:bg-blue-400 transition-colors duration-200 relative ${
          isDragging ? 'bg-blue-500' : ''
        }`}
        onMouseDown={handleMouseDown}
      >
        {/* Visual indicator for the resizer */}
        <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-3 flex items-center justify-center">
          <div className="w-1 h-8 bg-gray-400 rounded-full opacity-50"></div>
        </div>
      </div>

      {/* Right Pane */}
      <motion.div
        ref={rightPaneRef}
        className="overflow-auto bg-white"
        style={{ width: `${100 - splitPosition}%` }}
        onScroll={() => handleScroll('right')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-4">
          {rightContent}
        </div>
      </motion.div>

      {/* Overlay during dragging to prevent text selection */}
      {isDragging && (
        <div className="absolute inset-0 cursor-col-resize z-10" />
      )}
    </div>
  );
};