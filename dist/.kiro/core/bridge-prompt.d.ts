/**
 * Bridge Prompt Module
 *
 * The core logic that maps Source code -> Target explanations.
 * Transforms raw code analysis into human-understandable mental models
 * based on user skill level and cognitive complexity.
 */
import { FileComplexityResult, RepositoryComplexityMap } from './repository-analyzer';
import { SupportedLanguage } from './analysis/parserUtils';
/**
 * Mental model mappings for different code constructs
 */
interface MentalModelMapping {
    construct: string;
    mentalModel: string;
    description: string;
    skillLevelThreshold: number;
}
/**
 * Bridge explanation for a code snippet or file
 */
export interface BridgeExplanation {
    filePath: string;
    language: SupportedLanguage;
    cognitiveLoad: number;
    skillLevel: number;
    explanation: {
        overview: string;
        mentalModels: MentalModelMapping[];
        metaphor: string;
        complexity: {
            level: string;
            reasoning: string;
            suggestions: string[];
        };
    };
}
/**
 * Repository-level bridge explanation
 */
export interface RepositoryBridgeExplanation {
    repositoryPath: string;
    skillLevel: number;
    overview: string;
    hotspots: BridgeExplanation[];
    recommendations: string[];
    learningPath: string[];
}
/**
 * Generate bridge explanation for a single file
 */
export declare function generateFileBridgeExplanation(fileResult: FileComplexityResult, skillLevel: number): BridgeExplanation;
/**
 * Generate bridge explanation for an entire repository
 */
export declare function generateRepositoryBridgeExplanation(repositoryMap: RepositoryComplexityMap, skillLevel: number): RepositoryBridgeExplanation;
export {};
//# sourceMappingURL=bridge-prompt.d.ts.map