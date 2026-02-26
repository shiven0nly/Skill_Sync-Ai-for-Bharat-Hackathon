/**
 * MetaphorCard Interface and Utilities
 *
 * Defines the structure and utilities for high-complexity code snippet explanations
 * using metaphorical bridges to help developers understand complex code.
 */
/**
 * Utility class for generating and managing MetaphorCards
 */
export class MetaphorCardGenerator {
    constructor(config) {
        this.config = config;
    }
    /**
     * Generate a metaphor for high-complexity code
     */
    generateMetaphor(codeSnippet, language, complexity) {
        // Analyze the code patterns to determine appropriate metaphors
        const patterns = this.analyzeCodePatterns(codeSnippet, language);
        // Select metaphor based on complexity and user skill level
        const metaphor = this.selectMetaphor(patterns, complexity, this.config.userSkillLevel);
        return metaphor;
    }
    /**
     * Create a complete MetaphorCard data structure
     */
    createMetaphorCard(codeSnippet, language, filePath, complexity) {
        const metaphor = this.generateMetaphor(codeSnippet, language, complexity);
        return {
            codeSnippet,
            language,
            filePath,
            complexity,
            metaphor,
            userSkillLevel: this.config.userSkillLevel,
            analyzedAt: new Date().toISOString()
        };
    }
    /**
     * Analyze code patterns to determine metaphor categories
     */
    analyzeCodePatterns(codeSnippet, language) {
        const patterns = [];
        // Check for common patterns
        if (codeSnippet.includes('map') || codeSnippet.includes('filter') || codeSnippet.includes('reduce')) {
            patterns.push('data-transformation');
        }
        if (codeSnippet.includes('async') || codeSnippet.includes('await') || codeSnippet.includes('Promise')) {
            patterns.push('asynchronous');
        }
        if (codeSnippet.includes('class') || codeSnippet.includes('extends')) {
            patterns.push('object-oriented');
        }
        if (codeSnippet.includes('if') || codeSnippet.includes('switch') || codeSnippet.includes('?')) {
            patterns.push('conditional');
        }
        if (codeSnippet.includes('for') || codeSnippet.includes('while') || codeSnippet.includes('forEach')) {
            patterns.push('iteration');
        }
        return patterns;
    }
    /**
     * Select appropriate metaphor based on patterns and complexity
     */
    selectMetaphor(patterns, complexity, userSkillLevel) {
        // Default metaphors for different patterns
        const metaphorTemplates = {
            'data-transformation': {
                title: 'Data Assembly Line',
                description: 'This code processes data through multiple transformation steps, like items moving through a factory assembly line.',
                analogy: 'Think of a car factory where raw materials go through different stations: cutting, shaping, painting, and final assembly.',
                keyPoints: [
                    'Each operation transforms the data in a specific way',
                    'Operations are chained together for efficiency',
                    'Input flows through multiple processing stages',
                    'Final output is a refined version of the input'
                ]
            },
            'asynchronous': {
                title: 'Restaurant Kitchen',
                description: 'This code handles multiple tasks that don\'t need to wait for each other, like a busy restaurant kitchen.',
                analogy: 'Like a chef who starts cooking multiple dishes at once - they don\'t wait for one dish to finish before starting another.',
                keyPoints: [
                    'Multiple operations can run simultaneously',
                    'Results are handled when they become available',
                    'Improves efficiency by not blocking other operations',
                    'Requires coordination to manage timing'
                ]
            },
            'conditional': {
                title: 'Traffic Control System',
                description: 'This code makes decisions based on different conditions, like a traffic light system managing flow.',
                analogy: 'Like a smart traffic light that changes based on traffic conditions, time of day, and emergency vehicles.',
                keyPoints: [
                    'Different paths are taken based on conditions',
                    'Logic branches help handle various scenarios',
                    'Conditions are evaluated to make decisions',
                    'Each branch leads to different outcomes'
                ]
            },
            'iteration': {
                title: 'Inspection Line',
                description: 'This code processes each item in a collection one by one, like quality control on a production line.',
                analogy: 'Like a quality inspector checking each product on a conveyor belt, examining every item systematically.',
                keyPoints: [
                    'Each item is processed individually',
                    'Same operation is applied to all items',
                    'Processing continues until all items are handled',
                    'Results can be collected or actions performed'
                ]
            },
            'object-oriented': {
                title: 'Blueprint and Construction',
                description: 'This code defines templates and creates instances, like architectural blueprints used to build houses.',
                analogy: 'Like having a house blueprint that can be used to build many similar houses, each with its own unique features.',
                keyPoints: [
                    'Classes serve as templates or blueprints',
                    'Objects are instances created from templates',
                    'Inheritance allows sharing common features',
                    'Encapsulation keeps related data and methods together'
                ]
            }
        };
        // Select the most relevant metaphor
        const primaryPattern = patterns[0] || 'conditional';
        const template = metaphorTemplates[primaryPattern] || metaphorTemplates['conditional'];
        // Adjust difficulty level based on complexity and user skill
        const difficultyLevel = Math.min(10, Math.max(1, Math.round(complexity.cognitiveLoad * 2) - userSkillLevel + 5));
        return {
            ...template,
            difficultyLevel
        };
    }
    /**
     * Filter code snippets that would benefit from metaphor explanations
     */
    static shouldCreateMetaphorCard(complexity, userSkillLevel) {
        // Create metaphor cards for medium to high complexity code
        // or when user skill level is lower than the complexity demands
        return (complexity.complexity === 'high' ||
            (complexity.complexity === 'medium' && userSkillLevel <= 5) ||
            complexity.cognitiveLoad > userSkillLevel);
    }
    /**
     * Generate a summary of all metaphor cards for a repository
     */
    static generateRepositorySummary(metaphorCards) {
        const totalCards = metaphorCards.length;
        if (totalCards === 0) {
            return {
                totalCards: 0,
                averageDifficulty: 0,
                patternDistribution: {},
                recommendations: ['No high-complexity code found that requires metaphor explanations.']
            };
        }
        const averageDifficulty = metaphorCards.reduce((sum, card) => sum + card.metaphor.difficultyLevel, 0) / totalCards;
        // Count pattern distribution
        const patternDistribution = {};
        metaphorCards.forEach(card => {
            const title = card.metaphor.title;
            patternDistribution[title] = (patternDistribution[title] || 0) + 1;
        });
        // Generate recommendations
        const recommendations = [];
        if (averageDifficulty > 7) {
            recommendations.push('Consider refactoring high-complexity areas for better maintainability.');
        }
        if (totalCards > 10) {
            recommendations.push('Large number of complex code sections detected. Consider code review and documentation.');
        }
        const mostCommonPattern = Object.entries(patternDistribution)
            .sort(([, a], [, b]) => b - a)[0];
        if (mostCommonPattern && mostCommonPattern[1] > totalCards * 0.3) {
            recommendations.push(`Focus on improving ${mostCommonPattern[0]} patterns - they appear frequently in your codebase.`);
        }
        return {
            totalCards,
            averageDifficulty,
            patternDistribution,
            recommendations
        };
    }
}
/**
 * Export utility functions for easy use
 */
