/**
 * Integration Example: Using Tree-sitter Parsers with Complexity Analyzer
 *
 * This file demonstrates how to use the Tree-sitter parser setup
 * with the complexity analyzer to analyze code complexity.
 */
import { SupportedLanguage } from './parserUtils';
/**
 * Example: Analyze a JavaScript file
 */
declare function analyzeJavaScriptFile(filePath: string, code: string): Promise<{
    filePath: string;
    language: SupportedLanguage;
    metrics: {
        lineCount: number;
        functionCount: number;
        importCount: number;
        conditionalCount: number;
        loopCount: number;
        nestingDepth: number;
        cyclomaticComplexity: number;
        dependencyDepth: number;
    };
    cognitiveLoad: number;
    complexity: string;
}>;
/**
 * Example: Analyze a Python file
 */
declare function analyzePythonFile(filePath: string, code: string): Promise<{
    filePath: string;
    language: SupportedLanguage;
    metrics: {
        lineCount: number;
        functionCount: number;
        importCount: number;
        conditionalCount: number;
        loopCount: number;
        nestingDepth: number;
        cyclomaticComplexity: number;
        dependencyDepth: number;
    };
    cognitiveLoad: number;
    complexity: string;
}>;
/**
 * Example: Analyze a Go file
 */
declare function analyzeGoFile(filePath: string, code: string): Promise<{
    filePath: string;
    language: SupportedLanguage;
    metrics: {
        lineCount: number;
        functionCount: number;
        importCount: number;
        conditionalCount: number;
        loopCount: number;
        nestingDepth: number;
        cyclomaticComplexity: number;
        dependencyDepth: number;
    };
    cognitiveLoad: number;
    complexity: string;
}>;
export { analyzeJavaScriptFile, analyzePythonFile, analyzeGoFile };
//# sourceMappingURL=integration.example.d.ts.map