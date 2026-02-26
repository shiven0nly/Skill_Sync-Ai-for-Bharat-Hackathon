/**
 * Tests for MetaphorCard utilities
 */

import {
  MetaphorCardGenerator,
  MetaphorCardUtils,
  CodeMetaphor,
  MetaphorCardData
} from './MetaphorCard';
import { ComplexityMetrics } from '../analysis/complexityAnalyzer';

describe('MetaphorCard', () => {
  const mockComplexity: ComplexityMetrics = {
    cyclomaticComplexity: 3,
    dependencyDepth: 2,
    linesOfCode: 15,
    cognitiveLoad: 4.5,
    skillAdjustedLoad: 4.5,
    complexity: 'medium',
    score: 65,
    verdict: 'Medium Load 🟨',
    suggestion: 'Consider Bridge Explanation for clarity'
  };

  describe('MetaphorCardGenerator', () => {
    let generator: MetaphorCardGenerator;

    beforeEach(() => {
      generator = new MetaphorCardGenerator({
        userSkillLevel: 5,
        maxExplanationLength: 500,
        includeCodeExamples: true
      });
    });

    it('should generate metaphor for data transformation code', () => {
      const code = `
        const result = users
          .filter(user => user.active)
          .map(user => user.name)
          .reduce((acc, name) => acc + name.length, 0);
      `;

      const metaphor = generator.generateMetaphor(code, 'javascript', mockComplexity);

      expect(metaphor.title).toBe('Data Assembly Line');
      expect(metaphor.description).toContain('assembly line');
      expect(metaphor.analogy).toContain('factory');
      expect(metaphor.keyPoints).toHaveLength(4);
      expect(metaphor.difficultyLevel).toBeGreaterThan(0);
      expect(metaphor.difficultyLevel).toBeLessThanOrEqual(10);
    });

    it('should generate metaphor for asynchronous code', () => {
      const code = `
        async function fetchUserData() {
          const user = await fetch('/api/user');
          const posts = await fetch('/api/posts');
          return { user, posts };
        }
      `;

      const metaphor = generator.generateMetaphor(code, 'javascript', mockComplexity);

      expect(metaphor.title).toBe('Restaurant Kitchen');
      expect(metaphor.description).toContain('restaurant kitchen');
      expect(metaphor.analogy).toContain('chef');
      expect(metaphor.keyPoints.length).toBeGreaterThan(0);
    });

    it('should generate metaphor for conditional code', () => {
      const code = `
        if (user.age >= 18) {
          return 'adult';
        } else if (user.age >= 13) {
          return 'teenager';
        } else {
          return 'child';
        }
      `;

      const metaphor = generator.generateMetaphor(code, 'javascript', mockComplexity);

      expect(metaphor.title).toBe('Traffic Control System');
      expect(metaphor.description).toContain('traffic');
      expect(metaphor.analogy).toContain('traffic light');
    });

    it('should create complete metaphor card data', () => {
      const code = 'function test() { return "hello"; }';
      const filePath = '/src/test.js';

      const card = generator.createMetaphorCard(code, 'javascript', filePath, mockComplexity);

      expect(card.codeSnippet).toBe(code);
      expect(card.language).toBe('javascript');
      expect(card.filePath).toBe(filePath);
      expect(card.complexity).toBe(mockComplexity);
      expect(card.metaphor).toBeDefined();
      expect(card.userSkillLevel).toBe(5);
      expect(card.analyzedAt).toBeDefined();
    });

    it('should adjust difficulty level based on complexity and skill', () => {
      const highComplexity: ComplexityMetrics = {
        ...mockComplexity,
        cognitiveLoad: 8,
        complexity: 'high'
      };

      const lowSkillGenerator = new MetaphorCardGenerator({ userSkillLevel: 2 });
      const highSkillGenerator = new MetaphorCardGenerator({ userSkillLevel: 9 });

      const lowSkillMetaphor = lowSkillGenerator.generateMetaphor('test', 'javascript', highComplexity);
      const highSkillMetaphor = highSkillGenerator.generateMetaphor('test', 'javascript', highComplexity);

      // Both should be valid difficulty levels
      expect(lowSkillMetaphor.difficultyLevel).toBeGreaterThanOrEqual(1);
      expect(lowSkillMetaphor.difficultyLevel).toBeLessThanOrEqual(10);
      expect(highSkillMetaphor.difficultyLevel).toBeGreaterThanOrEqual(1);
      expect(highSkillMetaphor.difficultyLevel).toBeLessThanOrEqual(10);
      
      // Low skill should generally result in higher or equal difficulty
      expect(lowSkillMetaphor.difficultyLevel).toBeGreaterThanOrEqual(highSkillMetaphor.difficultyLevel);
    });
  });

  describe('MetaphorCardGenerator.shouldCreateMetaphorCard', () => {
    it('should recommend metaphor card for high complexity', () => {
      const highComplexity: ComplexityMetrics = {
        ...mockComplexity,
        complexity: 'high'
      };

      const result = MetaphorCardGenerator.shouldCreateMetaphorCard(highComplexity, 5);
      expect(result).toBe(true);
    });

    it('should recommend metaphor card for medium complexity with low skill', () => {
      const mediumComplexity: ComplexityMetrics = {
        ...mockComplexity,
        complexity: 'medium'
      };

      const result = MetaphorCardGenerator.shouldCreateMetaphorCard(mediumComplexity, 3);
      expect(result).toBe(true);
    });

    it('should not recommend metaphor card for low complexity with high skill', () => {
      const lowComplexity: ComplexityMetrics = {
        ...mockComplexity,
        complexity: 'low',
        cognitiveLoad: 1
      };

      const result = MetaphorCardGenerator.shouldCreateMetaphorCard(lowComplexity, 8);
      expect(result).toBe(false);
    });

    it('should recommend metaphor card when cognitive load exceeds skill level', () => {
      const complexity: ComplexityMetrics = {
        ...mockComplexity,
        cognitiveLoad: 7,
        complexity: 'medium'
      };

      const result = MetaphorCardGenerator.shouldCreateMetaphorCard(complexity, 5);
      expect(result).toBe(true);
    });
  });

  describe('MetaphorCardGenerator.generateRepositorySummary', () => {
    it('should generate summary for empty array', () => {
      const summary = MetaphorCardGenerator.generateRepositorySummary([]);

      expect(summary.totalCards).toBe(0);
      expect(summary.averageDifficulty).toBe(0);
      expect(summary.patternDistribution).toEqual({});
      expect(summary.recommendations).toHaveLength(1);
      expect(summary.recommendations[0]).toContain('No high-complexity code found');
    });

    it('should generate summary for multiple cards', () => {
      const cards: MetaphorCardData[] = [
        {
          codeSnippet: 'test1',
          language: 'javascript',
          filePath: '/test1.js',
          complexity: mockComplexity,
          metaphor: { title: 'Data Assembly Line', description: 'test', analogy: 'test', keyPoints: [], difficultyLevel: 6 },
          userSkillLevel: 5,
          analyzedAt: new Date().toISOString()
        },
        {
          codeSnippet: 'test2',
          language: 'javascript',
          filePath: '/test2.js',
          complexity: mockComplexity,
          metaphor: { title: 'Data Assembly Line', description: 'test', analogy: 'test', keyPoints: [], difficultyLevel: 8 },
          userSkillLevel: 5,
          analyzedAt: new Date().toISOString()
        },
        {
          codeSnippet: 'test3',
          language: 'javascript',
          filePath: '/test3.js',
          complexity: mockComplexity,
          metaphor: { title: 'Restaurant Kitchen', description: 'test', analogy: 'test', keyPoints: [], difficultyLevel: 4 },
          userSkillLevel: 5,
          analyzedAt: new Date().toISOString()
        }
      ];

      const summary = MetaphorCardGenerator.generateRepositorySummary(cards);

      expect(summary.totalCards).toBe(3);
      expect(summary.averageDifficulty).toBe(6); // (6 + 8 + 4) / 3
      expect(summary.patternDistribution['Data Assembly Line']).toBe(2);
      expect(summary.patternDistribution['Restaurant Kitchen']).toBe(1);
      expect(summary.recommendations.length).toBeGreaterThan(0);
    });

    it('should provide recommendations for high difficulty', () => {
      const highDifficultyCards: MetaphorCardData[] = [
        {
          codeSnippet: 'test',
          language: 'javascript',
          filePath: '/test.js',
          complexity: mockComplexity,
          metaphor: { title: 'Test', description: 'test', analogy: 'test', keyPoints: [], difficultyLevel: 9 },
          userSkillLevel: 5,
          analyzedAt: new Date().toISOString()
        }
      ];

      const summary = MetaphorCardGenerator.generateRepositorySummary(highDifficultyCards);

      expect(summary.recommendations.some(r => r.includes('refactoring'))).toBe(true);
    });
  });

  describe('MetaphorCardUtils', () => {
    it('should create generator with default configuration', () => {
      const generator = MetaphorCardUtils.createGenerator(7);
      expect(generator).toBeInstanceOf(MetaphorCardGenerator);
    });

    it('should check if metaphor is needed', () => {
      const highComplexity: ComplexityMetrics = {
        ...mockComplexity,
        complexity: 'high'
      };

      const result = MetaphorCardUtils.needsMetaphor(highComplexity, 5);
      expect(result).toBe(true);
    });

    it('should generate quick metaphor', () => {
      const code = 'const result = data.map(x => x * 2);';
      const metaphor = MetaphorCardUtils.quickMetaphor(code, 'javascript', 5);

      expect(metaphor.title).toBeDefined();
      expect(metaphor.description).toBeDefined();
      expect(metaphor.analogy).toBeDefined();
      expect(metaphor.keyPoints).toBeDefined();
      expect(metaphor.difficultyLevel).toBeGreaterThan(0);
    });
  });
});