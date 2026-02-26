import { calculateComplexity, categorizeCognitiveLoad, ComplexityMetrics } from './complexity-analyzer';

describe('calculateComplexity', () => {
  const baseMetrics: ComplexityMetrics = {
    cyclomaticComplexity: 4,
    dependencyDepth: 2,
    linesOfCode: 100
  };

  describe('basic functionality', () => {
    it('should calculate cognitive load using the C_L formula', () => {
      const result = calculateComplexity(baseMetrics, 5);
      
      // Expected calculation:
      // weightedComplexity = (4 * 0.5) + (2 * 0.3) + (log10(100) * 0.2)
      //                    = 2 + 0.6 + (2 * 0.2)
      //                    = 2 + 0.6 + 0.4 = 3
      // cognitiveLoad = 3 / 5 = 0.6
      
      expect(result.cognitiveLoad).toBeCloseTo(0.6, 2);
      expect(result.metrics).toEqual(baseMetrics);
      expect(result.skillLevel).toBe(5);
    });

    it('should handle minimum values correctly', () => {
      const minMetrics: ComplexityMetrics = {
        cyclomaticComplexity: 0,
        dependencyDepth: 0,
        linesOfCode: 1
      };
      
      const result = calculateComplexity(minMetrics, 1);
      
      // weightedComplexity = (0 * 0.5) + (0 * 0.3) + (log10(1) * 0.2)
      //                    = 0 + 0 + (0 * 0.2) = 0
      // cognitiveLoad = 0 / 1 = 0
      
      expect(result.cognitiveLoad).toBe(0);
    });

    it('should scale inversely with skill level', () => {
      const lowSkillResult = calculateComplexity(baseMetrics, 1);
      const highSkillResult = calculateComplexity(baseMetrics, 10);
      
      expect(lowSkillResult.cognitiveLoad).toBeGreaterThan(highSkillResult.cognitiveLoad);
      expect(lowSkillResult.cognitiveLoad).toBeCloseTo(highSkillResult.cognitiveLoad * 10, 2);
    });
  });

  describe('input validation', () => {
    it('should throw error for skill level below 1', () => {
      expect(() => calculateComplexity(baseMetrics, 0)).toThrow('Skill level must be between 1 and 10');
      expect(() => calculateComplexity(baseMetrics, -1)).toThrow('Skill level must be between 1 and 10');
    });

    it('should throw error for skill level above 10', () => {
      expect(() => calculateComplexity(baseMetrics, 11)).toThrow('Skill level must be between 1 and 10');
      expect(() => calculateComplexity(baseMetrics, 15)).toThrow('Skill level must be between 1 and 10');
    });

    it('should throw error for negative complexity metrics', () => {
      const invalidMetrics: ComplexityMetrics = {
        cyclomaticComplexity: -1,
        dependencyDepth: 2,
        linesOfCode: 100
      };
      
      expect(() => calculateComplexity(invalidMetrics, 5)).toThrow('Metrics must be non-negative, and lines of code must be at least 1');
    });

    it('should throw error for negative dependency depth', () => {
      const invalidMetrics: ComplexityMetrics = {
        cyclomaticComplexity: 4,
        dependencyDepth: -1,
        linesOfCode: 100
      };
      
      expect(() => calculateComplexity(invalidMetrics, 5)).toThrow('Metrics must be non-negative, and lines of code must be at least 1');
    });

    it('should throw error for zero or negative lines of code', () => {
      const invalidMetrics: ComplexityMetrics = {
        cyclomaticComplexity: 4,
        dependencyDepth: 2,
        linesOfCode: 0
      };
      
      expect(() => calculateComplexity(invalidMetrics, 5)).toThrow('Metrics must be non-negative, and lines of code must be at least 1');
    });
  });

  describe('formula components', () => {
    it('should weight cyclomatic complexity at 50%', () => {
      const highCyclomaticMetrics: ComplexityMetrics = {
        cyclomaticComplexity: 10,
        dependencyDepth: 0,
        linesOfCode: 10 // log10(10) = 1
      };
      
      const result = calculateComplexity(highCyclomaticMetrics, 1);
      
      // weightedComplexity = (10 * 0.5) + (0 * 0.3) + (1 * 0.2) = 5 + 0 + 0.2 = 5.2
      expect(result.cognitiveLoad).toBeCloseTo(5.2, 2);
    });

    it('should weight dependency depth at 30%', () => {
      const highDependencyMetrics: ComplexityMetrics = {
        cyclomaticComplexity: 0,
        dependencyDepth: 10,
        linesOfCode: 10 // log10(10) = 1
      };
      
      const result = calculateComplexity(highDependencyMetrics, 1);
      
      // weightedComplexity = (0 * 0.5) + (10 * 0.3) + (1 * 0.2) = 0 + 3 + 0.2 = 3.2
      expect(result.cognitiveLoad).toBeCloseTo(3.2, 2);
    });

    it('should weight lines of code logarithmically at 20%', () => {
      const highLOCMetrics: ComplexityMetrics = {
        cyclomaticComplexity: 0,
        dependencyDepth: 0,
        linesOfCode: 1000 // log10(1000) = 3
      };
      
      const result = calculateComplexity(highLOCMetrics, 1);
      
      // weightedComplexity = (0 * 0.5) + (0 * 0.3) + (3 * 0.2) = 0 + 0 + 0.6 = 0.6
      expect(result.cognitiveLoad).toBeCloseTo(0.6, 2);
    });
  });
});

describe('categorizeCognitiveLoad', () => {
  it('should categorize low cognitive load', () => {
    expect(categorizeCognitiveLoad(0.5)).toBe('Low');
    expect(categorizeCognitiveLoad(1.0)).toBe('Low');
  });

  it('should categorize medium cognitive load', () => {
    expect(categorizeCognitiveLoad(1.5)).toBe('Medium');
    expect(categorizeCognitiveLoad(2.0)).toBe('Medium');
  });

  it('should categorize high cognitive load', () => {
    expect(categorizeCognitiveLoad(2.5)).toBe('High');
    expect(categorizeCognitiveLoad(3.0)).toBe('High');
  });

  it('should categorize very high cognitive load', () => {
    expect(categorizeCognitiveLoad(3.5)).toBe('Very High');
    expect(categorizeCognitiveLoad(5.0)).toBe('Very High');
  });
});