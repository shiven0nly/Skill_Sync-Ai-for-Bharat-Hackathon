/**
 * Bridge Prompt Module
 *
 * The core logic that maps Source code -> Target explanations.
 * Transforms raw code analysis into human-understandable mental models
 * based on user skill level and cognitive complexity.
 */
/**
 * Mental model mappings for different programming constructs
 */
const MENTAL_MODEL_MAPPINGS = {
    javascript: [
        {
            construct: 'useEffect',
            mentalModel: 'Component Lifecycle Observer',
            description: 'Watches for changes and reacts automatically, like a security guard monitoring specific areas',
            skillLevelThreshold: 1
        },
        {
            construct: 'useState',
            mentalModel: 'Reactive Memory Slot',
            description: 'A smart storage box that notifies everyone when its contents change',
            skillLevelThreshold: 1
        },
        {
            construct: 'fetch()',
            mentalModel: 'External Data Request',
            description: 'Like sending a messenger to retrieve information from another building',
            skillLevelThreshold: 1
        },
        {
            construct: 'map()',
            mentalModel: 'Data Transformation Pipeline',
            description: 'An assembly line that transforms each item according to specific instructions',
            skillLevelThreshold: 2
        },
        {
            construct: 'Promise',
            mentalModel: 'Future Value Container',
            description: 'A receipt for work that will be completed later, with success or failure outcomes',
            skillLevelThreshold: 3
        },
        {
            construct: 'async/await',
            mentalModel: 'Sequential Async Coordinator',
            description: 'Makes asynchronous operations look like step-by-step instructions',
            skillLevelThreshold: 4
        },
        {
            construct: 'closure',
            mentalModel: 'Private Memory Capsule',
            description: 'A function that remembers its environment, like a person carrying their hometown memories',
            skillLevelThreshold: 5
        }
    ],
    python: [
        {
            construct: 'list comprehension',
            mentalModel: 'Filtered Transformation Factory',
            description: 'A one-line factory that filters and transforms items in a single operation',
            skillLevelThreshold: 2
        },
        {
            construct: 'decorator',
            mentalModel: 'Function Wrapper',
            description: 'Like gift wrapping that adds extra functionality without changing the gift inside',
            skillLevelThreshold: 4
        },
        {
            construct: 'generator',
            mentalModel: 'Lazy Data Producer',
            description: 'A factory that produces items on-demand rather than all at once',
            skillLevelThreshold: 5
        },
        {
            construct: 'context manager',
            mentalModel: 'Resource Guardian',
            description: 'Ensures resources are properly acquired and released, like a librarian managing book checkouts',
            skillLevelThreshold: 4
        },
        {
            construct: 'lambda',
            mentalModel: 'Anonymous Function',
            description: 'A quick, unnamed function for simple operations',
            skillLevelThreshold: 2
        }
    ],
    go: [
        {
            construct: 'goroutine',
            mentalModel: 'Lightweight Worker',
            description: 'Like hiring a temporary worker for a specific task that runs independently',
            skillLevelThreshold: 3
        },
        {
            construct: 'channel',
            mentalModel: 'Communication Pipeline',
            description: 'A typed message tube between goroutines, ensuring safe data exchange',
            skillLevelThreshold: 4
        },
        {
            construct: 'interface',
            mentalModel: 'Behavior Contract',
            description: 'Defines what something can do without specifying how it does it',
            skillLevelThreshold: 3
        },
        {
            construct: 'defer',
            mentalModel: 'Cleanup Scheduler',
            description: 'Schedules cleanup tasks to run when leaving a function, like setting a reminder',
            skillLevelThreshold: 2
        },
        {
            construct: 'pointer',
            mentalModel: 'Memory Address Reference',
            description: 'Like a house address that points to where the actual data lives',
            skillLevelThreshold: 4
        }
    ]
};
/**
 * Generate bridge explanation for a single file
 */
export function generateFileBridgeExplanation(fileResult, skillLevel) {
    const { filePath, language, complexity } = fileResult;
    const cognitiveLoad = complexity.cognitiveLoad;
    // Generate overview based on complexity and skill level
    const overview = generateOverview(filePath, language, cognitiveLoad, skillLevel);
    // Get relevant mental models for this language and skill level
    const mentalModels = getMentalModelsForSkillLevel(language, skillLevel);
    // Generate metaphor based on complexity level
    const metaphor = generateMetaphor(cognitiveLoad, skillLevel);
    // Generate complexity explanation
    const complexityExplanation = generateComplexityExplanation(complexity, skillLevel);
    return {
        filePath,
        language,
        cognitiveLoad,
        skillLevel,
        explanation: {
            overview,
            mentalModels,
            metaphor,
            complexity: complexityExplanation
        }
    };
}
/**
 * Generate bridge explanation for an entire repository
 */
