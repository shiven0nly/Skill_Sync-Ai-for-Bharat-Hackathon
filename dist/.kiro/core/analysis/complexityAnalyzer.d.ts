/**
 * Complexity Analyzer Module
 *
 * Implements the Cognitive Load (C_L) formula for measuring code complexity.
 * Formula: C_L = ((V_c × 0.5) + (D_d × 0.3) + (log₁₀(LOC) × 0.2)) / S_level
 *
 * Where:
 * - V_c = Cyclomatic Complexity (decision paths)
 * - D_d = Dependency Depth (imports/external calls)
 * - LOC = Lines of Code (used logarithmically)
 * - S_level = User Skill Level (1-10 scale)
 */
import { SupportedLanguage } from './parserUtils';
/**
 * Represents the complexity metrics for a code file
 */
export interface ComplexityMetrics {
    cyclomaticComplexity: number;
    dependencyDepth: number;
    linesOfCode: number;
    cognitiveLoad: number;
    skillAdjustedLoad: number;
    complexity: 'low' | 'medium' | 'high';
    score: number;
    verdict: string;
    suggestion: string;
}
/**
 * Calculate cyclomatic complexity from parsed code
 * Counts decision paths: conditionals, loops, and logical operators
 */
export declare function calculateCyclomaticComplexity(rootNode: any, language: SupportedLanguage): number;
/**
 * Calculate dependency depth from parsed code
 * Counts imports and external module references
 */
export declare function calculateDependencyDepth(rootNode: any, language: SupportedLanguage): number;
/**
 * Calculate the Cognitive Load (C_L) using the formula:
 * C_L = ((V_c × 0.5) + (D_d × 0.3) + (log₁₀(LOC) × 0.2)) / S_level
 *
 * @param rootNode - The parsed code tree from Tree-sitter
 * @param fileContent - The original file content (for LOC calculation)
 * @param userSkillLevel - User's skill level (1-10 scale)
 * @param language - The programming language
 * @returns ComplexityMetrics object with all calculated metrics
 */
export declare function calculateComplexity(rootNode: any, fileContent: string, userSkillLevel: number, language?: SupportedLanguage): ComplexityMetrics;
/**
 * Legacy function for backward compatibility
 * Analyzes code using simple regex-based metrics
 */
export declare const analyzeCode: (fileContent: string, userSkill: number) => {
    score: number;
    verdict: string;
    suggestion: string;
};
//# sourceMappingURL=complexityAnalyzer.d.ts.map