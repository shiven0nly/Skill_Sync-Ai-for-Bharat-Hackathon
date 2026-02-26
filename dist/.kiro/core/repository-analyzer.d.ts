/**
 * Repository Analyzer Module
 *
 * Analyzes an entire repository to generate a complexity map
 * using the existing Tree-sitter parsers and complexity calculation.
 */
import { ComplexityResult } from './complexity-analyzer';
import { SupportedLanguage } from './analysis/parserUtils';
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
    skillLevel: number;
    excludePatterns?: string[];
    includePatterns?: string[];
    maxFiles?: number;
}
/**
 * Analyze an entire repository and generate a complexity map
 */
export declare function analyzeRepository(repositoryPath: string, options: AnalysisOptions): Promise<RepositoryComplexityMap>;
//# sourceMappingURL=repository-analyzer.d.ts.map