export function generateRepositoryBridgeExplanation(repositoryMap, skillLevel) {
    const { repositoryPath, files, summary } = repositoryMap;
    // Generate repository overview
    const overview = generateRepositoryOverview(repositoryMap, skillLevel);
    // Identify hotspots (high complexity files)
    const hotspotFiles = files
        .filter(file => file.complexity.cognitiveLoad > 2)
        .sort((a, b) => b.complexity.cognitiveLoad - a.complexity.cognitiveLoad)
        .slice(0, 5); // Top 5 most complex files
    const hotspots = hotspotFiles.map(file => generateFileBridgeExplanation(file, skillLevel));
    // Generate recommendations
    const recommendations = generateRecommendations(repositoryMap, skillLevel);
    // Generate learning path
    const learningPath = generateLearningPath(repositoryMap, skillLevel);
    return {
        repositoryPath,
        skillLevel,
        overview,
        hotspots,
        recommendations,
        learningPath
    };
}
/**
 * Generate overview text for a file
 */
function generateOverview(filePath, language, cognitiveLoad, skillLevel) {
    const fileName = filePath.split('/').pop() || filePath;
    const complexityLevel = categorizeCognitiveLoad(cognitiveLoad);
    let overview = `This ${language} file (${fileName}) has ${complexityLevel.toLowerCase()} cognitive complexity. `;
    if (skillLevel <= 3) {
        // Beginner-friendly explanation
        if (cognitiveLoad <= 1) {
            overview += "This is a straightforward file that should be easy to understand and modify.";
        }
        else if (cognitiveLoad <= 2) {
            overview += "This file has moderate complexity. Take your time to understand each section before making changes.";
        }
        else {
            overview += "This is a complex file with many interconnected parts. Consider breaking it down into smaller, more manageable pieces.";
        }
    }
    else if (skillLevel <= 6) {
        // Intermediate explanation
        if (cognitiveLoad <= 1) {
            overview += "The logic is linear with minimal branching, making it maintainable and testable.";
        }
        else if (cognitiveLoad <= 2) {
            overview += "Contains moderate branching logic and dependencies that require careful consideration during modifications.";
        }
        else {
            overview += "High complexity due to multiple decision paths and dependencies. Consider refactoring for better maintainability.";
        }
    }
    else {
        // Advanced explanation
        if (cognitiveLoad <= 1) {
            overview += "Low cyclomatic complexity with minimal coupling, following good separation of concerns.";
        }
        else if (cognitiveLoad <= 2) {
            overview += "Moderate complexity with acceptable coupling. Monitor for potential abstraction opportunities.";
        }
        else {
            overview += "High complexity indicating potential architectural concerns. Consider applying SOLID principles and design patterns.";
        }
    }
    return overview;
}
/**
 * Get mental models appropriate for the user's skill level
 */
function getMentalModelsForSkillLevel(language, skillLevel) {
    const languageMappings = MENTAL_MODEL_MAPPINGS[language] || [];
    return languageMappings.filter(mapping => mapping.skillLevelThreshold <= skillLevel);
}
/**
 * Generate a metaphor based on cognitive load and skill level
 */
function generateMetaphor(cognitiveLoad, skillLevel) {
    const metaphors = {
        low: [
            "Think of this code like a simple recipe - each step follows naturally from the last.",
            "This code is like a straight highway - easy to follow from start to finish.",
            "Imagine this as a basic assembly line with clear, sequential steps."
        ],
        medium: [
            "This code is like a city intersection - multiple paths converge and decisions need to be made.",
            "Think of this as a restaurant kitchen during lunch rush - organized but with many moving parts.",
            "This resembles a library system - well-organized but with multiple interconnected sections."
        ],
        high: [
            "This code is like a complex machine with many gears - each part affects the others.",
            "Think of this as air traffic control - managing multiple concurrent operations safely.",
            "This resembles a symphony orchestra - many instruments playing different parts in harmony."
        ],
        veryHigh: [
            "This code is like a city's infrastructure - complex, interconnected, and requiring careful planning for any changes.",
            "Think of this as a space mission control center - highly complex with critical interdependencies.",
            "This resembles a biological ecosystem - many components with intricate relationships and feedback loops."
        ]
    };
    let category;
    if (cognitiveLoad <= 1)
        category = 'low';
    else if (cognitiveLoad <= 2)
        category = 'medium';
    else if (cognitiveLoad <= 3)
        category = 'high';
    else
        category = 'veryHigh';
    const categoryMetaphors = metaphors[category];
    const randomIndex = Math.floor(Math.random() * categoryMetaphors.length);
    return categoryMetaphors[randomIndex];
}
/**
 * Generate complexity explanation with reasoning and suggestions
 */
