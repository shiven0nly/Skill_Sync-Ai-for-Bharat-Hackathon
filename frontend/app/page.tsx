'use client';

import { SplitPaneLayout } from '@/components/SplitPaneLayout';
import { ComplexityHeatmap, FileComplexity } from '@/components/ComplexityHeatmap';
import { MetaphorCard, CodeSnippet, MetaphorExplanation } from '@/components/MetaphorCard';
import { useState } from 'react';

// Sample complexity data for demonstration
const sampleComplexityData: FileComplexity[] = [
  {
    path: 'src/analyzer/complexity.js',
    fileName: 'complexity.js',
    complexityScore: 8.5,
    cognitiveLoad: 7.2,
    cyclomaticComplexity: 12,
    dependencyDepth: 5,
    loc: 145,
    language: 'javascript'
  },
  {
    path: 'src/analyzer/parser.js',
    fileName: 'parser.js',
    complexityScore: 6.3,
    cognitiveLoad: 5.1,
    cyclomaticComplexity: 8,
    dependencyDepth: 3,
    loc: 89,
    language: 'javascript'
  },
  {
    path: 'src/ui/components/TreeView.tsx',
    fileName: 'TreeView.tsx',
    complexityScore: 4.2,
    cognitiveLoad: 3.8,
    cyclomaticComplexity: 5,
    dependencyDepth: 4,
    loc: 67,
    language: 'typescript'
  },
  {
    path: 'src/ui/components/HeatmapLegend.tsx',
    fileName: 'HeatmapLegend.tsx',
    complexityScore: 2.1,
    cognitiveLoad: 1.9,
    cyclomaticComplexity: 2,
    dependencyDepth: 2,
    loc: 34,
    language: 'typescript'
  },
  {
    path: 'src/utils/helpers.js',
    fileName: 'helpers.js',
    complexityScore: 3.7,
    cognitiveLoad: 3.2,
    cyclomaticComplexity: 4,
    dependencyDepth: 1,
    loc: 52,
    language: 'javascript'
  },
  {
    path: 'tests/analyzer.test.js',
    fileName: 'analyzer.test.js',
    complexityScore: 5.8,
    cognitiveLoad: 4.9,
    cyclomaticComplexity: 7,
    dependencyDepth: 6,
    loc: 123,
    language: 'javascript'
  }
];

// Sample code content for demonstration
const sampleSourceCode = `
function calculateComplexity(ast, dependencies, loc, skillLevel) {
  // Cyclomatic Complexity (V_c)
  const cyclomaticComplexity = countDecisionPoints(ast);
  
  // Dependency Depth (D_d)
  const dependencyDepth = dependencies.length;
  
  // Cognitive Load Formula
  const cognitiveLoad = (
    (cyclomaticComplexity * 0.5) + 
    (dependencyDepth * 0.3) + 
    (Math.log10(loc) * 0.2)
  ) / skillLevel;
  
  return {
    cognitiveLoad,
    cyclomaticComplexity,
    dependencyDepth,
    loc,
    skillLevel
  };
}

function countDecisionPoints(ast) {
  let count = 0;
  
  function traverse(node) {
    if (node.type === 'if_statement' || 
        node.type === 'while_statement' || 
        node.type === 'for_statement' ||
        node.type === 'switch_statement') {
      count++;
    }
    
    if (node.children) {
      node.children.forEach(traverse);
    }
  }
  
  traverse(ast);
  return count;
}

export { calculateComplexity };
`.trim();

