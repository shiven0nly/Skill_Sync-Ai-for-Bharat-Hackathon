/**
 * API Server for Skill-Sync Complexity Analysis
 * 
 * Provides REST endpoints for analyzing code complexity
 * and generating complexity maps for repositories.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';
import { calculateComplexity, ComplexityMetrics, analyzeCode } from '../analysis/complexityAnalyzer';
import { detectLanguageFromContent } from '../analysis/languageDetector';

/**
 * Represents a file's complexity analysis in the complexity map
 */
export interface FileComplexityMap {
  path: string;
  language: string;
  metrics: ComplexityMetrics;
  lastAnalyzed: string;
}

/**
 * Represents the complete complexity map for a repository
 */
export interface RepositoryComplexityMap {
  repositoryPath: string;
  totalFiles: number;
  analyzedFiles: number;
  averageComplexity: number;
  highComplexityFiles: number;
  mediumComplexityFiles: number;
  lowComplexityFiles: number;
  files: FileComplexityMap[];
  generatedAt: string;
}

/**
 * Configuration for complexity analysis
 */
export interface AnalysisConfig {
  userSkillLevel: number;
  includeExtensions: string[];
  excludePatterns: string[];
  maxFileSize: number; // in bytes
}

/**
 * Default analysis configuration
 */
const DEFAULT_CONFIG: AnalysisConfig = {
  userSkillLevel: 5,
  includeExtensions: ['.js', '.ts', '.jsx', '.tsx', '.py', '.go'],
  excludePatterns: ['node_modules', '.git', 'dist', 'build', '__pycache__'],
  maxFileSize: 1024 * 1024, // 1MB
};

/**
 * Check if a file should be analyzed based on configuration
 */
