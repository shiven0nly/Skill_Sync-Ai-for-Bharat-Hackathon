/**
 * Tests for Complexity Analyzer
 * 
 * Tests the calculateComplexity() function and related utilities
 * that implement the Cognitive Load (C_L) formula.
 */

import {
  calculateComplexity,
  calculateCyclomaticComplexity,
  calculateDependencyDepth,
  analyzeCode,
  ComplexityMetrics,
} from './complexityAnalyzer';

/**
 * Mock Tree-sitter node for testing
 */
function createMockNode(
  type: string,
  childCount: number = 0,
  children: any[] = []
): any {
  return {
    type,
    childCount,
    child: (index: number) => children[index] || null,
    startPosition: { row: 0, column: 0 },
    endPosition: { row: 1, column: 0 },
    text: 'mock code'
  };
}

describe('Complexity Analyzer', () => {
  describe('calculateCyclomaticComplexity', () => {
    it('should calculate base complexity of 1 for simple code', () => {
      const mockNode = createMockNode('program', 0);
      const result = calculateCyclomaticComplexity(mockNode, 'javascript');
      expect(result).toBe(1);
    });

    it('should add 1 for each conditional statement', () => {
      const ifNode = createMockNode('if_statement');
      const mockNode = createMockNode('program', 1, [ifNode]);
      const result = calculateCyclomaticComplexity(mockNode, 'javascript');
      expect(result).toBe(2); // base 1 + 1 conditional
    });

    it('should add 1 for each loop statement', () => {
      const forNode = createMockNode('for_statement');
      const whileNode = createMockNode('while_statement');
      const mockNode = createMockNode('program', 2, [forNode, whileNode]);
      const result = calculateCyclomaticComplexity(mockNode, 'javascript');
      expect(result).toBe(3); // base 1 + 2 loops
    });
  });

  describe('calculateDependencyDepth', () => {
    it('should count import statements', () => {
      const importNode = createMockNode('import_statement');
      const mockNode = createMockNode('program', 1, [importNode]);
      const result = calculateDependencyDepth(mockNode, 'javascript');
      expect(result).toBe(1);
    });

    it('should count multiple imports', () => {
      const import1 = createMockNode('import_statement');
      const import2 = createMockNode('import_statement');
      const mockNode = createMockNode('program', 2, [import1, import2]);
      const result = calculateDependencyDepth(mockNode, 'javascript');
      expect(result).toBe(2);
    });
  });

  describe('calculateComplexity', () => {
    it('should calculate complexity using C_L formula', () => {
      const mockNode = createMockNode('program', 0);
      const fileContent = 'const x = 1;\nconst y = 2;';
      const userSkillLevel = 5;

      const result = calculateComplexity(mockNode, fileContent, userSkillLevel, 'javascript');

      expect(result).toMatchObject({
        cyclomaticComplexity: 1,
        dependencyDepth: 0,
        linesOfCode: 2,
        complexity: 'low'
      });
      expect(result.cognitiveLoad).toBeGreaterThan(0);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should throw error for invalid skill level', () => {
      const mockNode = createMockNode('program', 0);
      const fileContent = 'const x = 1;';

      expect(() => {
        calculateComplexity(mockNode, fileContent, 0, 'javascript');
      }).toThrow('User skill level must be between 1 and 10');

      expect(() => {
        calculateComplexity(mockNode, fileContent, 11, 'javascript');
      }).toThrow('User skill level must be between 1 and 10');
    });

    it('should classify complexity levels correctly', () => {
      const mockNode = createMockNode('program', 0);
      
      // Low complexity (short file, no complexity)
      const lowComplexityResult = calculateComplexity(
        mockNode, 
        'const x = 1;', 
        10, // high skill level
        'javascript'
      );
      expect(lowComplexityResult.complexity).toBe('low');

      // Higher complexity (low skill level)
      const higherComplexityResult = calculateComplexity(
        mockNode, 
        'const x = 1;', 
        1, // low skill level
        'javascript'
      );
      // With skill level 1, the cognitive load will be higher
      expect(higherComplexityResult.complexity).toBe('low'); // Still low for simple code
    });

    it('should provide appropriate suggestions', () => {
      const mockNode = createMockNode('program', 0);
      const fileContent = 'const x = 1;';

      const result = calculateComplexity(mockNode, fileContent, 10, 'javascript');
      
      if (result.complexity === 'low') {
        expect(result.suggestion).toBe('Read as is');
      } else if (result.complexity === 'medium') {
        expect(result.suggestion).toBe('Consider Bridge Explanation for clarity');
      } else {
        expect(result.suggestion).toBe('Needs Bridge Explanation');
      }
    });
  });

  describe('analyzeCode (legacy function)', () => {
    it('should analyze code using regex-based approach', () => {
      const fileContent = `
        import React from 'react';
        if (condition) {
          for (let i = 0; i < 10; i++) {
            console.log(i);
          }
        }
      `;
      const userSkill = 5;

      const result = analyzeCode(fileContent, userSkill);

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('verdict');
      expect(result).toHaveProperty('suggestion');
      expect(typeof result.score).toBe('number');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });
});