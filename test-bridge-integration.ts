#!/usr/bin/env node

/**
 * Bridge Prompt API Integration Test
 * 
 * Tests the /bridge endpoint with mock data to verify the API integration works.
 */

import * as http from 'http';

interface BridgeRequest {
  repositoryPath: string;
  skillLevel: number;
  targetFile?: string;
}

async function testBridgeEndpoint() {
  console.log('🧪 Testing Bridge Prompt API Integration\n');

  // Mock request data (using current directory as test repo)
  const testRequest: BridgeRequest = {
    repositoryPath: process.cwd(),
    skillLevel: 5,
    targetFile: 'examples/bridge-prompt-usage.ts'
  };

  const postData = JSON.stringify(testRequest);

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/bridge',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise<void>((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          console.log(`Status Code: ${res.statusCode}`);
          console.log(`Response Success: ${response.success}`);
          
          if (response.success) {
            console.log('✅ Bridge endpoint test PASSED');
            console.log('\nSample Response Structure:');
            console.log(`- File Path: ${response.data.filePath}`);
            console.log(`- Language: ${response.data.language}`);
            console.log(`- Cognitive Load: ${response.data.cognitiveLoad}`);
            console.log(`- Skill Level: ${response.data.skillLevel}`);
            console.log(`- Overview: ${response.data.explanation.overview.substring(0, 100)}...`);
            console.log(`- Mental Models Count: ${response.data.explanation.mentalModels.length}`);
            console.log(`- Complexity Level: ${response.data.explanation.complexity.level}`);
            console.log(`- Suggestions Count: ${response.data.explanation.complexity.suggestions.length}`);
          } else {
            console.log('❌ Bridge endpoint test FAILED');
            console.log(`Error: ${response.error}`);
          }
          
          resolve();
        } catch (error) {
          console.log('❌ Failed to parse response');
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Request failed:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testHealthEndpoint() {
  console.log('\n🏥 Testing Health Endpoint');
  
  return new Promise<void>((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/health',
      method: 'GET'
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`Health Status: ${response.data.status}`);
          console.log('✅ Health endpoint working');
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  try {
    console.log('Starting integration tests...');
    console.log('Make sure the API server is running on port 3000');
    console.log('Run: npm run server:dev\n');

    await testHealthEndpoint();
    await testBridgeEndpoint();
    
    console.log('\n🎉 All integration tests completed!');
  } catch (error) {
    console.error('\n💥 Integration test failed:', error);
    console.log('\nMake sure to start the server first:');
    console.log('npm run server:dev');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { testBridgeEndpoint, testHealthEndpoint };