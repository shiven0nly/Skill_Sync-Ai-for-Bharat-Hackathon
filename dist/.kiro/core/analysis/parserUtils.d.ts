/**
 * Parser Utilities Module
 *
 * Provides utility functions for parsing code with Tree-sitter
 * and extracting structural information for complexity analysis.
 */
export type SupportedLanguage = 'javascript' | 'python' | 'go';
/**
 * Represents a parsed code node with metadata
 */
export interface ParsedNode {
    type: string;
    startLine: number;
    endLine: number;
    startColumn: number;
    endColumn: number;
    text: string;
    children: ParsedNode[];
}
/**
 * Represents the result of parsing a code file
 */
export interface ParseResult {
    language: SupportedLanguage;
    tree: any;
    rootNode: any;
    text: string;
}
/**
 * Parse code using a given parser
 */
export declare function parseCode(parser: any, code: string, previousTree?: any): ParseResult;
/**
 * Convert a Tree-sitter SyntaxNode to our ParsedNode format
 */
export declare function syntaxNodeToParseNode(node: any): ParsedNode;
/**
 * Query nodes of a specific type from the parse tree
 */
export declare function queryNodesByType(node: any, targetType: string): any[];
/**
 * Extract all function/method definitions from a parse tree
 */
export declare function extractFunctions(rootNode: any, language: SupportedLanguage): any[];
/**
 * Extract all import/require statements from a parse tree
 */
export declare function extractImports(rootNode: any, language: SupportedLanguage): any[];
/**
 * Extract all conditional statements (if, switch, etc.) from a parse tree
 */
export declare function extractConditionals(rootNode: any, language: SupportedLanguage): any[];
/**
 * Extract all loop statements from a parse tree
 */
export declare function extractLoops(rootNode: any, language: SupportedLanguage): any[];
/**
 * Count the depth of nesting in a parse tree
 */
export declare function calculateNestingDepth(node: any): number;
/**
 * Get the line count of a code snippet
 */
export declare function getLineCount(text: string): number;
//# sourceMappingURL=parserUtils.d.ts.map