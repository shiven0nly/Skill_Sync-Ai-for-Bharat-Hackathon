/**
 * Language Detector Module
 *
 * Detects the programming language of a code file based on file extension
 * and content analysis.
 */
import { SupportedLanguage } from './parserUtils';
/**
 * Detect the programming language from a file path
 */
export declare function detectLanguageFromPath(filePath: string): SupportedLanguage | null;
/**
 * Detect the programming language from code content
 * This is a fallback method when file extension is not available
 */
export declare function detectLanguageFromContent(content: string): SupportedLanguage | null;
/**
 * Detect language from both path and content
 * Prioritizes path-based detection, falls back to content analysis
 */
export declare function detectLanguage(filePath: string, content?: string): SupportedLanguage | null;
/**
 * Get all supported languages
 */
export declare function getSupportedLanguages(): SupportedLanguage[];
/**
 * Check if a language is supported
 */
export declare function isLanguageSupported(language: string): language is SupportedLanguage;
//# sourceMappingURL=languageDetector.d.ts.map