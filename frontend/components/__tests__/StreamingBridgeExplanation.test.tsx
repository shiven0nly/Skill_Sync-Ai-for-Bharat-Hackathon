/**
 * StreamingBridgeExplanation Component Tests
 * 
 * Tests for the streaming bridge explanation component including
 * event handling, progress updates, and error scenarios.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StreamingBridgeExplanation from '../StreamingBridgeExplanation';

// Mock TextDecoder and TextEncoder for Node.js test environment
global.TextDecoder = global.TextDecoder || class TextDecoder {
  decode(input) {
    return Buffer.from(input).toString('utf8');
  }
};

global.TextEncoder = global.TextEncoder || class TextEncoder {
  encode(input) {
    return Buffer.from(input, 'utf8');
  }
};

// Mock fetch for testing
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock ReadableStream for streaming tests
class MockReadableStream {
  private reader: MockReader;

  constructor(private events: string[]) {
    this.reader = new MockReader(events);
  }

  getReader() {
    return this.reader;
  }
}

class MockReader {
  private index = 0;

  constructor(private events: string[]) {}

  async read() {
    if (this.index >= this.events.length) {
      return { done: true, value: undefined };
    }

    const value = new TextEncoder().encode(this.events[this.index]);
    this.index++;
    
    return { done: false, value };
  }

  releaseLock() {
    // Mock implementation
  }
}

describe('StreamingBridgeExplanation', () => {
  const defaultProps = {
    repositoryPath: '/test/repo',
    skillLevel: 5
  };

  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('renders initial state correctly', () => {
    render(<StreamingBridgeExplanation {...defaultProps} />);
    
    expect(screen.getByText('Streaming Bridge Explanation')).toBeInTheDocument();
    expect(screen.getByText('Start Analysis')).toBeInTheDocument();
    expect(screen.getByText(/Repository:/)).toBeInTheDocument();
    expect(screen.getByText(/\/test\/repo/)).toBeInTheDocument();
    expect(screen.getByText(/Skill Level:/)).toBeInTheDocument();
    expect(screen.getByText(/5\/10/)).toBeInTheDocument();
  });

  it('shows target file when provided', () => {
    render(
      <StreamingBridgeExplanation 
        {...defaultProps} 
        targetFile="src/main.ts" 
      />
    );
    
    expect(screen.getByText(/Target File:/)).toBeInTheDocument();
    expect(screen.getByText(/src\/main\.ts/)).toBeInTheDocument();
  });

  it('handles successful streaming flow', async () => {
    const streamingEvents = [
      'event: connected\ndata: {"message": "Connected", "timestamp": "2024-01-01T00:00:00Z"}\n\n',
      'event: progress\ndata: {"stage": "analysis", "progress": 50, "message": "Analyzing files", "timestamp": "2024-01-01T00:00:01Z"}\n\n',
      'event: partial\ndata: {"section": "overview", "data": "This is a test overview", "timestamp": "2024-01-01T00:00:02Z"}\n\n',
      'event: complete\ndata: {"message": "Analysis complete", "timestamp": "2024-01-01T00:00:03Z"}\n\n'
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: new MockReadableStream(streamingEvents)
    });

    const onComplete = jest.fn();
    render(
      <StreamingBridgeExplanation 
        {...defaultProps} 
        onComplete={onComplete}
      />
    );

    fireEvent.click(screen.getByText('Start Analysis'));

    await waitFor(() => {
      expect(screen.getByText('Streaming...')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('This is a test overview')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/bridge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({
        repositoryPath: '/test/repo',
        skillLevel: 5,
        streaming: true
      }),
      signal: expect.any(AbortSignal)
    });
  });

  it('handles streaming errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const onError = jest.fn();
    render(
      <StreamingBridgeExplanation 
        {...defaultProps} 
        onError={onError}
      />
    );

    fireEvent.click(screen.getByText('Start Analysis'));

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    expect(onError).toHaveBeenCalledWith('Network error');
  });

  it('handles HTTP errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    render(<StreamingBridgeExplanation {...defaultProps} />);

    fireEvent.click(screen.getByText('Start Analysis'));

    await waitFor(() => {
      expect(screen.getByText('HTTP 500: Internal Server Error')).toBeInTheDocument();
    });
  });

  it('displays progress bar during streaming', async () => {
    const streamingEvents = [
      'event: progress\ndata: {"stage": "analysis", "progress": 25, "message": "Starting analysis", "timestamp": "2024-01-01T00:00:00Z"}\n\n',
      'event: progress\ndata: {"stage": "explanation", "progress": 75, "message": "Generating explanations", "timestamp": "2024-01-01T00:00:01Z"}\n\n'
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: new MockReadableStream(streamingEvents)
    });

    render(<StreamingBridgeExplanation {...defaultProps} />);

    fireEvent.click(screen.getByText('Start Analysis'));

    await waitFor(() => {
      expect(screen.getByText('Analysis')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument();
      expect(screen.getByText('Starting analysis')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Explanation')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('Generating explanations')).toBeInTheDocument();
    });
  });

  it('displays mental models correctly', async () => {
    const mentalModels = [
      {
        construct: 'useState',
        mentalModel: 'Reactive Memory Slot',
        description: 'A smart storage box that notifies everyone when its contents change'
      },
      {
        construct: 'useEffect',
        mentalModel: 'Component Lifecycle Observer',
        description: 'Watches for changes and reacts automatically'
      }
    ];

    const streamingEvents = [
      `event: partial\ndata: {"section": "mentalModels", "data": ${JSON.stringify(mentalModels)}, "timestamp": "2024-01-01T00:00:00Z"}\n\n`
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: new MockReadableStream(streamingEvents)
    });

    render(<StreamingBridgeExplanation {...defaultProps} />);

    fireEvent.click(screen.getByText('Start Analysis'));

    await waitFor(() => {
      expect(screen.getByText('Mental Models')).toBeInTheDocument();
      expect(screen.getByText('useState → Reactive Memory Slot')).toBeInTheDocument();
      expect(screen.getByText('useEffect → Component Lifecycle Observer')).toBeInTheDocument();
    });
  });

  it('displays complexity information correctly', async () => {
    const complexity = {
      level: 'Medium',
      reasoning: 'Moderate complexity due to branching logic',
      suggestions: ['Consider refactoring', 'Add more tests']
    };

    const streamingEvents = [
      `event: partial\ndata: {"section": "complexity", "data": ${JSON.stringify(complexity)}, "timestamp": "2024-01-01T00:00:00Z"}\n\n`
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: new MockReadableStream(streamingEvents)
    });

    render(<StreamingBridgeExplanation {...defaultProps} />);

    fireEvent.click(screen.getByText('Start Analysis'));

    await waitFor(() => {
      expect(screen.getByText('Complexity')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Moderate complexity due to branching logic')).toBeInTheDocument();
      expect(screen.getByText('Consider refactoring')).toBeInTheDocument();
      expect(screen.getByText('Add more tests')).toBeInTheDocument();
    });
  });

  it('displays hotspots correctly', async () => {
    const hotspot = {
      filePath: 'src/complex.ts',
      cognitiveLoad: 3.5,
      explanation: {
        overview: 'This file has high complexity due to nested logic'
      }
    };

    const streamingEvents = [
      `event: hotspot\ndata: {"index": 0, "total": 1, "data": ${JSON.stringify(hotspot)}, "timestamp": "2024-01-01T00:00:00Z"}\n\n`
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: new MockReadableStream(streamingEvents)
    });

    render(<StreamingBridgeExplanation {...defaultProps} />);

    fireEvent.click(screen.getByText('Start Analysis'));

    await waitFor(() => {
      expect(screen.getByText('Complexity Hotspots')).toBeInTheDocument();
      expect(screen.getByText('src/complex.ts')).toBeInTheDocument();
      expect(screen.getByText('Load: 3.50')).toBeInTheDocument();
      expect(screen.getByText('This file has high complexity due to nested logic')).toBeInTheDocument();
    });
  });

  it('allows stopping streaming', async () => {
    const streamingEvents = [
      'event: progress\ndata: {"stage": "analysis", "progress": 25, "message": "Starting", "timestamp": "2024-01-01T00:00:00Z"}\n\n'
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: new MockReadableStream(streamingEvents)
    });

    render(<StreamingBridgeExplanation {...defaultProps} />);

    fireEvent.click(screen.getByText('Start Analysis'));

    await waitFor(() => {
      expect(screen.getByText('Stop')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Stop'));

    await waitFor(() => {
      expect(screen.getByText('Start Analysis')).toBeInTheDocument();
    });
  });

  it('prevents multiple simultaneous streams', async () => {
    const streamingEvents = [
      'event: progress\ndata: {"stage": "analysis", "progress": 25, "message": "Starting", "timestamp": "2024-01-01T00:00:00Z"}\n\n'
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: new MockReadableStream(streamingEvents)
    });

    render(<StreamingBridgeExplanation {...defaultProps} />);

    const startButton = screen.getByText('Start Analysis');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(startButton).toBeDisabled();
    });

    // Try to click again - should not trigger another request
    fireEvent.click(startButton);
    
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});