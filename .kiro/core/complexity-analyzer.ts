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
export function calculateComplexity(
  metrics: ComplexityMetrics,
  skillLevel: number
): ComplexityResult {
  // Validate inputs
  if (skillLevel < 1 || skillLevel > 10) {
    throw new Error('Skill level must be between 1 and 10');
  }

  if (metrics.cyclomaticComplexity < 0 || metrics.dependencyDepth < 0 || metrics.linesOfCode < 1) {
    throw new Error('Metrics must be non-negative, and lines of code must be at least 1');
  }

  const { cyclomaticComplexity, dependencyDepth, linesOfCode } = metrics;

  // Apply the cognitive load formula
  const weightedComplexity = (cyclomaticComplexity * 0.5) + 
                            (dependencyDepth * 0.3) + 
                            (Math.log10(linesOfCode) * 0.2);

  const cognitiveLoad = weightedComplexity / skillLevel;

  return {
    cognitiveLoad,
    metrics,
    skillLevel
  };
}

/**
 * Helper function to categorize cognitive load levels
 */
export function categorizeCognitiveLoad(cognitiveLoad: number): string {
  if (cognitiveLoad <= 1) return 'Low';
  if (cognitiveLoad <= 2) return 'Medium';
  if (cognitiveLoad <= 3) return 'High';
  return 'Very High';
}