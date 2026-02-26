'use client';

/**
 * StreamingBridgeExplanation Component
 * 
 * React component that demonstrates real-time streaming of bridge explanations
 * using Server-Sent Events for progressive loading of code analysis results.
 */

import React, { useState, useEffect, useRef } from 'react';

interface StreamingEvent {
  eventType: string;
  data: any;
  timestamp: string;
}

interface ProgressState {
  stage: string;
  progress: number;
  message: string;
}

interface BridgeExplanationState {
  overview?: string;
  mentalModels?: any[];
  metaphor?: string;
  complexity?: any;
  recommendations?: string[];
  learningPath?: string[];
  hotspots?: any[];
}

interface StreamingBridgeExplanationProps {
  repositoryPath: string;
  skillLevel: number;
  targetFile?: string;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

export default function StreamingBridgeExplanation({
  repositoryPath,
  skillLevel,
  targetFile,
  onComplete,
  onError
}: StreamingBridgeExplanationProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [progress, setProgress] = useState<ProgressState>({ stage: '', progress: 0, message: '' });
  const [explanation, setExplanation] = useState<BridgeExplanationState>({});
  const [events, setEvents] = useState<StreamingEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const startStreaming = async () => {
    if (isStreaming) return;

    setIsStreaming(true);
    setError(null);
    setProgress({ stage: '', progress: 0, message: '' });
    setExplanation({});
    setEvents([]);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/bridge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          repositoryPath,
          skillLevel,
          targetFile,
          streaming: true
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          
          // Process complete events
          const eventTexts = buffer.split('\n\n');
          buffer = eventTexts.pop() || '';
          
          for (const eventText of eventTexts) {
            if (eventText.trim()) {
              parseAndHandleEvent(eventText);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        const errorMessage = err.message;
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const parseAndHandleEvent = (eventText: string) => {
    const lines = eventText.split('\n');
    let eventType = 'message';
    let data = '';

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventType = line.substring(7);
      } else if (line.startsWith('data: ')) {
        data = line.substring(6);
      }
    }

    if (data) {
      try {
        const parsedData = JSON.parse(data);
        handleStreamingEvent(eventType, parsedData);
      } catch (error) {
        console.error('Failed to parse event data:', error);
      }
    }
  };

  const handleStreamingEvent = (eventType: string, data: any) => {
    const event: StreamingEvent = {
      eventType,
      data,
      timestamp: data.timestamp || new Date().toISOString()
    };

    setEvents(prev => [...prev, event]);

    switch (eventType) {
      case 'connected':
        console.log('Connected to streaming bridge');
        break;

      case 'progress':
        setProgress({
          stage: data.stage,
          progress: data.progress,
          message: data.message
        });
        break;

      case 'partial':
        setExplanation(prev => ({
          ...prev,
          [data.section]: data.data
        }));
        break;

      case 'hotspot':
        setExplanation(prev => ({
          ...prev,
          hotspots: [...(prev.hotspots || []), data.data]
        }));
        break;

      case 'result':
        onComplete?.(data.data);
        break;

      case 'complete':
        console.log('Streaming complete');
        break;

      case 'error':
        const errorMessage = data.error;
        setError(errorMessage);
        onError?.(errorMessage);
        break;
    }
  };

  const renderProgressBar = () => {
    if (!progress.stage) return null;

    return (
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-blue-900 capitalize">
            {progress.stage}
          </span>
          <span className="text-sm text-blue-700">{progress.progress}%</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress.progress}%` }}
          />
        </div>
        <p className="text-sm text-blue-800 mt-2">{progress.message}</p>
      </div>
    );
  };

  const renderExplanationSection = (title: string, content: any) => {
    if (!content) return null;

    return (
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>
        
        {title === 'Overview' && (
          <p className="text-gray-700 leading-relaxed">{content}</p>
        )}
        
        {title === 'Mental Models' && Array.isArray(content) && (
          <div className="space-y-3">
            {content.map((model, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <div className="font-medium text-gray-800">
                  {model.construct} → {model.mentalModel}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {model.description}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {title === 'Metaphor' && (
          <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
            <p className="text-gray-700 italic">{content}</p>
          </div>
        )}
        
        {title === 'Complexity' && content.level && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Level:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                content.level === 'Low' ? 'bg-green-100 text-green-800' :
                content.level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                content.level === 'High' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {content.level}
              </span>
            </div>
            <p className="text-gray-700">{content.reasoning}</p>
            {content.suggestions && content.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium mt-3 mb-2">Suggestions:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {content.suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="text-gray-700">{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {(title === 'Recommendations' || title === 'Learning Path') && Array.isArray(content) && (
          <ul className="list-disc list-inside space-y-2">
            {content.map((item, index) => (
              <li key={index} className="text-gray-700">{item}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const renderHotspots = () => {
    if (!explanation.hotspots || explanation.hotspots.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Complexity Hotspots</h3>
        <div className="space-y-4">
          {explanation.hotspots.map((hotspot, index) => (
            <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-red-900">{hotspot.filePath}</h4>
                <span className="text-sm bg-red-200 text-red-800 px-2 py-1 rounded">
                  Load: {hotspot.cognitiveLoad.toFixed(2)}
                </span>
              </div>
              <p className="text-red-800 text-sm">{hotspot.explanation.overview}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Streaming Bridge Explanation
        </h2>
        
        <div className="flex gap-4 mb-4">
          <button
            onClick={startStreaming}
            disabled={isStreaming}
            className={`px-4 py-2 rounded font-medium ${
              isStreaming
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isStreaming ? 'Streaming...' : 'Start Analysis'}
          </button>
          
          {isStreaming && (
            <button
              onClick={stopStreaming}
              className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700"
            >
              Stop
            </button>
          )}
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <div><strong>Repository:</strong> {repositoryPath}</div>
          <div><strong>Skill Level:</strong> {skillLevel}/10</div>
          {targetFile && <div><strong>Target File:</strong> {targetFile}</div>}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-medium mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {renderProgressBar()}

      <div className="space-y-6">
        {renderExplanationSection('Overview', explanation.overview)}
        {renderExplanationSection('Mental Models', explanation.mentalModels)}
        {renderExplanationSection('Metaphor', explanation.metaphor)}
        {renderExplanationSection('Complexity', explanation.complexity)}
        {renderHotspots()}
        {renderExplanationSection('Recommendations', explanation.recommendations)}
        {renderExplanationSection('Learning Path', explanation.learningPath)}
      </div>

      {/* Debug Events Panel */}
      {events.length > 0 && (
        <details className="mt-8">
          <summary className="cursor-pointer text-gray-600 font-medium">
            Debug Events ({events.length})
          </summary>
          <div className="mt-4 max-h-96 overflow-y-auto bg-gray-50 rounded p-4">
            {events.map((event, index) => (
              <div key={index} className="mb-2 text-xs">
                <span className="font-mono text-blue-600">{event.eventType}</span>
                <span className="text-gray-500 ml-2">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
                <pre className="text-gray-700 mt-1 whitespace-pre-wrap">
                  {JSON.stringify(event.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}