export const MetaphorCardUtils = {
    /**
     * Create a metaphor card generator with default configuration
     */
    createGenerator: (userSkillLevel) => {
        return new MetaphorCardGenerator({
            userSkillLevel,
            maxExplanationLength: 500,
            includeCodeExamples: true
        });
    },
    /**
     * Quick function to check if a code snippet needs a metaphor explanation
     */
    needsMetaphor: (complexity, userSkillLevel) => {
        return MetaphorCardGenerator.shouldCreateMetaphorCard(complexity, userSkillLevel);
    },
    /**
     * Generate a simple metaphor for a code snippet
     */
    quickMetaphor: (codeSnippet, language, userSkillLevel) => {
        const generator = new MetaphorCardGenerator({ userSkillLevel });
        const mockComplexity = {
            cyclomaticComplexity: 1,
            dependencyDepth: 0,
            linesOfCode: codeSnippet.split('\n').length,
            cognitiveLoad: 3,
            skillAdjustedLoad: 3,
            complexity: 'medium',
            score: 50,
            verdict: 'Medium Load 🟨',
            suggestion: 'Consider Bridge Explanation for clarity'
        };
        return generator.generateMetaphor(codeSnippet, language, mockComplexity);
    }
};
//# sourceMappingURL=MetaphorCard.js.map