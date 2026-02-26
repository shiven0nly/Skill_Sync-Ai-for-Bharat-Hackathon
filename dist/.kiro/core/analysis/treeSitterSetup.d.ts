/**
 * Tree-sitter Parser Setup Module
 *
 * This module initializes and manages Tree-sitter parsers for JavaScript, Python, and Go.
 * Tree-sitter is used to parse code and extract structural information for complexity analysis.
 *
 * NOTE: This is a setup module that defines the parser infrastructure.
 * The actual Tree-sitter WASM module (web-tree-sitter) needs to be loaded at runtime.
 */
import type { SupportedLanguage } from './parserUtils';
/**
 * Parser instance wrapper for a specific language
 */
export interface LanguageParser {
    language: SupportedLanguage;
    parser: any;
    ready: boolean;
}
/**
 * Tree-sitter Parser Manager
 * Handles initialization and management of parsers for multiple languages
 */
export declare class TreeSitterParserManager {
    private parsers;
    private initialized;
    private wasmPath;
    private Parser;
    constructor(wasmPath?: string);
    /**
     * Initialize the Tree-sitter library and load all language parsers
     */
    initialize(): Promise<void>;
    /**
     * Load a specific language parser
     */
    private loadLanguageParser;
    /**
     * Get the language module for a specific language
     * This dynamically imports the language grammar
     */
    private getLanguageModule;
    /**
     * Get a parser for a specific language
     */
    getParser(language: SupportedLanguage): any;
    /**
     * Check if a parser is ready for use
     */
    isReady(language: SupportedLanguage): boolean;
    /**
     * Get all initialized parsers
     */
    getAllParsers(): Map<SupportedLanguage, LanguageParser>;
    /**
     * Check if the manager is fully initialized
     */
    isInitialized(): boolean;
}
/**
 * Get or create the global parser manager
 */
export declare function getParserManager(wasmPath?: string): Promise<TreeSitterParserManager>;
/**
 * Reset the global parser manager (useful for testing)
 */
export declare function resetParserManager(): void;
/**
 * Setup Tree-sitter parsers for all supported languages
 * Returns a map of language -> parser for use in analysis
 */
export declare function setupTreeSitter(): Promise<Record<SupportedLanguage, any>>;
//# sourceMappingURL=treeSitterSetup.d.ts.map