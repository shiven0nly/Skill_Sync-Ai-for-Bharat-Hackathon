/**
 * Repository Analyzer Module
 * 
 * Analyzes an entire repository to generate a complexity map
 * using the existing Tree-sitter parsers and complexity calculation.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { calculateComplexity, ComplexityMetrics, ComplexityResult } from './complexity-analyzer';
import { getParserManager } from './analysis/treeSitterSetup';
import { detectLanguage } from './analysis/languageDetector';
import { SupportedLanguage } from './analysis/parserUtils';
import { 
  parseCode, 
  extractFunctions, 
  extractImports, 
  extractConditionals, 
  extractLoops,
  getLineCount 
} from './analysis/parserUtils';

/**
 * Represents the complexity analysis of a single file
 */
export interface FileComplexityResult {
  filePath: string;
  language: SupportedLanguage;
  complexity: ComplexityResult;
  category: string;
}

/**
 * Represents the complexity map of an entire repository
 */
export interface RepositoryComplexityMap {
  repositoryPath: string;
  totalFiles: number;
  analyzedFiles: number;
  skippedFiles: number;
  files: FileComplexityResult[];
  summary: {
    averageComplexity: number;
    highComplexityFiles: number;
    languageDistribution: Record<SupportedLanguage, number>;
  };
}

/**
 * Configuration options for repository analysis
 */
export interface AnalysisOptions {
  skillLevel: number; // User's skill level (1-10)
  excludePatterns?: string[]; // File patterns to exclude
  includePatterns?: string[]; // File patterns to include (if specified, only these will be analyzed)
  maxFiles?: number; // Maximum number of files to analyze
}

/**
 * Default file patterns to exclude from analysis
 */
const DEFAULT_EXCLUDE_PATTERNS = [
  'node_modules/**',
  '.git/**',
  'dist/**',
  'build/**',
  '*.min.js',
  '*.bundle.js',
  '.DS_Store',
  'Thumbs.db'
];

/**
 * Analyze an entire repository and generate a complexity map
 */
export async function analyzeRepository(
  repositoryPath: string,
  options: AnalysisOptions
): Promise<RepositoryComplexityMap> {
  const { skillLevel, excludePatterns = [], includePatterns, maxFiles } = options;

  // Validate skill level
  if (skillLevel < 1 || skillLevel > 10) {
    throw new Error('Skill level must be between 1 and 10');
  }

  // Initialize Tree-sitter parsers
  const parserManager = await getParserManager();

  // Get all files in the repository
  const allFiles = await getAllFiles(repositoryPath);
  
  // Filter files based on patterns
  const filteredFiles = filterFiles(allFiles, excludePatterns, includePatterns);
  
  // Limit files if maxFiles is specified
  const filesToAnalyze = maxFiles ? filteredFiles.slice(0, maxFiles) : filteredFiles;

  const fileResults: FileComplexityResult[] = [];
  let analyzedCount = 0;
  let skippedCount = 0;

  // Analyze each file
  for (const filePath of filesToAnalyze) {
    try {
      const result = await analyzeFile(filePath, skillLevel, parserManager);
      if (result) {
        fileResults.push(result);
        analyzedCount++;
      } else {
        skippedCount++;
      }
    } catch (error) {
      console.warn(`Failed to analyze file ${filePath}:`, error);
      skippedCount++;
    }
  }

  // Generate summary statistics
  const summary = generateSummary(fileResults);

  return {
    repositoryPath,
    totalFiles: allFiles.length,
    analyzedFiles: analyzedCount,
    skippedFiles: skippedCount,
    files: fileResults,
    summary
  };
}

/**
 * Analyze a single file and calculate its complexity
 */
async function analyzeFile(
  filePath: string,
  skillLevel: number,
  parserManager: any
): Promise<FileComplexityResult | null> {
  try {
    // Read file content
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Detect language
    const language = detectLanguage(filePath, content);
    if (!language) {
      return null; // Skip unsupported files
    }

    // Get parser for the language
    const parser = parserManager.getParser(language);
    
    // Parse the code
    const parseResult = parseCode(parser, content);
    const { rootNode } = parseResult;

    // Extract structural information
    const functions = extractFunctions(rootNode, language);
    const imports = extractImports(rootNode, language);
    const conditionals = extractConditionals(rootNode, language);
    const loops = extractLoops(rootNode, language);
    const linesOfCode = getLineCount(content);

    // Calculate complexity metrics
    const cyclomaticComplexity = calculateCyclomaticComplexity(conditionals, loops, functions);
    const dependencyDepth = calculateDependencyDepth(imports);

    const metrics: ComplexityMetrics = {
      cyclomaticComplexity,
      dependencyDepth,
      linesOfCode
    };

    // Calculate cognitive load
    const complexity = calculateComplexity(metrics, skillLevel);
    
    // Categorize complexity
    const category = categorizeCognitiveLoad(complexity.cognitiveLoad);

    return {
      filePath,
      language,
      complexity,
      category
    };

  } catch (error) {
    throw new Error(`Failed to analyze file ${filePath}: ${error}`);
  }
}

