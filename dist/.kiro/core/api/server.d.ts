/**
 * API Server for Skill-Sync Complexity Analysis
 *
 * Provides REST endpoints for analyzing code complexity
 * and generating complexity maps for repositories.
 */
import { ComplexityMetrics } from '../analysis/complexityAnalyzer';
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
    maxFileSize: number;
}
/**
 * Generate a complexity map for an entire repository
 */
export declare function generateComplexityMap(repositoryPath: string, config?: Partial<AnalysisConfig>): Promise<RepositoryComplexityMap>;
/**
 * Simple HTTP server implementation for the API
 */
export declare class ComplexityApiServer {
    private port;
    constructor(port?: number);
    /**
     * Handle HTTP requests manually (simplified implementation)
     */
    private handleRequest;
    /**
     * Start the server (simplified implementation for demo)
     */
    start(): Promise<void>;
    /**
     * Process a request (for testing/demo purposes)
     */
    processRequest(method: string, url: string, body?: string): Promise<any>;
}
/**
 * CLI function to analyze a repository from command line
 */
export declare function analyzeRepositoryCLI(repositoryPath: string, userSkillLevel?: number): Promise<void>;
//# sourceMappingURL=server.d.ts.map