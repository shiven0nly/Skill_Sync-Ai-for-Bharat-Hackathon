/**
 * MetaphorCard Component
 *
 * Displays high-complexity code snippets with metaphorical explanations
 * to help bridge understanding for developers with different skill levels.
 */
import React from 'react';
export interface MetaphorCardProps {
    /** The original complex code snippet */
    codeSnippet: string;
    /** Programming language of the code */
    language: string;
    /** Complexity metrics for the code */
    complexity: {
        score: number;
        level: 'low' | 'medium' | 'high';
        verdict: string;
    };
    /** Metaphorical explanation to bridge understanding */
    metaphor: {
        title: string;
        description: string;
        analogy: string;
        keyPoints: string[];
    };
    /** User's skill level (1-10) */
    userSkillLevel: number;
    /** Optional callback when user requests more details */
    onExploreMore?: () => void;
}
export declare const MetaphorCard: React.FC<MetaphorCardProps>;
/**
 * Example usage and props for testing
 */
export declare const MetaphorCardExample: React.FC;
export default MetaphorCard;
//# sourceMappingURL=MetaphorCard.d.ts.map