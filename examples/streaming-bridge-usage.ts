#!/usr/bin/env node

/**
 * Streaming Bridge Usage Example
 * 
 * Demonstrates how to consume streaming bridge explanations using Server-Sent Events.
 * This example shows both browser-compatible EventSource usage and Node.js implementation.
 */

import * as http from 'http';

/**
 * Node.js Server-Sent Events client implementation
 */
class SSEClient {
  private req: http.ClientRequest | null = null;

  constructor(
    private url: string,
    private onEvent: (eventType: string, data: any) => void,
    private onError: (error: Error) => void
  ) {}

  connect(postData: string): void {
    const urlObj = new URL(this.url);
    
    const options: http.RequestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 3000,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    };

    this.req = http.request(options, (res) => {
      if (res.statusCode !== 200) {
        this.onError(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }

      res.setEncoding('utf8');
      
      let buffer = '';
      
      res.on('data', (chunk: string) => {
        buffer += chunk;
        
        // Process complete events
        const events = buffer.split('\n\n');
        buffer = events.pop() || ''; // Keep incomplete event in buffer
        
        for (const event of events) {
          if (event.trim()) {
            this.parseEvent(event);
          }
        }
      });

      res.on('end', () => {
        console.log('Stream ended');
      });

      res.on('error', (error) => {
        this.onError(error);
      });
    });

    this.req.on('error', (error) => {
      this.onError(error);
    });

    // Send the POST data
    this.req.write(postData);
    this.req.end();
  }

  private parseEvent(eventText: string): void {
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
        this.onEvent(eventType, parsedData);
      } catch (error) {
        console.error('Failed to parse event data:', error);
      }
    }
  }

  disconnect(): void {
    if (this.req) {
      this.req.destroy();
      this.req = null;
    }
  }
}

/**
 * Example usage of streaming bridge explanations
 */
async function demonstrateStreamingBridge() {
  console.log('🌉 Streaming Bridge Explanation Demo');
  console.log('=====================================\n');

  const serverUrl = 'http://localhost:3000/bridge';
  
  // Example request payload
  const requestPayload = {
    repositoryPath: process.cwd(), // Analyze current directory
    skillLevel: 5,
    streaming: true, // Enable streaming
    maxFiles: 10
  };

  console.log('📡 Connecting to streaming endpoint...');
  console.log(`URL: ${serverUrl}`);
  console.log(`Payload:`, JSON.stringify(requestPayload, null, 2));
  console.log('\n🔄 Streaming events:\n');

  const client = new SSEClient(
    serverUrl,
    (eventType: string, data: any) => {
      handleStreamingEvent(eventType, data);
    },
    (error: Error) => {
      console.error('❌ SSE Error:', error.message);
      process.exit(1);
    }
  );

  // Connect and start streaming
  client.connect(JSON.stringify(requestPayload));

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Disconnecting...');
    client.disconnect();
    process.exit(0);
  });
}

/**
 * Handle different types of streaming events
 */
