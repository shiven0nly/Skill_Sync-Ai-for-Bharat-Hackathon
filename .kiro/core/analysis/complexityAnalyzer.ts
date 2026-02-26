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

import {
  extractConditionals,
  extractLoops,
  extractImports,
  getLineCount,
  SupportedLanguage,
} from './parserUtils';

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
export function calculateCyclomaticComplexity(
  rootNode: any,
  language: SupportedLanguage
): number {
  // Count conditional statements (if, switch, ternary)
  const conditionals = extractConditionals(rootNode, language);
  
  // Count loop statements (for, while, do-while)
  const loops = extractLoops(rootNode, language);
  
  // Base complexity is 1 (for the main path)
  let complexity = 1;
  
  // Add 1 for each conditional
  complexity += conditionals.length;
  
  // Add 1 for each loop
  complexity += loops.length;
  
  return complexity;
}

/**
 * Calculate dependency depth from parsed code
 * Counts imports and external module references
 */
export function calculateDependencyDepth(
  rootNode: any,
  language: SupportedLanguage
): number {
  const imports = extractImports(rootNode, language);
  return imports.length;
}

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
export function calculateComplexity(
  rootNode: any,
  fileContent: string,
  userSkillLevel: number,
  language: SupportedLanguage = 'javascript'
): ComplexityMetrics {
  // Validate skill level
  if (userSkillLevel < 1 || userSkillLevel > 10) {
    throw new Error('User skill level must be between 1 and 10');
  }

  // Calculate individual metrics
  const cyclomaticComplexity = calculateCyclomaticComplexity(rootNode, language);
  const dependencyDepth = calculateDependencyDepth(rootNode, language);
  const linesOfCode = getLineCount(fileContent);

  // Ensure LOC is at least 1 to avoid log(0)
  const locForCalculation = Math.max(1, linesOfCode);

  // Apply the C_L formula:
  // C_L = ((V_c × 0.5) + (D_d × 0.3) + (log₁₀(LOC) × 0.2)) / S_level
  const numerator =
    cyclomaticComplexity * 0.5 +
    dependencyDepth * 0.3 +
    Math.log10(locForCalculation) * 0.2;

  const cognitiveLoad = numerator / userSkillLevel;
  const skillAdjustedLoad = cognitiveLoad;

  // Determine complexity level based on cognitive load
  let complexity: 'low' | 'medium' | 'high';
  if (skillAdjustedLoad < 2) {
    complexity = 'low';
  } else if (skillAdjustedLoad < 5) {
    complexity = 'medium';
  } else {
    complexity = 'high';
  }

  // Calculate a normalized score (0-100)
  const score = Math.min(100, Math.round((skillAdjustedLoad / 10) * 100));

  // Generate verdict and suggestion
  const verdict =
    complexity === 'high'
      ? 'High Load 🟥'
      : complexity === 'medium'
      ? 'Medium Load 🟨'
      : 'Low Load 🟢';

  const suggestion =
    complexity === 'high'
      ? 'Needs Bridge Explanation'
      : complexity === 'medium'
      ? 'Consider Bridge Explanation for clarity'
      : 'Read as is';

  return {
    cyclomaticComplexity,
    dependencyDepth,
    linesOfCode,
    cognitiveLoad,
    skillAdjustedLoad,
    complexity,
    score,
    verdict,
    suggestion,
  };
}

/**
 * Legacy function for backward compatibility
 * Analyzes code using simple regex-based metrics
 */
export const analyzeCode = (fileContent: string, userSkill: number) => {
  const lines = fileContent.split('\n').length;

  // Simplified logic for a hackathon demo:
  const cyclomaticComplexity =
    (fileContent.match(/if|for|while|map|&&|\|\|/g) || []).length;
  const dependencyDepth = (fileContent.match(/import|require/g) || []).length;

  // The Kiro Logic: $C_L$ Formula
  const cognitiveLoad =
    (cyclomaticComplexity * 0.5 +
      dependencyDepth * 0.3 +
      Math.log10(lines) * 0.2) /
    userSkill;

  return {
    score: Math.min(100, Math.round(cognitiveLoad * 10)),
    verdict:
      cognitiveLoad > 7
        ? 'High Load 🟥'
        : cognitiveLoad > 4
        ? 'Medium Load 🟨'
        : 'Low Load 🟢',
    suggestion:
      cognitiveLoad > 7 ? 'Needs Bridge Explanation' : 'Read as is',
  };
};