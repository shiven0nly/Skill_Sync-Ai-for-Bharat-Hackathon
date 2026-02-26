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
  parser: any; // Parser type from web-tree-sitter
  ready: boolean;
}

/**
 * Tree-sitter Parser Manager
 * Handles initialization and management of parsers for multiple languages
 */
export class TreeSitterParserManager {
  private parsers: Map<SupportedLanguage, LanguageParser> = new Map();
  private initialized: boolean = false;
  private wasmPath: string;
  private Parser: any; // web-tree-sitter Parser class

  constructor(wasmPath: string = 'node_modules/web-tree-sitter/tree-sitter.wasm') {
    this.wasmPath = wasmPath;
  }

  /**
   * Initialize the Tree-sitter library and load all language parsers
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Dynamically import web-tree-sitter
      const TreeSitterModule = await import('web-tree-sitter');
      this.Parser = TreeSitterModule.default;

      // Initialize the Tree-sitter library with WASM
      await this.Parser.init({
        locateFile: (scriptName: string) => this.wasmPath,
      });

      // Load parsers for each supported language
      await this.loadLanguageParser('javascript');
      await this.loadLanguageParser('python');
      await this.loadLanguageParser('go');

      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize Tree-sitter: ${error}`);
    }
  }

  /**
   * Load a specific language parser
   */
  private async loadLanguageParser(language: SupportedLanguage): Promise<void> {
    try {
      const parser = new this.Parser();
      const languageModule = await this.getLanguageModule(language);
      parser.setLanguage(languageModule);

      this.parsers.set(language, {
        language,
        parser,
        ready: true,
      });
    } catch (error) {
      throw new Error(`Failed to load ${language} parser: ${error}`);
    }
  }

  /**
   * Get the language module for a specific language
   * This dynamically imports the language grammar
   */
  private async getLanguageModule(language: SupportedLanguage): Promise<any> {
    switch (language) {
      case 'javascript':
        // For web-tree-sitter, we use the built-in JavaScript parser
        return await this.Parser.Language.load('javascript');
      case 'python':
        return await this.Parser.Language.load('python');
      case 'go':
        return await this.Parser.Language.load('go');
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }

  /**
   * Get a parser for a specific language
   */
  getParser(language: SupportedLanguage): any {
    const parserWrapper = this.parsers.get(language);
    if (!parserWrapper || !parserWrapper.ready) {
      throw new Error(`Parser for ${language} is not initialized`);
    }
    return parserWrapper.parser;
  }

  /**
   * Check if a parser is ready for use
   */
  isReady(language: SupportedLanguage): boolean {
    const parserWrapper = this.parsers.get(language);
    return parserWrapper?.ready ?? false;
  }

  /**
   * Get all initialized parsers
   */
  getAllParsers(): Map<SupportedLanguage, LanguageParser> {
    return new Map(this.parsers);
  }

  /**
   * Check if the manager is fully initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

/**
 * Global parser manager instance
 */
let globalParserManager: TreeSitterParserManager | null = null;

/**
 * Get or create the global parser manager
 */
export async function getParserManager(
  wasmPath?: string
): Promise<TreeSitterParserManager> {
  if (!globalParserManager) {
    globalParserManager = new TreeSitterParserManager(wasmPath);
    await globalParserManager.initialize();
  }
  return globalParserManager;
}

/**
 * Reset the global parser manager (useful for testing)
 */
export function resetParserManager(): void {
  globalParserManager = null;
}
/**
 * Setup Tree-sitter parsers for all supported languages
 * Returns a map of language -> parser for use in analysis
 */
export async function setupTreeSitter(): Promise<Record<SupportedLanguage, any>> {
  const manager = await getParserManager();
  const parsers: Record<SupportedLanguage, any> = {} as any;
  
  const supportedLanguages: SupportedLanguage[] = ['javascript', 'python', 'go'];
  
  for (const language of supportedLanguages) {
    if (manager.isReady(language)) {
      parsers[language] = manager.getParser(language);
    }
  }
  
  return parsers;
}