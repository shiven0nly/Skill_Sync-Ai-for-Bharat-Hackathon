import React, { useState } from 'react';
import { MetaphorCard, CodeSnippet, MetaphorExplanation } from '../frontend/components/MetaphorCard';

// Example usage of the MetaphorCard component
export const MetaphorCardExample: React.FC = () => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Example high-complexity code snippet
  const complexSnippet: CodeSnippet = {
    id: 'react-hooks-example',
    code: `const useComplexState = (initialValue) => {
  const [state, setState] = useState(initialValue);
  const [history, setHistory] = useState([initialValue]);
  
  useEffect(() => {
    if (state !== history[history.length - 1]) {
      setHistory(prev => [...prev, state]);
    }
  }, [state, history]);
  
  const undo = useCallback(() => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setState(newHistory[newHistory.length - 1]);
    }
  }, [history]);
  
  return { state, setState, history, undo };
};`,
    language: 'javascript',
    fileName: 'hooks/useComplexState.js',
    startLine: 1,
    endLine: 20,
    complexityScore: 7.8,
  };

  // Metaphor explanation for the complex code
  const metaphorExplanation: MetaphorExplanation = {
    title: 'State History Manager Hook',
    description: 'This custom hook manages state with an undo functionality, keeping track of all previous values.',
    analogy: 'Think of this like a notebook with carbon paper - every time you write something new, you automatically create a copy that you can refer back to. The undo function is like flipping back through the pages.',
    keyPoints: [
      'useState manages the current state value',
      'A second useState tracks the history of all changes',
      'useEffect watches for state changes and updates history',
      'useCallback optimizes the undo function to prevent unnecessary re-renders',
      'The undo function removes the last entry and restores the previous state',
      'History prevents infinite loops by checking if state actually changed',
    ],
  };

  const handleExpand = (snippetId: string) => {
    setExpandedCard(expandedCard === snippetId ? null : snippetId);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          MetaphorCard Component Examples
        </h1>
        
        <div className="grid gap-6">
          {/* Example with different skill levels */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Different Skill Levels
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              {/* Beginner Level */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Beginner (Level 2)
                </h3>
                <MetaphorCard
                  snippet={complexSnippet}
                  metaphor={metaphorExplanation}
                  userSkillLevel={2}
                  onExpand={handleExpand}
                  isExpanded={expandedCard === `${complexSnippet.id}-beginner`}
                />
              </div>
              
              {/* Intermediate Level */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Intermediate (Level 5)
                </h3>
                <MetaphorCard
                  snippet={complexSnippet}
                  metaphor={metaphorExplanation}
                  userSkillLevel={5}
                  onExpand={handleExpand}
                  isExpanded={expandedCard === `${complexSnippet.id}-intermediate`}
                />
              </div>
              
              {/* Advanced Level */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Advanced (Level 9)
                </h3>
                <MetaphorCard
                  snippet={complexSnippet}
                  metaphor={metaphorExplanation}
                  userSkillLevel={9}
                  onExpand={handleExpand}
                  isExpanded={expandedCard === `${complexSnippet.id}-advanced`}
                />
              </div>
            </div>
          </div>

          {/* Example with different complexity levels */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Different Complexity Levels
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              {/* Low Complexity */}
              <MetaphorCard
                snippet={{
                  ...complexSnippet,
                  id: 'low-complexity',
                  complexityScore: 2.1,
                  code: 'const greeting = "Hello, World!";',
                }}
                metaphor={{
                  title: 'Simple Variable Declaration',
                  description: 'A basic string variable assignment.',
                  analogy: 'Like putting a label on a box.',
                  keyPoints: ['Variables store values', 'const means immutable'],
                }}
                userSkillLevel={5}
                onExpand={handleExpand}
                isExpanded={expandedCard === 'low-complexity'}
              />
              
              {/* Medium Complexity */}
              <MetaphorCard
                snippet={{
                  ...complexSnippet,
                  id: 'medium-complexity',
                  complexityScore: 5.5,
                }}
                metaphor={metaphorExplanation}
                userSkillLevel={5}
                onExpand={handleExpand}
                isExpanded={expandedCard === 'medium-complexity'}
              />
              
              {/* High Complexity */}
              <MetaphorCard
                snippet={{
                  ...complexSnippet,
                  id: 'high-complexity',
                  complexityScore: 9.2,
                }}
                metaphor={metaphorExplanation}
                userSkillLevel={5}
                onExpand={handleExpand}
                isExpanded={expandedCard === 'high-complexity'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};