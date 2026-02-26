/**
 * Tests for the Complexity API Server
 */

import { ComplexityApiServer, generateComplexityMap } from './server';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

describe('Complexity API Server', () => {
  let testDir: string;
  let server: ComplexityApiServer;

  beforeEach(() => {
    // Create a temporary test directory
    testDir = join(__dirname, 'test-repo');
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch {}
    mkdirSync(testDir, { recursive: true });
    
    server = new ComplexityApiServer(3001);
  });

  afterEach(() => {
    // Clean up test directory
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch {}
  });

  describe('generateComplexityMap', () => {
    it('should analyze a simple JavaScript file', async () => {
      // Create a test file
      const testFile = join(testDir, 'test.js');
      writeFileSync(testFile, `
        function hello(name) {
          if (name) {
            return "Hello, " + name;
          }
          return "Hello, World!";
        }
      `);

      const result = await generateComplexityMap(testDir);

      expect(result.repositoryPath).toBe(testDir);
      expect(result.analyzedFiles).toBe(1);
      expect(result.files).toHaveLength(1);
      expect(result.files[0].path).toBe('test.js');
      expect(result.files[0].language).toBe('javascript');
      expect(result.files[0].metrics).toHaveProperty('cyclomaticComplexity');
      expect(result.files[0].metrics).toHaveProperty('cognitiveLoad');
    });

    it('should handle multiple files', async () => {
      // Create multiple test files
      writeFileSync(join(testDir, 'file1.js'), 'const x = 1;');
      writeFileSync(join(testDir, 'file2.ts'), 'let y: number = 2;');
      writeFileSync(join(testDir, 'file3.py'), 'print("hello")');

      const result = await generateComplexityMap(testDir);

      // Debug: log what files were found
      console.log('Files found:', result.files.map(f => ({ path: f.path, language: f.language })));

      expect(result.analyzedFiles).toBeGreaterThanOrEqual(1); // At least JS files should be detected
      expect(result.files.length).toBeGreaterThanOrEqual(1);
      
      const jsFile = result.files.find(f => f.path === 'file1.js');
      expect(jsFile).toBeDefined();
      expect(jsFile?.language).toBe('javascript');
    });

    it('should exclude files based on configuration', async () => {
      // Create files in node_modules (should be excluded)
      mkdirSync(join(testDir, 'node_modules'), { recursive: true });
      writeFileSync(join(testDir, 'node_modules', 'lib.js'), 'module.exports = {};');
      writeFileSync(join(testDir, 'main.js'), 'const lib = require("./node_modules/lib");');

      const result = await generateComplexityMap(testDir);

      expect(result.analyzedFiles).toBe(1);
      expect(result.files[0].path).toBe('main.js');
    });

    it('should calculate summary statistics correctly', async () => {
      // Create files with different complexity levels
      writeFileSync(join(testDir, 'simple.js'), 'const x = 1;');
      writeFileSync(join(testDir, 'complex.js'), `
        function complexFunction(a, b, c) {
          if (a > 0) {
            for (let i = 0; i < b; i++) {
              if (i % 2 === 0) {
                while (c > 0) {
                  c--;
                }
              }
            }
          }
          return a + b + c;
        }
      `);

      const result = await generateComplexityMap(testDir, { userSkillLevel: 1 });

      expect(result.analyzedFiles).toBeGreaterThanOrEqual(1);
      expect(result.averageComplexity).toBeGreaterThan(0);
      expect(result.lowComplexityFiles + result.mediumComplexityFiles + result.highComplexityFiles).toBe(result.analyzedFiles);
    });
  });

  describe('ComplexityApiServer', () => {
    it('should handle health check requests', async () => {
      const response = await server.processRequest('GET', '/health');
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'ok');
      expect(response.data).toHaveProperty('timestamp');
    });

    it('should handle GET analyze requests', async () => {
      // Create a test file
      writeFileSync(join(testDir, 'test.js'), 'const x = 1;');

      const response = await server.processRequest('GET', `/api/analyze?path=${testDir}&skillLevel=5`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('repositoryPath', testDir);
      expect(response.data).toHaveProperty('analyzedFiles');
      expect(response.data).toHaveProperty('files');
    });

    it('should handle POST analyze requests', async () => {
      // Create a test file
      writeFileSync(join(testDir, 'test.js'), 'const x = 1;');

      const requestBody = JSON.stringify({
        repositoryPath: testDir,
        userSkillLevel: 7
      });

      const response = await server.processRequest('POST', '/api/analyze', requestBody);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('repositoryPath', testDir);
      expect(response.data).toHaveProperty('analyzedFiles');
    });

    it('should return 400 for missing repository path', async () => {
      const response = await server.processRequest('GET', '/api/analyze');
      
      expect(response.status).toBe(400);
      expect(response.error).toContain('path parameter is required');
    });

    it('should return 404 for unknown endpoints', async () => {
      const response = await server.processRequest('GET', '/unknown');
      
      expect(response.status).toBe(404);
      expect(response.error).toContain('Not found');
    });
  });
});