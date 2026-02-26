# Tree-sitter Parser Setup for Skill-Sync

This directory contains the Tree-sitter parser setup and utilities for the Skill-Sync complexity analyzer engine.

## Overview

Tree-sitter is a parser generator tool and an incremental parsing library. It's used in Skill-Sync to parse JavaScript, Python, and Go code for complexity analysis.

## Modules

### 1. `treeSitterSetup.ts`
**Purpose**: Initializes and manages Tree-sitter parsers for multiple languages.

**Key Components**:
- `TreeSitterParserManager`: Main class for managing parsers
- `getParserManager()`: Global singleton for parser management
- `resetParserManager()`: Reset the global manager (useful for testing)

**Usage**:
```typescript
import { getParserManager } from './treeSitterSetup';

const manager = await getParserManager();
const jsParser = manager.getParser('javascript');
const pythonParser = manager.getParser('python');
const goParser = manager.getParser('go');
```

### 2. `parserUtils.ts`
**Purpose**: Provides utility functions for parsing code and extracting structural information.

**Key Functions**:
- `parseCode()`: Parse code using a given parser
- `syntaxNodeToParseNode()`: Convert Tree-sitter nodes to our format
- `queryNodesByType()`: Find nodes of a specific type
- `extractFunctions()`: Extract all function definitions
- `extractImports()`: Extract all import statements
- `extractConditionals()`: Extract all conditional statements
- `extractLoops()`: Extract all loop statements
- `calculateNestingDepth()`: Calculate maximum nesting depth
- `getLineCount()`: Count lines in code

**Usage**:
```typescript
import { extractFunctions, extractImports } from './parserUtils';

const functions = extractFunctions(rootNode, 'javascript');
const imports = extractImports(rootNode, 'python');
```

### 3. `languageDetector.ts`
**Purpose**: Detects programming language from file paths and code content.

**Key Functions**:
- `detectLanguageFromPath()`: Detect language from file extension
- `detectLanguageFromContent()`: Detect language from code content
- `detectLanguage()`: Combined detection (path + content)
- `getSupportedLanguages()`: Get list of supported languages
- `isLanguageSupported()`: Check if a language is supported

**Usage**:
```typescript
import { detectLanguage } from './languageDetector';

const language = detectLanguage('app.js');
// Returns: 'javascript'

const language2 = detectLanguage('unknown.txt', 'def hello(): pass');
// Returns: 'python'
```

## Supported Languages

- **JavaScript** (`.js`, `.jsx`, `.ts`, `.tsx`, `.mjs`, `.cjs`)
- **Python** (`.py`, `.pyw`, `.pyi`)
- **Go** (`.go`)

## Installation

1. Install dependencies:
```bash
npm install
```

2. The Tree-sitter WASM module will be automatically downloaded as part of `web-tree-sitter`.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test -- --coverage
```

## Architecture

### Parser Manager Pattern
The `TreeSitterParserManager` uses a singleton pattern to ensure only one instance of each language parser is created. This is efficient because:
- Parsers are expensive to initialize
- Multiple instances would waste memory
- Reusing parsers improves performance

### Language Detection Strategy
Language detection uses a two-tier approach:
1. **Path-based**: Fast, reliable for known file extensions
2. **Content-based**: Fallback for unknown extensions, uses pattern matching

### Node Extraction
The parser utilities provide language-specific node type mappings:
- JavaScript: `function_declaration`, `arrow_function`, `method_definition`
- Python: `function_definition`
- Go: `function_declaration`, `method_declaration`

## Integration with Complexity Analyzer

The Tree-sitter setup is used by the complexity analyzer to:

1. **Parse code** into an abstract syntax tree (AST)
2. **Extract metrics**:
   - Cyclomatic complexity (from conditionals and loops)
   - Dependency depth (from imports)
   - Nesting depth (from nested structures)
3. **Calculate cognitive load** using the formula:
   ```
   C_L = ((V_c × 0.5) + (D_d × 0.3) + (log₁₀(LOC) × 0.2)) / S_level
   ```

## Performance Considerations

- **Lazy initialization**: Parsers are only initialized when first requested
- **Incremental parsing**: Tree-sitter supports incremental parsing for better performance
- **Memory efficiency**: Reuses parser instances across multiple parses

## Future Enhancements

- [ ] Support for additional languages (Java, Rust, C++, etc.)
- [ ] Incremental parsing for large codebases
- [ ] Caching of parse results
- [ ] Performance profiling and optimization
- [ ] Custom query language for complex AST traversals

## References

- [Tree-sitter Documentation](https://tree-sitter.github.io/)
- [web-tree-sitter](https://github.com/tree-sitter/tree-sitter/tree/master/lib/binding_web)
- [Tree-sitter Language Grammars](https://github.com/tree-sitter)