const bridgeExplanation = `
# 🧠 Cognitive Load Analysis

## Function: calculateComplexity()

**Mental Model**: Think of this as a "Code Difficulty Calculator" - like a fitness tracker for your brain when reading code.

### Core Components:

#### 1. Cyclomatic Complexity (V_c) - "Decision Fatigue"
- **What it measures**: How many different paths your brain needs to track
- **Real-world analogy**: Like counting intersections on a road trip - more intersections = more mental effort to navigate
- **Weight**: 50% of the complexity score (most important factor)

#### 2. Dependency Depth (D_d) - "Context Switching Cost"
- **What it measures**: How many external pieces you need to understand
- **Real-world analogy**: Like reading a book that references other books - each reference adds mental overhead
- **Weight**: 30% of the complexity score

#### 3. Lines of Code (LOC) - "Information Volume"
- **What it measures**: Raw amount of information to process
- **Real-world analogy**: Like the length of a document - longer usually means more effort, but not linearly
- **Weight**: 20% of the complexity score (logarithmic to prevent over-weighting)

### Skill Level Adjustment
The formula divides by your skill level (1-10), meaning:
- **Beginner (1-3)**: Same code feels much harder
- **Expert (8-10)**: Same code feels much easier

### The Formula in Plain English:
"Take the mental effort from decisions (50%) + effort from dependencies (30%) + effort from code volume (20%), then adjust based on how experienced you are with this type of code."

---

## Function: countDecisionPoints()

**Mental Model**: A "Branch Counter" - like counting how many times you need to make a choice while reading the code.

This function walks through the code structure and counts every place where the program needs to make a decision:
- **if statements**: "Should I do this or that?"
- **loops**: "Should I continue or stop?"
- **switches**: "Which of these options should I pick?"

Each decision point adds cognitive load because your brain needs to track multiple possible execution paths.
`.trim();

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<FileComplexity | null>(null);
  const [expandedSnippets, setExpandedSnippets] = useState<Set<string>>(new Set());

  // Handle file selection from heatmap
  const handleFileSelect = (file: FileComplexity) => {
    setSelectedFile(file);
  };

  // Handle snippet expansion
  const handleSnippetExpand = (snippetId: string) => {
    setExpandedSnippets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(snippetId)) {
        newSet.delete(snippetId);
      } else {
        newSet.add(snippetId);
      }
      return newSet;
    });
  };

  // Generate sample snippet and metaphor for selected file
  const generateSampleContent = (file: FileComplexity) => {
    const snippet: CodeSnippet = {
      id: file.path,
      code: sampleSourceCode,
      language: file.language,
      fileName: file.fileName,
      startLine: 1,
      endLine: 25,
      complexityScore: file.complexityScore
    };

    const metaphor: MetaphorExplanation = {
      title: `Understanding ${file.fileName}`,
      description: `This ${file.language} file has a complexity score of ${file.complexityScore.toFixed(1)}, indicating ${
        file.complexityScore > 7 ? 'high' : file.complexityScore > 4 ? 'moderate' : 'low'
      } cognitive load.`,
      analogy: file.complexityScore > 7 
        ? "Like navigating a busy intersection with multiple traffic lights - requires careful attention to multiple decision points."
        : file.complexityScore > 4
        ? "Like following a recipe with several steps - manageable but requires focus."
        : "Like reading a straightforward instruction manual - easy to follow and understand.",
      keyPoints: [
        `Cyclomatic complexity: ${file.cyclomaticComplexity} decision points`,
        `Dependency depth: ${file.dependencyDepth} external references`,
        `Lines of code: ${file.loc}`,
        `Cognitive load factor: ${file.cognitiveLoad.toFixed(2)}`
      ]
    };

    return { snippet, metaphor };
  };

  return (
    <main className="h-screen w-screen">
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="bg-gray-900 text-white p-4 flex-shrink-0">
          <h1 className="text-2xl font-bold">Skill-Sync</h1>
          <p className="text-gray-300">Developer Cognitive Load Analyzer</p>
        </header>
        
        {/* Main Content with Three Panes */}
        <div className="flex-1 flex">
          {/* Left Sidebar - Heatmap */}
          <div className="w-80 border-r border-gray-200 bg-gray-50 p-4">
            <ComplexityHeatmap
              complexityData={sampleComplexityData}
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile?.path}
              maxComplexityThreshold={10}
            />
          </div>

          {/* Main Split Pane Area */}
          <div className="flex-1">
            <SplitPaneLayout
              leftContent={
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-800">
                    📄 Source Code (The Reality)
                  </h2>
                  {selectedFile ? (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <div className="text-sm text-blue-800">
                        <strong>Selected:</strong> {selectedFile.fileName}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        Complexity: {selectedFile.complexityScore.toFixed(1)} | 
                        Cognitive Load: {selectedFile.cognitiveLoad.toFixed(1)} | 
                        LOC: {selectedFile.loc}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                      <div className="text-sm text-gray-600">
                        Select a file from the heatmap to view its details
                      </div>
                    </div>
                  )}
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                    <code>{sampleSourceCode}</code>
                  </pre>
                </div>
              }
              rightContent={
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-800">
                    🌉 Bridge Explanation (The Understanding)
                  </h2>
                  {selectedFile ? (
                    <div className="space-y-4">
                      {(() => {
                        const { snippet, metaphor } = generateSampleContent(selectedFile);
                        return (
                          <MetaphorCard
                            snippet={snippet}
                            metaphor={metaphor}
                            userSkillLevel={5}
                            onExpand={handleSnippetExpand}
                            isExpanded={expandedSnippets.has(snippet.id)}
                          />
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                        {bridgeExplanation}
                      </pre>
                    </div>
                  )}
                </div>
              }
              initialSplitPosition={50}
              minPaneWidth={300}
              enableSynchronizedScrolling={true}
              className="border-t border-gray-200"
            />
          </div>
        </div>
      </div>
    </main>
  );
}