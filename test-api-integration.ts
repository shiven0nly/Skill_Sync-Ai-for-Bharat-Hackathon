/**
 * Integration Test for API Server
 * 
 * This script demonstrates the API working with the current project directory.
 * Run this after starting the server with `npm run server`.
 */

import * as http from 'http';
import * as path from 'path';

async function testApiIntegration() {
  console.log('🧠 Testing Skill-Sync API Integration');
  console.log('=====================================\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await makeRequest('GET', '/health');
    
    if (healthResponse.statusCode === 200 && healthResponse.data.success) {
      console.log('✅ Health check passed');
      console.log(`   Status: ${healthResponse.data.data.status}`);
      console.log(`   Service: ${healthResponse.data.data.service}\n`);
    } else {
      console.log('❌ Health check failed');
      return;
    }

    // Test 2: Repository Analysis
    console.log('2. Testing Repository Analysis...');
    console.log('   Analyzing current project directory...');
    
    const analysisRequest = {
      repositoryPath: process.cwd(),
      skillLevel: 5,
      excludePatterns: [
        '*.test.ts',
        '*.spec.ts',
        'node_modules/**',
        'dist/**',
        '.git/**'
      ],
      maxFiles: 10 // Limit for demo
    };

    const analysisResponse = await makeRequest('POST', '/analyze', analysisRequest);
    
    if (analysisResponse.statusCode === 200 && analysisResponse.data.success) {
      console.log('✅ Repository analysis completed');
      const data = analysisResponse.data.data;
      
      console.log(`   Repository: ${data.repositoryPath}`);
      console.log(`   Total files found: ${data.totalFiles}`);
      console.log(`   Files analyzed: ${data.analyzedFiles}`);
      console.log(`   Files skipped: ${data.skippedFiles}`);
      console.log(`   Average complexity: ${data.summary.averageComplexity}`);
      console.log(`   High complexity files: ${data.summary.highComplexityFiles}`);
      
      console.log('\n   Language distribution:');
      Object.entries(data.summary.languageDistribution).forEach(([lang, count]) => {
        if (typeof count === 'number' && count > 0) {
          console.log(`     ${lang}: ${count} files`);
        }
      });

      if (data.files.length > 0) {
        console.log('\n   Sample analyzed files:');
        data.files.slice(0, 3).forEach((file: any) => {
          const relativePath = path.relative(process.cwd(), file.filePath);
          console.log(`     ${relativePath} (${file.language}): ${file.category} complexity (${file.complexity.cognitiveLoad.toFixed(2)})`);
        });
      }
      
    } else {
      console.log('❌ Repository analysis failed');
      console.log(`   Status: ${analysisResponse.statusCode}`);
      console.log(`   Error: ${analysisResponse.data.error}`);
    }

  } catch (error) {
    console.error('❌ Integration test failed:', error);
    console.log('\n💡 Make sure the API server is running:');
    console.log('   npm run server');
  }
}

// Helper function to make HTTP requests
async function makeRequest(method: string, path: string, body?: any): Promise<{
  statusCode: number;
  data: any;
}> {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode || 500,
            data: parsedData
          });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// Run the integration test
testApiIntegration();