function handleStreamingEvent(eventType: string, data: any): void {
  const timestamp = new Date(data.timestamp).toLocaleTimeString();

  switch (eventType) {
    case 'connected':
      console.log(`✅ [${timestamp}] Connected: ${data.message}`);
      break;

    case 'progress':
      const progressBar = '█'.repeat(Math.floor(data.progress / 5)) + 
                         '░'.repeat(20 - Math.floor(data.progress / 5));
      console.log(`📊 [${timestamp}] ${data.stage}: [${progressBar}] ${data.progress}% - ${data.message}`);
      break;

    case 'partial':
      console.log(`🧩 [${timestamp}] Partial result - ${data.section}:`);
      if (data.section === 'overview') {
        console.log(`   📝 ${data.data}`);
      } else if (data.section === 'mentalModels') {
        console.log(`   🧠 Found ${data.data.length} mental models`);
        data.data.forEach((model: any, index: number) => {
          console.log(`      ${index + 1}. ${model.construct} → ${model.mentalModel}`);
        });
      } else if (data.section === 'metaphor') {
        console.log(`   🎭 ${data.data}`);
      } else if (data.section === 'complexity') {
        console.log(`   ⚡ Complexity: ${data.data.level} - ${data.data.reasoning}`);
      } else if (data.section === 'recommendations') {
        console.log(`   💡 Recommendations:`);
        data.data.forEach((rec: string, index: number) => {
          console.log(`      ${index + 1}. ${rec}`);
        });
      } else if (data.section === 'learningPath') {
        console.log(`   🎯 Learning Path:`);
        data.data.forEach((step: string) => {
          console.log(`      ${step}`);
        });
      }
      break;

    case 'hotspot':
      console.log(`🔥 [${timestamp}] Hotspot ${data.index + 1}/${data.total}: ${data.data.filePath}`);
      console.log(`   ⚡ Cognitive Load: ${data.data.cognitiveLoad.toFixed(2)}`);
      console.log(`   📝 ${data.data.explanation.overview.substring(0, 100)}...`);
      break;

    case 'result':
      console.log(`🎉 [${timestamp}] Final result (${data.type}):`);
      if (data.type === 'repository') {
        console.log(`   📁 Repository: ${data.data.repositoryPath}`);
        console.log(`   🔥 Hotspots: ${data.data.hotspots.length}`);
        console.log(`   💡 Recommendations: ${data.data.recommendations.length}`);
      } else {
        console.log(`   📄 File: ${data.data.filePath}`);
        console.log(`   ⚡ Cognitive Load: ${data.data.cognitiveLoad.toFixed(2)}`);
      }
      break;

    case 'complete':
      console.log(`✅ [${timestamp}] ${data.message}`);
      console.log('\n🎊 Streaming complete! Disconnecting...');
      process.exit(0);
      break;

    case 'error':
      console.error(`❌ [${timestamp}] Error: ${data.error}`);
      process.exit(1);
      break;

    default:
      console.log(`📨 [${timestamp}] ${eventType}:`, JSON.stringify(data, null, 2));
  }
}

/**
 * Browser-compatible example using EventSource
 */
function browserExample(): string {
  return `
// Browser-compatible streaming bridge explanation
// Note: This requires a GET endpoint or CORS-enabled POST with EventSource

// For POST requests with body, you'll need to use fetch with ReadableStream
async function streamingBridgeExplanation(repositoryPath, skillLevel) {
  const response = await fetch('/bridge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream'
    },
    body: JSON.stringify({
      repositoryPath,
      skillLevel,
      streaming: true
    })
  });

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
      const events = buffer.split('\\n\\n');
      buffer = events.pop() || '';
      
      for (const event of events) {
        if (event.trim()) {
          parseSSEEvent(event);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function parseSSEEvent(eventText) {
  const lines = eventText.split('\\n');
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
    const parsedData = JSON.parse(data);
    handleStreamingEvent(eventType, parsedData);
  }
}

function handleStreamingEvent(eventType, data) {
  switch (eventType) {
    case 'connected':
      console.log('Connected to streaming bridge');
      break;
    case 'progress':
      updateProgressBar(data.stage, data.progress, data.message);
      break;
    case 'partial':
      displayPartialResult(data.section, data.data);
      break;
    case 'hotspot':
      displayHotspot(data.index, data.total, data.data);
      break;
    case 'result':
      displayFinalResult(data.type, data.data);
      break;
    case 'complete':
      console.log('Streaming complete');
      break;
    case 'error':
      console.error('Streaming error:', data.error);
      break;
  }
}

// Usage
streamingBridgeExplanation('./my-project', 5)
  .then(() => console.log('Streaming finished'))
  .catch(error => console.error('Streaming failed:', error));
`;
}

// Main execution
if (require.main === module) {
  console.log('Choose an option:');
  console.log('1. Run Node.js streaming demo');
  console.log('2. Show browser example code');
  
  const args = process.argv.slice(2);
  
  if (args[0] === 'browser') {
    console.log('\n📱 Browser Example Code:');
    console.log('========================\n');
    console.log(browserExample());
  } else {
    // Default to Node.js demo
    demonstrateStreamingBridge().catch((error) => {
      console.error('Demo failed:', error);
      process.exit(1);
    });
  }
}

export { SSEClient, demonstrateStreamingBridge };