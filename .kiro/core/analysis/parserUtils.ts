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
  tree: any; // Parser.Tree type from web-tree-sitter
  rootNode: any; // Parser.SyntaxNode type from web-tree-sitter
  text: string;
}

/**
 * Parse code using a given parser
 */
export function parseCode(
  parser: any,
  code: string,
  previousTree?: any
): ParseResult {
  const tree = parser.parse(code, previousTree);
  return {
    language: 'javascript', // This will be set by the caller
    tree,
    rootNode: tree.rootNode,
    text: code,
  };
}

/**
 * Convert a Tree-sitter SyntaxNode to our ParsedNode format
 */
export function syntaxNodeToParseNode(node: any): ParsedNode {
  const children: ParsedNode[] = [];

  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (child) {
      children.push(syntaxNodeToParseNode(child));
    }
  }

  return {
    type: node.type,
    startLine: node.startPosition.row,
    endLine: node.endPosition.row,
    startColumn: node.startPosition.column,
    endColumn: node.endPosition.column,
    text: node.text,
    children,
  };
}

/**
 * Query nodes of a specific type from the parse tree
 */
export function queryNodesByType(
  node: any,
  targetType: string
): any[] {
  const results: any[] = [];

  function traverse(currentNode: any) {
    if (currentNode.type === targetType) {
      results.push(currentNode);
    }

    for (let i = 0; i < currentNode.childCount; i++) {
      const child = currentNode.child(i);
      if (child) {
        traverse(child);
      }
    }
  }

  traverse(node);
  return results;
}

/**
 * Extract all function/method definitions from a parse tree
 */
export function extractFunctions(
  rootNode: any,
  language: SupportedLanguage
): any[] {
  const functionTypes = getFunctionTypesForLanguage(language);
  const functions: any[] = [];

  for (const funcType of functionTypes) {
    functions.push(...queryNodesByType(rootNode, funcType));
  }

  return functions;
}

/**
 * Extract all import/require statements from a parse tree
 */
export function extractImports(
  rootNode: any,
  language: SupportedLanguage
): any[] {
  const importTypes = getImportTypesForLanguage(language);
  const imports: any[] = [];

  for (const importType of importTypes) {
    imports.push(...queryNodesByType(rootNode, importType));
  }

  return imports;
}

/**
 * Extract all conditional statements (if, switch, etc.) from a parse tree
 */
export function extractConditionals(
  rootNode: any,
  language: SupportedLanguage
): any[] {
  const conditionalTypes = getConditionalTypesForLanguage(language);
  const conditionals: any[] = [];

  for (const condType of conditionalTypes) {
    conditionals.push(...queryNodesByType(rootNode, condType));
  }

  return conditionals;
}

/**
 * Extract all loop statements from a parse tree
 */
export function extractLoops(
  rootNode: any,
  language: SupportedLanguage
): any[] {
  const loopTypes = getLoopTypesForLanguage(language);
  const loops: any[] = [];

  for (const loopType of loopTypes) {
    loops.push(...queryNodesByType(rootNode, loopType));
  }

  return loops;
}

/**
 * Get function definition node types for a language
 */
function getFunctionTypesForLanguage(language: SupportedLanguage): string[] {
  switch (language) {
    case 'javascript':
      return ['function_declaration', 'arrow_function', 'method_definition'];
    case 'python':
      return ['function_definition'];
    case 'go':
      return ['function_declaration', 'method_declaration'];
    default:
      return [];
  }
}

/**
 * Get import/require statement node types for a language
 */
function getImportTypesForLanguage(language: SupportedLanguage): string[] {
  switch (language) {
    case 'javascript':
      return ['import_statement', 'require_call'];
    case 'python':
      return ['import_statement', 'import_from_statement'];
    case 'go':
      return ['import_spec', 'import_declaration'];
    default:
      return [];
  }
}

/**
 * Get conditional statement node types for a language
 */
function getConditionalTypesForLanguage(language: SupportedLanguage): string[] {
  switch (language) {
    case 'javascript':
      return ['if_statement', 'switch_statement', 'ternary_expression'];
    case 'python':
      return ['if_statement', 'elif_clause', 'else_clause'];
    case 'go':
      return ['if_statement', 'switch_statement', 'type_switch_statement'];
    default:
      return [];
  }
}

/**
 * Get loop statement node types for a language
 */
function getLoopTypesForLanguage(language: SupportedLanguage): string[] {
  switch (language) {
    case 'javascript':
      return ['for_statement', 'while_statement', 'do_statement', 'for_in_statement', 'for_of_statement'];
    case 'python':
      return ['for_statement', 'while_statement'];
    case 'go':
      return ['for_statement'];
    default:
      return [];
  }
}

/**
 * Count the depth of nesting in a parse tree
 */
export function calculateNestingDepth(node: any): number {
  let maxDepth = 0;

  function traverse(currentNode: any, depth: number) {
    maxDepth = Math.max(maxDepth, depth);

    for (let i = 0; i < currentNode.childCount; i++) {
      const child = currentNode.child(i);
      if (child) {
        traverse(child, depth + 1);
      }
    }
  }

  traverse(node, 0);
  return maxDepth;
}

/**
 * Get the line count of a code snippet
 */
export function getLineCount(text: string): number {
  return text.split('\n').length;
}
