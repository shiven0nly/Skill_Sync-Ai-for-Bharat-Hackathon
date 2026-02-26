#!/usr/bin/env node

/**
 * Simple Streaming Test
 * 
 * Basic test to verify streaming functionality works
 */

const http = require('http');
const { spawn } = require('child_process');

async function testStreaming() {
  console.log('🧪 Simple Streaming Test');
  console.log('========================\n');

  // Test data
  const requestData = JSON.stringify({
    repositoryPath: process.cwd(),
    skillLevel: 5,
    streaming: true,
    maxFiles: 3
  });

  console.log('📡 Testing streaming endpoint...');
  console.log('Request:', requestData);
  console.log('\n🔄 Starting server and testing...\n');

  // Start server in background
  const serverProcess = spawn('node', ['dist/src/server.js'], {
    env: { ...process.env, PORT: '3002' },
    stdio: 'pipe'
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: '/bridge',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      }
    };

    const req = http.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);
      
      if (res.statusCode !== 200) {
        console.error('❌ Request failed');
        serverProcess.kill();
        process.exit(1);
      }

      let eventCount = 0;
      res.setEncoding('utf8');
      
      res.on('data', (chunk) => {
        console.log(`📨 Received chunk ${++eventCount}:`);
        console.log(chunk.substring(0, 200) + (chunk.length > 200 ? '...' : ''));
        console.log('---');
        
        if (eventCount >= 5) {
          console.log('✅ Streaming test successful!');
          serverProcess.kill();
          process.exit(0);
        }
      });

      res.on('end', () => {
        console.log('✅ Stream ended successfully');
        serverProcess.kill();
        process.exit(0);
      });

      res.on('error', (error) => {
        console.error('❌ Stream error:', error);
        serverProcess.kill();
        process.exit(1);
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      serverProcess.kill();
      process.exit(1);
    });

    req.write(requestData);
    req.end();

    // Timeout after 10 seconds
    setTimeout(() => {
      console.log('⏰ Test timeout - stopping');
      serverProcess.kill();
      process.exit(0);
    }, 10000);

  } catch (error) {
    console.error('❌ Test failed:', error);
    serverProcess.kill();
    process.exit(1);
  }
}

testStreaming();