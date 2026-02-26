/**
 * Bridge Prompt Tests
 * 
 * Tests for the Bridge Prompt functionality that maps source code to human-understandable explanations.
 */

import { 
  generateFileBridgeExplanation, 
  generateRepositoryBridgeExplanation,
  BridgeExplanation,
  RepositoryBridgeExplanation 
} from './bridge-prompt';
import { FileComplexityResult, RepositoryComplexityMap } from './repository-analyzer';

describe('Bridge Prompt', () => {
  // Mock file complexity result
  const mockFileResult: FileComplexityResult = {
    filePath: 'src/components/UserAuth.js',
    language: 'javascript',
    complexity: {
      cognitiveLoad: 2.5,
      skillLevel: 5,
      metrics: {
        cyclomaticComplexity: 8,
        dependencyDepth: 5,
        linesOfCode: 150
      }
    },
    category: 'High'
  };

  // Mock repository complexity map
  const mockRepositoryMap: RepositoryComplexityMap = {
    repositoryPath: '/test/repo',
    totalFiles: 50,
    analyzedFiles: 30,
    skippedFiles: 20,
    files: [mockFileResult],
    summary: {
      averageComplexity: 2.1,
      highComplexityFiles: 5,
      languageDistribution: {
        javascript: 20,
        python: 8,
        go: 2
      }
    }
  };

  describe('generateFileBridgeExplanation', () => {
    it('should generate explanation for beginner skill level', () => {
      const explanation = generateFileBridgeExplanation(mockFileResult, 2);
      
      expect(explanation.filePath).toBe('src/components/UserAuth.js');
      expect(explanation.language).toBe('javascript');
      expect(explanation.cognitiveLoad).toBe(2.5);
      expect(explanation.skillLevel).toBe(2);
      expect(explanation.explanation.overview).toContain('high cognitive complexity');
      expect(explanation.explanation.mentalModels).toBeDefined();
      expect(explanation.explanation.metaphor).toBeDefined();
      expect(explanation.explanation.complexity.level).toBe('High');
    });

    it('should generate explanation for advanced skill level', () => {
      const explanation = generateFileBridgeExplanation(mockFileResult, 8);
      
      expect(explanation.skillLevel).toBe(8);
      expect(explanation.explanation.overview).toContain('complexity');
      expect(explanation.explanation.mentalModels.length).toBeGreaterThan(0);
      expect(explanation.explanation.complexity.suggestions).toBeDefined();
    });

    it('should provide appropriate mental models for skill level', () => {
      const beginnerExplanation = generateFileBridgeExplanation(mockFileResult, 2);
      const advancedExplanation = generateFileBridgeExplanation(mockFileResult, 8);
      
      // Advanced users should get more mental models
      expect(advancedExplanation.explanation.mentalModels.length)
        .toBeGreaterThanOrEqual(beginnerExplanation.explanation.mentalModels.length);
    });

    it('should generate different metaphors for different complexity levels', () => {
      const lowComplexityFile: FileComplexityResult = {
        ...mockFileResult,
        complexity: {
          ...mockFileResult.complexity,
          cognitiveLoad: 0.8
        }
      };

      const lowComplexityExplanation = generateFileBridgeExplanation(lowComplexityFile, 5);
      const highComplexityExplanation = generateFileBridgeExplanation(mockFileResult, 5);
      
      expect(lowComplexityExplanation.explanation.metaphor)
        .not.toBe(highComplexityExplanation.explanation.metaphor);
    });
  });

  describe('generateRepositoryBridgeExplanation', () => {
    it('should generate repository-level explanation', () => {
      const explanation = generateRepositoryBridgeExplanation(mockRepositoryMap, 5);
      
      expect(explanation.repositoryPath).toBe('/test/repo');
      expect(explanation.skillLevel).toBe(5);
      expect(explanation.overview).toContain('50 files');
      expect(explanation.overview).toContain('30 analyzed');
      expect(explanation.hotspots).toBeDefined();
      expect(explanation.recommendations).toBeDefined();
      expect(explanation.learningPath).toBeDefined();
    });

    it('should identify hotspots correctly', () => {
      const multiFileMap: RepositoryComplexityMap = {
        ...mockRepositoryMap,
        files: [
          mockFileResult, // High complexity (2.5)
          {
            ...mockFileResult,
            filePath: 'src/utils/simple.js',
            complexity: { ...mockFileResult.complexity, cognitiveLoad: 1.0 }
          }, // Low complexity
          {
            ...mockFileResult,
            filePath: 'src/complex/algorithm.js',
            complexity: { ...mockFileResult.complexity, cognitiveLoad: 3.2 }
          } // Very high complexity
        ]
      };

      const explanation = generateRepositoryBridgeExplanation(multiFileMap, 5);
      
      // Should identify high complexity files as hotspots
      expect(explanation.hotspots.length).toBeGreaterThan(0);
      expect(explanation.hotspots[0].cognitiveLoad).toBeGreaterThan(2);
    });

    it('should provide skill-appropriate recommendations', () => {
      const beginnerExplanation = generateRepositoryBridgeExplanation(mockRepositoryMap, 2);
      const expertExplanation = generateRepositoryBridgeExplanation(mockRepositoryMap, 9);
      
      // Check if beginner recommendations include starting with low complexity
      const hasBeginnerAdvice = beginnerExplanation.recommendations.some(rec => 
        /start with.*low.*complexity/i.test(rec)
      );
      expect(hasBeginnerAdvice).toBe(true);
      
      // Check if expert recommendations include advanced concepts
      const hasExpertAdvice = expertExplanation.recommendations.some(rec => 
        /design patterns|refactoring|mentoring/i.test(rec)
      );
      expect(hasExpertAdvice).toBe(true);
    });

    it('should generate appropriate learning paths', () => {
      const beginnerExplanation = generateRepositoryBridgeExplanation(mockRepositoryMap, 3);
      const expertExplanation = generateRepositoryBridgeExplanation(mockRepositoryMap, 8);
      
      expect(beginnerExplanation.learningPath[0]).toContain('simplest files');
      expect(expertExplanation.learningPath[0]).toContain('architecture');
    });
  });

  describe('Mental Model Mappings', () => {
    it('should include JavaScript mental models', () => {
      const explanation = generateFileBridgeExplanation(mockFileResult, 5);
      const mentalModels = explanation.explanation.mentalModels;
      
      expect(mentalModels.some(model => 
        model.construct === 'useEffect' || 
        model.construct === 'useState' ||
        model.construct === 'fetch()'
      )).toBe(true);
    });

    it('should filter mental models by skill level', () => {
      const beginnerExplanation = generateFileBridgeExplanation(mockFileResult, 2);
      const expertExplanation = generateFileBridgeExplanation(mockFileResult, 8);
      
      // Expert should have access to more advanced concepts
      const beginnerAdvancedConcepts = beginnerExplanation.explanation.mentalModels
        .filter(model => model.skillLevelThreshold > 5);
      const expertAdvancedConcepts = expertExplanation.explanation.mentalModels
        .filter(model => model.skillLevelThreshold > 5);
      
      expect(expertAdvancedConcepts.length).toBeGreaterThanOrEqual(beginnerAdvancedConcepts.length);
    });
  });

  describe('Complexity Categorization', () => {
    it('should categorize complexity levels correctly', () => {
      const testCases = [
        { cognitiveLoad: 0.5, expectedLevel: 'Low' },
        { cognitiveLoad: 1.5, expectedLevel: 'Medium' },
        { cognitiveLoad: 2.5, expectedLevel: 'High' },
        { cognitiveLoad: 4.0, expectedLevel: 'Very High' }
      ];

      testCases.forEach(({ cognitiveLoad, expectedLevel }) => {
        const testFile: FileComplexityResult = {
          ...mockFileResult,
          complexity: {
            ...mockFileResult.complexity,
            cognitiveLoad
          }
        };

        const explanation = generateFileBridgeExplanation(testFile, 5);
        expect(explanation.explanation.complexity.level).toBe(expectedLevel);
      });
    });
  });
});