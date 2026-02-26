/**
 * Parser Utilities Module
 *
 * Provides utility functions for parsing code with Tree-sitter
 * and extracting structural information for complexity analysis.
 */
/**
 * Parse code using a given parser
 */
export function parseCode(parser, code, previousTree) {
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
export function syntaxNodeToParseNode(node) {
    const children = [];
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
export function queryNodesByType(node, targetType) {
    const results = [];
    function traverse(currentNode) {
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
export function extractFunctions(rootNode, language) {
    const functionTypes = getFunctionTypesForLanguage(language);
    const functions = [];
    for (const funcType of functionTypes) {
        functions.push(...queryNodesByType(rootNode, funcType));
    }
    return functions;
}
/**
 * Extract all import/require statements from a parse tree
 */
export function extractImports(rootNode, language) {
    const importTypes = getImportTypesForLanguage(language);
    const imports = [];
    for (const importType of importTypes) {
        imports.push(...queryNodesByType(rootNode, importType));
    }
    return imports;
}
/**
 * Extract all conditional statements (if, switch, etc.) from a parse tree
 */
export function extractConditionals(rootNode, language) {
    const conditionalTypes = getConditionalTypesForLanguage(language);
    const conditionals = [];
    for (const condType of conditionalTypes) {
        conditionals.push(...queryNodesByType(rootNode, condType));
    }
    return conditionals;
}
/**
 * Extract all loop statements from a parse tree
 */
export function extractLoops(rootNode, language) {
    const loopTypes = getLoopTypesForLanguage(language);
    const loops = [];
    for (const loopType of loopTypes) {
        loops.push(...queryNodesByType(rootNode, loopType));
    }
    return loops;
}
/**
 * Get function definition node types for a language
 */
function getFunctionTypesForLanguage(language) {
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
function getImportTypesForLanguage(language) {
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
function getConditionalTypesForLanguage(language) {
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
function getLoopTypesForLanguage(language) {
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
export function calculateNestingDepth(node) {
    let maxDepth = 0;
    function traverse(currentNode, depth) {
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
export function getLineCount(text) {
    return text.split('\n').length;
}
//# sourceMappingURL=parserUtils.js.map