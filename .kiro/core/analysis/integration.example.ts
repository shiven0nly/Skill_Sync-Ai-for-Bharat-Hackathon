/**
 * Integration Example: Using Tree-sitter Parsers with Complexity Analyzer
 * 
 * This file demonstrates how to use the Tree-sitter parser setup
 * with the complexity analyzer to analyze code complexity.
 */

import { getParserManager } from './treeSitterSetup';
import { detectLanguage } from './languageDetector';
import {
  extractFunctions,
  extractImports,
  extractConditionals,
  extractLoops,
  calculateNestingDepth,
  getLineCount,
  parseCode,
} from './parserUtils';
import { SupportedLanguage } from './parserUtils';

/**
 * Example: Analyze a JavaScript file
 */
async function analyzeJavaScriptFile(filePath: string, code: string) {
  // Get the parser manager
  const manager = await getParserManager();

  // Detect language
  const language = detectLanguage(filePath, code) as SupportedLanguage;
  if (!language) {
    throw new Error(`Could not detect language for ${filePath}`);
  }

  // Get the appropriate parser
  const parser = manager.getParser(language);

  // Parse the code
  const parseResult = parseCode(parser, code);

  // Extract metrics
  const functions = extractFunctions(parseResult.rootNode, language);
  const imports = extractImports(parseResult.rootNode, language);
  const conditionals = extractConditionals(parseResult.rootNode, language);
  const loops = extractLoops(parseResult.rootNode, language);
  const nestingDepth = calculateNestingDepth(parseResult.rootNode);
  const lineCount = getLineCount(code);

  // Calculate cyclomatic complexity (simplified)
  const cyclomaticComplexity = conditionals.length + loops.length;

  // Calculate dependency depth
  const dependencyDepth = imports.length;

  // Calculate cognitive load using the formula
  const userSkill = 5; // Default skill level
  const cognitiveLoad =
    ((cyclomaticComplexity * 0.5) + (dependencyDepth * 0.3) + (Math.log10(lineCount) * 0.2)) /
    (userSkill / 5);

  return {
    filePath,
    language,
    metrics: {
      lineCount,
      functionCount: functions.length,
      importCount: imports.length,
      conditionalCount: conditionals.length,
      loopCount: loops.length,
      nestingDepth,
      cyclomaticComplexity,
      dependencyDepth,
    },
    cognitiveLoad: Math.round(cognitiveLoad * 100) / 100,
    complexity: cognitiveLoad > 7 ? 'High' : cognitiveLoad > 4 ? 'Medium' : 'Low',
  };
}

/**
 * Example: Analyze a Python file
 */
async function analyzePythonFile(filePath: string, code: string) {
  const manager = await getParserManager();
  const language = detectLanguage(filePath, code) as SupportedLanguage;

  if (!language) {
    throw new Error(`Could not detect language for ${filePath}`);
  }

  const parser = manager.getParser(language);
  const parseResult = parseCode(parser, code);

  const functions = extractFunctions(parseResult.rootNode, language);
  const imports = extractImports(parseResult.rootNode, language);
  const conditionals = extractConditionals(parseResult.rootNode, language);
  const loops = extractLoops(parseResult.rootNode, language);
  const nestingDepth = calculateNestingDepth(parseResult.rootNode);
  const lineCount = getLineCount(code);

  const cyclomaticComplexity = conditionals.length + loops.length;
  const dependencyDepth = imports.length;

  const userSkill = 5;
  const cognitiveLoad =
    ((cyclomaticComplexity * 0.5) + (dependencyDepth * 0.3) + (Math.log10(lineCount) * 0.2)) /
    (userSkill / 5);

  return {
    filePath,
    language,
    metrics: {
      lineCount,
      functionCount: functions.length,
      importCount: imports.length,
      conditionalCount: conditionals.length,
      loopCount: loops.length,
      nestingDepth,
      cyclomaticComplexity,
      dependencyDepth,
    },
    cognitiveLoad: Math.round(cognitiveLoad * 100) / 100,
    complexity: cognitiveLoad > 7 ? 'High' : cognitiveLoad > 4 ? 'Medium' : 'Low',
  };
}

/**
 * Example: Analyze a Go file
 */
async function analyzeGoFile(filePath: string, code: string) {
  const manager = await getParserManager();
  const language = detectLanguage(filePath, code) as SupportedLanguage;

  if (!language) {
    throw new Error(`Could not detect language for ${filePath}`);
  }

  const parser = manager.getParser(language);
  const parseResult = parseCode(parser, code);

  const functions = extractFunctions(parseResult.rootNode, language);
  const imports = extractImports(parseResult.rootNode, language);
  const conditionals = extractConditionals(parseResult.rootNode, language);
  const loops = extractLoops(parseResult.rootNode, language);
  const nestingDepth = calculateNestingDepth(parseResult.rootNode);
  const lineCount = getLineCount(code);

  const cyclomaticComplexity = conditionals.length + loops.length;
  const dependencyDepth = imports.length;

  const userSkill = 5;
  const cognitiveLoad =
    ((cyclomaticComplexity * 0.5) + (dependencyDepth * 0.3) + (Math.log10(lineCount) * 0.2)) /
    (userSkill / 5);

  return {
    filePath,
    language,
    metrics: {
      lineCount,
      functionCount: functions.length,
      importCount: imports.length,
      conditionalCount: conditionals.length,
      loopCount: loops.length,
      nestingDepth,
      cyclomaticComplexity,
      dependencyDepth,
    },
    cognitiveLoad: Math.round(cognitiveLoad * 100) / 100,
    complexity: cognitiveLoad > 7 ? 'High' : cognitiveLoad > 4 ? 'Medium' : 'Low',
  };
}

/**
 * Example usage
 */
async function main() {
  // Example JavaScript code
  const jsCode = `
    import React from 'react';
    
    export function ComplexComponent({ data }) {
      const [state, setState] = React.useState(null);
      
      React.useEffect(() => {
        if (data) {
          for (let i = 0; i < data.length; i++) {
            if (data[i].active) {
              setState(data[i]);
            }
          }
        }
      }, [data]);
      
      return <div>{state?.name}</div>;
    }
  `;

  // Example Python code
  const pyCode = `
    import os
    from typing import List
    
    def process_data(items: List[str]) -> None:
        for item in items:
            if item.startswith('_'):
                continue
            if len(item) > 10:
                print(f"Long item: {item}")
            else:
                print(f"Short item: {item}")
  `;

  // Example Go code
  const goCode = `
    package main
    
    import (
        "fmt"
        "os"
    )
    
    func main() {
        data := []string{"a", "b", "c"}
        for _, item := range data {
            if len(item) > 0 {
                fmt.Println(item)
            }
        }
    }
  `;

  try {
    console.log('Analyzing JavaScript file...');
    const jsAnalysis = await analyzeJavaScriptFile('app.jsx', jsCode);
    console.log(jsAnalysis);

    console.log('\nAnalyzing Python file...');
    const pyAnalysis = await analyzePythonFile('script.py', pyCode);
    console.log(pyAnalysis);

    console.log('\nAnalyzing Go file...');
    const goAnalysis = await analyzeGoFile('main.go', goCode);
    console.log(goAnalysis);
  } catch (error) {
    console.error('Error during analysis:', error);
  }
}

// Uncomment to run the example
// main();

export { analyzeJavaScriptFile, analyzePythonFile, analyzeGoFile };
