/**
 * Complexity Analyzer - Implements cognitive load calculation
 * Based on the C_L formula from the design document
 */
export interface ComplexityMetrics {
    cyclomaticComplexity: number;
    dependencyDepth: number;
    linesOfCode: number;
}
export interface ComplexityResult {
    cognitiveLoad: number;
    metrics: ComplexityMetrics;
    skillLevel: number;
}
/**
 * Calculate cognitive load using the C_L formula:
 * C_L = ((V_c × 0.5) + (D_d × 0.3) + (log₁₀(LOC) × 0.2)) / S_level
 *
 * @param metrics - The complexity metrics for the code
 * @param skillLevel - User's self-reported expertise (1-10 scale)
 * @returns ComplexityResult containing cognitive load and input metrics
 */
export declare function calculateComplexity(metrics: ComplexityMetrics, skillLevel: number): ComplexityResult;
/**
 * Helper function to categorize cognitive load levels
 */
export declare function categorizeCognitiveLoad(cognitiveLoad: number): string;
//# sourceMappingURL=complexity-analyzer.d.ts.map