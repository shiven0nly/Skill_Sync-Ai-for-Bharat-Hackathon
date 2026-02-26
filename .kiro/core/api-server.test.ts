/**
 * API Server Tests
 * 
 * Tests for the Skill-Sync API server functionality.
 */

import { SkillSyncApiServer } from './api-server';
import * as http from 'http';

describe('SkillSyncApiServer', () => {
  let server: SkillSyncApiServer;
  const testPort = 3001; // Use different port for testing

  beforeAll(async () => {
    server = new SkillSyncApiServer(testPort);
    await server.start();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('Health Check Endpoint', () => {
    test('should return healthy status', async () => {
      const response = await makeRequest('GET', '/health');
      
      expect(response.statusCode).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.status).toBe('healthy');
      expect(response.data.data.service).toBe('Skill-Sync API');
    });

    test('should reject non-GET requests', async () => {
      const response = await makeRequest('POST', '/health');
      
      expect(response.statusCode).toBe(405);
      expect(response.data.success).toBe(false);
      expect(response.data.error).toContain('Method not allowed');
    });
  });

  describe('Analyze Endpoint', () => {
    test('should reject GET requests', async () => {
      const response = await makeRequest('GET', '/analyze');
      
      expect(response.statusCode).toBe(405);
      expect(response.data.success).toBe(false);
      expect(response.data.error).toContain('Method not allowed');
    });

    test('should validate required fields', async () => {
      const response = await makeRequest('POST', '/analyze', {});
      
      expect(response.statusCode).toBe(400);
      expect(response.data.success).toBe(false);
      expect(response.data.error).toContain('repositoryPath is required');
    });

    test('should validate skill level', async () => {
      const response = await makeRequest('POST', '/analyze', {
        repositoryPath: '/some/path',
        skillLevel: 15 // Invalid skill level
      });
      
      expect(response.statusCode).toBe(400);
      expect(response.data.success).toBe(false);
      expect(response.data.error).toContain('skillLevel must be a number between 1 and 10');
    });

    test('should handle invalid repository path gracefully', async () => {
      const response = await makeRequest('POST', '/analyze', {
        repositoryPath: '/nonexistent/path',
        skillLevel: 5
      });
      
      expect(response.statusCode).toBe(500);
      expect(response.data.success).toBe(false);
      expect(response.data.error).toBeDefined();
    });
  });

  describe('Unknown Endpoints', () => {
    test('should return 404 for unknown endpoints', async () => {
      const response = await makeRequest('GET', '/unknown');
      
      expect(response.statusCode).toBe(404);
      expect(response.data.success).toBe(false);
      expect(response.data.error).toContain('Endpoint not found');
    });
  });

  // Helper function to make HTTP requests
  async function makeRequest(method: string, path: string, body?: any): Promise<{
    statusCode: number;
    data: any;
  }> {
    return new Promise((resolve, reject) => {
      const postData = body ? JSON.stringify(body) : '';
      
      const options = {
        hostname: 'localhost',
        port: testPort,
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
});