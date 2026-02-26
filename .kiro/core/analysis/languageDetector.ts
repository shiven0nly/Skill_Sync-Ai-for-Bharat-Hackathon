/**
 * Language Detector Module
 * 
 * Detects the programming language of a code file based on file extension
 * and content analysis.
 */

import { SupportedLanguage } from './parserUtils';

/**
 * File extension to language mapping
 */
const EXTENSION_TO_LANGUAGE: Record<string, SupportedLanguage> = {
  // JavaScript extensions
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.ts': 'javascript', // TypeScript uses JavaScript parser
  '.tsx': 'javascript',

  // Python extensions
  '.py': 'python',
  '.pyw': 'python',
  '.pyi': 'python',

  // Go extensions
  '.go': 'go',
};

/**
 * Detect the programming language from a file path
 */
export function detectLanguageFromPath(filePath: string): SupportedLanguage | null {
  const extension = getFileExtension(filePath);
  return EXTENSION_TO_LANGUAGE[extension] || null;
}

/**
 * Detect the programming language from code content
 * This is a fallback method when file extension is not available
 */
export function detectLanguageFromContent(content: string): SupportedLanguage | null {
  // Normalize content for analysis
  const normalizedContent = content.trim();

  // Check for Python first if it has async def (Python-specific)
  if (/^\s*async\s+def/m.test(normalizedContent)) {
    return 'python';
  }

  // Check for JavaScript indicators
  if (isJavaScriptCode(normalizedContent)) {
    return 'javascript';
  }

  // Check for Python indicators
  if (isPythonCode(normalizedContent)) {
    return 'python';
  }

  // Check for Go indicators
  if (isGoCode(normalizedContent)) {
    return 'go';
  }

  return null;
}

/**
 * Detect language from both path and content
 * Prioritizes path-based detection, falls back to content analysis
 */
export function detectLanguage(
  filePath: string,
  content?: string
): SupportedLanguage | null {
  // Try path-based detection first
  const pathLanguage = detectLanguageFromPath(filePath);
  if (pathLanguage) {
    return pathLanguage;
  }

  // Fall back to content-based detection if content is provided
  if (content) {
    return detectLanguageFromContent(content);
  }

  return null;
}

/**
 * Get file extension from file path
 */
function getFileExtension(filePath: string): string {
  const lastDotIndex = filePath.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return '';
  }
  return filePath.substring(lastDotIndex).toLowerCase();
}

/**
 * Check if content appears to be Python code
 */
function isPythonCode(content: string): boolean {
  // Python-specific patterns that are very unlikely in other languages
  const pythonSpecific = [
    /^\s*def\s+\w+\s*\(/m, // function definition
    /^\s*class\s+\w+/m, // class definition
    /^\s*if\s+__name__\s*==\s*['"]__main__['"]/m, // main guard
    /^\s*@\w+/m, // decorators
    /^\s*async\s+def/m, // async functions (Python specific)
  ];

  // Check for Python-specific patterns first
  const specificMatches = pythonSpecific.filter(indicator => indicator.test(content)).length;
  if (specificMatches > 0) {
    return true;
  }

  // General Python patterns
  const pythonGeneral = [
    /^\s*import\s+\w+\s*(?:,|\s|$)/m, // import statement (without 'from', no quotes)
    /^\s*from\s+\w+\s+import\s+\w+/m, // from import (Python style)
    /:\s*$/m, // colon at end of line
  ];

  const generalMatches = pythonGeneral.filter(indicator => indicator.test(content)).length;
  return generalMatches >= 1;
}

/**
 * Check if content appears to be Go code
 */
function isGoCode(content: string): boolean {
  const goIndicators = [
    /^\s*package\s+\w+/m, // package declaration
    /^\s*import\s*\(/m, // import block
    /func\s+\w+\s*\(/m, // function declaration
    /^\s*func\s+\(.*\)\s+\w+/m, // method declaration
    /interface\s*\{/m, // interface definition
    /struct\s*\{/m, // struct definition
    /defer\s+/m, // defer statement
    /go\s+\w+\s*\(/m, // goroutine
    /make\s*\(/m, // make function
  ];

  const matches = goIndicators.filter(indicator => indicator.test(content)).length;
  return matches >= 1; // Changed from 2 to 1 for better detection
}

/**
 * Check if content appears to be JavaScript code
 */
function isJavaScriptCode(content: string): boolean {
  // Very specific JavaScript patterns
  const jsSpecific = [
    /^\s*import\s+.*from\s+['"`]/m, // ES6 import with 'from'
    /=>\s*\{/m, // arrow function
    /^\s*export\s+/m, // export keyword
  ];

  const specificMatches = jsSpecific.filter(indicator => indicator.test(content)).length;
  if (specificMatches > 0) {
    return true;
  }

  // General JavaScript patterns (but exclude Python-specific async def)
  const jsGeneral = [
    /^\s*const\s+\w+\s*=/m, // const declaration
    /^\s*let\s+\w+\s*=/m, // let declaration
    /^\s*var\s+\w+\s*=/m, // var declaration
    /function\s+\w+\s*\(/m, // function declaration
    /require\s*\(/m, // CommonJS require
    /async\s+function/m, // async function (not async def)
    /await\s+/m, // await keyword
  ];

  const generalMatches = jsGeneral.filter(indicator => indicator.test(content)).length;
  return generalMatches >= 1;
}

/**
 * Get all supported languages
 */
export function getSupportedLanguages(): SupportedLanguage[] {
  return ['javascript', 'python', 'go'];
}

/**
 * Check if a language is supported
 */
export function isLanguageSupported(language: string): language is SupportedLanguage {
  return ['javascript', 'python', 'go'].includes(language);
}