function generateComplexityExplanation(complexity, skillLevel) {
    const level = categorizeCognitiveLoad(complexity.cognitiveLoad);
    const { cyclomaticComplexity, dependencyDepth, linesOfCode } = complexity.metrics;
    let reasoning = `Cognitive load of ${complexity.cognitiveLoad.toFixed(2)} is calculated from: `;
    reasoning += `${cyclomaticComplexity} decision paths, `;
    reasoning += `${dependencyDepth} dependencies, `;
    reasoning += `and ${linesOfCode} lines of code, `;
    reasoning += `adjusted for skill level ${skillLevel}.`;
    const suggestions = [];
    if (complexity.cognitiveLoad > 2) {
        suggestions.push("Consider breaking this into smaller, focused functions");
        if (cyclomaticComplexity > 10) {
            suggestions.push("Reduce branching complexity by extracting conditional logic");
        }
        if (dependencyDepth > 5) {
            suggestions.push("Review dependencies - consider dependency injection or facade patterns");
        }
        if (linesOfCode > 200) {
            suggestions.push("File is quite large - consider splitting into multiple modules");
        }
    }
    else if (complexity.cognitiveLoad > 1) {
        suggestions.push("Good complexity level - monitor for future growth");
    }
    else {
        suggestions.push("Excellent - low complexity makes this code maintainable");
    }
    // Skill-level specific suggestions
    if (skillLevel <= 3 && complexity.cognitiveLoad > 1.5) {
        suggestions.push("Focus on understanding one section at a time");
        suggestions.push("Consider adding more comments to clarify complex logic");
    }
    else if (skillLevel >= 7 && complexity.cognitiveLoad > 2) {
        suggestions.push("Consider applying design patterns to reduce complexity");
        suggestions.push("Evaluate opportunities for abstraction and encapsulation");
    }
    return { level, reasoning, suggestions };
}
/**
 * Generate repository overview
 */
function generateRepositoryOverview(repositoryMap, skillLevel) {
    const { totalFiles, analyzedFiles, summary } = repositoryMap;
    const { averageComplexity, highComplexityFiles, languageDistribution } = summary;
    let overview = `This repository contains ${totalFiles} files, with ${analyzedFiles} analyzed for complexity. `;
    overview += `Average cognitive load is ${averageComplexity.toFixed(2)}, `;
    overview += `with ${highComplexityFiles} files requiring extra attention. `;
    const languages = Object.entries(languageDistribution)
        .filter(([_, count]) => count > 0)
        .map(([lang, count]) => `${count} ${lang}`)
        .join(', ');
    overview += `Language distribution: ${languages}.`;
    return overview;
}
/**
 * Generate recommendations for the repository
 */
function generateRecommendations(repositoryMap, skillLevel) {
    const recommendations = [];
    const { summary } = repositoryMap;
    if (summary.highComplexityFiles > 0) {
        recommendations.push(`Focus on the ${summary.highComplexityFiles} high-complexity files first`);
    }
    if (summary.averageComplexity > 2) {
        recommendations.push("Consider refactoring to reduce overall complexity");
    }
    if (skillLevel <= 3) {
        recommendations.push("Start with low-complexity files to build confidence");
        recommendations.push("Use the mental model mappings to understand unfamiliar patterns");
    }
    else if (skillLevel >= 7) {
        recommendations.push("Look for opportunities to apply design patterns");
        recommendations.push("Consider mentoring others on the complex sections");
    }
    return recommendations;
}
/**
 * Generate learning path for the repository
 */
function generateLearningPath(repositoryMap, skillLevel) {
    const learningPath = [];
    const { files } = repositoryMap;
    // Sort files by complexity
    const sortedFiles = [...files].sort((a, b) => a.complexity.cognitiveLoad - b.complexity.cognitiveLoad);
    if (skillLevel <= 3) {
        learningPath.push("1. Start with the simplest files to understand the codebase structure");
        learningPath.push("2. Gradually work through medium-complexity files");
        learningPath.push("3. Study high-complexity files with the help of mental models");
    }
    else if (skillLevel <= 6) {
        learningPath.push("1. Review the architecture by examining high-level files first");
        learningPath.push("2. Identify patterns and abstractions used throughout");
        learningPath.push("3. Focus on the most complex files to understand critical logic");
    }
    else {
        learningPath.push("1. Analyze the overall architecture and design patterns");
        learningPath.push("2. Identify refactoring opportunities in high-complexity areas");
        learningPath.push("3. Consider how to improve maintainability and testability");
    }
    return learningPath;
}
/**
 * Categorize cognitive load levels
 */
function categorizeCognitiveLoad(cognitiveLoad) {
    if (cognitiveLoad <= 1)
        return 'Low';
    if (cognitiveLoad <= 2)
        return 'Medium';
    if (cognitiveLoad <= 3)
        return 'High';
    return 'Very High';
}
//# sourceMappingURL=bridge-prompt.js.map