function shouldAnalyzeFile(filePath: string, config: AnalysisConfig): boolean {
  const ext = extname(filePath);
  
  // Check if extension is included
  if (!config.includeExtensions.includes(ext)) {
    return false;
  }
  
  // Check if path matches exclude patterns
  for (const pattern of config.excludePatterns) {
    if (filePath.includes(pattern)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Recursively find all files in a directory
 */
function findFiles(dirPath: string, config: AnalysisConfig): string[] {
  const files: string[] = [];
  
  function traverse(currentPath: string) {
    try {
      const items = readdirSync(currentPath);
      
      for (const item of items) {
        const fullPath = join(currentPath, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip excluded directories
          const shouldSkip = config.excludePatterns.some(pattern => 
            item.includes(pattern) || fullPath.includes(pattern)
          );
          
          if (!shouldSkip) {
            traverse(fullPath);
          }
        } else if (stat.isFile()) {
          // Check file size
          if (stat.size <= config.maxFileSize && shouldAnalyzeFile(fullPath, config)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read directory ${currentPath}:`, error);
    }
  }
  
  traverse(dirPath);
  return files;
}

/**
 * Analyze a single file using legacy regex-based approach
 */
async function analyzeFileLegacy(
  filePath: string, 
  config: AnalysisConfig
): Promise<FileComplexityMap | null> {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const language = detectLanguageFromContent(content);
    
    if (!language) {
      return null;
    }
    
    // Use the legacy analyzeCode function
    const legacyResult = analyzeCode(content, config.userSkillLevel);
    
    // Convert to ComplexityMetrics format
    const metrics: ComplexityMetrics = {
      cyclomaticComplexity: (content.match(/if|for|while|map|&&|\|\|/g) || []).length,
      dependencyDepth: (content.match(/import|require/g) || []).length,
      linesOfCode: content.split('\n').length,
      cognitiveLoad: legacyResult.score / 10, // Convert score back to cognitive load
      skillAdjustedLoad: legacyResult.score / 10,
      complexity: legacyResult.verdict.includes('High') ? 'high' : 
                 legacyResult.verdict.includes('Medium') ? 'medium' : 'low',
      score: legacyResult.score,
      verdict: legacyResult.verdict,
      suggestion: legacyResult.suggestion
    };
    
    return {
      path: filePath,
      language,
      metrics,
      lastAnalyzed: new Date().toISOString()
    };
  } catch (error) {
    console.warn(`Warning: Could not analyze file ${filePath}:`, error);
    return null;
  }
}

/**
 * Analyze a single file and return its complexity metrics
 */
async function analyzeFile(
  filePath: string, 
  config: AnalysisConfig,
  parsers: any
): Promise<FileComplexityMap | null> {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const language = detectLanguageFromContent(content);
    
    if (!language || !parsers[language]) {
      return null;
    }
    
    const parser = parsers[language];
    const tree = parser.parse(content);
    const rootNode = tree.rootNode;
    
    const metrics = calculateComplexity(
      rootNode,
      content,
      config.userSkillLevel,
      language
    );
    
    return {
      path: filePath,
      language,
      metrics,
      lastAnalyzed: new Date().toISOString()
    };
  } catch (error) {
    console.warn(`Warning: Could not analyze file ${filePath}:`, error);
    return null;
  }
}

/**
 * Generate a complexity map for an entire repository
 */
export async function generateComplexityMap(
  repositoryPath: string,
  config: Partial<AnalysisConfig> = {}
): Promise<RepositoryComplexityMap> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Find all files to analyze
  const allFiles = findFiles(repositoryPath, finalConfig);
  const fileAnalyses: FileComplexityMap[] = [];
  
  // Analyze each file using the legacy regex-based approach for now
  for (const filePath of allFiles) {
    const analysis = await analyzeFileLegacy(filePath, finalConfig);
    if (analysis) {
      // Make path relative to repository root
      analysis.path = relative(repositoryPath, filePath);
      fileAnalyses.push(analysis);
    }
  }
  
  // Calculate summary statistics
  const totalFiles = allFiles.length;
  const analyzedFiles = fileAnalyses.length;
  
  let totalComplexity = 0;
  let highComplexityFiles = 0;
  let mediumComplexityFiles = 0;
  let lowComplexityFiles = 0;
  
  for (const analysis of fileAnalyses) {
    totalComplexity += analysis.metrics.cognitiveLoad;
    
    switch (analysis.metrics.complexity) {
      case 'high':
        highComplexityFiles++;
        break;
      case 'medium':
        mediumComplexityFiles++;
        break;
      case 'low':
        lowComplexityFiles++;
        break;
    }
  }
  
  const averageComplexity = analyzedFiles > 0 ? totalComplexity / analyzedFiles : 0;
  
  return {
    repositoryPath,
    totalFiles,
    analyzedFiles,
    averageComplexity,
    highComplexityFiles,
    mediumComplexityFiles,
    lowComplexityFiles,
    files: fileAnalyses,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Simple HTTP server implementation for the API
 */
export class ComplexityApiServer {
  private port: number;
  
  constructor(port: number = 3000) {
    this.port = port;
  }
  
  /**
   * Handle HTTP requests manually (simplified implementation)
   */
  private async handleRequest(url: string, method: string, body?: string): Promise<any> {
    const urlParts = url.split('?');
    const path = urlParts[0];
    const queryString = urlParts[1] || '';
    const params = new URLSearchParams(queryString);
    
    if (method === 'GET' && path === '/health') {
      return { status: 'ok', timestamp: new Date().toISOString() };
    }
    
    if (method === 'POST' && path === '/api/analyze') {
      const requestData = body ? JSON.parse(body) : {};
      const { repositoryPath, userSkillLevel = 5 } = requestData;
      
      if (!repositoryPath) {
        throw new Error('repositoryPath is required');
      }
      
      const config: Partial<AnalysisConfig> = {
        userSkillLevel: Number(userSkillLevel)
      };
      
      const complexityMap = await generateComplexityMap(repositoryPath, config);
      return complexityMap;
    }
    
    if (method === 'GET' && path === '/api/analyze') {
      const repositoryPath = params.get('path');
      const userSkillLevel = params.get('skillLevel') || '5';
      
      if (!repositoryPath) {
        throw new Error('path parameter is required');
      }
      
      const config: Partial<AnalysisConfig> = {
        userSkillLevel: Number(userSkillLevel)
      };
      
      const complexityMap = await generateComplexityMap(repositoryPath, config);
      return complexityMap;
    }
    
    throw new Error(`Not found: ${method} ${path}`);
  }
  
  /**
   * Start the server (simplified implementation for demo)
   */
  async start(): Promise<void> {
    console.log(`Complexity API Server starting on port ${this.port}`);
    console.log('Available endpoints:');
    console.log('  GET  /health - Health check');
    console.log('  GET  /api/analyze?path=<repo-path>&skillLevel=<1-10> - Analyze repository');
    console.log('  POST /api/analyze - Analyze repository (JSON body: {repositoryPath, userSkillLevel})');
    
    // This is a simplified implementation
    // In a real scenario, you'd use Express.js or similar
    return Promise.resolve();
  }
  
  /**
   * Process a request (for testing/demo purposes)
   */
  async processRequest(method: string, url: string, body?: string): Promise<any> {
    try {
      const result = await this.handleRequest(url, method, body);
      return {
        status: 200,
        data: result
      };
    } catch (error: any) {
      return {
        status: error.message.includes('Not found') ? 404 : 400,
        error: error.message
      };
    }
  }
}

/**
 * CLI function to analyze a repository from command line
 */
export async function analyzeRepositoryCLI(repositoryPath: string, userSkillLevel: number = 5): Promise<void> {
  console.log(`Analyzing repository: ${repositoryPath}`);
  console.log(`User skill level: ${userSkillLevel}`);
  console.log('');
  
  const complexityMap = await generateComplexityMap(repositoryPath, { userSkillLevel });
  
  console.log('=== COMPLEXITY MAP RESULTS ===');
  console.log(`Repository: ${complexityMap.repositoryPath}`);
  console.log(`Total files found: ${complexityMap.totalFiles}`);
  console.log(`Files analyzed: ${complexityMap.analyzedFiles}`);
  console.log(`Average complexity: ${complexityMap.averageComplexity.toFixed(2)}`);
  console.log('');
  
  console.log('Complexity Distribution:');
  console.log(`  🟢 Low: ${complexityMap.lowComplexityFiles} files`);
  console.log(`  🟨 Medium: ${complexityMap.mediumComplexityFiles} files`);
  console.log(`  🟥 High: ${complexityMap.highComplexityFiles} files`);
  console.log('');
  
  if (complexityMap.files.length > 0) {
    console.log('Top 10 Most Complex Files:');
    const sortedFiles = complexityMap.files
      .sort((a, b) => b.metrics.cognitiveLoad - a.metrics.cognitiveLoad)
      .slice(0, 10);
    
    for (const file of sortedFiles) {
      console.log(`  ${file.metrics.verdict} ${file.path} (${file.metrics.cognitiveLoad.toFixed(2)})`);
    }
  }
  
  console.log('');
  console.log(`Analysis completed at: ${complexityMap.generatedAt}`);
}