/**
 * Calculate cyclomatic complexity from parsed nodes
 */
function calculateCyclomaticComplexity(
  conditionals: any[],
  loops: any[],
  functions: any[]
): number {
  // Base complexity is 1 for each function, plus 1 for each decision point
  const baseComplexity = Math.max(1, functions.length);
  const decisionPoints = conditionals.length + loops.length;
  
  return baseComplexity + decisionPoints;
}

/**
 * Calculate dependency depth from import statements
 */
function calculateDependencyDepth(imports: any[]): number {
  // Simple heuristic: count unique imports as dependency depth
  // In a more sophisticated implementation, we could analyze the actual dependency graph
  return imports.length;
}

/**
 * Categorize cognitive load levels
 */
function categorizeCognitiveLoad(cognitiveLoad: number): string {
  if (cognitiveLoad <= 1) return 'Low';
  if (cognitiveLoad <= 2) return 'Medium';
  if (cognitiveLoad <= 3) return 'High';
  return 'Very High';
}

/**
 * Get all files in a directory recursively
 */
async function getAllFiles(dirPath: string): Promise<string[]> {
  const files: string[] = [];

  async function traverse(currentPath: string) {
    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        
        if (entry.isDirectory()) {
          await traverse(fullPath);
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
      console.warn(`Cannot read directory ${currentPath}:`, error);
    }
  }

  await traverse(dirPath);
  return files;
}

/**
 * Filter files based on include/exclude patterns
 */
function filterFiles(
  files: string[],
  excludePatterns: string[],
  includePatterns?: string[]
): string[] {
  const allExcludePatterns = [...DEFAULT_EXCLUDE_PATTERNS, ...excludePatterns];
  
  let filteredFiles = files;

  // Apply include patterns if specified
  if (includePatterns && includePatterns.length > 0) {
    filteredFiles = files.filter(file => 
      includePatterns.some(pattern => matchesPattern(file, pattern))
    );
  }

  // Apply exclude patterns
  filteredFiles = filteredFiles.filter(file => 
    !allExcludePatterns.some(pattern => matchesPattern(file, pattern))
  );

  // Only include supported file types
  filteredFiles = filteredFiles.filter(file => {
    const language = detectLanguage(file);
    return language !== null;
  });

  return filteredFiles;
}

/**
 * Simple pattern matching (supports basic wildcards)
 */
function matchesPattern(filePath: string, pattern: string): boolean {
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/\*\*/g, '.*') // ** matches any path
    .replace(/\*/g, '[^/]*') // * matches any filename characters
    .replace(/\./g, '\\.'); // Escape dots
  
  const regex = new RegExp(regexPattern);
  return regex.test(filePath);
}

/**
 * Generate summary statistics for the repository analysis
 */
function generateSummary(fileResults: FileComplexityResult[]) {
  if (fileResults.length === 0) {
    return {
      averageComplexity: 0,
      highComplexityFiles: 0,
      languageDistribution: {} as Record<SupportedLanguage, number>
    };
  }

  // Calculate average complexity
  const totalComplexity = fileResults.reduce((sum, file) => sum + file.complexity.cognitiveLoad, 0);
  const averageComplexity = totalComplexity / fileResults.length;

  // Count high complexity files (cognitive load > 2)
  const highComplexityFiles = fileResults.filter(file => file.complexity.cognitiveLoad > 2).length;

  // Calculate language distribution
  const languageDistribution: Record<SupportedLanguage, number> = {
    javascript: 0,
    python: 0,
    go: 0
  };

  fileResults.forEach(file => {
    languageDistribution[file.language]++;
  });

  return {
    averageComplexity: Math.round(averageComplexity * 100) / 100, // Round to 2 decimal places
    highComplexityFiles,
    languageDistribution
  };
}