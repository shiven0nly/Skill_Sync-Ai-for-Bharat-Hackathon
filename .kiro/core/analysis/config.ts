/**
 * Configuration for Tree-sitter Parser Setup
 */

/**
 * Parser configuration
 */
export const PARSER_CONFIG = {
  // WASM module path
  wasmPath: 'node_modules/web-tree-sitter/tree-sitter.wasm',

  // Language configurations
  languages: {
    javascript: {
      name: 'JavaScript',
      extensions: ['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx'],
      grammarPackage: 'tree-sitter-javascript',
    },
    python: {
      name: 'Python',
      extensions: ['.py', '.pyw', '.pyi'],
      grammarPackage: 'tree-sitter-python',
    },
    go: {
      name: 'Go',
      extensions: ['.go'],
      grammarPackage: 'tree-sitter-go',
    },
  },

  // Parser options
  options: {
    // Enable incremental parsing
    incremental: true,

    // Maximum file size to parse (in bytes)
    maxFileSize: 10 * 1024 * 1024, // 10MB

    // Timeout for parsing (in milliseconds)
    parseTimeout: 5000,
  },
};

/**
 * Complexity analysis configuration
 */
export const COMPLEXITY_CONFIG = {
  // Cognitive load formula weights
  weights: {
    cyclomaticComplexity: 0.5,
    dependencyDepth: 0.3,
    linesOfCode: 0.2,
  },

  // Complexity thresholds
  thresholds: {
    low: 4,
    medium: 7,
    high: Infinity,
  },

  // Default user skill level (1-10)
  defaultSkillLevel: 5,

  // Skill level adjustment factor
  skillLevelFactor: 5,
};

/**
 * Language detection configuration
 */
export const DETECTION_CONFIG = {
  // Minimum number of indicators to confirm language detection
  minIndicators: 2,

  // Case sensitivity for extension matching
  caseSensitive: false,
};

/**
 * Export all configurations
 */
export default {
  PARSER_CONFIG,
  COMPLEXITY_CONFIG,
  DETECTION_CONFIG,
};
