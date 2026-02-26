/**
 * MetaphorCard Interface and Utilities
 *
 * Defines the structure and utilities for high-complexity code snippet explanations
 * using metaphorical bridges to help developers understand complex code.
 */
import { ComplexityMetrics } from '../analysis/complexityAnalyzer';
/**
 * Represents a metaphorical explanation for complex code
 */
export interface CodeMetaphor {
    /** Title of the metaphor */
    title: string;
    /** Detailed description of how the code works */
    description: string;
    /** Simple analogy to relate the code to familiar concepts */
    analogy: string;
    /** Key learning points to highlight */
    keyPoints: string[];
    /** Difficulty level of understanding (1-10) */
    difficultyLevel: number;
}
/**
 * Complete data structure for a MetaphorCard
 */
export interface MetaphorCardData {
    /** The original complex code snippet */
    codeSnippet: string;
    /** Programming language of the code */
    language: string;
    /** File path where the code is located */
    filePath: string;
    /** Complexity analysis results */
    complexity: ComplexityMetrics;
    /** Metaphorical explanation */
    metaphor: CodeMetaphor;
    /** User's skill level (1-10) */
    userSkillLevel: number;
    /** Timestamp when the analysis was performed */
    analyzedAt: string;
}
/**
 * Configuration for generating metaphors
 */
export interface MetaphorGenerationConfig {
    /** User's skill level to tailor explanations */
    userSkillLevel: number;
    /** Preferred metaphor domains (e.g., 'cooking', 'sports', 'nature') */
    preferredDomains?: string[];
    /** Maximum length of explanations */
    maxExplanationLength?: number;
    /** Include code examples in explanations */
    includeCodeExamples?: boolean;
}
/**
 * Utility class for generating and managing MetaphorCards
 */
export declare class MetaphorCardGenerator {
    private config;
    constructor(config: MetaphorGenerationConfig);
    /**
     * Generate a metaphor for high-complexity code
     */
    generateMetaphor(codeSnippet: string, language: string, complexity: ComplexityMetrics): CodeMetaphor;
    /**
     * Create a complete MetaphorCard data structure
     */
    createMetaphorCard(codeSnippet: string, language: string, filePath: string, complexity: ComplexityMetrics): MetaphorCardData;
    /**
     * Analyze code patterns to determine metaphor categories
     */
    private analyzeCodePatterns;
    /**
     * Select appropriate metaphor based on patterns and complexity
     */
    private selectMetaphor;
    /**
     * Filter code snippets that would benefit from metaphor explanations
     */
    static shouldCreateMetaphorCard(complexity: ComplexityMetrics, userSkillLevel: number): boolean;
    /**
     * Generate a summary of all metaphor cards for a repository
     */
    static generateRepositorySummary(metaphorCards: MetaphorCardData[]): {
        totalCards: number;
        averageDifficulty: number;
        patternDistribution: Record<string, number>;
        recommendations: string[];
    };
}
/**
 * Export utility functions for easy use
 */
export declare const MetaphorCardUtils: {
    /**
     * Create a metaphor card generator with default configuration
     */
    createGenerator: (userSkillLevel: number) => MetaphorCardGenerator;
    /**
     * Quick function to check if a code snippet needs a metaphor explanation
     */
    needsMetaphor: (complexity: ComplexityMetrics, userSkillLevel: number) => boolean;
    /**
     * Generate a simple metaphor for a code snippet
     */
    quickMetaphor: (codeSnippet: string, language: string, userSkillLevel: number) => CodeMetaphor;
};
//# sourceMappingURL=MetaphorCard.d.ts.map